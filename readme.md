# Slatebox documentation

The source for https://docs.slatebox.com. Guides are in `Using-Slatebox`, `Installation` and `Developers`. Runnable recipes are in `Examples`.

Run `npm ci`, `npm run build` and `npm test`. Serve the generated directory with `npx --yes http-server dist -p 8000`. The existing publishing branch is `retype`. Directory names and Markdown filenames determine public URLs.

After publishing changes to the downloadable HTML examples, run `node scripts/check-downloads.mjs` with Playwright installed. It downloads each file through the public guide, serves it from localhost, and checks editing, saving and workshop handoff. Set `PLAYWRIGHT_MODULE` to use an existing Playwright installation, or pass the documentation origin as the first argument to check a preview.
