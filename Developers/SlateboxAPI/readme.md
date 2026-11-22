# Slatebox HTTP API

## Agent prompt

```text
Help me use the documented Slatebox HTTP API for “Slatebox HTTP API”. Use the documented method, path and permissions. Show the request with credential placeholders and verify the response on my chosen slate.

Read https://docs.slatebox.com/Developers/SlateboxAPI/readme.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/SlateboxAPI/readme.md.
```

Create, read and edit slates from your own code. The API is served under `/api/v1` on your Slatebox origin: `https://app.slatebox.com` for Slatebox Cloud, or your own instance's address.

## Endpoints

| Request | Does | Needs |
| --- | --- | --- |
| `POST /api/v1/slates` | Create a private diagram or decision map | `slates:write` and an `Idempotency-Key` |
| `GET /api/v1/slates/{shareId}` | Read a slate | `slates:read` and view access. A public slate reads without a token |
| `POST /api/v1/slates/{shareId}/operations` | Preview or save an edit | `slates:write` and edit access |
| `POST /api/v1/slates/{shareId}/invite` | Issue an unlisted invitation link, or change its role | Owner, `slates:share` and an `Idempotency-Key` |
| `DELETE /api/v1/slates/{shareId}/invite/{inviteId}` | Withdraw that invitation | Owner, `slates:share` and an `Idempotency-Key` |
| `GET /api/v1/me` | Read your account | A token |
| `GET /api/v1/instance` | Describe the instance: version, limits and routes | Nothing; a token adds your account |
| `GET /api/v1/tokens` | List the token you call with | That token |
| `DELETE /api/v1/tokens/current` | Revoke the token you call with, which signs an agent out | That token |
| `POST /api/v1/exec` | Run an agent script in the sealed runner | A token; each call inside is checked with its scopes |
| `GET /api/v1/exec/{execId}` | Read the record of one of your runs | A token of yours |
| `POST /mcp` | The MCP endpoint: the `exec` and `describe` tools | A bearer token |
| `GET https://api.slatebox.com/embed/{publishedSlateId}` | Show a published presentation image (the embed host) | A published board |

Every instance serves its OpenAPI 3.1 document, with request bodies, response schemas and operation IDs, at `/api/v1/openapi.json`. No token is needed. [OpenAPI for Slatebox Cloud](https://app.slatebox.com/api/v1/openapi.json)

<!-- tabs -->

```js Node.js
const base = process.env.SLATEBOX_BASE_URL ?? 'https://app.slatebox.com'
const spec = await (await fetch(`${base}/api/v1/openapi.json`)).json()
console.log(Object.keys(spec.paths))
```

```python Python
import os, requests

base = os.environ.get("SLATEBOX_BASE_URL", "https://app.slatebox.com")
spec = requests.get(f"{base}/api/v1/openapi.json").json()
print(list(spec["paths"]))
```

```sh curl
curl --fail-with-body --silent --show-error \
  "${SLATEBOX_BASE_URL:-https://app.slatebox.com}/api/v1/openapi.json"
```

<!-- /tabs -->

## Authentication

1. Sign in and open **Profile → Developer access**. [Developer access](https://app.slatebox.com/profile)
2. Create a personal token with the scopes you need, and keep it in your secret store.
3. Send it as `Authorization: Bearer` followed by the token.

Every request is checked against the token's scopes and your current access to the slate. Revoke unused tokens in the same panel. Call the API from a server: never put a personal token in a public web page.

The examples read these environment variables. The exec package and CLI read the first two.

| Variable | Value |
| --- | --- |
| `SLATEBOX_API_TOKEN` | Your personal token |
| `SLATEBOX_BASE_URL` | Your Slatebox origin, such as `https://app.slatebox.com` |
| `SLATEBOX_SHARE_ID` | The ID after `/canvas/` in the URL of a slate you can open |

Node.js examples are ES modules for Node.js 22 or later: save one as `example.mjs` and run `node example.mjs`. Python examples need `requests`. [Read, preview and apply an edit](slates.md)

## Work on the same decision map

The canvas, exec scripts and the HTTP API work on the same saved slate. Each client method in a script is one HTTP operation, checked the same way. Paths are relative to `/api/v1`. [Exec: how agents work with Slatebox](exec.md)

| In the app | In an exec script | HTTP |
| --- | --- | --- |
| Draw a flow from a brief or public source | `slatebox.slates.create({ kind: "diagram", brief })` | `POST /slates` with `kind: "diagram"` |
| Start a private map from a brief | `slatebox.slates.create({ brief })` | `POST /slates` |
| Open the saved map | `slatebox.slates.get({ shareId })` | `GET /slates/{shareId}` |
| Ask the side conversation to add a branch | `applyOperations` with `add_map_branch` | `POST /slates/{shareId}/operations` |
| Change the instruction at a station | `applyOperations` with `update_map_outcome` | The same, with `update_map_outcome` |
| Drag the token to a connected station | `applyOperations` with `move_workshop_card` | The same, with `move_workshop_card` |
| Present a scene first | `applyOperations` with `set_presentation_order` | The same, with `set_presentation_order` |
| Create an invitation from **Share** | `slatebox.slates.issueInvite({ shareId, role })` | `POST /slates/{shareId}/invite` |
| Withdraw that link | `slatebox.slates.revokeInvite({ shareId, inviteId })` | `DELETE /slates/{shareId}/invite/{inviteId}` |

Preview against the current revision, then save with the same revision. In a script, issuing or withdrawing an invitation waits for your confirmation.

An invitation link grants access to one slate. To add a named teammate, use **Manage team** in the app; to start a live session, use **Presentation options → Present to everyone here**. [Run the backfill review](../../Examples/review-a-backfill.md) · [Install the package and CLI](terminal-and-agents.md) · [Work with a team](../../Using-Slatebox/readme.md#work-with-a-team)

## Run agent scripts over HTTP

`POST /api/v1/exec` takes `intent`, `code` and optionally `mode`, `confirm` and `idempotencyKey`. It returns `200` whenever the script ran, with its `status`, `result`, `logs`, each call and any held save. `POST /mcp` serves the same `exec` tool to MCP clients. [Exec over HTTP](exec.md#use-exec-over-http) · [Run a script](terminal-and-agents.md#run-a-script)

## Embed a published board

For an interactive walkthrough, open **View previous versions** in the presentation editor and select **Copy embed code** on the published version. Readers step through the viewpoints inside your page. [Try a walkthrough in a handbook](../../Examples/embed-a-walkthrough.md)

For a still preview, use this iframe with your published slate ID. It shows the published image and links to its presentation player. For teammates who will edit the board, send a canvas invitation instead.

<!-- tabs -->

```html HTML
<iframe title="Workshop decision" loading="lazy" width="800" height="450"
  src="https://api.slatebox.com/embed/your-published-slate-id"></iframe>
```

<!-- /tabs -->
