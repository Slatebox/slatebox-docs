# Local development

## Quickstart

To run Slatebox, start the image: one container runs the app, the relay and MongoDB. [Run your own Slatebox](../Installation/install-with-docker.md)

To work on the engine, run this in a SlateboxJS checkout:

<!-- tabs -->

```sh Node.js
npm ci
npm run build
npm run dev
```

<!-- /tabs -->

You get ESM, CommonJS, CSS and TypeScript declarations in `dist/`, and a local Vite URL to open. Run one unit suite with `npm test -- tests/unit/Node.test.ts`. [Add a slate to a web page](JavascriptLibrary/readme.md)

To try app, engine and relay changes together, build the image from your three checkouts. It builds the engine fresh and labels the image with all three revisions. [Build the image yourself](../Installation/install-with-docker.md#build-the-image-yourself)

## Environment variables

The image needs none. Its optional settings (address, mail, AI drafts, single sign-on) are in one table. Browser-visible settings are public; service credentials stay in server-side settings. [Options](../Installation/install-with-docker.md#options)
