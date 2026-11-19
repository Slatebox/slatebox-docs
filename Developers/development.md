# Local development

## Quickstart

For a running instance, start the Slatebox image. One container runs the app, the collaboration relay and MongoDB. [Run your own Slatebox](../Installation/install-with-docker.md)

For engine development, open the root of a SlateboxJS checkout and run:

```sh
npm ci
npm run build
npm run dev
```

The build produces ESM, CommonJS, CSS and TypeScript declarations in `dist/`. Open the local Vite URL printed by the final command. Run `npm test -- tests/unit/Node.test.ts` for the node unit suite. [Add a slate to a web page](JavascriptLibrary/readme.md)

To try app, engine and relay changes together, build the image from your three checkouts. The build compiles the engine afresh and labels the image with all three revisions. [Build the image yourself](../Installation/install-with-docker.md#build-the-image-yourself)

## Environment variables

The image needs none. Its optional settings, such as the public address, mail and AI drafts, are listed in one table. The app's browser-visible settings are public; the image keeps service credentials in server-side settings. [Options](../Installation/install-with-docker.md#options)
