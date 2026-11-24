---
feature: self-host
whileHeld: /installation/self-hosting/
description: Run your own Slatebox with one command, on this computer, a server or Kubernetes, with any AI or none.
agentPrompt: >-
  Help me install my own Slatebox with the slatebox installer from npm (npx -y slatebox@latest).
  First run npx -y slatebox@latest agent-prompt and follow the brief it prints exactly.
  Ask me, do not guess: where it runs (this computer with Docker, a Linux server over SSH as user@host, Kubernetes with which context and namespace, or files only),
  the domain name for HTTPS or the port, the admin email, and the AI: none for now, or which providers and models.
  Slatebox has no default AI provider: any cloud provider the installer lists, or any OpenAI-compatible endpoint I run, on this computer or in my company.
  Never write a key into a file or a flag: ask me to export each key in an environment variable and pass key=env:NAME.
  Write slatebox.yaml, run npx -y slatebox@latest plan --answers slatebox.yaml --json, and show me the whole plan.
  Run install with --yes only after I say yes to that plan. Never add --install-docker, --new-encryption-key or --delete-data unless I ask for them.
  Report the address, and tell me where SLATEBOX_KEY_ENCRYPTION_KEY is stored so I can back it up.
---
# Run your own Slatebox

One command installs Slatebox on this computer, a Linux server or a Kubernetes cluster. It asks a few questions, shows a plan of everything it will write and run, and installs once you say yes.

<!-- tabs -->

```sh Shell
npx slatebox@latest install
```

<!-- /tabs -->

You get the address, a healthy Slatebox, daily backups, and your key encryption key kept in one private place. Your own Slatebox is free, and its AI is whatever you connect, or none. [Who pays for what on your own server](self-host-costs.md)

Would rather not run anything? [Use Slatebox Cloud](https://app.slatebox.com/start).

## Install with one command

Pick where Slatebox runs. You need Node.js 22.13 or newer where you type the command, and Docker where Slatebox runs.

<!-- tabs -->

```sh Docker
# This computer
npx slatebox@latest install
```

```sh Remote server
# A Linux server over SSH
npx slatebox@latest install ssh root@203.0.113.5 --domain boards.example.com
```

```sh Kubernetes
# Your current kubectl context
npx slatebox@latest install k8s --route ingress \
  --domain boards.example.com --tls-issuer ClusterIssuer/letsencrypt
```

```sh Files only
# compose, manifests or helm; nothing is applied
npx slatebox@latest install export --format helm --out ./slatebox-deploy
```

<!-- /tabs -->

| Where | What you get |
| --- | --- |
| This computer (Docker) | The first free port from 7070, published on `127.0.0.1` only. `--listen 0.0.0.0` opens it to your network. Files in `~/.slatebox/installs/<name>/`. |
| Remote server | Root or passwordless sudo over SSH. With `--domain`, HTTPS with automatic certificates (point DNS at the server, open ports 80 and 443). Without it, `http://<server>:7070`. Files in `/opt/slatebox`, owned by root. Docker is installed only with `--install-docker`. |
| Kubernetes | kubectl and your current context; a context whose name looks like production must be named with `--k8s-context`. Namespace `slatebox`. One StatefulSet with a volume, a Service, the Secret `<name>-env`, a backups sidecar, and an Ingress or Gateway API HTTPRoute with `--route ingress` or `--route gateway`. |
| Files only | A compose file, Kubernetes manifests or a Helm chart for GitOps, with placeholders where secrets go. |

- Nothing changes before the plan is shown. On a server or a cluster nothing changes without a yes.
- The install waits for health. If it fails, the previous state is put back (exit 5).
- Running it again with the same answers changes nothing. `--name <id>` keeps several installs side by side.
- Flags for every question: `npx slatebox@latest --help`.

## Let an agent install it

Give your coding agent the brief, or copy this page's agent prompt:

<!-- tabs -->

```sh Shell
npx slatebox@latest agent-prompt
```

<!-- /tabs -->

The agent writes an answers file, shows you the plan and installs only after your yes. An agent never gets a question on screen: a missing answer is exit 3 with each question, its choices and the flag that answers it.

<!-- tabs -->

```yaml slatebox.yaml
version: 1
target: ssh                # local | ssh | k8s | export
ssh: { host: 203.0.113.5, user: root }
address: { domain: boards.example.com }
adminEmail: ops@example.com
ai:
  mode: providers          # or: none
  providers:
    - { id: local, kind: ollama, model: your-local-model }
    - { id: cloud, kind: anthropic, model: your-model-name, keyFrom: "env:ANTHROPIC_API_KEY" }
  default: local
sso: { enabled: false }
```

<!-- /tabs -->

<!-- tabs -->

```sh Shell
npx -y slatebox@latest plan --answers slatebox.yaml --json            # changes nothing
npx -y slatebox@latest install --answers slatebox.yaml --yes --json   # after the person says yes
```

<!-- /tabs -->

With `--json`, each line is one event (`plan`, `step`, `done`, `error`). The last line, `done`, carries `address` and `secretsFile`.

| Exit | Meaning |
| --- | --- |
| 0 | Done, or nothing to change |
| 2 | Bad flags or answers; the `error` event lists each field |
| 3 | An answer or a confirmation is needed and nobody can be asked |
| 4 | A precondition failed: no Docker, no cluster access, CPU too old, port taken, image unavailable, key encryption key missing |
| 5 | The change failed its health check and was rolled back |
| 6 | The rollback failed too; the `error` event lists the commands a person must run |
| 7 | Cancelled |

`--yes`, `--install-docker`, `--new-encryption-key`, `--delete-data` and `--confirm` count only when typed on the command line, never from the environment or an answers file.

## Choose the AI when you install

Slatebox is not tied to any AI provider, and the installer never picks one. Answer **None for now**, or give any mix of cloud and local models:

| `kind` | Needs |
| --- | --- |
| `openai`, `anthropic`, `deepinfra`, `openrouter`, `groq`, `together`, `mistral` | `model` and a key |
| `ollama`, `lmstudio` | `model`; no key |
| `openai-compatible` | `url` and `model` of any OpenAI-compatible endpoint you run (a model server of your own, a company gateway); a key if it needs one |

<!-- tabs -->

```sh Cloud
export OPENAI_API_KEY=your-openai-key
npx slatebox@latest install --ai-provider "kind=openai,model=your-model-name,key=env:OPENAI_API_KEY"
```

```sh Local
npx slatebox@latest install --ai-provider "kind=ollama,model=your-local-model"
```

```sh Both
npx slatebox@latest install \
  --ai-provider "id=local,kind=ollama,model=your-local-model" \
  --ai-provider "kind=anthropic,model=your-model-name,key=env:ANTHROPIC_API_KEY" \
  --ai-default local
```

```sh None
npx slatebox@latest install --ai none
```

<!-- /tabs -->

- A key is never typed into a flag or an answers file. Give `key=env:NAME`, `key=file:/path`, or `key=prompt` (typed, hidden). It is stored with the other secrets.
- An endpoint on `localhost` is reached from the container as `host.docker.internal`; the plan says so.
- An image that takes one AI connection at a time says so before anything changes when you give several.

Change it later, from the computer that installed:

<!-- tabs -->

```sh Shell
npx slatebox ai add "kind=groq,model=your-model-name,key=env:GROQ_API_KEY"
npx slatebox ai use local       # the default; also: list, remove <id>, off
npx slatebox ai test            # from inside the container: model, tool calls, latency
```

<!-- /tabs -->

## Where the encryption key lives

The installer makes `SLATEBOX_KEY_ENCRYPTION_KEY` once. It encrypts the AI and call keys people save. It is kept outside your data:

| Where Slatebox runs | Where the key is |
| --- | --- |
| This computer | `~/.slatebox/installs/<name>/secrets.env`, mode 0600 |
| Remote server | `/opt/slatebox/secrets.env` on the server, root only, mode 0600 |
| Kubernetes | The Secret `<name>-env` in the install's namespace |
| Files only | Wherever you put it: the exported files hold placeholders you fill in |

Back it up in your password manager now. Backups do not contain it, and without it the keys people saved cannot be read after a restore.

<!-- tabs -->

```sh Shell
npx slatebox secrets path                                   # where it is
npx slatebox secrets reveal SLATEBOX_KEY_ENCRYPTION_KEY     # prints it to a terminal only
```

<!-- /tabs -->

Running the installer again never makes a new key. If the data exists but its key cannot be read, the install stops with exit 4 and changes nothing. Put the file or Secret back; only `--new-encryption-key` starts over, and every saved key must then be added again.

## Run the container yourself

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

You get a new slate of your own. There is nothing to configure: the first start creates the secrets this installation needs and keeps them with your data. Its AI is whatever you and your people connect, local or cloud, and calls use your own Daily key. Add AI, mail and HTTPS with [options](#options).

## What you need

| | |
| --- | --- |
| Installer | Node.js 22.13 or newer on the computer you type it on. On Windows, run it in WSL 2 for this computer or a server; Kubernetes and files only work anywhere. |
| Docker | Docker Engine on Linux, or Docker Desktop on macOS or Windows. The image runs on `linux/amd64` and `linux/arm64`. On a server the installer adds Docker only with `--install-docker`. |
| Kubernetes | kubectl with access to the namespace, a default or named storage class, and for a route, an ingress class or Gateway and a cert-manager issuer. The installer checks each before applying. |
| Processor | Intel or AMD with AVX (Sandy Bridge or Bulldozer and later), or ARMv8.2-A (Apple silicon, Raspberry Pi 5). A Raspberry Pi 4 cannot run it. In a virtual machine, give the guest the host's CPU type so AVX is passed through. |
| Memory | 1 GB free, 2 GB for a team. [Single sign-on](single-sign-on.md) adds about 0.5 GB while it is on. |
| Disk | About 585 MB to download and 2.5 GB unpacked, plus your slates. |

On a processor without AVX or ARMv8.2-A, the container stops at once and its log says why:

```text Output
[slatebox] This processor cannot run MongoDB 8.0: it needs the AVX instruction set (Intel Sandy Bridge, AMD Bulldozer or newer). In a virtual machine, give the guest the host CPU type so that AVX is passed through.
[slatebox] Run Slatebox on a newer machine, or keep the database on a MongoDB server elsewhere and set MONGO_URL.
```

## First run

A start usually takes under a minute. Until then the page says Slatebox is starting and opens by itself. The installer waits for it; `npx slatebox status` shows the address, version, health, AI, single sign-on and last backup. On a container you run yourself, the status reads `healthy` once a slate can be opened:

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
| `SLATEBOX_AI_URL`, `SLATEBOX_AI_MODEL` | Any OpenAI-compatible endpoint and the model it serves, for every AI feature. `SLATEBOX_AI_KEY` is then its bearer token, if it needs one. [Connect AI](#connect-ai) |
| `SLATEBOX_AI_KEY` | Without `SLATEBOX_AI_URL`: a [DeepInfra](https://deepinfra.com) API key for the built-in AI. |
| `SLATEBOX_AI_CONFIG` | Any mix of AI as JSON: several connections, and which one each feature uses. [Set the server's AI](../Using-Slatebox/choose-your-ai.md#set-the-servers-ai) |
| `SLATEBOX_AI_OWN_PROVIDERS` | `off` keeps everyone on the AI set here. Default `on`: people and teams may connect their own in **Profile → AI**, and their choice wins. |
| `SLATEBOX_AI_PRIVATE_ENDPOINTS` | `off` lets people and teams connect models at public addresses only. Default `on`: they may also use your network and `host.docker.internal`. Your own connections are not affected. |
| `SLATEBOX_SSO` | `keycloak` turns on [single sign-on](single-sign-on.md). Off by default. |
| `SLATEBOX_SSO_ONLY` | `true`, with `SLATEBOX_SSO=keycloak`: single sign-on is the only way in. |
| `SLATEBOX_SSO_ADMIN` | `open` (default) or `closed`, with `SLATEBOX_SSO=keycloak`. `closed` takes the Keycloak admin console off the published port. |
| `SLATEBOX_KEY_ENCRYPTION_KEY` | 32 random bytes in base64, made with `openssl rand -base64 32`. Lets people and teams save their own AI and call keys, encrypted. Keep it for the life of the server and store it with your backups: after a change, saved keys must be added again. |
| `SLATEBOX_SETTINGS` | A JSON object of further app settings. `{"daily":{"apiKey":"your-daily-key"}}` turns on audio and video calls. |
| `MONGO_URL` | A MongoDB replica set you run elsewhere. The bundled database then does not start. `MONGO_OPLOG_URL` is passed on too, when set. |

- A misspelled or lower-case option stops the container and lists the valid names.
- To change an option, run the container again with the new value (Docker: `docker rm -f slatebox`, then your `docker run`; Compose: edit the file, then `docker compose up -d`). Your data stays in the volume.
- A feature without its service says so and everything else keeps working. Without mail, share by link and [make reset links yourself](#forgotten-passwords). With no AI connected, drafts say the administrator can turn them on. Without a Daily key, calls say they are unavailable.

## Connect AI

Your Slatebox's AI is whatever you and your people connect, local or cloud, mixed per feature. Set the server's default with `SLATEBOX_AI_URL` and `SLATEBOX_AI_MODEL` (one endpoint for every feature) or `SLATEBOX_AI_CONFIG` (a mix). People connect their own in **Profile → AI**, unless you set `SLATEBOX_AI_OWN_PROVIDERS=off`. [Choose your AI](../Using-Slatebox/choose-your-ai.md)

- Inside the container, `localhost` is the container itself. A model server on this machine is at `host.docker.internal`, such as `http://host.docker.internal:8000/v1`.
- On a Mac, run the model server on the Mac itself, not in Docker: Docker on a Mac cannot use the Mac's GPU.
- On Linux, add `--add-host=host.docker.internal:host-gateway` to `docker run` (Compose: `extra_hosts: ["host.docker.internal:host-gateway"]`), and have the model server listen beyond `127.0.0.1`.
- `docker exec slatebox slatebox ai check` tests each server connection: reached, key accepted, model listed, answered and called tools.

## Agents and exec

The image runs exec, so agents can work on your instance the same way they work on Slatebox Cloud. Point them at your address instead of `https://app.slatebox.com`.

- `POST /api/v1/exec` runs a script in the sealed runner inside the container.
- `/mcp` on your address is the hosted MCP endpoint.
- The `slatebox-mcp` package and the `slatebox` CLI work against your address with `SLATEBOX_BASE_URL`.

Exec limits are set with `SLATEBOX_SETTINGS`, for example `{"selfHosted":{"exec":{"auditDays":90}}}`. [How exec works](../Developers/SlateboxAPI/exec.md)

## Upgrade

The installer backs up, upgrades, waits for health, and on a failure puts the previous version and the backup back:

<!-- tabs -->

```sh Shell
npx slatebox upgrade                 # the install's own image tag, fetched again
npx slatebox upgrade --to ghcr.io/slatebox/slatebox:latest
```

<!-- /tabs -->

The plan shows the new image and the backup it takes first. On Kubernetes the rollback also puts back the previous settings and Secret.

Without the installer, take a [backup](#back-up-and-restore), then pull the new image and start it with the same options:

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

The installer schedules a backup every day at 03:00 and keeps the last 14. Choose with `--backups default|<folder>|s3://bucket/prefix|off`, `--backup-schedule` and `--backup-keep`. On Kubernetes, backups go to a volume in the namespace. `npx slatebox status` shows the last backup and warns when one is late.

<!-- tabs -->

```sh Shell
npx slatebox backup --to ./backups      # writes ./backups/slatebox-<date>-<time>.gz on this computer
npx slatebox restore ./backups/slatebox-20261121-090000.gz
```

<!-- /tabs -->

A restore shows its plan first: it replaces every slate and account with the backup's.

Without the installer, back up while Slatebox runs:

<!-- tabs -->

```sh Docker
docker exec slatebox slatebox backup > slatebox-backup.gz
```

```sh Docker Compose
docker compose exec -T slatebox slatebox backup > slatebox-backup.gz
```

<!-- /tabs -->

You get one file with every slate, account and uploaded file, and, with single sign-on on, Keycloak's database and its secrets. The command prints `Backup complete`. Keep the file private. It does not hold `SLATEBOX_KEY_ENCRYPTION_KEY`: [keep that with it](#where-the-encryption-key-lives).

Restore into this installation, or into a new one:

<!-- tabs -->

```sh Docker
docker exec -i slatebox slatebox restore < slatebox-backup.gz
```

```sh Docker Compose
docker compose exec -T slatebox slatebox restore < slatebox-backup.gz
```

<!-- /tabs -->

The restore checks the file first, pauses Slatebox for a few seconds, replaces the data and starts again. If the file cannot be loaded, Slatebox keeps the data it had. On a new address, set `SLATEBOX_URL` to it. With `MONGO_URL`, back up that database with its own tools.

## Move to another server

Give the new install its own name, such as `boards`, so both stay listed in `npx slatebox installs`.

1. Back up the old install to this computer: `npx slatebox backup --to ./backups`. It prints the file it wrote.
2. Before installing, put the old key where the new install keeps it: copy `secrets.env` to `~/.slatebox/installs/boards/` on this computer or `/opt/slatebox/` on the new server (mode 0600), or create the Secret `boards-env` holding `SLATEBOX_KEY_ENCRYPTION_KEY` in the new namespace.
3. Install with `--name boards` on the new target. The plan says the existing key is kept.
4. Restore into it: `npx slatebox restore ./backups/slatebox-20261121-090000.gz --name boards`.
5. Point DNS at the new address. Then `npx slatebox uninstall` removes the old install and keeps its data until you add `--delete-data --confirm slatebox`.

Skip step 2 and everything else still moves: people add their saved AI and call keys again.

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
| Installer exit 4: the data has no `SLATEBOX_KEY_ENCRYPTION_KEY` | Put the backed-up `secrets.env` or Secret back and run again. See [Where the encryption key lives](#where-the-encryption-key-lives). |
| Installer: `Host key verification failed` | Run `ssh user@host` once yourself, compare the fingerprint the installer printed, then run again. |
| Installer exit 5 | The change failed its health check and the previous state is running. The `error` event and `npx slatebox status` say why. |
| `port is already allocated` | Port 7070 is taken. Publish another, such as `-p 8080:7070 -e SLATEBOX_URL=http://localhost:8080`. |
| Certificate error with built-in HTTPS | The certificate is not issued yet. Check that DNS points here and ports 80 and 443 reach the container. `[proxy]` log lines give the reason. |
| Edits do not reach a second browser | Your proxy must forward WebSocket upgrades. |
| A restore says the file is not a complete backup | The file is empty or cut short. Back up again and check for `Backup complete`. |

With single sign-on on, also see [its troubleshooting](single-sign-on.md#troubleshooting).

## What is inside, and its licenses

The Slatebox app, the SlateboxJS engine and the collaboration relay are MIT licensed. The image also carries the app's `enterprise/` folder (outside-agent connections, under the Slatebox Enterprise License), switched off: an on-prem license from Slatebox, a flat yearly fee per install, switches it on. Single sign-on needs no license. The image also holds other projects under their own licenses, so the image as a whole is not MIT licensed:

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
