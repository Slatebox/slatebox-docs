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

Features written before they can be published are switched in `scripts/features.json`. Today there is one, `"private": false`: Slatebox Private stays unpublished until a measured load test backs its "people at once" figures. A page with `feature: private` in its front matter is built only while the switch is on; while it is off it has no address and is in no navigation, search, sitemap, agent index or Markdown mirror. Text between `<!-- feature:private -->` and `<!-- /feature:private -->` in any page is kept only while the switch is on. `scripts/check-pricing.mjs` checks whichever state the switch is in. To publish Private, set `"private": true` in the same change that switches it on for the marketing site (`site/features.json` there).

After changing a downloadable HTML example, run `node scripts/check-downloads.mjs` with Playwright installed. It downloads each file through the public guide, serves it from localhost, and checks editing, saving and workshop handoff. Set `PLAYWRIGHT_MODULE` to use an existing Playwright, or pass a documentation origin as the first argument to check a preview.
