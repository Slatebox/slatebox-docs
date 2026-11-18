# Local development

## Quickstart

For a running instance, use the Compose release and its matching app and relay images. It starts MongoDB, the Meteor app and the collaboration relay together. The initializer uses Node inside the image. [Docker setup](../Installation/install-with-docker.md)

For engine development, obtain the matching SlateboxJS checkout, open its root and run:

```sh
npm ci
npm run build
npm run dev
```

The build produces ESM, CommonJS, CSS and TypeScript declarations in `dist/`. Open the local Vite URL printed by the final command. Run `npm test -- tests/unit/Node.test.ts` for the node unit suite. App integrations use a file-based engine build during development. Keep the app, engine and relay revisions together when assembling a release. [Add a slate to a web page](JavascriptLibrary/readme.md)

## Environment variables

The Compose wrapper uses `APP_IMAGE` and `COLLAB_IMAGE` at initialization. Set `ROOT_URL` to the public app origin and `WS_URL` to the public WebSocket relay origin when serving other machines. Set `SLATEBOX_STATE` and `COMPOSE_PROJECT_NAME` consistently when running several installations. The app's browser-visible settings are public. Store service credentials in the installation’s private server settings. [Configuration and recovery](../Installation/install-with-docker.md)
