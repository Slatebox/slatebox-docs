#!/usr/bin/env bash
# Restore an offline backup into a new Compose project using a matched release kit.
set -euo pipefail
umask 077
die() { printf '%s\n' "$*" >&2; exit 1; }
[[ $# == 1 ]] || die 'Usage: from the extracted self-host directory, run restore-instance.sh BACKUP_DIRECTORY'
backup=$(cd "$1" && pwd -P)
[[ -x ./run && -f ../platform && -f ../images.txt && -f ../images.tar.gz ]] || die 'Run this from the matching extracted kit’s self-host directory.'
project=${COMPOSE_PROJECT_NAME:?Set COMPOSE_PROJECT_NAME to a new project name on this Docker host.}
[[ "$project" =~ ^[a-z0-9][a-z0-9_-]*$ ]] || die 'Use a lowercase Compose project name.'
state=${SLATEBOX_STATE:-.state}
state=$(cd "$(dirname "$state")" && pwd -P)/$(basename "$state")
[[ ! -e "$state" && ! -L "$state" ]] || die 'Select a new settings directory for the recovered instance.'
host=$(docker version --format '{{.Server.Os}}/{{.Server.Arch}}')
[[ "$host" == "$(cat ../platform)" ]] || die "This release kit does not match the receiver ($host)."
app=$(cat ../app-image)
relay=$(cat ../relay-image)
for value in "$state" "$app" "$relay"; do
  [[ -n "$value" && "$value" != *"'"* && "$value" != *$'\n'* && "$value" != *$'\r'* ]] || die 'Unsupported state path or image tag.'
done

# Verify the files we will use, including a missing or unexpected proxy archive.
files=(mongo-data.tgz instance.tgz)
if [[ -f "$backup/caddy-data.tgz" ]]; then files+=(caddy-data.tgz); fi
(
  cd "$backup"
  if command -v sha256sum >/dev/null; then digest=(sha256sum); else digest=(shasum -a 256); fi
  calculated=$("${digest[@]}" "${files[@]}")
  [[ "$(LC_ALL=C sort SHA256SUMS)" == "$(LC_ALL=C sort <<< "$calculated")" ]] || die 'Backup checksum mismatch. Use the complete backup from one installation.'
)

filter="label=com.docker.compose.project=$project"
containers=$(docker ps -aq --filter "$filter")
networks=$(docker network ls -q --filter "$filter")
volumes=$(docker volume ls -q --filter "$filter")
all_volumes=$(docker volume ls -q)
all_networks=$(docker network ls --format '{{.Name}}')
[[ -z "$containers$networks$volumes" ]] || die 'Choose an unused Compose project. Its containers, networks or volumes already exist.'
for name in "${project}_mongo-data" "${project}_caddy-data"; do
  if grep -Fxq "$name" <<< "$all_volumes"; then die "Volume already exists: $name"; fi
done
if grep -Fxq "${project}_default" <<< "$all_networks"; then die 'The project network already exists.'; fi

docker image load -i ../images.tar.gz
while IFS= read -r image; do
  docker image inspect --platform "$host" "$image" --format '{{.Id}}' >/dev/null
done < ../images.txt

# Keep ./run from seeing settings until the database and the optional TLS volume are complete.
mkdir -m 700 "$state"
work=''
claimed=()
owner=$(od -An -N16 -tx1 /dev/urandom | tr -d ' \n')
cleanup() {
  if [[ ! -f "$state/instance.env" ]]; then
    if [[ -n "${claimed[*]-}" ]]; then
      for volume in "${claimed[@]}"; do
        marker=$(docker volume inspect --format '{{index .Labels "com.slatebox.restore"}}' "$volume") || continue
        if [[ "$marker" == "$owner" ]]; then docker volume rm "$volume" >/dev/null || true; fi
      done
    fi
    rm -f "$state/settings.json"
    if [[ -n "$work" ]]; then rm -rf "$work"; fi
    rmdir "$state" || true
  fi
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM
work=$(mktemp -d "$state/.restore.XXXXXXXX")
for file in settings.json instance.env; do
  tar -xOzf "$backup/instance.tgz" "$file" > "$work/$file"
  [[ -s "$work/$file" ]] || die "Missing $file in the installation backup."
done
printf "\nSLATEBOX_STATE='%s'\nAPP_IMAGE='%s'\nCOLLAB_IMAGE='%s'\n" "$state" "$app" "$relay" >> "$work/instance.env"
# Resolve only the Mongo service image. Avoid printing interpolated settings.
mongo=$(SLATEBOX_STATE="$work" ./run config --images mongo)
grep -Fxq "$mongo" ../images.txt || die 'The kit must contain the release MongoDB image.'
# Compose bind-mounts settings and startup files from the daemon's filesystem.
docker run --rm --pull never --network none --read-only \
  --mount "type=bind,src=$work/settings.json,dst=/restore-settings,readonly" \
  --mount "type=bind,src=$(pwd -P)/mongo-init.js,dst=/restore-init,readonly" \
  --entrypoint sh "$mongo" -ec 'test -s /restore-settings && test -s /restore-init' ||
  die 'Docker cannot read the kit or recovered settings. Use directories shared with the Docker daemon, then retry.'

restore_volume() {
  local logical=$1 archive=$2 name="${project}_$1" marker
  docker volume create --label "com.docker.compose.project=$project" --label "com.docker.compose.volume=$logical" \
    --label "com.slatebox.restore=$owner" "$name" >/dev/null
  marker=$(docker volume inspect --format '{{index .Labels "com.slatebox.restore"}}' "$name")
  [[ "$marker" == "$owner" ]] || die "Another installation claimed $name."
  claimed+=("$name")
  docker run --rm -i --pull never --network none --mount "type=volume,src=$name,dst=/restore,volume-nocopy" \
    --entrypoint sh "$mongo" -ec 'test -z "$(ls -A /restore)" && tar -xzf - -C /restore
      if [ "$1" = mongo-data ]; then test -s /restore/WiredTiger; fi' sh "$logical" < "$backup/$archive"
}
restore_volume mongo-data mongo-data.tgz
if [[ -f "$backup/caddy-data.tgz" ]]; then restore_volume caddy-data caddy-data.tgz; fi
mv "$work/settings.json" "$state/settings.json"
mv "$work/instance.env" "$state/instance.env"
rmdir "$work"
printf 'Restored private settings and data. Start the recovered instance from this directory:\n  COMPOSE_PROJECT_NAME=%q SLATEBOX_STATE=%q ./run up -d --wait --pull never\n' "$project" "$state"
