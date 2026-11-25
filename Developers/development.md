# Local development

## Agent prompt

```text
Help me implement “Local development” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/development.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/development.md.
```

## Quickstart

To run Slatebox, start the image: one container runs the app, the relay and MongoDB. To run your own, use `npx slatebox install`. [Run your own Slatebox](../Installation/self-hosting.md)

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

The image needs none. Its optional settings (address, mail, AI drafts, single sign-on) are in one table: [Options](../Installation/install-with-docker.md#options). Browser-visible settings are public; service credentials stay in server-side settings.
