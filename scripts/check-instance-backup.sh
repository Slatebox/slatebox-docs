#!/usr/bin/env bash
# A real Docker/Compose fixture. Uses a preloaded Alpine image and local dummy data.
set -euo pipefail
umask 077
script=$(cd "$(dirname "$0")/../assets/self-host" && pwd -P)/backup-instance.sh
docker image inspect alpine:latest >/dev/null
work=$(mktemp -d)
export COMPOSE_PROJECT_NAME="sb-backup-test-$(date +%s)-$$"
mkdir -p "$work/self-host/.active" "$work/self-host/.wrong" "$work/tools"
cd "$work/self-host"
export SLATEBOX_STATE=.active
cat > compose.yaml <<'YAML'
x-service: &service
  image: alpine:latest
  entrypoint: [sh, -c, 'trap "exit 0" TERM; while :; do sleep 0.2; done']
services:
  app:
    <<: *service
    volumes: ['./.active/settings.json:/opt/slatebox/settings.json:ro']
  collab:
    <<: *service
  mongo:
    <<: *service
    volumes: ['mongo-data:/data/db']
  proxy:
    <<: *service
    volumes: ['caddy-data:/data']
volumes:
  mongo-data: {}
  caddy-data: {}
YAML
touch run && chmod +x run
printf 'EXAMPLE=local-fixture\n' >.active/instance.env
printf '{}\n' >.active/settings.json
cp .active/* .wrong/
cleanup(){ docker compose down -v >/dev/null 2>&1; rm -rf "$work"; }
trap cleanup EXIT
docker compose up -d --pull never >/dev/null
for service in mongo proxy; do
  path=/data; if [[ $service == mongo ]]; then path=/data/db; fi
  docker compose exec -T "$service" sh -c 'printf "%s\n" "$2" > "$1/synthetic-record"' sh "$path" "$service"
done
before=$(docker compose ps -q | sort)
[[ -n "$before" ]]
if SLATEBOX_STATE=.wrong bash "$script" "$work/wrong" >/dev/null 2>&1; then exit 1; fi
[[ ! -e "$work/wrong" && $(docker compose ps -q | sort) == "$before" ]]
bash "$script" "$work/backup" >/dev/null
[[ $(docker compose ps -q | sort) == "$before" ]]
(cd "$work/backup" && if command -v sha256sum >/dev/null; then sha256sum -c SHA256SUMS; else shasum -a 256 -c SHA256SUMS; fi) >/dev/null
for pair in mongo-data:mongo caddy-data:proxy; do
  [[ $(tar -xOzf "$work/backup/${pair%:*}.tgz" ./synthetic-record) == "${pair#*:}" ]]
done
for file in instance.env settings.json; do tar -xOzf "$work/backup/instance.tgz" "$file" | cmp - ".active/$file"; done

# Fail only the (now cold) data read. The real original containers must return.
export SB_TEST_REAL_DOCKER=$(command -v docker)
cat > "$work/tools/docker" <<'SH'
#!/usr/bin/env bash
if [[ $1 == start && ${2:-} == --attach ]]; then exit 17; fi
exec "$SB_TEST_REAL_DOCKER" "$@"
SH
chmod +x "$work/tools/docker"
if PATH="$work/tools:$PATH" bash "$script" --leave-stopped "$work/failed" >/dev/null 2>&1; then exit 1; fi
[[ ! -e "$work/failed" && $(docker compose ps -q | sort) == "$before" ]]
bash "$script" --leave-stopped "$work/cutover" >/dev/null
[[ -f "$work/cutover/SHA256SUMS" && -z $(docker compose ps -q) ]]
[[ $(docker compose ps --all -q | sort) == "$before" ]]
printf 'Backup retained active state, both actual volumes and container identities; failure resumed and verified cutover stayed stopped.\n'
