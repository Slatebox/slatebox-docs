# Local development

## Quickstart

To run Slatebox, start the image: one container runs the app, the relay and MongoDB. <!-- feature:self-host -->[Run your own Slatebox](../Installation/install-with-docker.md)<!-- /feature:self-host --><!-- feature:!self-host -->The installer and the image are being published. [Run your own Slatebox](../Installation/self-hosting.md)<!-- /feature:!self-host -->

To work on the engine, run this in a SlateboxJS checkout:

<!-- tabs -->

```sh Node.js
npm ci
npm run build
npm run dev
```

<!-- /tabs -->

You get ESM, CommonJS, CSS and TypeScript declarations in `dist/`, and a local Vite URL to open. Run one unit suite with `npm test -- tests/unit/Node.test.ts`. [Add a slate to a web page](JavascriptLibrary/readme.md)

<!-- feature:self-host -->
To try app, engine and relay changes together, build the image from your three checkouts. It builds the engine fresh and labels the image with all three revisions. [Build the image yourself](../Installation/install-with-docker.md#build-the-image-yourself)
<!-- /feature:self-host -->

## Environment variables

The image needs none. Its optional settings (address, mail, AI drafts, single sign-on) are in one table<!-- feature:self-host -->: [Options](../Installation/install-with-docker.md#options)<!-- /feature:self-host -->. Browser-visible settings are public; service credentials stay in server-side settings.
