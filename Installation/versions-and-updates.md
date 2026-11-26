---
feature: self-host
whileHeld: /installation/self-hosting/
description: How Slatebox is versioned and released, which image your server runs, how to move to a new version and back, and how security fixes reach you.
agentPrompt: >-
  Help me keep my own Slatebox current.
  First run npx slatebox status (or docker exec slatebox slatebox version on a container I run myself) and tell me the version it runs and the newest release on https://github.com/Slatebox/slatebox/releases.
  If a newer release exists, show me its release notes and the plan of npx slatebox upgrade before anything changes, and run it only after I say yes.
  Never delete the volume, a backup or the encryption key.
---

# Versions and updates

Every part of Slatebox has its own version number, its own changelog and release notes for each version. A self-hosted Slatebox moves to a new version only when its admin chooses, after a backup, and goes back if the new version fails its health check.

## What has a version

| Part | Published as | Tag | Notes |
| --- | --- | --- | --- |
| The app and the self-host image | `ghcr.io/slatebox/slatebox:X.Y.Z` | `vX.Y.Z` | [Releases](https://github.com/Slatebox/slatebox/releases) |
| The installer and CLI | npm [`slatebox`](https://www.npmjs.com/package/slatebox) | `slatebox@X.Y.Z` | [Changelog](https://github.com/Slatebox/slatebox/blob/main/packages/slatebox/CHANGELOG.md) |
| The MCP server and its CLI | npm [`slatebox-mcp`](https://www.npmjs.com/package/slatebox-mcp) | `slatebox-mcp@X.Y.Z` | [Changelog](https://github.com/Slatebox/slatebox/blob/main/packages/slatebox-mcp/CHANGELOG.md) |
| The SlateboxJS engine | npm [`slateboxjs`](https://www.npmjs.com/package/slateboxjs) | `vX.Y.Z` in [Slatebox/slateboxjs](https://github.com/Slatebox/slateboxjs) | [Changelog](https://github.com/Slatebox/slateboxjs/blob/main/CHANGELOG.md) |

All of them follow [Semantic Versioning](https://semver.org/): a major version changes or removes something people rely on, a minor version adds features, a patch fixes. Changelogs are written from the commit messages ([Conventional Commits](https://www.conventionalcommits.org/)), one section per version.

Each image is built and signed by GitHub from its release tag (cosign, with build provenance), for `linux/amd64` and `linux/arm64`. Slatebox Cloud always runs the newest build.

## Which version you run

Installer 0.3.0 and later pin the newest published image by its digest, so every install of the same installer version runs the same bytes. To see the version:

<!-- tabs -->

```sh Shell
npx slatebox status                    # address, version, health, AI, single sign-on, last backup
docker exec slatebox slatebox version  # on a container you run yourself
```

<!-- /tabs -->

A server on 2.1.0 or later also shows it in **Admin › Updates**, with the newest release for your channel, and can update itself. An older install runs `npx slatebox@latest upgrade` once, after installer 0.3.0 is on npm, to get there.

## Move to a new version

<!-- tabs -->

```sh Shell
npx slatebox@latest upgrade
```

<!-- /tabs -->

It takes a backup, starts the new image, waits for it to be healthy, and on a failure puts the previous image and the backup back. The plan shows the new image and the backup before anything changes. [Upgrade without the installer](install-with-docker.md#upgrade)
<!-- feature:auto-updates -->

## Automatic updates

From installer 0.3.0, `npx slatebox install` and `npx slatebox upgrade` set up a small updater on the host (a launchd agent, a systemd timer or a cron line that runs every five minutes). It applies only a release Slatebox signed, pulled by its digest, through the same backup, health check and rollback as `npx slatebox upgrade`.

Choose in **Admin › Updates**:

- **Apply updates automatically**: on, minor and patch releases are applied in a weekly window you set (days, start time, hours, time zone), optionally after a wait once a release is out; off, you are told about each release and choose when.
- **Channel**: stable, or preview (early releases, for a test server).
- **Major releases**: whether they join the window; each one still needs your approval first.
- **How you are told**: the notifications bell, and email when mail is set up.

A release Slatebox withdraws is never installed, and a server on it is told to move on.

| Command | What it does |
| --- | --- |
| `npx slatebox updates check` | Shows the newest release for your channel and whether it applies |
| `npx slatebox updates apply` | Applies it now, with the backup and rollback |
| `npx slatebox updates auto off` | Stops applying updates on their own; you are still told about each release |
| `npx slatebox updates disable` | Removes the updater from the host (`updates enable` sets it up again) |
| `npx slatebox install --no-auto-updates` | Installs without the updater |

The list of releases (the update feed) and each release's manifest are signed with the Slatebox release key and published with the [GitHub releases](https://github.com/Slatebox/slatebox/releases). The updater refuses anything they do not name.
<!-- /feature:auto-updates -->

## Security fixes

Security fixes go into the newest release of each part. Staying on the newest image is how you get them. Report a problem privately, as described in the [security policy](https://github.com/Slatebox/slatebox/blob/main/SECURITY.md).
