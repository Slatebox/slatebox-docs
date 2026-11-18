#!/usr/bin/env bash
# Assemble an authorized source build, or initialize a fresh host from its archive.
set -euo pipefail
umask 077
die() { printf '%s\n' "$*" >&2; exit 1; }
platform() { docker version --format '{{.Server.Os}}/{{.Server.Arch}}'; }
require_image() {
  docker image inspect --platform "$host" "$1" >/dev/null || die "A local $host image is required for $1."
}

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
    git -C "$app" archive "$full_app_rev" LICENSE.md self-host/{compose.yaml,Caddyfile,init.mjs,mongo-init.js,run,README.md} | tar -xf - -C "$kit"
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
    [[ $# == 0 || ( $# == 1 && $1 == --https ) ]] || die 'Usage: ./initialize [--https]'
    cd "$(dirname "$0")"
    host=$(platform)
    expected=$(cat platform)
    [[ "$host" == "$expected" ]] || die "This release requires $expected; your Docker daemon runs $host."
    cd self-host
    state=${SLATEBOX_STATE:-.state}
    [[ ! -e "$state" && ! -L "$state" ]] || die "Instance settings already exist: $state"
    APP_IMAGE=$(cat ../app-image)
    COLLAB_IMAGE=$(cat ../relay-image)
    export APP_IMAGE COLLAB_IMAGE
    docker image load -i ../images.tar.gz
    while IFS= read -r ref; do require_image "$ref"; done < ../images.txt
    exec ./run init "$@"
    ;;
esac
