# Slatebox documentation

The source for https://docs.slatebox.com. Guides are in `Using-Slatebox`, `Installation` and `Developers`. Runnable recipes are in `Examples`.

Run `npm ci`, `npm run build` and `npm test`. Serve the generated directory with `python3 -m http.server --directory dist`. The existing publishing branch is `retype`. Directory names and Markdown filenames determine public URLs.

After publishing changes to the downloadable HTML examples, run `node scripts/check-downloads.mjs` with Playwright installed. It downloads each file through the public guide, serves it from localhost, and checks editing, saving and workshop handoff. Set `PLAYWRIGHT_MODULE` to use an existing Playwright installation, or pass the documentation origin as the first argument to check a preview.

The Docker guide and its copied prompt point to `assets/self-host/release.json`. Add the verification record under `assets/self-host/releases/{release}.json` when a new matched pair is ready. The build serves the newest record at the unversioned URL and retains each earlier record at its own URL. Use the complete four-image archives, their on-disk sizes and SHA-256 checksums. The recorded release can differ from the latest cloud deployment.

Release order for the pricing pages (`Using-Slatebox/pricing.md`, `own-keys.md`, `top-ups.md`, `Installation/self-host-meters.md`): publish them after the app's pricing switch is in production and the old subscriptions are converted and set not to renew, and before the marketing site's `/plans/` page, which links to them.
