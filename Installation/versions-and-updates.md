# Versions and updates

## Agent prompt

```text
Help me keep my own Slatebox current. First run npx slatebox status (or docker exec slatebox slatebox version on a container I run myself) and tell me the version it runs and the newest release on https://github.com/Slatebox/slatebox/releases. If a newer release exists, show me its release notes and the plan of npx slatebox upgrade before anything changes, and run it only after I say yes. Never delete the volume, a backup or the encryption key.

Read the official guide at https://docs.slatebox.com/Installation/versions-and-updates.md first. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Installation/versions-and-updates.md.
```

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


## Security fixes

Security fixes go into the newest release of each part. Staying on the newest image is how you get them. Report a problem privately, as described in the [security policy](https://github.com/Slatebox/slatebox/blob/main/SECURITY.md).
