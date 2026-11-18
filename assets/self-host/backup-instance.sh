#!/usr/bin/env bash
# From the active release's self-host directory:
#   COMPOSE_PROJECT_NAME=slatebox SLATEBOX_STATE=.state bash backup-instance.sh NEW_OUTPUT_DIR
# The three services and an active HTTPS proxy stop briefly for a cold backup.
set -euo pipefail
umask 077
die() { printf '%s\n' "$*" >&2; exit 1; }
leave_stopped=''
if [[ ${1:-} == --leave-stopped ]]; then leave_stopped=yes; shift; fi
[[ $# == 1 && -n "$1" ]] || die 'Usage: bash backup-instance.sh [--leave-stopped] NEW_OUTPUT_DIR'
[[ -f compose.yaml && -x run ]] || die 'Run from the active release self-host directory.'
project=${COMPOSE_PROJECT_NAME:-slatebox}
[[ "$project" =~ ^[a-z0-9][a-z0-9_-]*$ ]] || die 'Invalid Compose project name.'
state=$(cd "${SLATEBOX_STATE:-.state}" && pwd -P) || die 'Select the active settings directory with SLATEBOX_STATE.'
[[ -f "$state/settings.json" && -f "$state/instance.env" && ! -L "$state/instance.env" ]] || die 'The selected state must contain settings.json and instance.env.'
dest_parent=$(cd "$(dirname -- "$1")" && pwd -P) || die 'The backup parent directory must exist.'
output="$dest_parent/$(basename -- "$1")"
[[ ! -e "$output" && ! -L "$output" ]] || die 'Select a new backup output directory.'
if command -v sha256sum >/dev/null; then checksum=(sha256sum); else command -v shasum >/dev/null || die 'Install a SHA-256 checksum utility.'; checksum=(shasum -a 256); fi

running_service() {
  local id
  id=$(docker ps --no-trunc -q --filter "label=com.docker.compose.project=$project" --filter "label=com.docker.compose.service=$1") || return 1
  [[ "$id" != *$'\n'* ]] || die "Expected at most one running $1 container."
  printf '%s' "$id"
}
app=$(running_service app); collab=$(running_service collab); mongo=$(running_service mongo); proxy=$(running_service proxy)
[[ -n "$app" && -n "$collab" && -n "$mongo" ]] || die 'Start the existing app, relay and MongoDB in the selected project before backup.'
root=$(pwd -P)
for id in "$app" "$collab" "$mongo" ${proxy:+"$proxy"}; do
  working_dir=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' "$id")
  [[ "$working_dir" == "$root" || "$working_dir" -ef "$root" ]] || die 'A running service belongs to a different kit directory.'
done
mounted=$(docker inspect --format '{{range .Mounts}}{{if and (eq .Type "bind") (eq .Destination "/opt/slatebox/settings.json")}}{{.Source}}{{end}}{{end}}' "$app")
[[ "$mounted" == "$state/settings.json" || "$mounted" -ef "$state/settings.json" ]] || die 'The selected settings do not match the running app mount.'

check_volume() {
  local id=$1 target=$2 logical=$3 volume owner writers
  volume=$(docker inspect --format "{{range .Mounts}}{{if and (eq .Type \"volume\") (eq .Destination \"$target\")}}{{.Name}}{{end}}{{end}}" "$id")
  [[ -n "$volume" ]] || die "No named volume is mounted at $target."
  owner=$(docker volume inspect --format '{{index .Labels "com.docker.compose.project"}}/{{index .Labels "com.docker.compose.volume"}}' "$volume")
  [[ "$owner" == "$project/$logical" ]] || die "The $logical mount does not belong to the selected project's Compose volume."
  writers=$(docker ps --no-trunc -q --filter "volume=$volume")
  [[ "$writers" == "$id" ]] || die "Another running container uses the $logical volume."
}
check_volume "$mongo" /data/db mongo-data
if [[ -n "$proxy" ]]; then check_volume "$proxy" /data caddy-data; fi
lock="$state/.backup-in-progress"
mkdir -m 700 "$lock" || die 'A backup lock exists. Check for an active backup before retrying.'
helpers=()
stopped=()
work=''
reserved=''
complete=''
wait_ready() {
  local id=$1 health deadline=$((SECONDS+240))
  while (( SECONDS < deadline )); do
    health=$(docker inspect --format '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{end}}' "$id") || return 1
    case "$health" in running/healthy|running/) return 0;; running/starting|running/unhealthy|restarting/*) sleep 2;; *) return 1;; esac
  done
  return 1
}
resume() {
  local i failed=0
  for ((i=${#stopped[@]}-1;i>=0;i--)); do
    if ! docker start "${stopped[i]}" >/dev/null || ! wait_ready "${stopped[i]}"; then
      printf 'Service %s did not resume healthy. Inspect this installation before retrying.\n' "${stopped[i]}" >&2
      failed=1
    fi
  done
  stopped=()
  return "$failed"
}
cleanup() {
  local result=$? id
  trap - EXIT
  trap '' HUP INT TERM
  set +e
  # Stop any interrupted tar reader before Mongo can accept writes.
  for id in ${helpers[@]+"${helpers[@]}"}; do docker rm -fv "$id" >/dev/null || result=1; done
  if (( ${#stopped[@]} )) && [[ -z "$complete" || -z "$leave_stopped" || "$result" != 0 ]]; then
    if resume; then printf 'The original services resumed.\n' >&2; else result=1; fi
  fi
  if [[ -n "$work" ]]; then rm -rf "$work"; fi
  if [[ -n "$reserved" && -z "$complete" ]]; then
    rm -f "$output"/{instance.tgz,mongo-data.tgz,caddy-data.tgz,SHA256SUMS}
    rmdir "$output" || true
  fi
  rmdir "$lock" || result=1
  exit "$result"
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM
mkdir -m 700 "$output" || die 'Could not reserve a new output directory.'
reserved=yes
work=$(mktemp -d "$output/.private.XXXXXXXX")
# Copy the active bind through the container. An editor can replace the host path
# while the original inode remains mounted by the app.
docker cp "$app:/opt/slatebox/settings.json" "$work/settings.json"
cp "$state/instance.env" "$work/instance.env"
chmod 600 "$work/settings.json" "$work/instance.env"
tar -C "$work" -czf "$output/instance.tgz" instance.env settings.json

reader() {
  local id=$1 target=$2 image
  image=$(docker inspect --format '{{.Image}}' "$id") || return 1
  docker create --pull never --network none --read-only --volumes-from "$id:ro" --entrypoint tar "$image" -C "$target" -czf - .
}
# Inheriting the mounts pins the actual volume instead of asking Docker to
# resolve (and possibly create) a volume by name. No Compose services are recreated.
mongo_reader=$(reader "$mongo" /data/db); helpers+=("$mongo_reader")
if [[ -n "$proxy" ]]; then proxy_reader=$(reader "$proxy" /data); helpers+=("$proxy_reader"); fi
for id in ${proxy:+"$proxy"} "$app" "$collab" "$mongo"; do
  stopped+=("$id")
  timeout=15
  if [[ "$id" == "$mongo" ]]; then timeout=120; fi
  docker stop --time "$timeout" "$id" >/dev/null
  [[ $(docker inspect --format '{{.State.Status}}/{{.State.ExitCode}}' "$id") == exited/* ]] || die 'A service did not stop.'
done
[[ $(docker inspect --format '{{.State.ExitCode}}' "$mongo") == 0 ]] || die 'MongoDB did not shut down cleanly. Refusing to archive its files.'
archive() {
  local id=$1 file=$2
  docker start --attach "$id" > "$output/$file"
  [[ $(docker inspect --format '{{.State.Status}}/{{.State.ExitCode}}' "$id") == exited/0 ]] || die "Could not archive $file."
}
archive "$mongo_reader" mongo-data.tgz
files=(instance.tgz mongo-data.tgz)
if [[ -n "$proxy" ]]; then archive "$proxy_reader" caddy-data.tgz; files+=(caddy-data.tgz); fi
if [[ -z "$leave_stopped" ]]; then resume || die 'Backup recovery requires operator attention.'; fi
for file in "${files[@]}"; do tar -tzf "$output/$file" >/dev/null; done
(cd "$output" && "${checksum[@]}" "${files[@]}" > SHA256SUMS && "${checksum[@]}" -c SHA256SUMS >/dev/null)
complete=yes
if [[ -n "$leave_stopped" ]]; then
  printf 'Backup verified in %s. The original services are stopped for cutover.\n' "$output"
else
  printf 'Backup verified in %s. The original services are running.\n' "$output"
fi
