# Slatebox HTTP API

## Agent prompt

```text
Help me use the documented Slatebox HTTP API for “Slatebox HTTP API”. Use the documented method, path and permissions. Show the request with credential placeholders and verify the response on my chosen slate.

Read https://docs.slatebox.com/Developers/SlateboxAPI/readme.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/SlateboxAPI/readme.md.
```

## Introduction

Create a private decision map from a team question, read a slate or submit an edit from your own application. A public route directory lists the endpoints and scopes the hosted service currently serves.

```sh
curl --fail --silent --show-error https://api.slatebox.com/v1
```

| Request | Use | Required access |
| --- | --- | --- |
| `POST /v1/slates` | Create a private decision map from a brief | `slates:write` and an `Idempotency-Key` |
| `GET /v1/slates/{shareId}` | Read a summary, optionally the full slate | `slates:read` and permission to view the slate |
| `POST /v1/slates/{shareId}/operations` | Preview or apply an edit | `slates:write` and permission to edit the slate |
| `POST /v1/slates/{shareId}/invite` | Issue or change an unlisted invitation link | Owner with `slates:share` and an `Idempotency-Key` |
| `DELETE /v1/slates/{shareId}/invite/{inviteId}` | Withdraw that invitation | Owner with `slates:share` and an `Idempotency-Key` |
| `GET /embed/{publishedSlateId}` | Display a published presentation snapshot | A published image |
| `GET /healthz` | Check the edge service | Public |

The shell CLI and MCP tools can read the same board and submit the same edit plan. [Edit from a terminal or an agent](terminal-and-agents.md)

Download the OpenAPI 3.1 document for the request bodies, response schemas and operation IDs. Self-hosted instances serve their own version at `/api/v1/openapi.json`. The document can be read before issuing a token. [OpenAPI for Slatebox Cloud](https://api.slatebox.com/v1/openapi.json)

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

Replace request signatures, public keys and timestamp headers with a personal bearer token. Migrate decision-map creation to `POST /v1/slates` with a brief and an idempotency key. Older prompt magic links, standalone layout and v1.0 WebSocket embed scripts were retired. [Create a private decision map](slates.md#create-a-private-decision-map) Use **Manage Team** in the app to invite colleagues. [Team administration](organizations.md)
