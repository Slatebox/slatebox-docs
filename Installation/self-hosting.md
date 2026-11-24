---
title: Run your own Slatebox
<!-- feature:self-host -->
description: Install your own Slatebox with one command, npx slatebox, on the machine of your choice. Or ask your agent to walk you through it.
agentPrompt: >-
  Help me install my own Slatebox on the machine I choose. The installer is the npm package slatebox: I run npx slatebox in a terminal there.
  Ask me, one question at a time and without guessing: where it runs (this computer with Docker, a Linux server over SSH as user@host, Kubernetes with which context and namespace, or files only),
  a domain name for HTTPS or a port, the admin email, the AI (none for now, or which providers; Slatebox has no default AI provider) and whether to turn on single sign-on.
  Never ask me to paste a key or password into this conversation: keys stay in environment variables on my machine.
  Give me the exact npx slatebox command for my answers, suggest --dry-run first, and once it finishes, check that the address it printed answers at /readyz.
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
Install Slatebox on the machine of your choice with one command: a laptop, a Linux server or a Kubernetes cluster.

## What you get

- **One container.** The app, live collaboration, its database and Keycloak for single sign-on, in `ghcr.io/slatebox/slatebox`. Your data stays in one volume.
- **Free.** No limits from us. AI is whatever you and your people connect, or none. [Who pays for what on your own server](self-host-costs.md)
- **Single sign-on, free.** Keycloak is built in and needs no license. [Single sign-on](single-sign-on.md)
- **Outside agents with an on-prem license.** Inviting agents such as GitHub, Linear or Exa onto a slate is in the image, locked, until an on-prem license from Slatebox unlocks it on your install. [Contact Slatebox](https://slatebox.com/contact/)

## Install

Run this in a terminal on the machine you install from:

<!-- tabs -->

```sh Shell
npx slatebox
```

<!-- /tabs -->

It asks where Slatebox runs, its address, the admin email, the AI and single sign-on. It shows a plan of everything it will write and run, and installs once you say yes. You get the address and the command that gives the admin a sign-in link. Add `--dry-run` to see the plan without changing anything.

## Or ask your agent

Connect the Slatebox MCP server to Claude, ChatGPT, Claude Code or another agent, and say "install Slatebox on my server". It asks the same questions, gives you the exact `npx slatebox` command to run on that machine, and checks the address once you have run it. It never runs commands on your machine itself. [Connect an assistant](../Developers/SlateboxAPI/mcp.md)

## What you need

| | |
| --- | --- |
| Where you run `npx slatebox` | Node.js 22.13 or newer. On Windows, use WSL 2. |
| Where Slatebox runs | Docker, or Podman with its Docker compatibility on. Or a Kubernetes cluster with kubectl access. |
| Machine | 1 GB of memory (2 GB for a team, about 0.5 GB more with single sign-on), 3 GB of disk plus your slates, and an Intel or AMD processor with AVX or an ARMv8.2-A processor. |
| Address | A free port, 7070 by default. For HTTPS, a domain pointed at the server with ports 80 and 443 open. |

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
