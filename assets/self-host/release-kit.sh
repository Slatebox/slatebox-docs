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
    cp "$0" "$kit/initialize"
    chmod 700 "$kit/initialize"

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
