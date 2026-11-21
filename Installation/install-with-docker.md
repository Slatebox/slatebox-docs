# Run your own Slatebox

One container is a complete Slatebox: the app, live collaboration and the database. Run it, then open [http://localhost:7070](http://localhost:7070) on the same machine.

<!-- tabs -->

```sh Docker
docker run -d --name slatebox -p 7070:7070 -v slatebox-data:/data ghcr.io/slatebox/slatebox
```

```yaml Docker Compose
# compose.yaml — start it with: docker compose up -d
services:
  slatebox:
    image: ghcr.io/slatebox/slatebox
    container_name: slatebox
    ports: ["7070:7070"]
    volumes: [slatebox-data:/data]
volumes:
  slatebox-data:
    name: slatebox-data
```

<!-- /tabs -->

You get a new slate of your own. There is nothing to configure: the first start creates the secrets this installation needs and keeps them with your data. Your own Slatebox has no meters; AI and calls use your own keys. [No meters on your own server](self-host-meters.md)

Would rather not run anything? [Use Slatebox Cloud](https://app.slatebox.com/start).

## What you need

| | |
| --- | --- |
| Docker | Docker Engine on Linux, or Docker Desktop on macOS or Windows. The image runs on `linux/amd64` and `linux/arm64`. |
| Processor | Intel or AMD with AVX (Sandy Bridge or Bulldozer and later), or ARMv8.2-A (Apple silicon, Raspberry Pi 5). A Raspberry Pi 4 cannot run it. In a virtual machine, give the guest the host's CPU type so AVX is passed through. |
| Memory | 1 GB free, 2 GB for a team. [Single sign-on](single-sign-on.md) adds about 0.5 GB while it is on. |
| Disk | About 585 MB to download and 2.5 GB unpacked, plus your slates. |

On a processor without AVX or ARMv8.2-A, the container stops at once and its log says why:

```text Output
[slatebox] This processor cannot run MongoDB 8.0: it needs the AVX instruction set (Intel Sandy Bridge, AMD Bulldozer or newer). In a virtual machine, give the guest the host CPU type so that AVX is passed through.
[slatebox] Run Slatebox on a newer machine, or keep the database on a MongoDB server elsewhere and set MONGO_URL.
```

## First run

A start usually takes under a minute. Until then the page says Slatebox is starting and opens by itself. The status reads `healthy` once a slate can be opened:

<!-- tabs -->

```sh Docker
docker ps --filter name=slatebox
```

```sh Docker Compose
docker compose ps
```

<!-- /tabs -->

1. Open the address, double-click the note, type, and reload. Your text is still there.
2. To see live editing, choose **Share**, create an edit link under **Unlisted** and open it in a second browser. Typing in one shows in the other.

## Where your data lives

Everything is in the volume `slatebox-data`, mounted at `/data`. The container holds no state: remove it and start a new one on the same volume at any time. Removing the volume deletes your slates.

| Folder in `/data` | Contents |
| --- | --- |
| `db` | Slates, accounts, invitations |
| `secrets` | Secrets made on the first start |
| `caddy` | HTTPS certificates, when built-in HTTPS is on |
| `keycloak` | People, sign-in providers and sign-in events, when [single sign-on](single-sign-on.md) is on |

To keep the data in a host folder on Linux, create the folder and run the container as its owner:

<!-- tabs -->

```sh Docker
mkdir -p ~/slatebox-data
docker run -d --name slatebox -p 7070:7070 --user "$(id -u):$(id -g)" \
  -v ~/slatebox-data:/data ghcr.io/slatebox/slatebox
```

```yaml Docker Compose
# mkdir -p ~/slatebox-data, then: docker compose up -d
# user: the output of `id -u` and `id -g` on the host
services:
  slatebox:
    image: ghcr.io/slatebox/slatebox
    container_name: slatebox
    user: "1000:1000"
    ports: ["7070:7070"]
    volumes: [~/slatebox-data:/data]
```

<!-- /tabs -->

## Use a public address with HTTPS

Point a DNS name at your server, open TCP ports 80 and 443, and start Slatebox with that address:

<!-- tabs -->

```sh Docker
docker run -d --name slatebox --restart unless-stopped \
  -p 80:80 -p 443:443 \
  -e SLATEBOX_URL=https://boards.example.com \
  -v slatebox-data:/data ghcr.io/slatebox/slatebox
```

```yaml Docker Compose
services:
  slatebox:
    image: ghcr.io/slatebox/slatebox
    container_name: slatebox
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    environment:
      SLATEBOX_URL: https://boards.example.com
    volumes: [slatebox-data:/data]
volumes:
  slatebox-data:
    name: slatebox-data
```

<!-- /tabs -->

- Slatebox gets a certificate for that name (from Let's Encrypt unless you set `SLATEBOX_ACME_CA`), renews it and redirects HTTP to HTTPS.
- `unless-stopped` starts Slatebox again after a reboot or a failure.
- Every link, invitation and live-editing connection is built from `SLATEBOX_URL`. Open Slatebox at any other address and it shows which address it expects.

### Behind your own proxy

If your proxy already terminates HTTPS, add `SLATEBOX_HTTPS=off` and forward the host name to port 7070, including WebSocket upgrades and the original `Host` header. The app and live editing share that one port.

<!-- tabs -->

```sh Docker
docker run -d --name slatebox --restart unless-stopped \
  -p 127.0.0.1:7070:7070 \
  -e SLATEBOX_URL=https://boards.example.com -e SLATEBOX_HTTPS=off \
  -v slatebox-data:/data ghcr.io/slatebox/slatebox
```

```yaml Docker Compose
services:
  slatebox:
    image: ghcr.io/slatebox/slatebox
    container_name: slatebox
    restart: unless-stopped
    ports: ["127.0.0.1:7070:7070"]
    environment:
      SLATEBOX_URL: https://boards.example.com
      SLATEBOX_HTTPS: "off"
    volumes: [slatebox-data:/data]
volumes:
  slatebox-data:
    name: slatebox-data
```

<!-- /tabs -->

### Another port, or an address on your network

Plain HTTP works on any address. Set `SLATEBOX_URL` to the address people type:

<!-- tabs -->

```sh Docker
docker run -d --name slatebox -p 8080:7070 \
  -e SLATEBOX_URL=http://192.168.1.20:8080 \
  -v slatebox-data:/data ghcr.io/slatebox/slatebox
```

```yaml Docker Compose
services:
  slatebox:
    image: ghcr.io/slatebox/slatebox
    container_name: slatebox
    ports: ["8080:7070"]
    environment:
      SLATEBOX_URL: http://192.168.1.20:8080
    volumes: [slatebox-data:/data]
volumes:
  slatebox-data:
    name: slatebox-data
```

<!-- /tabs -->

Browsers allow the microphone and camera only on HTTPS pages and on `localhost`.

## Options

Every option is optional. Add it with `-e NAME=value`, or under `environment:` in `compose.yaml`.

| Option | What it does |
| --- | --- |
| `SLATEBOX_URL` | The address people type. Default `http://localhost:7070`. |
| `SLATEBOX_HTTPS` | `off` when your own proxy terminates HTTPS. Otherwise an `https://` address turns on built-in HTTPS on ports 80 and 443. |
| `SLATEBOX_ACME_CA` | The ACME directory URL of your own certificate authority. |
| `SLATEBOX_MAIL_URL` | An `smtp://` or `smtps://` URL, such as `smtp://user:password@mail.example.com:587`. Turns on invitations, email verification and password-reset mail. |
| `SLATEBOX_MAIL_FROM` | The sender, such as `Slatebox <boards@example.com>`. Needed unless the user name in `SLATEBOX_MAIL_URL` is itself an address. |
| `SLATEBOX_AI_KEY` | A [DeepInfra](https://deepinfra.com) API key. Turns on AI drafts. |
| `SLATEBOX_AI_URL`, `SLATEBOX_AI_MODEL` | Your own OpenAI-compatible endpoint and model. `SLATEBOX_AI_KEY` is then its bearer token, if it needs one. |
| `SLATEBOX_SSO` | `keycloak` turns on [single sign-on](single-sign-on.md). Off by default. |
| `SLATEBOX_SSO_ONLY` | `true`, with `SLATEBOX_SSO=keycloak`: single sign-on is the only way in. |
| `SLATEBOX_SSO_ADMIN` | `open` (default) or `closed`, with `SLATEBOX_SSO=keycloak`. `closed` takes the Keycloak admin console off the published port. |
| `SLATEBOX_SETTINGS` | A JSON object of further app settings. `{"daily":{"apiKey":"your-daily-key"}}` turns on audio and video calls. |
| `MONGO_URL` | A MongoDB replica set you run elsewhere. The bundled database then does not start. `MONGO_OPLOG_URL` is passed on too, when set. |

- A misspelled or lower-case option stops the container and lists the valid names.
- To change an option, run the container again with the new value (Docker: `docker rm -f slatebox`, then your `docker run`; Compose: edit the file, then `docker compose up -d`). Your data stays in the volume.
- A feature without its service says so and everything else keeps working. Without mail, share by link and [make reset links yourself](#forgotten-passwords). Without an AI key, drafts say the administrator can turn them on. Without a Daily key, calls say they are unavailable.

## Upgrade

Take a [backup](#back-up-and-restore), then pull the new image and start it with the same options:

<!-- tabs -->

```sh Docker
docker pull ghcr.io/slatebox/slatebox
docker rm -f slatebox
docker run -d --name slatebox -p 7070:7070 -v slatebox-data:/data ghcr.io/slatebox/slatebox
```

```sh Docker Compose
docker compose pull
docker compose up -d
```

<!-- /tabs -->

The volume carries your slates, accounts, files and secrets to the new container.

## Back up and restore

Back up while Slatebox runs:

<!-- tabs -->

```sh Docker
docker exec slatebox slatebox backup > slatebox-backup.gz
```

```sh Docker Compose
docker compose exec -T slatebox slatebox backup > slatebox-backup.gz
```

<!-- /tabs -->

You get one file with every slate, account and uploaded file, and, with single sign-on on, Keycloak's database and its secrets. The command prints `Backup complete`. Keep the file private.

Restore into this installation, or into a new one started with the commands above:

<!-- tabs -->

```sh Docker
docker exec -i slatebox slatebox restore < slatebox-backup.gz
```

```sh Docker Compose
docker compose exec -T slatebox slatebox restore < slatebox-backup.gz
```

<!-- /tabs -->

The restore checks the file first, pauses Slatebox for a few seconds, replaces the data and starts again. If the file cannot be loaded, Slatebox keeps the data it had. On a new address, set `SLATEBOX_URL` to it. With `MONGO_URL`, back up that database with its own tools.

## Forgotten passwords

With mail on, **Forgot password** on the sign-in page sends a reset link. With or without mail, you can make one:

<!-- tabs -->

```sh Docker
docker exec slatebox slatebox password-link person@example.com
```

```sh Docker Compose
docker compose exec slatebox slatebox password-link person@example.com
```

<!-- /tabs -->

Give the link to that person only. It sets a new password once and expires after three days.

## Troubleshooting

Start with the log. Each line names the part of Slatebox that wrote it.

<!-- tabs -->

```sh Docker
docker logs slatebox
docker exec slatebox slatebox health
docker exec slatebox slatebox version
```

```sh Docker Compose
docker compose logs slatebox
docker compose exec slatebox slatebox health
docker compose exec slatebox slatebox version
```

<!-- /tabs -->

`health` prints why Slatebox is not healthy. `version` prints the source revisions the image was built from.

| What you see | Fix |
| --- | --- |
| "Slatebox is starting" for minutes | The last `[slatebox]` log lines name the part that did not come up. |
| "Slatebox is set up for another address" | Set `SLATEBOX_URL` to the address you open and run the container again. This also happens when you publish a port other than 7070 without setting `SLATEBOX_URL`. |
| The container restarts or exits | The log names the part on a line with `stopped unexpectedly`. |
| `This processor cannot run MongoDB 8.0` | See [What you need](#what-you-need). Use another machine, pass the host CPU type to the virtual machine, or set `MONGO_URL`. |
| `Unknown setting` | An option is misspelled. The message lists the valid names. |
| `/data is not writable` | The log names the folder's owner. Run as that owner with `--user`, or use a Docker volume. |
| `SLATEBOX_MAIL_URL also needs SLATEBOX_MAIL_FROM` | Add `SLATEBOX_MAIL_FROM` with an address your mail service accepts. |
| `holds a database but /data/secrets/secrets.json is missing` | `db` and `secrets` belong together. Use the complete volume, or start on an empty one and restore a backup. |
| `port is already allocated` | Port 7070 is taken. Publish another, such as `-p 8080:7070 -e SLATEBOX_URL=http://localhost:8080`. |
| Certificate error with built-in HTTPS | The certificate is not issued yet. Check that DNS points here and ports 80 and 443 reach the container. `[proxy]` log lines give the reason. |
| Edits do not reach a second browser | Your proxy must forward WebSocket upgrades. |
| A restore says the file is not a complete backup | The file is empty or cut short. Back up again and check for `Backup complete`. |

With single sign-on on, also see [its troubleshooting](single-sign-on.md#troubleshooting).

## What is inside, and its licenses

The Slatebox app, the SlateboxJS engine and the collaboration relay are MIT licensed. The image also holds other projects under their own licenses, so the image as a whole is not MIT licensed:

| Part | License |
| --- | --- |
| Slatebox app, SlateboxJS, collaboration relay | MIT |
| MongoDB Community Server | Server Side Public License (SSPL) v1 |
| MongoDB Database Tools, Caddy, Keycloak | Apache License 2.0 |
| Eclipse Temurin Java runtime (runs Keycloak) | GPL 2.0 with the Classpath Exception |
| Node.js, Meteor, tini | MIT |
| Interface and slate-image fonts | SIL Open Font License 1.1 or Apache License 2.0, per family |
| Ubuntu base system and npm packages | Each under its own license |

Read the SSPL if you plan to offer the database to others as a service. With `MONGO_URL` set, the bundled MongoDB does not run. Print the full list and every license text:

<!-- tabs -->

```sh Docker
docker run --rm --entrypoint cat ghcr.io/slatebox/slatebox /opt/slatebox/licenses/NOTICE.md
```

```sh Docker Compose
docker compose run --rm --no-deps --entrypoint cat slatebox /opt/slatebox/licenses/NOTICE.md
```

<!-- /tabs -->

## Build the image yourself

You need Git, Docker and checkouts of the Slatebox app, SlateboxJS and the relay ([the Slatebox fork of y-websocket](https://github.com/Slatebox/y-websocket)). In the app's `self-host` folder, run:

<!-- tabs -->

```sh Shell
./build-image.sh /path/to/slateboxjs /path/to/y-websocket
```

<!-- /tabs -->

It builds from committed files only, labels the image with the three source revisions and prints the command to run it. To work on the source, see [Development](../Developers/development.md).
