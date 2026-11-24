# Slatebox documentation

Source for https://docs.slatebox.com. Guides live in `Using-Slatebox`, `Installation` and `Developers`; runnable recipes in `Examples`. Folder and file names set the public URLs. Write to [STYLE.md](STYLE.md).

| Task | Command |
| --- | --- |
| Install | `npm ci` |
| Build the site into `dist/` | `npm run build` |
| Check links, style and pricing facts | `npm test` |
| List examples outside a language picker | `node scripts/check-style.mjs --strict` |
| Preview locally | `npx --yes http-server dist -p 8000 -a 127.0.0.1` |

Pushing `main` publishes the site: a GitHub Action builds `dist/` and pushes it to the `retype` branch.

Features written before they can be published are switched in `scripts/features.json`, one `true` or `false` each:

- `"pro-checkout": true`: the Slatebox Pro page carries the steps to buy it in **Credits** (Pro is on sale from 2026-11-22, with no notice period). Turned off, it says only that Pro is not on sale yet; turn it off if these docs publish before the app that sells Pro, and keep it in step with the marketing site's `pro-checkout` switch.
- `"self-host": false`: the install guide (`Installation/install-with-docker.md`) and the single sign-on guide (`Installation/single-sign-on.md`) are held, because their first command needs the npm installer `slatebox` or the image `ghcr.io/slatebox/slatebox`, and neither is published yet. While held, their addresses redirect to `Installation/self-hosting.md` ("The installer is being published"), which is built only while the switch is off. Links to the held guides sit in `<!-- feature:self-host -->` blocks, with the stand-in link in `<!-- feature:!self-host -->` blocks beside them.

A page with `feature: <name>` in its front matter is built only while that switch is on, and `feature: "!<name>"` only while it is off; a page that is not built has no address and is in no navigation, search, sitemap, agent index or Markdown mirror. A held page with `whileHeld: /address/` keeps its old address as a redirect to that page. Text between `<!-- feature:<name> -->` and `<!-- /feature:<name> -->` in any page is kept only while the switch is on; between `<!-- feature:!<name> -->` and `<!-- /feature:!<name> -->`, only while it is off. `scripts/check-pricing.mjs` and `scripts/check-installer-docs.mjs` check whichever state the switches are in.

### Publishing the install guide

The publish workflow runs `scripts/check-image-published.mjs` and `scripts/check-installer-published.mjs` after the tests. While `"self-host"` is off they pass without a network call, since the guide is not built. To publish the guide, set `"self-host": true` once `slatebox` is on npm and `ghcr.io/slatebox/slatebox:latest` can be pulled without signing in (amd64 and arm64). That one change builds both guides, drops the coming-soon page and its redirects, and re-arms both checks: the Action then fails unless the installer and the image are really published.

After changing a downloadable HTML example, run `node scripts/check-downloads.mjs` with Playwright installed. It downloads each file through the public guide, serves it from localhost, and checks editing, saving and workshop handoff. Set `PLAYWRIGHT_MODULE` to use an existing Playwright, or pass a documentation origin as the first argument to check a preview.
