# Slatebox HTTP API

## Introduction

Read an existing slate or submit a structured edit from your own application. A public route directory lists the endpoints and scopes the hosted service currently serves.

```sh
curl --fail --silent --show-error https://api.slatebox.com/v1
```

| Request | Use | Required access |
| --- | --- | --- |
| `GET /v1/slates/{shareId}` | Read a summary, optionally the full slate | `slates:read` and permission to view the slate |
| `POST /v1/slates/{shareId}/operations` | Preview or apply an edit | `slates:write` and permission to edit the slate |
| `GET /embed/{publishedSlateId}` | Display a published presentation snapshot | A published image |
| `GET /healthz` | Check the edge service | Public |

## Authentication

Sign in, open **Profile → Developer access**, and create a personal token. Copy it into a local secret store when issued. Send it in the `Authorization: Bearer` header. The service checks the token's scopes and the account's current access on every request. Revoke unused tokens in the same profile panel. [Developer access](https://app.slatebox.com/profile)

For the shell examples, set `SLATEBOX_TOKEN` in your terminal through your secret manager and set `SLATEBOX_SHARE_ID` to the identifier following `/canvas/` in a slate you can access. Public web pages should call their own backend when requests require personal credentials. The Worker also accepts the original app-style `/api/v1/slates/…` paths. [Read, preview and apply an edit](slates.md)

## Embed a published board

For an interactive walkthrough, open **View previous versions** in the presentation editor and select **Copy embed code** on the published version. Readers can advance through the viewpoints inside your page. [Try a walkthrough in a handbook](../../Examples/embed-a-walkthrough.md)

For a still preview, replace the identifier below with your published slate ID. The iframe shows the published image and links to its presentation player. Use a canvas invitation for teammates who will edit the underlying board.

```html
<iframe title="Workshop decision" loading="lazy" width="800" height="450"
  src="https://api.slatebox.com/embed/YOUR_PUBLISHED_SLATE_ID"></iframe>
```

## Migration from organization HMAC credentials

Replace request signatures, public keys and timestamp headers with a personal bearer token. The former prompt magic links, programmatic slate-creation, standalone layout service and v1.0 WebSocket embed scripts were retired. Create the slate in the app, then read or edit it by its share ID. Move organization administration to the team settings screen. [Team administration](organizations.md)
