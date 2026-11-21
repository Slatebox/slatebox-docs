# Slatebox HTTP API

## Introduction

Create a private drawing or decision map from a team question, read a slate or submit an edit from your own application. The HTTP API is served under `/api/v1` on your Slatebox origin: `https://app.slatebox.com` for Slatebox Cloud, or your own instance's address. The OpenAPI document lists the operations and scopes that origin serves, and can be read before you issue a token.

```sh
curl --fail --silent --show-error "${SLATEBOX_BASE_URL:-https://app.slatebox.com}/api/v1/openapi.json"
```

| Request | Use | Required access |
| --- | --- | --- |
| `POST /api/v1/slates` | Create a private diagram or decision map | `slates:write` and an `Idempotency-Key` |
| `GET /api/v1/slates/{shareId}` | Read a summary, optionally the full slate | `slates:read` and permission to view the slate |
| `POST /api/v1/slates/{shareId}/operations` | Preview or apply an edit | `slates:write` and permission to edit the slate |
| `POST /api/v1/slates/{shareId}/invite` | Issue or change an unlisted invitation link | Owner with `slates:share` and an `Idempotency-Key` |
| `DELETE /api/v1/slates/{shareId}/invite/{inviteId}` | Withdraw that invitation | Owner with `slates:share` and an `Idempotency-Key` |
| `GET https://api.slatebox.com/embed/{publishedSlateId}` | Display a published presentation snapshot (the embed host, not the API) | A published image |
| `POST /api/v1/exec` | Run an agent script against the typed client in the instance's sealed runner | A token; each call inside is checked with that token's scopes |
| `GET /api/v1/exec/{execId}` | Read the record of one of your own script runs | The token that ran it |
| `POST /mcp` | The MCP endpoint for agents: the `exec` and `describe` tools | `Authorization: Bearer` with a token |

Download the OpenAPI 3.1 document for the request bodies, response schemas and operation IDs. Every instance serves its own version at `/api/v1/openapi.json`. [OpenAPI for Slatebox Cloud](https://app.slatebox.com/api/v1/openapi.json)

## Work on the same decision map

The canvas, exec scripts and the HTTP API work on the same saved slate. An agent, the CLI (`slatebox exec`) and the MCP endpoint all run scripts that call the client methods below; each method is one HTTP operation, checked the same way. The HTTP paths below are relative to `/api/v1` on your Slatebox origin. Check the OpenAPI schema on the instance you plan to use. [Exec: how agents work with Slatebox](exec.md)

| In the app | In an exec script | HTTP operation |
| --- | --- | --- |
| Draw a flow from a brief or public source | `slatebox.slates.create({ kind: "diagram", brief })` | `POST /slates` with `kind: "diagram"` |
| Start a private map from a brief | `slatebox.slates.create({ brief })` | `POST /slates` |
| Open the saved map | `slatebox.slates.get({ shareId })` | `GET /slates/{shareId}` |
| Ask the side conversation to add a branch | `applyOperations` with an `add_map_branch` operation | Submit `add_map_branch` |
| Change the instruction at a station | `applyOperations` with `update_map_outcome` | Submit `update_map_outcome` |
| Drag the token to a connected station or choose it by keyboard | `applyOperations` with `move_workshop_card` | Submit `move_workshop_card` |
| Ask the conversation to present a scene first | `applyOperations` with `set_presentation_order` | Submit `set_presentation_order` |
| Create an invitation from **Share** | `slatebox.slates.issueInvite({ shareId, role })` | `POST /slates/{shareId}/invite` |
| Withdraw that link | `slatebox.slates.revokeInvite({ shareId, inviteId })` | `DELETE /slates/{shareId}/invite/{inviteId}` |

Submit map edits and moves to `POST /slates/{shareId}/operations`. Preview against the current revision, then use the same revision to save. In a script, creating an invitation or withdrawing one waits for your confirmation. The invitation links above grant access to one slate. To enroll a named team member, use **Manage Team**. Use **Present together** in the app to start the live session. [Run the backfill review](../../Examples/review-a-backfill.md) · [Install the package and CLI](terminal-and-agents.md) · [Team enrollment](organizations.md)

## Run agent scripts over HTTP

`POST /api/v1/exec` takes `intent`, `code` and optionally `mode`, `confirm` and `idempotencyKey`, and returns `200` whenever the script ran, with its `status`, `result`, `logs`, each call and any held save. `POST /mcp` serves the same `exec` tool to MCP clients. When the package or CLI runs a script on your own machine instead, each call it sends carries `Slatebox-Exec-*` headers (`Id`, `Key`, `Call`, `Code-Sha256`, `Mode`, `Intent` and, when confirming, `Confirm`), and the instance applies the same script rules to it. Do not combine those headers with `Idempotency-Key`. [Exec over HTTP](exec.md#use-exec-over-http)

## Authentication

Sign in, open **Profile → Developer access**, and create a personal token. Copy it into a local secret store when issued. Send it in the `Authorization: Bearer` header. The service checks the token's scopes and the account's current access on every request. Revoke unused tokens in the same profile panel. [Developer access](https://app.slatebox.com/profile)

For the shell examples, set `SLATEBOX_API_TOKEN` in your terminal through your secret manager, set `SLATEBOX_BASE_URL` to your Slatebox origin, and set `SLATEBOX_SHARE_ID` to the identifier following `/canvas/` in a slate you can access. The exec package and CLI read the same two variables. Public web pages should call their own backend when requests require personal credentials. [Read, preview and apply an edit](slates.md)

## Embed a published board

For an interactive walkthrough, open **View previous versions** in the presentation editor and select **Copy embed code** on the published version. Readers can advance through the viewpoints inside your page. [Try a walkthrough in a handbook](../../Examples/embed-a-walkthrough.md)

For a still preview, replace the identifier below with your published slate ID. The iframe shows the published image and links to its presentation player. Use a canvas invitation for teammates who will edit the underlying board.

```html
<iframe title="Workshop decision" loading="lazy" width="800" height="450"
  src="https://api.slatebox.com/embed/YOUR_PUBLISHED_SLATE_ID"></iframe>
```

## Migration from organization HMAC credentials

Replace request signatures, public keys and timestamp headers with a personal bearer token. Migrate decision-map creation to `POST /api/v1/slates` with a brief and an idempotency key. Older prompt magic links, standalone layout and v1.0 WebSocket embed scripts were retired. [Create a private decision map](slates.md#create-a-private-decision-map) Use **Manage Team** in the app to invite colleagues. [Team administration](organizations.md)
