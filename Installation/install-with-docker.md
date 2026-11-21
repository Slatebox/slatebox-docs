# Run your own Slatebox

One container is a complete Slatebox: the app, live collaboration and the database. Install Docker, run one command and open one address. If you would rather not run anything, [use Slatebox Cloud](https://app.slatebox.com/start). Your own Slatebox has no meters: AI and calls use your own keys. [No meters on your own server](self-host-meters.md)

```sh
docker run -d --name slatebox -p 7070:7070 -v slatebox-data:/data ghcr.io/slatebox/slatebox
```

Open [http://localhost:7070](http://localhost:7070) on the machine that runs Docker.

## What you need

- **Docker** on Linux, or Docker Desktop on macOS or Windows. The image is published for 64-bit Intel and AMD processors (`linux/amd64`) and 64-bit ARM processors (`linux/arm64`); Docker picks the right one.
- **A processor that MongoDB 8.0 supports.** The database inside the image needs:
  - on Intel and AMD: the AVX instruction set, which every Intel processor since Sandy Bridge (2011) and every AMD processor since Bulldozer (2011) has. In a virtual machine, give the guest the host's CPU type (for example `host` in Proxmox or QEMU) so that AVX is passed through.
  - on ARM: ARMv8.2-A or newer, for example Apple silicon, AWS Graviton 2 or later, Ampere Altra or a Raspberry Pi 5. A Raspberry Pi 4 or older cannot run it.

  On a processor without these, the container stops at once and its log says so:

  ```
  [slatebox] This processor cannot run MongoDB 8.0: it needs the AVX instruction set (Intel Sandy Bridge, AMD Bulldozer or newer). In a virtual machine, give the guest the host CPU type so that AVX is passed through.
  [slatebox] Run Slatebox on a newer machine, or keep the database on a MongoDB server elsewhere and set MONGO_URL.
  ```

  On ARM the first line reads `This processor cannot run MongoDB 8.0: it needs ARMv8.2-A or newer (a Raspberry Pi 5 works; a Raspberry Pi 4 or older does not).`
- **Memory:** Slatebox uses about half a gigabyte while a few people work in it. Give the machine at least 1 GB of free memory, and 2 GB for a team. [Single sign-on](single-sign-on.md) adds about 0.5 GB while it is on.
- **Disk:** about 585 MB to download, 2.5 GB once unpacked, plus your slates. About 225 MB of the download is Keycloak and its Java runtime, for [single sign-on](single-sign-on.md); they take no memory while single sign-on is off.

## First run

A start usually takes well under a minute. Until Slatebox is ready, the page says that it is starting and opens by itself. You can also watch from the terminal:

```sh
docker ps --filter name=slatebox
```

The status reads `healthy` once a slate can be opened. The address opens a new slate of your own. Double-click the note, type something and reload the page: your text is still there. To see live editing, choose **Share**, create an edit link under **Unlisted** and open it in a second browser. What you type in one appears in the other.

There is nothing to configure. On its first start the container creates the secrets this installation needs and keeps them with your data.

## Where your data lives

Everything Slatebox stores is in the Docker volume `slatebox-data`, mounted at `/data` in the container:

| Path in the volume | Contents |
| --- | --- |
| `db` | The database: slates, accounts, invitations |
| `secrets` | Secrets generated on the first start, readable only inside the container |
| `caddy` | HTTPS certificates, when built-in HTTPS is on |
| `keycloak` | Single sign-on: Keycloak's database of people, company sign-in providers and sign-in events, when [single sign-on](single-sign-on.md) is on |

The container itself holds no state. You can remove it and start a new one on the same volume at any time. Removing the volume deletes your slates.

To keep the data in a folder on a Linux host instead of a volume, make the folder and run the container as its owner:

```sh
mkdir -p ~/slatebox-data
docker run -d --name slatebox -p 7070:7070 --user "$(id -u):$(id -g)" \
  -v ~/slatebox-data:/data ghcr.io/slatebox/slatebox
```

## Use a public address with HTTPS

`localhost` only works on the machine that runs Docker. For a team, give Slatebox a host name. Point the DNS name at your server, allow inbound TCP ports 80 and 443, and start Slatebox with its address:

```sh
docker run -d --name slatebox --restart unless-stopped \
  -p 80:80 -p 443:443 \
  -e SLATEBOX_URL=https://boards.example.com \
  -v slatebox-data:/data ghcr.io/slatebox/slatebox
```

Slatebox obtains a certificate for that name by itself, from Let's Encrypt unless you choose another authority, renews it, and redirects HTTP to HTTPS. The certificate is kept in the data volume. `--restart unless-stopped` starts Slatebox again after a reboot or a failure.

Slatebox builds every link, every invitation and its live-editing connection from `SLATEBOX_URL`. If you open it at an address other than the one it was started with, it shows a page telling you which address it expects and how to change it, rather than a half-working app.

### Behind your own proxy

If a proxy or load balancer of yours already terminates HTTPS, add `SLATEBOX_HTTPS=off` and forward everything for the host name to port 7070, including WebSocket upgrades:

```sh
docker run -d --name slatebox --restart unless-stopped \
  -p 127.0.0.1:7070:7070 \
  -e SLATEBOX_URL=https://boards.example.com -e SLATEBOX_HTTPS=off \
  -v slatebox-data:/data ghcr.io/slatebox/slatebox
```

One upstream is enough: the app and live editing share the port. Have your proxy pass the original `Host` header on to Slatebox.

### Another port, or an address on your network

Plain HTTP on any address works the same way. Tell Slatebox the address people will type:

```sh
docker run -d --name slatebox -p 8080:7070 \
  -e SLATEBOX_URL=http://192.168.1.20:8080 \
  -v slatebox-data:/data ghcr.io/slatebox/slatebox
```

Browsers only allow the microphone and camera on HTTPS pages and on `localhost`.

## Options

Every option is optional. Give one with `-e NAME=value` in the `docker run` command.

| Option | What it does |
| --- | --- |
| `SLATEBOX_URL` | The address people type to reach this Slatebox. Default `http://localhost:7070`. |
| `SLATEBOX_HTTPS` | Set to `off` when your own proxy terminates HTTPS. Otherwise an `https://` address turns on built-in HTTPS on ports 80 and 443. |
| `SLATEBOX_ACME_CA` | The ACME directory URL of your own certificate authority, when certificates should not come from Let's Encrypt. |
| `SLATEBOX_MAIL_URL` | An `smtp://` or `smtps://` URL, for example `smtp://user:password@mail.example.com:587`. Turns on invitations, email verification and password-reset mail. |
| `SLATEBOX_MAIL_FROM` | The address mail is sent from, for example `Slatebox <boards@example.com>`. Use an address your mail service accepts as a sender. When the user name in `SLATEBOX_MAIL_URL` is itself an address, that address is used and this option can be left out. |
| `SLATEBOX_AI_KEY` | A [DeepInfra](https://deepinfra.com) API key. Turns on AI drafts. |
| `SLATEBOX_AI_URL` and `SLATEBOX_AI_MODEL` | Use your own OpenAI-compatible endpoint and model for AI drafts. `SLATEBOX_AI_KEY` is then that endpoint's bearer token, if it needs one. |
| `SLATEBOX_SSO` | Set to `keycloak` to turn on single sign-on with the Keycloak bundled in the image. Off by default. See [Single sign-on](single-sign-on.md). |
| `SLATEBOX_SSO_ONLY` | Set to `true`, together with `SLATEBOX_SSO=keycloak`, so that people can only sign in with single sign-on: no passwords and no guests. |
| `SLATEBOX_SSO_ADMIN` | `open` (default) or `closed`, together with `SLATEBOX_SSO=keycloak`. `closed` keeps Keycloak's admin console off the published port once your company's sign-in is set up. |
| `SLATEBOX_SETTINGS` | A JSON object with further app settings. `{"daily":{"apiKey":"..."}}` supplies the [Daily](https://www.daily.co) key that audio and video calls need. |
| `MONGO_URL` | Use a MongoDB replica set you run elsewhere. The bundled database is then not started. `MONGO_OPLOG_URL` is passed to the app as well when set. |

A misspelled option, or one written in lower case, stops the container with the list of valid names, so an option is never silently ignored. To change an option, remove the container and run it again with the new value; your data stays in the volume.

Features that need an outside service say so when it is not configured, and everything else keeps working. Without mail, slates are shared by link, Slatebox says that it cannot send a verification mail, and a forgotten password is reset with a link you make (see [Forgotten passwords](#forgotten-passwords)). Without an AI key, a request for a draft answers that the administrator can turn drafting on. Without a Daily key, starting a call answers that calls are unavailable.

## Upgrade

Pull the newer image, remove the container and run your `docker run` command again:

```sh
docker pull ghcr.io/slatebox/slatebox
docker rm -f slatebox
docker run -d --name slatebox -p 7070:7070 -v slatebox-data:/data ghcr.io/slatebox/slatebox
```

Use the same options you started with. The volume carries your slates, accounts, uploaded files and secrets to the new container. Take a backup first.

## Back up and restore

Back up while Slatebox is running:

```sh
docker exec slatebox slatebox backup > slatebox-backup.gz
```

The file holds every slate, account and uploaded file (pictures, chat attachments, team logos). With single sign-on on, it also holds Keycloak's database and the secrets that open it. Keep it somewhere private.

Restore into the same installation, or into a new one on another machine after starting it with the `docker run` command:

```sh
docker exec -i slatebox slatebox restore < slatebox-backup.gz
```

The restore checks the file before it changes anything, pauses Slatebox for a few seconds, replaces the data and starts it again. If the backup cannot be loaded, Slatebox continues with the data it had. After restoring on a new address, start the container with that address in `SLATEBOX_URL`.

With `MONGO_URL` set, your slates are in your own database; back that up with its own tools.

## Forgotten passwords

With mail on, **Forgot password** on the sign-in page sends a reset link. With or without mail, you can make one for a person yourself:

```sh
docker exec slatebox slatebox password-link person@example.com
```

Give the printed link to that person only. It sets a new password once and expires after three days.

## Troubleshooting

Start with the log. Each line names the part of Slatebox that wrote it:

```sh
docker logs slatebox
```

| What you see | What to do |
| --- | --- |
| The page says "Slatebox is starting" for more than a few minutes | Read `docker logs slatebox`. The last `[slatebox]` lines say which part did not come up. |
| The page says "Slatebox is set up for another address" | You opened Slatebox at an address other than `SLATEBOX_URL`. Remove the container and run your `docker run` command again with `-e SLATEBOX_URL=` and the address you want to use; `docker start` cannot add an option. This also happens when you publish a port other than 7070 without setting `SLATEBOX_URL`. |
| `docker ps` shows the container restarting or exited | A required part stopped. `docker logs slatebox` names it in a line that says `stopped unexpectedly`. |
| The log says `This processor cannot run MongoDB 8.0` | The processor lacks AVX (Intel or AMD) or ARMv8.2-A (ARM); see [What you need](#what-you-need). Use a newer machine, pass the host CPU type through to a virtual machine, or set `MONGO_URL` to a MongoDB server that runs elsewhere. |
| The log says `Unknown setting` | An option name is misspelled. The message lists the valid names. |
| The log says `/data is not writable` | The log names the owner of the folder mounted at `/data`. Add `--user` with that owner to the `docker run` command, or mount a Docker volume at `/data` instead. |
| The log says `SLATEBOX_MAIL_URL also needs SLATEBOX_MAIL_FROM` | Add `-e SLATEBOX_MAIL_FROM=` with an address your mail service accepts as a sender. |
| The log says `holds a database but /data/secrets/secrets.json is missing` | The `db` and `secrets` folders of the volume belong together. Use the complete volume, or start on a new, empty volume and restore a backup into it. |
| `port is already allocated` when starting | Another program uses port 7070. Publish a different one, for example `-p 8080:7070 -e SLATEBOX_URL=http://localhost:8080`. |
| With built-in HTTPS, the browser reports a certificate error | The certificate could not be issued yet. Check that the DNS name points at this server and that ports 80 and 443 reach the container. The log lines from `[proxy]` give the reason. |
| Edits do not appear in a second browser | Live editing uses a WebSocket on the same address. If your own proxy is in front, make sure it forwards WebSocket upgrades. |
| A restore says the file is not a complete backup | The backup file is empty or cut short. Make a new backup and check that the command printed `Backup complete`. |

With single sign-on on, also see [Single sign-on](single-sign-on.md#troubleshooting).

`docker exec slatebox slatebox health` prints the reason when Slatebox is not healthy, and `docker exec slatebox slatebox version` prints the exact source revisions the image was built from.

## What is inside, and its licenses

The Slatebox app, the SlateboxJS canvas engine and the collaboration relay are MIT licensed. The image also contains programs from other projects under their own licenses:

| Part | License |
| --- | --- |
| Slatebox app, SlateboxJS, collaboration relay | MIT |
| MongoDB Community Server | Server Side Public License (SSPL) v1 |
| MongoDB Database Tools, Caddy, Keycloak | Apache License 2.0 |
| Eclipse Temurin Java runtime (runs Keycloak) | GPL 2.0 with the Classpath Exception |
| Node.js, Meteor, tini | MIT |
| Fonts for the interface and for rendering slate images | SIL Open Font License 1.1 or Apache License 2.0, per family |
| Ubuntu base system and npm packages | Each under its own license |

The image as a whole is therefore not MIT licensed. In particular the SSPL is not an MIT-style license; read it if you plan to offer the database to others as a service. Setting `MONGO_URL` runs Slatebox without starting the bundled MongoDB. The complete list and every license text ship inside the image:

```sh
docker run --rm --entrypoint cat ghcr.io/slatebox/slatebox /opt/slatebox/licenses/NOTICE.md
```

## Build the image yourself

The image is built from three source repositories: the Slatebox app, SlateboxJS, and the collaboration relay, which is [the Slatebox fork of y-websocket](https://github.com/Slatebox/y-websocket). With checkouts of all three, Git and Docker, run this in the app's `self-host` directory:

```sh
./build-image.sh /path/to/slateboxjs /path/to/y-websocket
```

It builds from committed files only, labels the image with the three source revisions and prints the command to run it. To work on the source itself, see [Development](../Developers/development.md).
