# Host a Slatebox instance

Run the Meteor web app, its authenticated collaboration relay, and a single-member MongoDB replica set with persistent storage on your own Docker host. The setup creates fresh installation secrets. Each browser talks to the app and to the collaboration relay at the origins you configure.

## Install Slatebox on your own server

Install Docker Engine and Docker Compose v2 or newer. The initializer uses Node bundled in the app image. Run these commands from the app release’s `self-host/` directory on the Docker host. With Docker Desktop or Colima, keep this checkout and the instance state in a folder shared with the Docker VM so it can mount the configuration files. The current supplied release images are Linux ARM64. Ask Slatebox for access to the image pair while the source repositories are private. For other architectures or a source-controlled release, build the images below.

```sh
APP_IMAGE=registry.example.com/slatebox/app:release \
  COLLAB_IMAGE=registry.example.com/slatebox/relay:release ./run init
./run up -d
./run ps
curl --fail http://localhost:7070/readyz
```

Replace the two image references with the supplied release tags or your local build tags. Sign in to your registry first if it requires authentication. The browser entry is http://localhost:7070/start and the relay listens on ws://localhost:7071. Both ports bind to loopback. MongoDB is reachable only inside the Compose network.

To run multiple instances, use a distinct COMPOSE_PROJECT_NAME, SLATEBOX_STATE directory, APP_PORT and COLLAB_PORT for each one. Keep the project name and state path the same for later commands. `./run stop` stops the containers. `./run up -d` starts them again. `./run down` recreates containers on the next start and preserves the Mongo data volume. Removing the volume deletes the instance data.

## Use your enterprise hostnames

Set the public app and relay origins when initializing. For example, put an HTTPS reverse proxy in front of the two loopback ports and enable WebSocket upgrade forwarding on both upstreams.

```sh
ROOT_URL=https://boards.example.com WS_URL=wss://live.example.com \
  APP_IMAGE=registry.example.com/slatebox/app:release \
  COLLAB_IMAGE=registry.example.com/slatebox/relay:release ./run init
```

The init command creates `.state/instance.env` and `.state/settings.json` with private file permissions. Protect these files and your Mongo volume in backups. Running init against an existing directory stops before changing credentials. For an update, change the two image tags in `instance.env`, make a database backup, and run `./run up -d`. The Mongo initialization service also runs on restart and reuses the original database users.

## Build from the three source checkouts

Use the Slatebox app, SlateboxJS engine and Slatebox collaboration relay repositories. The relay is the Slatebox fork of y-websocket. Use a compatible set of commits supplied by your release contact. With this app checkout open in the self-host directory, run:

```sh
./build-images.sh /path/to/slateboxjs-v2 /path/to/y-websocket
```

The script stages committed source in a temporary directory, builds and packs the engine, and checks the app lock points at that exact local build. It then produces Docker images tagged with the source revisions and prints the two image names to use with init. Source builds need Git, npm, Node.js, Docker, internet access for dependencies, and sufficient memory for the Meteor builder.

By default the script targets the Docker daemon’s native Linux architecture. To select one explicitly, run:

```sh
TARGET_PLATFORM=linux/amd64 ./build-images.sh /path/to/slateboxjs-v2 /path/to/y-websocket
TARGET_PLATFORM=linux/arm64 ./build-images.sh /path/to/slateboxjs-v2 /path/to/y-websocket
```

Build each architecture on a matching Docker host or a builder with emulation for the target. The script loads individual images into the local Docker daemon, checks their architecture and adds an `-amd64` or `-arm64` suffix to each tag. Use the matching pair for your deployment.

## Environment Variables

- **Email** — Set `mailGun.server` in `.state/settings.json` to your SMTP URL for login links, invitations, verification, and password resets.
- **AI** — Set `API_KEY_DEEP_INFRA` in `.state/instance.env` to your own provider credential. In app versions with workshops, set `selfHosted.workshopAI` to `true` to enable agent-authored workshops for registered users.
- **Calls** — Supply `daily.apiKey` from your own Daily account for cloud-hosted media rooms. The bundled WebSocket service carries board changes.
- **Published presentation images** — Configure your own `aws.region`, `aws.accessKey`, `aws.secretKey`, `aws.imageBucket` and `aws.cloudUrl` for the app's S3 image-storage integration. Published images need an HTTPS asset origin reachable by viewers.

Apply settings changes with `./run up -d --force-recreate app`. The app's `public` settings are visible to browsers. Keep credentials in server settings. Configure production access through your organization’s firewall, TLS proxy, and backup process. This Compose installation uses one database member and one relay process.

### Move a backed-up instance to another Docker host

Choose a maintenance window. Stopping the app, relay and MongoDB together lets you take a consistent copy of the database files. These commands assume the default settings directory and the Compose project name used to start the instance. Run them from the release's `self-host` directory.

```sh
set -e
umask 077
backup=$(mktemp -d ./slatebox-backup.XXXXXXXX)
./run down
./run run --rm -T --no-deps --entrypoint tar mongo -C /data/db -czf - . < /dev/null > "$backup/mongo-data.tgz"
tar -C .state -czf "$backup/instance.tgz" instance.env settings.json
(cd "$backup" && shasum -a 256 mongo-data.tgz instance.tgz > SHA256SUMS)
```

The archive contains private boards, login data and service credentials. Store the copies together on protected storage and transfer them over an encrypted connection. Back up any external object storage separately. For a backup drill, the original installation can be brought back with `./run up -d --wait` as soon as the files have been copied.

On the recovery host, use the same release, Mongo image version and compatible release images for the host architecture. Copy the three backup files into `backup/` beside the Compose file. Use an unused Compose project name and a new settings directory. Preserve the public URLs for the app and relay so invitation links and browser sessions still address the same instance.

```sh
set -e
umask 077
(cd backup && shasum -a 256 -c SHA256SUMS)
mkdir -m 700 .state
tar -C .state -xzf backup/instance.tgz
export SLATEBOX_STATE="$PWD/.state"
export COMPOSE_PROJECT_NAME=slatebox-restored
./run run --rm -T --no-deps --entrypoint sh mongo -ec \
  'test -z "$(ls -A /data/db)" && tar -C /data/db -xzf -' < backup/mongo-data.tgz
./run up -d --wait
```

The empty-directory check protects existing database files. Open a known private slate as its owner and confirm its contents. For an actual move, direct the original app and relay hostnames to the recovered stack together before accepting edits.
