---
title: Run your own Slatebox
<!-- feature:self-host -->
description: Run your own Slatebox with one command, npx slatebox install. It answers at https://<name>.slatebox.team with HTTPS and live collaboration, and nothing else to set up. Or ask your agent to walk you through it.
agentPrompt: >-
  Help me install my own Slatebox. The installer is the npm package slatebox: I run npx slatebox install in a terminal on the machine where it should run.
  By default it gives my Slatebox a free team address, https://<name>.slatebox.team, with HTTPS and no DNS, ports or certificates; I approve a short code in my browser to claim the name.
  Ask me, one question at a time and without guessing: the team address name, or my own domain instead, where it runs (this computer with Docker, a Linux server over SSH as user@host, Kubernetes, or files only),
  the AI (none for now, or which providers; Slatebox has no default AI provider) and whether to turn on single sign-on.
  Never ask me to paste a key or password into this conversation: keys stay in environment variables on my machine.
  Give me the exact npx slatebox install command for my answers, suggest --dry-run first, and once it finishes, tell me to open the one-time setup link it printed in my terminal to create the first account (I can run slatebox setup-link for a new one; never ask me for the link), then check that the address answers at /readyz.
<!-- /feature:self-host -->
<!-- feature:!self-host -->
description: Slatebox runs on your own server with one command. The installer is being published; until then, use Slatebox Cloud.
agentPrompt: >-
  Help me decide where my team should use Slatebox while the self-host installer is being published.
  Explain that Slatebox Cloud is free today, and who pays for what on a self-hosted Slatebox.
<!-- /feature:!self-host -->
---

# Run your own Slatebox

<!-- feature:self-host -->
Run this in a terminal on the machine where Slatebox should run:

<!-- tabs -->

```sh Shell
npx slatebox install
```

<!-- /tabs -->

Pick a team address and approve a short code in your browser. Slatebox then runs at `https://<name>.slatebox.team`, with no DNS, ports or certificates to set up.

## What you get

- **A team address with HTTPS.** The container opens a secure tunnel itself: nothing is opened on your machine or router. [Team addresses](team-addresses.md)
- **Live collaboration** over the same address.
- **Starts on boot**, on the same address.
- **One container.** The app, live collaboration, its database and Keycloak, in `ghcr.io/slatebox/slatebox`. Your data stays in one volume.
- **Free.** No limits from us. AI is whatever you connect, or none. [Who pays for what](self-host-costs.md)
- **Single sign-on, free.** [Single sign-on](single-sign-on.md)
- **Outside agents** (GitHub, Linear, Exa) unlock with an on-prem license. [Contact Slatebox](https://slatebox.com/contact/)

## Install

It asks a few short questions, shows a plan of everything it will write, run and create, and installs once you say yes. Add `--dry-run` to see the plan only.

It ends with a one-time setup link. Open it to create the first account, the server administrator. Nobody can sign up before that. The link works once, for 24 hours; `slatebox setup-link` prints a new one.

## Your own domain

- `--domain boards.example.com`: HTTPS certificates renewed automatically, or your own proxy.
- `--local` for this computer only, or a tunnel from your own Cloudflare account.
- A Linux server over SSH, Kubernetes, or files for GitOps.
- `--sso` turns on single sign-on.

[The full install guide](install-with-docker.md)

## Or ask your agent

Connect the Slatebox MCP server to Claude, ChatGPT or another agent and say "install Slatebox on my server". It asks the same questions, gives you the exact `npx slatebox install` command, and checks the address once you have run it. It never runs commands on your machine. [Connect an assistant](../Developers/SlateboxAPI/mcp.md)

## What you need

| | |
| --- | --- |
| Where you run `npx slatebox install` | Node.js 22.13 or newer. On Windows, use WSL 2. |
| Where Slatebox runs | Docker or Podman. That is all for a team address. Or Kubernetes with kubectl access. |
| Machine | 1 GB of memory (2 GB for a team), 3 GB of disk plus your slates, and a processor with AVX or ARMv8.2-A. |
| Your own domain | DNS pointed at the server and ports 80 and 443 open, or your own proxy. |

Something went wrong? [Troubleshooting](install-with-docker.md#troubleshooting) · Every option, upgrades and backups: [the full install guide](install-with-docker.md)
<!-- /feature:self-host -->
<!-- feature:!self-host -->
The installer is being published. One command installs Slatebox on this computer, a Linux server or a Kubernetes cluster: the app, the collaboration relay and the database in one container. This page gives that command as soon as the installer and its image are out.

Until then, [use Slatebox Cloud](https://app.slatebox.com/start). It is free.

## What a self-hosted Slatebox is

- **The same app.** Every feature of Slatebox Cloud. Outside-agent connections (inviting agents such as GitHub, Linear or Exa onto a slate) are in the image, switched off, until an on-prem license from Slatebox switches them on. The app, the SlateboxJS engine and the relay are MIT licensed, except the app's `enterprise/` folder, which holds those connections.
- **Single sign-on, free.** Keycloak is in the image. It needs no license.
- **Free, with your own AI and calls.** No limits from us. AI is whatever you and your people connect, local or cloud, or none; calls use your own Daily account. [Who pays for what on your own server](self-host-costs.md) · [Choose your AI](../Using-Slatebox/choose-your-ai.md)
- **Your agents too.** The image runs exec, so agents work with your own slates the same way. [Exec: how agents work with Slatebox](../Developers/SlateboxAPI/exec.md)

Would rather not run a server? Slatebox Cloud is free and fully managed, and Slatebox Business adds a shared pool of AI and calls for a team. [Slatebox Business](../Using-Slatebox/slatebox-business.md)
<!-- /feature:!self-host -->
