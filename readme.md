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

- `"private": true`: Slatebox Private is published. Its measured load test backs the "people at once" figures (About 25 for Small) and the video cost was checked against the provider invoice, the two conditions it was held for. Keep it in step with the marketing site's switch (`site/features.json` there).
- `"private-checkout": false`: the Private page offers "Write to us to buy Small" instead of the self-serve link `https://app.slatebox.com/buy/private-small`. Turn it on together with the app's `public.privateCheckout` setting and the marketing site's `private-checkout` switch, once the payment link exists.
- `"pro-checkout": false`: the Slatebox Pro page says Pro goes on sale on the date emailed to every account, instead of the steps to buy it in **Credits**. The app sells Pro only once its admin has set the Pro date, so the order is: the app, then the Pro date, then this switch and the marketing site's `pro-checkout` switch.
- `"self-host": false`: the install guide (`Installation/install-with-docker.md`) and the single sign-on guide (`Installation/single-sign-on.md`) are held, because their first command needs the npm installer `slatebox` or the image `ghcr.io/slatebox/slatebox`, and neither is published yet. While held, their addresses redirect to `Installation/self-hosting.md` ("Self-hosting is coming soon"), which is built only while the switch is off. Links to the held guides sit in `<!-- feature:self-host -->` blocks, with the coming-soon link in `<!-- feature:!self-host -->` blocks beside them.

A page with `feature: <name>` in its front matter is built only while that switch is on, and `feature: "!<name>"` only while it is off; a page that is not built has no address and is in no navigation, search, sitemap, agent index or Markdown mirror. A held page with `whileHeld: /address/` keeps its old address as a redirect to that page. Text between `<!-- feature:<name> -->` and `<!-- /feature:<name> -->` in any page is kept only while the switch is on; between `<!-- feature:!<name> -->` and `<!-- /feature:!<name> -->`, only while it is off. `scripts/check-pricing.mjs` and `scripts/check-installer-docs.mjs` check whichever state the switches are in.

### Publishing the install guide

The publish workflow runs `scripts/check-image-published.mjs` and `scripts/check-installer-published.mjs` after the tests. While `"self-host"` is off they pass without a network call, since the guide is not built. To publish the guide, set `"self-host": true` once `slatebox` is on npm and `ghcr.io/slatebox/slatebox:latest` can be pulled without signing in (amd64 and arm64). That one change builds both guides, drops the coming-soon page and its redirects, and re-arms both checks: the Action then fails unless the installer and the image are really published.

After changing a downloadable HTML example, run `node scripts/check-downloads.mjs` with Playwright installed. It downloads each file through the public guide, serves it from localhost, and checks editing, saving and workshop handoff. Set `PLAYWRIGHT_MODULE` to use an existing Playwright, or pass a documentation origin as the first argument to check a preview.
