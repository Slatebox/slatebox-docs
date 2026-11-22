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

After changing a downloadable HTML example, run `node scripts/check-downloads.mjs` with Playwright installed. It downloads each file through the public guide, serves it from localhost, and checks editing, saving and workshop handoff. Set `PLAYWRIGHT_MODULE` to use an existing Playwright, or pass a documentation origin as the first argument to check a preview.
