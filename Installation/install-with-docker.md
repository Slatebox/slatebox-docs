# Host a Slatebox instance

Run the whiteboard, its authenticated collaboration relay and MongoDB on a Docker host you manage. Browser clients connect to your app and relay. Board data lives in a persistent MongoDB volume. If you want Slatebox to operate the service, start in Slatebox Cloud. [Open the hosted app](https://app.slatebox.com/start)

## Get the release

The Slatebox app and SlateboxJS engine are MIT licensed. Request a matched self-host release from Slatebox and include the Linux architecture reported by `docker version --format '{{.Server.Arch}}'`. For a first install, ask for the **ARM64 or AMD64 release archive and its SHA-256 checksum**. It includes the app, authenticated collaboration relay, MongoDB, optional HTTPS proxy and startup files. [Request release access](mailto:tim@slatebox.com?subject=Slatebox%20self-host%20release%20kit) · [Enterprise deployment options](https://slatebox.com/enterprise/)

| What you have | Where to start |
| --- | --- |
| A release kit and checksum | [Load it on a fresh Docker host](#start-from-a-release-kit). The operator can install without signing in to a container registry. |
| A release directory and tagged image pair | [Install from separate images](#install-slatebox-on-your-own-server). Match the images to your host architecture. |
| Source access | [Build the images](#build-from-the-three-source-checkouts) from the supplied app and engine revisions and the matching public relay revision. |
| A hosted Slatebox account | [Open Slatebox Cloud](https://app.slatebox.com/start) to use a board immediately. |

The public `timheckel/slatebox-community:latest` image on Docker Hub is the 2022 community release. Its Compose setup predates the authenticated relay used by today's app. Use the matched release for this guide. [Legacy image tags](https://hub.docker.com/r/timheckel/slatebox-community/tags) · [Slatebox relay source](https://github.com/Slatebox/y-websocket)

## Start from a release kit

Use Docker Engine and CLI 28.1 or newer with Compose v2 on a Linux Docker host that matches the release architecture. Obtain the archive and its SHA-256 checksum file through your release contact. Copy both files into a fresh installation directory on the receiving machine. These commands assume one supplied archive and checksum file in that directory.

```sh
sha256sum -c slatebox-*.tar.sha256
```

Continue once the checksum reports `OK`. On macOS use `shasum -a 256 -c slatebox-*.tar.sha256`. Extract the kit and launch it on your Docker host.

```sh
tar -xf slatebox-*.tar
cd slatebox-release
./start
```

Open the address printed by `./start`. The default is [http://localhost:7070/start](http://localhost:7070/start) on the Docker host. Create a slate, add a note and reopen its URL. The launcher loads the supplied images, creates private settings and waits for the database, collaboration relay and app to be ready. Keep the extracted kit. Run `./start` from that directory again to resume an interrupted launch or restart the same instance. If the launcher finds another installation under that project name, it leaves its boards in place. To upgrade it, follow the [release upgrade procedure](#upgrade-an-existing-team-from-a-release-kit). [Open a remote trial from your laptop](#try-a-remote-host-over-ssh) · [Back up your boards](#move-a-backed-up-instance-to-another-docker-host)

If another service already uses ports 7070 or 7071, choose two unused ports on the first launch, for example `APP_PORT=17070 COLLAB_PORT=17071 ./start`. Future starts reuse the saved ports. If Docker reports a port conflict after setup, free the saved port and rerun `./start` to resume with the same boards and credentials.

For a fresh team installation with the bundled HTTPS proxy, set up DNS and open ports 80 and 443 first. Run this in place of the first `./start`, using the two hostnames your team controls.

```sh
ROOT_URL=https://boards.example.com WS_URL=wss://live.example.com ./start --https
```

[Set up DNS and HTTPS](#use-your-enterprise-hostnames) · [Move an existing trial to team hostnames](#keep-the-boards-from-your-pilot)

### Earlier release kits

If your extracted kit has only `initialize`, use its original startup commands from the `slatebox-release` directory. Run the initializer once. On subsequent starts, run the Compose command in `self-host/` with the same settings and project name.

```sh
./initialize
cd self-host
./run up -d --wait --pull never
```

## Try a remote host over SSH

Start the release kit on the VM first. You can request a matched archive and checksum from Slatebox. [Get the release](#get-the-release) · [Start the kit on the VM](#start-from-a-release-kit)

Once the app is healthy, open a tunnel from the laptop where you want to try the board. Slatebox serves the app on the VM’s loopback port 7070 and live edits on port 7071. Forward both so your browser can reach the two services. This works with the default loopback installation before you set up DNS.

Run this in a terminal on your laptop. Replace `operator@your-docker-host` with your SSH login and host. Keep this terminal open during the evaluation.

```sh
ssh -NT -o ExitOnForwardFailure=yes \
  -L 127.0.0.1:7070:127.0.0.1:7070 \
  -L 127.0.0.1:7071:127.0.0.1:7071 operator@your-docker-host
```

Open [Slatebox on your laptop](http://localhost:7070/start) and create a slate. Under **Share**, copy an edit link and open it in a private browser window on the same laptop. Join as a second editor, add a note and watch it appear in the original window. Press **Ctrl+C** in the SSH terminal to close the tunnel. The remote instance keeps running and stores the slate on the VM.

A localhost link takes each reader to their own computer. Give the app and relay team hostnames before sending invitations to colleagues. [Keep the boards from your pilot](#keep-the-boards-from-your-pilot) · [Set up a fresh team instance](#use-your-enterprise-hostnames)

## Choose a host for a team evaluation

The quickest self-host route is a matched release kit on a Linux Docker host your team already operates. Open the first slate, save a note and reopen it. For a team trial, give the app and relay separate HTTPS hostnames and invite a second editor. If you need a board today while release access is being arranged, [start in Slatebox Cloud](https://app.slatebox.com/start).

### Existing Docker host, DigitalOcean Droplet or AWS EC2

| Where to run it | What to provision | What your team owns |
| --- | --- | --- |
| Existing Linux VM or on-premises server | Docker Engine, Compose v2, persistent disk and a matched pair of images. Request the ARM64 or AMD64 archive for that host. | Host patching, capacity, backups and recovery. This is the shortest path when a suitable machine is already available. |
| DigitalOcean Droplet | The Docker Marketplace image installs Docker Engine and Compose. Check the installed versions with `docker version` and `docker compose version`. For an x86-64 Droplet, request the Linux AMD64 archive. | SSH access, firewall, DNS and backups. Budget for the Droplet even when powered off, plus any separately purchased volumes and backups. [Docker Marketplace image](https://docs.digitalocean.com/products/marketplace/catalog/docker/) · [Droplet billing](https://docs.digitalocean.com/products/droplets/details/pricing/) |
| AWS EC2 | A Graviton instance with an Arm64 Linux image matches the ARM64 archive. Install Docker Engine and Compose v2. Place Docker's persistent data on EBS and choose what should happen to that volume on instance termination. | EC2, disk and backup costs, security groups and DNS. This fits teams that already operate an AWS account and restore EBS-backed hosts. [AWS Graviton](https://aws.amazon.com/ec2/graviton/) · [Amazon EBS volumes](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes.html) |

**Storage determines which services fit.** This release runs its own MongoDB replica set on a persistent Docker volume. DigitalOcean App Platform documents ephemeral container filesystems and no volume support. Moving this topology there would also require a separate database and a new deployment procedure. On either VM option, the app and relay both need working WebSocket upgrades. [App Platform storage limits](https://docs.digitalocean.com/products/app-platform/details/limits/)

### DigitalOcean open source credits

On 1 October 2026 the Node.js build team published a DigitalOcean notice closing new Open Source Credits applications and renewals. DigitalOcean later offered to work directly with Node.js. As of 18 November 2026, our hosting comparison assumes regular billing for a new Slatebox installation. [Program notice and follow-up](https://github.com/nodejs/build/issues/4499) · [DigitalOcean open-source resources](https://www.digitalocean.com/open-source)

### Hosting a public project demo

For an evaluation that needs to start today, use a Linux VM your team already operates. If you want a dedicated host with a short setup, the Docker Droplet is a paid VM with Docker installed. Choose its release archive by the VM's reported architecture. [DigitalOcean Docker Droplet](https://docs.digitalocean.com/products/marketplace/catalog/docker/)

For infrastructure that serves the open-source project itself, AWS reviews applications for credits. Its criteria include an OSI-approved license, an active community, independence from single-vendor dominance and no venture funding. Oregon State University’s Open Source Lab also reviews hosting requests for projects with community impact. Budget for regular hosting until a provider approves the project. [AWS open-source credits](https://aws.amazon.com/blogs/opensource/aws-cloud-credits-for-open-source-projects-affirming-our-commitment/) · [OSU Open Source Lab hosting policy](https://osuosl.org/services/hosting/policy/)

### What the Slatebox release checks covered

On a separate Linux ARM64 Docker host, the November 18 kit for release `20261118T160440Z` was 658.5 MiB. After extraction, `./start` took 109 seconds to load the images and report a ready app. A new owner created a private map. A reader opened its view link, followed the owner to the second scene and reloaded into that scene. Near the end of that two-browser trial Docker reported 210 MiB for the app, 27 MiB for the relay and 121 MiB for MongoDB. Allow additional memory for the operating system, Docker, more participants and your boards. Measure with your team's workload before sizing a production host.

The team built and packaged both architectures. On a second ARM64 Docker host, a checksum-verified archive started the app, relay and database with registry pulls disabled. Two guests shared a board, presented an edit and reopened it. The AMD64 app and relay ran under emulation on the build host. On an ARM64 installation, a kit upgrade preserved two registered users, a private map and its existing edit link. A cold backup restored into a fresh database volume returned the board to its saved position, and both editors could collaborate again. A separate recovery drill restored a private board on another Docker host. Two browsers exchanged edits over distinct app and relay HTTPS origins using a local certificate authority. The cloud options above are deployment choices based on provider documentation reviewed on 18 November 2026. Verify public DNS, certificate issuance and a two-user edit on the host you select. [Verify a team connection](#verify-a-team-connection)

## Install Slatebox on your own server

Use a Linux Docker host with persistent disk, Docker Engine and the Compose v2 plugin. A single VM is sufficient to run this topology. Choose a host your team can patch, back up and monitor. Size storage for your boards, MongoDB and backups, and allow extra memory if you build Meteor on the same machine. Docker Desktop and Colima can run a local evaluation when the release directory and instance state are visible to the Docker VM. [Docker Engine installation](https://docs.docker.com/engine/install/) · [Compose installation](https://docs.docker.com/compose/install/)

Start in the release’s `self-host/` directory. Check that you have the scripts and a running Docker daemon.

```sh
test -x ./run && test -f compose.yaml && test -f init.mjs && test -f mongo-init.js
docker compose version
docker version --format '{{.Server.Os}}/{{.Server.Arch}}'
```

Enter the two exact image references from your release or build output in the same terminal. If your release uses a private registry, sign in using its instructions. If you received image archives instead, load each with `docker image load -i /path/to/archive.tar` first. The following commands use locally available images and pull a missing image by its supplied reference.

```sh
printf 'App image: '; read -r APP_IMAGE
printf 'Collaboration image: '; read -r COLLAB_IMAGE
export APP_IMAGE COLLAB_IMAGE
for image in "$APP_IMAGE" "$COLLAB_IMAGE"; do
  docker image inspect "$image" >/dev/null 2>&1 || docker pull "$image"
done
docker image inspect --format '{{.Os}}/{{.Architecture}}' "$APP_IMAGE" "$COLLAB_IMAGE"
```

For a **local evaluation**, initialize once, then start the services. For a **team deployment**, choose the public origins in the hostname section before initializing. The installer runs its setup code inside the app image, so an operator using prebuilt images needs no host Node installation.

```sh
./run init
unset APP_IMAGE COLLAB_IMAGE
./run up -d --wait
./run ps -a
curl --fail --show-error http://localhost:7070/readyz
```

The app, relay and MongoDB should be healthy. The one-time `mongo-init` service should exit successfully. On the Docker host open [the local start screen](http://localhost:7070/start), create a blank slate, add a note and reload. Save its URL. The default app port 7070 and relay port 7071 bind to loopback; MongoDB is reachable only on the Compose network. If readiness fails, inspect the service status and recent local logs.

```sh
./run ps -a
./run logs --tail=80 app collab mongo-init
```

## Use your enterprise hostnames

Choose an app hostname and a separate relay hostname. Point both DNS records at the host that will terminate TLS. Then choose **one** of the following paths for a new installation, using the image references you exported earlier.

### Let Compose run the HTTPS proxy

On a single VM with no existing proxy, allow inbound TCP ports 80 and 443. Confirm both public hostnames resolve to this VM, including any IPv6 records. The managed HTTPS option runs Caddy in the Compose project, obtains certificates for the two names and forwards app and relay traffic. Replace the example domains with hostnames you control.

```sh
ROOT_URL=https://boards.example.com WS_URL=wss://live.example.com ./run init --https
unset APP_IMAGE COLLAB_IMAGE
./run up -d --wait
./run ps -a
```

The release check used Caddy’s local certificate authority and two separate hostnames. Two browsers exchanged edits over secure WebSockets and reopened the saved slate. Public DNS and public certificate issuance require a check on your deployment.

Keep the named `caddy-data` volume across restarts to retain certificate and account state. If a certificate fails to issue, check DNS, the firewall, any other service bound to ports 80 or 443, and `./run logs --tail=80 proxy`. [How Caddy obtains and renews certificates](https://caddyserver.com/docs/automatic-https)

### Keep the boards from your pilot

A trial on `localhost` can become the team instance on the same Docker host. Before moving it, have anyone who owns a board as a guest save their account with an email and password. Write down each board’s path starting with `/canvas/`. The new hostname has its own browser session.

Use a release whose `self-host/` directory includes `hostnames.mjs`. If your kit predates this command, ask your release contact for the updated kit. Make a [backup of the database and installation settings](#move-a-backed-up-instance-to-another-docker-host), start the pilot again, and keep its Compose project name and state directory selected. Point two DNS names at the host and allow inbound TCP 80 and 443 for the bundled proxy.

From `self-host/`, substitute your hostnames and choose a new directory for the team settings.

```sh
ROOT_URL=https://boards.example.com WS_URL=wss://live.example.com ./run promote .team-state
export SLATEBOX_STATE=.team-state
./run up -d --wait
```

The first command copies the installation settings and credentials into the new directory and sets the app and relay origins. Starting the services with that directory uses the existing database. Keep `SLATEBOX_STATE` and the project name set the same way on future runs. Sign in at the new hostname, open a saved board path and send collaborators the updated link. Check that another editor’s change arrives in your browser.

To return to the original loopback setup, stop the proxy with the team settings selected, select the pilot’s original state directory again and start the services. For a pilot that used the default `.state/`, run:

```sh
SLATEBOX_STATE=.team-state ./run stop proxy
unset SLATEBOX_STATE
./run up -d --wait
```

### Bring your existing reverse proxy

Initialize the standard loopback services and configure your existing TLS proxy to reach them. When the proxy runs on the Docker host, forward the app hostname to `127.0.0.1:7070` and the relay hostname to `127.0.0.1:7071`. Enable WebSocket upgrades on **both** upstreams.

```sh
ROOT_URL=https://boards.example.com WS_URL=wss://live.example.com ./run init
unset APP_IMAGE COLLAB_IMAGE
./run up -d --wait
```

### Verify a team connection

From a separate device check `https://boards.example.com/readyz` using your real hostname, then open its `/start` page and create a disposable slate. Grant a second account edit access. Open the slate in both browsers and confirm that moving a note appears immediately in the other browser. Reload the second browser to confirm the edit persists.

## Build from the three source checkouts

With release access, check out the matching app and SlateboxJS engine revisions. Check out the relay revision supplied for that release from Slatebox’s public fork of y-websocket. [Relay source](https://github.com/Slatebox/y-websocket) Source builds require Git, Bash, tar, npm, Node.js, Docker and network access for build dependencies. From the app checkout’s `self-host/` directory run the command for **one** target architecture, replacing the paths with your local checkout paths.

```sh
# For Intel or AMD 64-bit Linux
TARGET_PLATFORM=linux/amd64 ./build-images.sh /path/to/slateboxjs-v2 /path/to/y-websocket
```

```sh
# For 64-bit Arm Linux
TARGET_PLATFORM=linux/arm64 ./build-images.sh /path/to/slateboxjs-v2 /path/to/y-websocket
```

The script stages committed source, packs the matching engine into the app, builds the two Docker images and verifies each target architecture. It prints `APP_IMAGE` and `COLLAB_IMAGE` values with revision and architecture tags. Use those tags for initialization. For a different target architecture, use a native builder or configure Docker emulation. The output is a pair of local images for the selected platform. [Docker multi-platform build options](https://docs.docker.com/build/building/multi-platform/)

### Package a source build for another team

On your build host, use the `APP_IMAGE` and `COLLAB_IMAGE` tags printed by the source build. Pull the MongoDB and Caddy versions pinned in that release’s Compose file with `docker pull --platform linux/arm64` or `linux/amd64` as appropriate. Set `TARGET_PLATFORM` to the receiving Docker host’s platform when packaging a cross-build. Download the [release packaging script](/assets/self-host/release-kit.sh). From the parent of your app checkout, run it with the app checkout path and an existing output directory.

```sh
printf 'App build tag: '; read -r APP_IMAGE
printf 'Relay build tag: '; read -r COLLAB_IMAGE
export APP_IMAGE COLLAB_IMAGE
mkdir -p releases
bash release-kit.sh pack /path/to/app releases
```

The packager reads the startup files from the app revision stamped on the local image. It exports the four images and writes the archive and its `.tar.sha256` file. Give both to authorized operators. Instance credentials and board data are generated or restored on the receiving host.

## Environment Variables

Initialization writes your private `.state/instance.env` and `.state/settings.json`. Keep them with the installation. Running init against an existing state directory preserves its credentials and exits. For another instance choose separate `COMPOSE_PROJECT_NAME`, `SLATEBOX_STATE`, `APP_PORT` and `COLLAB_PORT` values. Use the same project name and state path for all subsequent operations.

| Capability | What your installation needs |
| --- | --- |
| Draw, save, reopen and collaborate on boards | The app, its WebSocket relay and persistent MongoDB from the Compose stack. |
| Email invitations, verification links and password resets | Configure your SMTP URL in private `mailGun.server` settings and verify delivery to a test account. |
| AI-authored workshops | Enable drafting for registered users with `selfHosted.workshopAI` in private settings. The default provider uses your `API_KEY_DEEP_INFRA` in `.state/instance.env` and bills your DeepInfra account. You can also [connect a model server you operate](#run-workshop-ai-on-your-own-infrastructure). |
| Audio and video calls | Configure your own Daily account in private `daily.apiKey` settings. Daily hosts the media rooms. Camera and microphone access requires HTTPS or localhost. Without a Daily key, calls are unavailable and board collaboration continues. |
| Published presentation images | Configure `aws.region`, `aws.accessKey`, `aws.secretKey`, `aws.imageBucket` and `aws.cloudUrl` for your image bucket and viewer-accessible HTTPS asset origin. |

The app’s `public` settings are delivered to browsers. Keep secrets in server settings. Apply app configuration changes with `./run up -d --no-deps --force-recreate --wait app`. Your cloud subscription, provider credentials and existing hosted slates are separate from the fresh installation.

## Run workshop AI on your own infrastructure

The board VM runs the app, collaboration relay and MongoDB. AI drafting is optional. You can run a tool-capable model on the same machine if it has enough memory for both workloads, or use a private inference host so generating a draft does not compete with collaborators for VM resources.

In `.state/settings.json`, set `selfHosted.workshopAI` to `true` and configure `selfHosted.workshopProvider` with the model server’s API root (`baseUrl`) and exact model name (`model`). Use an address the app container can reach. A server on another machine needs its internal hostname. Two containers on the same Docker network can use a service name. Keep any required bearer credential in the private `workshopProvider.apiKey` field.

For example, if you run llama.cpp under the alias `slatebox-local`, merge these fields into the existing private settings. Replace the example hostname and port with your server’s address. Slatebox appends `/chat/completions` to the API root.

```json
{
  "selfHosted": {
    "workshopAI": true,
    "workshopProvider": {
      "baseUrl": "http://inference.internal:8080/v1",
      "model": "slatebox-local"
    }
  }
}
```

An operator test used llama.cpp build 9910 with the Q4_K_M GGUF of Qwen3-4B-Instruct-2507 on an M3 Ultra. After downloading the weights, the model server ran with `--jinja --ctx-size 8192 --alias slatebox-local` and the default `toolChoice` of `auto`. A registered user generated a sorting workshop, opened it as a private slate, moved a card and presented the result. A branching map draft also retained the two requested cue messages. The weights file is about 2.5 GB. Budget additional memory for inference and test your expected concurrent workload on your own hardware. Once the weights are installed, local drafting can use that private endpoint without an external inference service. [llama.cpp server setup](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md) · [Qwen3-4B-Instruct-2507 GGUF files](https://huggingface.co/lmstudio-community/Qwen3-4B-Instruct-2507-GGUF)

Run `./run up -d --no-deps --force-recreate --wait app`. From a registered account, open `/workshops`, choose **Ask AI**, then **Draft a different board**. Enter a brief, choose **Draft with AI**, and move a card on the result. The endpoint receives the brief and, for rule revisions, the current workshop model. Audio and video rooms use Daily separately. See **Use your own inference endpoint** in your release’s `self-host/README.md` for the model server requirements.

## Restart and update

`./run stop` stops the services. `./run up -d --wait` starts them again. `./run down` removes the containers and retains the named database volume. [Docker volume lifecycle](https://docs.docker.com/engine/storage/volumes/)

### Upgrade an existing team from a release kit

Obtain the new kit and its checksum for the same Docker host architecture. Use a new kit with the `--upgrade-from` option. Keep the current release in its own directory. Schedule a maintenance window, take a backup, and start the original instance again. Sign in and save the URL of a private slate to check after the upgrade. [Get the release](#get-the-release) · [Back up the instance](#move-a-backed-up-instance-to-another-docker-host)

Put the new archive and checksum in a fresh directory. Keep the Compose project name you used for the running instance. The default is `slatebox`. If you use a custom project name, export that value instead. Set `previous_state` to the **active settings directory** for the running app. For example, a trial promoted to HTTPS may use `.team-state`. It contains `instance.env` and `settings.json`.

```sh
set -e
export COMPOSE_PROJECT_NAME=slatebox
previous_state=/path/to/current/slatebox-release/self-host/.state
unset APP_IMAGE COLLAB_IMAGE SLATEBOX_STATE
sha256sum -c slatebox-*.tar.sha256
tar -xf slatebox-*.tar
cd slatebox-release
./initialize --upgrade-from "$previous_state"
```

Preparation checks that the running app uses those settings, loads the images locally, and creates a private copy of the configuration in the new kit. The current app keeps serving your team at this point. To switch to the new release, run the commands below in the same terminal so the project name stays selected.

```sh
cd self-host
./run up -d --wait --pull never
./run ps -a
```

Open the saved private slate at its original URL. Sign in as the same owner, ask a second editor to move a note, then reload to confirm the edit persisted. Run subsequent commands from the new release's `self-host` directory with the same project name. Keep the backup and the original configuration available for recovery.

For a manual image upgrade on an installation managed from separate images, back up the instance, load the matched image pair, update the app and relay references in the active settings file, and apply them with `./run up -d --wait --pull never`.

## Move a backed-up instance to another Docker host

Choose a maintenance window. Stopping the app, relay and MongoDB together lets you take a consistent copy of the database files. These commands assume a Linux host with `sha256sum`. Use the Compose project name and active settings directory you used to start the instance. For a promoted HTTPS trial, set `SLATEBOX_STATE` to the team settings directory before taking the backup. On macOS, substitute `shasum -a 256` for `sha256sum`. Run them from the release's `self-host` directory.

```sh
set -e
umask 077
state_dir=${SLATEBOX_STATE:-.state}
backup=$(mktemp -d ./slatebox-backup.XXXXXXXX)
./run down
./run run --rm -T --no-deps --entrypoint tar mongo -C /data/db -czf - . < /dev/null > "$backup/mongo-data.tgz"
tar -C "$state_dir" -czf "$backup/instance.tgz" instance.env settings.json
(cd "$backup" && sha256sum mongo-data.tgz instance.tgz > SHA256SUMS)
```

The archive contains private boards, login data and service credentials. Store the copies together on protected storage and transfer them over an encrypted connection. Back up any external object storage separately. If you enabled managed HTTPS, also back up the `caddy-data` volume to retain certificate state, or let Caddy obtain fresh certificates on recovery with working DNS and reachable public ports. For a backup drill, the original installation can be brought back with `./run up -d --wait` as soon as the files have been copied.

On the recovery host, use the same release, Mongo image version and compatible release images for the host architecture. Copy the three backup files into `backup/` beside the Compose file. Use an unused Compose project name and a new settings directory. Preserve the public URLs for the app and relay so invitation links and browser sessions still address the same instance.

```sh
set -e
umask 077
(cd backup && sha256sum -c SHA256SUMS)
mkdir -m 700 .state
tar -C .state -xzf backup/instance.tgz
export SLATEBOX_STATE="$PWD/.state"
export COMPOSE_PROJECT_NAME=slatebox-restored
```

Before starting the restored instance, set `APP_IMAGE` and `COLLAB_IMAGE` in its restored `.state/instance.env` to the matching pair available on the recovery host. This matters when the replacement host uses a different architecture. Keep the restored database credentials. Then load the volume from the archive.

```sh
./run run --rm -T --no-deps --entrypoint sh mongo -ec \
  'test -z "$(ls -A /data/db)" && tar -C /data/db -xzf -' < backup/mongo-data.tgz
./run up -d --wait
```

The empty-directory check protects existing database files. Open a known private slate as its owner and confirm its contents. For an actual move, direct the original app and relay hostnames to the recovered stack together before accepting edits.
