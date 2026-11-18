#!/usr/bin/env bash
# Assemble a release, initialize a fresh host, or prepare an existing instance for upgrade.
set -euo pipefail
umask 077
die() { printf '%s\n' "$*" >&2; exit 1; }
platform() { docker version --format '{{.Server.Os}}/{{.Server.Arch}}'; }
require_image() {
  docker image inspect --platform "$host" "$1" >/dev/null || die "A local $host image is required for $1."
}

# Match the running app to its settings before selecting the database project for an upgrade.
check_running_instance() {
  local project=${COMPOSE_PROJECT_NAME:-slatebox} container mounted
  container=$(docker ps -q --filter "label=com.docker.compose.project=$project" --filter 'label=com.docker.compose.service=app')
  [[ -n "$container" && "$container" != *$'\n'* ]] || die "Expected one running app in Compose project $project. Use the project that owns your boards."
  mounted=$(docker inspect --format '{{range .Mounts}}{{if eq .Destination "/opt/slatebox/settings.json"}}{{.Source}}{{end}}{{end}}' "$container")
  [[ "$mounted" == "$previous/settings.json" || "$mounted" -ef "$previous/settings.json" ]] ||
    die "The running app in project $project uses a different settings directory."
}

prepare_upgrade() (
  target="$PWD/.state"
  for value in "$target" "$APP_IMAGE" "$COLLAB_IMAGE"; do
    [[ -n "$value" && "$value" != *"'"* && "$value" != *$'\n'* && "$value" != *$'\r'* ]] || die 'Unsupported release path or image tag.'
  done
  temp=$(mktemp -d "$PWD/.slatebox-upgrade.XXXXXXXX")
  trap 'rm -rf "$temp"' EXIT
  cp "$previous/settings.json" "$temp/settings.json"
  # Keep custom provider settings, including their original Compose quoting.
  # Compose resolves repeated keys in file order. The last three select this kit.
  cp "$previous/instance.env" "$temp/instance.env"
  chmod 600 "$temp/settings.json" "$temp/instance.env"
  printf "\n# Active paths and image pair for this release kit\nSLATEBOX_STATE='%s'\nAPP_IMAGE='%s'\nCOLLAB_IMAGE='%s'\n" \
    "$target" "$APP_IMAGE" "$COLLAB_IMAGE" >> "$temp/instance.env"
  # Publish instance.env last: ./run treats its presence as a ready instance.
  # Only the process that reserved this directory may clean up these files.
  mkdir -m 700 "$target"
  trap 'rm -rf "$temp"; if [[ ! -f "$target/instance.env" ]]; then rm -f "$target/settings.json"; rmdir "$target"; fi' EXIT
  mv "$temp/settings.json" "$target/settings.json"
  mv "$temp/instance.env" "$target/instance.env"
  trap - EXIT
  rmdir "$temp"
  printf 'Prepared the new release for Compose project %s.\n' "${COMPOSE_PROJECT_NAME:-slatebox}"
  printf 'From this kit, run: cd self-host && COMPOSE_PROJECT_NAME=%q ./run up -d --wait --pull never\n' "${COMPOSE_PROJECT_NAME:-slatebox}"
)

start_instance() {
  [[ $# == 0 || ( $# == 1 && $1 == --https ) ]] || die 'Usage: ./start [--https]'
  cd "$(dirname "$0")/self-host"
  project=${COMPOSE_PROJECT_NAME:-slatebox}
  [[ "$project" =~ ^[a-z0-9][a-z0-9_-]*$ ]] || die 'Use a lowercase Compose project name.'
  export COMPOSE_PROJECT_NAME="$project"
  state=${SLATEBOX_STATE:-.state}
  state=$(cd "$(dirname "$state")" && pwd -P)/$(basename "$state")
  export SLATEBOX_STATE="$state"
  identity="$state/start-instance"
  pending="$state.start-pending"
  daemon=$(docker info --format '{{.ID}}')
  [[ -n "$daemon" ]] || die 'Cannot identify the Docker daemon.'
  owner=''
  record="$identity"
  if [[ ! -f "$record" ]]; then record="$pending"; fi
  if [[ -f "$record" ]]; then
    { IFS= read -r old_project; IFS= read -r owner; IFS= read -r old_daemon; } < "$record"
    [[ "$old_project" == "$project" && "$old_daemon" == "$daemon" && "$owner" =~ ^[0-9a-f]{32}$ ]] ||
      die 'Use the Docker daemon and Compose project that own this installation.'
  elif [[ -e "$state" || -L "$state" ]]; then
    die 'These settings were prepared separately. Use self-host/run with their existing project or follow the documented upgrade or restore procedure.'
  fi

  # Include stopped containers, retained volumes and resources without Compose labels.
  # Existing settings alone do not prove which credentials belong to a database volume.
  volumes=$(docker volume ls --format '{{.Name}}' --filter "label=com.docker.compose.project=$project")
  all_volumes=$(docker volume ls --format '{{.Name}}')
  for name in ${project}_mongo-data ${project}_caddy-data; do
    if grep -Fxq "$name" <<< "$all_volumes"; then volumes="$volumes $name"; fi
  done
  for name in $volumes; do
    marker=$(docker volume inspect --format '{{index .Labels "com.slatebox.installation"}}' "$name")
    [[ -n "$owner" && "$marker" == "$owner" ]] || die "Existing volume $name belongs to another installation. Use a fresh project or the documented upgrade path."
  done
  disconnected_app=''
  containers=$(docker ps -aq --filter "label=com.docker.compose.project=$project")
  for container in $containers; do
    file=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project.config_files"}}' "$container")
    [[ -n "$owner" && ( "$file" == "$(pwd -P)/compose.yaml" || "$file" -ef ./compose.yaml ) ]] || die "Existing containers belong to another installation of project $project."
    service=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.service"}}' "$container")
    if [[ "$service" == app ]]; then
      mounted=$(docker inspect --format '{{range .Mounts}}{{if eq .Destination "/opt/slatebox/settings.json"}}{{.Source}}{{end}}{{end}}' "$container")
      [[ "$mounted" == "$state/settings.json" || "$mounted" -ef "$state/settings.json" ]] || die 'The project app uses a different settings file.'
      if [[ $(docker inspect --format '{{len .NetworkSettings.Networks}}' "$container") == 0 ]]; then
        disconnected_app=$container
      fi
    fi
  done
  networks=$(docker network ls --format '{{.Name}}' --filter "label=com.docker.compose.project=$project")
  all_networks=$(docker network ls --format '{{.Name}}')
  if [[ -n "$networks" ]] || grep -Fxq "${project}_default" <<< "$all_networks"; then
    [[ -n "$owner" && -n "$volumes" && "$networks" == "${project}_default" ]] ||
      die "Existing network conflicts with project $project. Choose a fresh project."
  fi

  if [[ -f "$state/start-volume" ]] && ! grep -Fxq "${project}_mongo-data" <<< "$all_volumes"; then
    die 'The original database volume is missing. Restore the instance from backup before starting.'
  fi
  if [[ -n "$volumes" && ( ! -f "$state/instance.env" || ! -f "$state/settings.json" ) ]]; then
    die 'The installation settings for the existing database are missing. Restore them from backup.'
  fi
  if [[ -z "$owner" ]]; then
    owner=$(od -An -N16 -tx1 /dev/urandom | tr -d ' \n')
    temp=$(mktemp "$state.start-pending.XXXXXXXX")
    trap 'rm -f "$temp"' EXIT
    printf '%s\n%s\n%s\n' "$project" "$owner" "$daemon" > "$temp"
    ln "$temp" "$pending" || die 'Another process is starting this instance. Retry ./start.'
  fi
  if [[ ! -e "$state" ]]; then
    ../initialize "$@"
  elif [[ ! -f "$state/settings.json" || ! -f "$state/instance.env" ]]; then
    die 'Incomplete settings directory. Check the original settings before starting this installation.'
  fi
  if [[ ! -f "$identity" ]]; then ln "$pending" "$identity"; fi
  if [[ -f "$pending" && "$pending" -ef "$identity" ]]; then rm "$pending"; fi
  # Installer inputs apply on first launch. On retries Compose must use the settings
  # that belong to the retained database, even from a shell with different defaults.
  unset APP_PORT COLLAB_PORT ROOT_URL WS_URL APP_IMAGE COLLAB_IMAGE COMPOSE_PROFILES
  unset MONGO_ROOT_PASSWORD APP_PASSWORD RELAY_PASSWORD REPLICA_KEY API_GEN_KEY API_KEYS
  services=$(./run config --services)
  if [[ $# == 1 ]] && ! grep -Fxq proxy <<< "$services"; then
    die 'This instance uses HTTP. Use the documented HTTPS promotion flow.'
  fi
  # Docker creates a named volume atomically. Verify the winner's label even if
  # another extracted kit tried to claim the same project after our initial check.
  claim_volume() {
    local logical=$1 name="${project}_$1" marker
    docker volume create --label "com.docker.compose.project=$project" --label "com.docker.compose.volume=$logical" \
      --label "com.slatebox.installation=$owner" "$name" >/dev/null
    marker=$(docker volume inspect --format '{{index .Labels "com.slatebox.installation"}}' "$name")
    [[ "$marker" == "$owner" ]] || die "Volume $name belongs to another installation."
  }
  claim_volume mongo-data
  : > "$state/start-volume"
  if grep -Fxq proxy <<< "$services"; then claim_volume caddy-data; fi
  # A port-bind failure can detach the app from every network. Compose can
  # restart that container without restoring DNS, so recreate just the app.
  if [[ -n "$disconnected_app" && "$networks" == "${project}_default" ]]; then
    ./run up --no-start --no-deps --force-recreate --pull never app
  fi
  ./run up -d --wait --pull never
  ./run exec -T app node -p 'new URL("/start", process.env.ROOT_URL).href'
}

if [[ $(basename "$0") == start ]]; then start_instance "$@"; exit; fi

case "${1:-}" in
  pack)
    [[ $# == 3 ]] || die 'Usage: release-kit.sh pack APP_CHECKOUT OUTPUT_DIRECTORY'
    : "${APP_IMAGE:?Set APP_IMAGE to the tagged self-host app build}"
    : "${COLLAB_IMAGE:?Set COLLAB_IMAGE to the matching tagged relay build}"
    app=$2
    out=$(cd "$3" && pwd -P)
    host=${TARGET_PLATFORM:-$(platform)}
    case "$host" in linux/arm64|linux/amd64) ;; *) die "Unsupported Docker host: $host";; esac
    app_rev=$(docker image inspect --platform "$host" --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$APP_IMAGE")
    engine_rev=$(docker image inspect --platform "$host" --format '{{index .Config.Labels "com.slatebox.engine.revision"}}' "$APP_IMAGE")
    relay_rev=$(docker image inspect --platform "$host" --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$COLLAB_IMAGE")
    for rev in "$app_rev" "$engine_rev" "$relay_rev"; do
      [[ "$rev" =~ ^[a-f0-9]{7,40}$ ]] || die 'Use images from the tagged self-host source build.'
    done
    full_app_rev=$(git -C "$app" rev-parse --verify "$app_rev^{commit}")
    name="slatebox-$app_rev-$engine_rev-$relay_rev-${host#linux/}.tar"
    [[ ! -e "$out/$name" && ! -e "$out/$name.sha256" ]] || die "Archive already exists: $name"
    work=$(mktemp -d "$out/.slatebox-release.XXXXXXXX")
    trap 'rm -rf "$work"' EXIT
    kit="$work/slatebox-release"
    mkdir "$kit"
    startup_files=(LICENSE.md self-host/{compose.yaml,Caddyfile,init.mjs,mongo-init.js,run,README.md})
    if git -C "$app" cat-file -e "$full_app_rev:self-host/hostnames.mjs" 2>/dev/null; then
      startup_files+=(self-host/hostnames.mjs)
    fi
    git -C "$app" archive "$full_app_rev" "${startup_files[@]}" | tar -xf - -C "$kit"
    tools_dir=$(cd "$(dirname "$0")" && pwd -P)
    # A standalone download remains a complete packer. The tools download adds
    # recovery utilities to the private kit, independently of its app revision.
    if [[ -f "$tools_dir/backup-instance.sh" || -f "$tools_dir/restore-instance.sh" ]]; then
      [[ -f "$tools_dir/backup-instance.sh" && -f "$tools_dir/restore-instance.sh" ]] ||
        die 'The offline recovery tools are incomplete. Extract the complete release-tools.tar.gz or use the standalone packer in its own directory.'
      cp "$tools_dir/backup-instance.sh" "$tools_dir/restore-instance.sh" "$kit/self-host/"
      chmod 700 "$kit/self-host/"{backup,restore}-instance.sh
      README="$kit/self-host/README.md"
      {
        cat <<'RECOVERY'
## Back up or recover this release

Use the recovery scripts included beside this README for backup and migration.
They supersede any manual volume-copy examples further down. Run them from
the extracted release’s `self-host/` directory.

On the running source, select its existing Compose project and active settings
directory. Give the backup a new directory on protected storage.

```sh
bash ./backup-instance.sh /protected/backup-directory
```

For final cutover, use `--leave-stopped` before the directory to prevent further
source writes. Transfer the complete backup privately. On the receiving host,
use the matching kit, a new Compose project name and an unused state directory.

```sh
COMPOSE_PROJECT_NAME=slatebox-recovered SLATEBOX_STATE="$PWD/.recovered" bash ./restore-instance.sh /protected/backup-directory
```

Verify a known private board and its invitation before switching traffic. Keep
external object storage in your backup plan. [Docker installation and recovery guide](https://docs.slatebox.com/installation/install-with-docker/#move-a-backed-up-instance-to-another-docker-host)

RECOVERY
        cat "$README"
      } > "$work/kit-readme"
      mv "$work/kit-readme" "$README"
    fi
    cp "$0" "$kit/initialize"
    cp "$0" "$kit/start"
    chmod 700 "$kit/initialize" "$kit/start"

    # Resolve dependencies from the versioned Compose file with inert values only.
    compose=(docker compose)
    if ! docker compose version >/dev/null 2>&1; then compose=(docker-compose); fi
    APP_PORT=7070 COLLAB_PORT=7071 SLATEBOX_STATE=/unused ROOT_URL=http://localhost:7070 \
      MONGO_ROOT_PASSWORD=unused APP_PASSWORD=unused RELAY_PASSWORD=unused REPLICA_KEY=unused \
      API_GEN_KEY=unused API_KEYS=unused \
      "${compose[@]}" --env-file /dev/null --profile https -f "$kit/self-host/compose.yaml" config --images | sort -u > "$kit/images.txt"
    images=()
    while IFS= read -r ref; do
      require_image "$ref"
      images+=("$ref")
    done < "$kit/images.txt"
    printf '%s\n' "$host" > "$kit/platform"
    printf '%s\n' "$APP_IMAGE" > "$kit/app-image"
    printf '%s\n' "$COLLAB_IMAGE" > "$kit/relay-image"
    docker image save --platform "$host" "${images[@]}" | gzip -1 > "$kit/images.tar.gz"
    tar -cf "$work/$name" -C "$work" slatebox-release
    (cd "$work"; if command -v sha256sum >/dev/null; then sha256sum "$name"; else shasum -a 256 "$name"; fi) > "$work/$name.sha256"
    ln "$work/$name" "$out/$name"
    ln "$work/$name.sha256" "$out/$name.sha256"
    printf 'Archive: %s/%s\n' "$out" "$name"
    cat "$out/$name.sha256"
    ;;
  *)
    [[ $(basename "$0") == initialize ]] || die 'Usage: release-kit.sh pack APP_CHECKOUT OUTPUT_DIRECTORY'
    previous=''
    if [[ $# == 2 && $1 == --upgrade-from ]]; then
      previous=$(cd "$2" && pwd -P) || die 'Choose the settings directory of the running instance.'
      [[ -f "$previous/instance.env" && -f "$previous/settings.json" ]] || die 'The previous instance needs both instance.env and settings.json.'
      [[ -z ${SLATEBOX_STATE:-} && -z ${APP_IMAGE:-} && -z ${COLLAB_IMAGE:-} ]] ||
        die 'Unset SLATEBOX_STATE, APP_IMAGE and COLLAB_IMAGE before preparing the new kit.'
    elif [[ $# != 0 && !( $# == 1 && $1 == --https ) ]]; then
      die 'Usage: ./initialize [--https | --upgrade-from PREVIOUS_SETTINGS_DIRECTORY]'
    fi
    cd "$(dirname "$0")"
    host=$(platform)
    expected=$(cat platform)
    [[ "$host" == "$expected" ]] || die "This release requires $expected; your Docker daemon runs $host."
    cd self-host
    state=${SLATEBOX_STATE:-.state}
    [[ ! -e "$state" && ! -L "$state" ]] || die "Instance settings already exist: $state"
    if [[ -n "$previous" ]]; then check_running_instance; fi
    APP_IMAGE=$(cat ../app-image)
    COLLAB_IMAGE=$(cat ../relay-image)
    export APP_IMAGE COLLAB_IMAGE
    docker image load -i ../images.tar.gz
    while IFS= read -r ref; do require_image "$ref"; done < ../images.txt
    if [[ -n "$previous" ]]; then prepare_upgrade; else exec ./run init "$@"; fi
    ;;
esac
