# Read and edit a slate

## Agent prompt

```text
Help me use the documented Slatebox HTTP API for “Read and edit a slate”. Use the documented method, path and permissions. Show the request with credential placeholders and verify the response on my chosen slate.

Read https://docs.slatebox.com/Developers/SlateboxAPI/slates.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/SlateboxAPI/slates.md.
```

Create a slate, read it, and preview or save an edit over plain HTTP. Set `SLATEBOX_API_TOKEN`, `SLATEBOX_BASE_URL` and `SLATEBOX_SHARE_ID` first. [Authentication](readme.md#authentication)

## Create a native diagram

Send a brief with `"kind": "diagram"`. You need `slates:write` and one `Idempotency-Key` per drawing; keep it for retries.

<!-- tabs -->

```js Node.js
const res = await fetch(`${process.env.SLATEBOX_BASE_URL}/api/v1/slates`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}`,
    'Idempotency-Key': crypto.randomUUID(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    kind: 'diagram',
    source: 'call-status',
    brief: 'What should support tell someone starting a new call during the outage?',
  }),
})
console.log(res.status, await res.json())
```

```python Python
import os, uuid, requests

res = requests.post(
    f"{os.environ['SLATEBOX_BASE_URL']}/api/v1/slates",
    headers={
        "Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}",
        "Idempotency-Key": str(uuid.uuid4()),
    },
    json={
        "kind": "diagram",
        "source": "call-status",
        "brief": "What should support tell someone starting a new call during the outage?",
    },
)
print(res.status_code, res.json())
```

```sh curl
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H 'Content-Type: application/json' \
  --data '{"kind":"diagram","source":"call-status","brief":"What should support tell someone starting a new call during the outage?"}' \
  "$SLATEBOX_BASE_URL/api/v1/slates"
```

<!-- /tabs -->

You get `201` with `shareId`, the editor `url` and `diagram`: here five native notes and four directed connections.

- **Retry.** The same key and body return `200` and the original result. The same key with a different body returns `409`.
- **Your own steps.** Leave out `source` and send steps such as `Request -> Review -> Release`, up to 1,200 characters.
- **Sources.** `call-status`, `interview-notes`, `sign-in-outage` and `friday-launch`.

[The same diagram from an exec script](terminal-and-agents.md#create-a-diagram-from-source-material)

## Create a private decision map

Send a team question as the brief, up to 160 characters.

<!-- tabs -->

```js Node.js
const res = await fetch(`${process.env.SLATEBOX_BASE_URL}/api/v1/slates`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}`,
    'Idempotency-Key': crypto.randomUUID(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ brief: 'Who can approve a customer refund?' }),
})
console.log(res.status, await res.json())
```

```python Python
import os, uuid, requests

res = requests.post(
    f"{os.environ['SLATEBOX_BASE_URL']}/api/v1/slates",
    headers={
        "Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}",
        "Idempotency-Key": str(uuid.uuid4()),
    },
    json={"brief": "Who can approve a customer refund?"},
)
print(res.status_code, res.json())
```

```sh curl
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H 'Content-Type: application/json' \
  --data '{"brief":"Who can approve a customer refund?"}' \
  "$SLATEBOX_BASE_URL/api/v1/slates"
```

<!-- /tabs -->

You get `201` with the new map's `shareId`, editor `url` and `workshop` summary. The map is private to the token's owner. Open the editor to add paths through the side conversation. Retries work as for a diagram.

## Read a slate

<!-- tabs -->

```js Node.js
const res = await fetch(`${process.env.SLATEBOX_BASE_URL}/api/v1/slates/${process.env.SLATEBOX_SHARE_ID}`, {
  headers: { Authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}` },
})
const slate = await res.json()
console.log(slate.revision, slate.nodeCount)
```

```python Python
import os, requests

res = requests.get(
    f"{os.environ['SLATEBOX_BASE_URL']}/api/v1/slates/{os.environ['SLATEBOX_SHARE_ID']}",
    headers={"Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}"},
)
slate = res.json()
print(slate["revision"], slate["nodeCount"])
```

```sh curl
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  "$SLATEBOX_BASE_URL/api/v1/slates/$SLATEBOX_SHARE_ID"
```

<!-- /tabs -->

You get the slate as one JSON object. Treat it as private board data.

| Field | Holds |
| --- | --- |
| `shareId`, `revision` | The slate and its save count. Send `revision` as `expectedRevision` with a canvas edit |
| `name`, `url` | Its name and editor address |
| `nodes`, `nodeCount` | Every matching note, with every key a write sets |
| `connections` | Its connectors |
| `access` | Your role and what you may do |
| `workshop` | On a map or workshop only: lanes, cards, `presentationOrder` and the board's own `revision` |

Narrow the notes with `fields`, `ids`, `within`, `groupId` or `q`, and page with `limit` and `cursor`. Add `?include=full` to get a `document` field with the slate as the engine loads it. A public slate reads without a token.

## Preview one change

Every edit names the revision it was made on: read the slate's `revision` and send it as `expectedRevision`. Without it the request is refused with `400 invalid_request`. `"mode": "preview"` saves nothing, but still needs edit permission.

<!-- tabs -->

```js Node.js
const slateUrl = `${process.env.SLATEBOX_BASE_URL}/api/v1/slates/${process.env.SLATEBOX_SHARE_ID}`
const auth = { Authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}` }
const { revision } = await (await fetch(slateUrl, { headers: auth })).json()
const res = await fetch(`${slateUrl}/operations`, {
  method: 'POST',
  headers: { ...auth, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'preview',
    expectedRevision: revision,
    userMessage: 'Add a triangle',
    plan: { message: 'Add one triangle', operations: [{ kind: 'add_nodes', count: 1, shape: 'triangle' }] },
  }),
})
console.log(res.status, await res.json())
```

```python Python
import os, requests

slate_url = f"{os.environ['SLATEBOX_BASE_URL']}/api/v1/slates/{os.environ['SLATEBOX_SHARE_ID']}"
auth = {"Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}"}
revision = requests.get(slate_url, headers=auth).json()["revision"]
res = requests.post(
    f"{slate_url}/operations",
    headers=auth,
    json={
        "mode": "preview",
        "expectedRevision": revision,
        "userMessage": "Add a triangle",
        "plan": {"message": "Add one triangle", "operations": [{"kind": "add_nodes", "count": 1, "shape": "triangle"}]},
    },
)
print(res.status_code, res.json())
```

```sh curl
slate_url="$SLATEBOX_BASE_URL/api/v1/slates/$SLATEBOX_SHARE_ID"
revision=$(curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" "$slate_url" | jq .revision)
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"mode":"preview","expectedRevision":'"$revision"',"userMessage":"Add a triangle","plan":{"message":"Add one triangle","operations":[{"kind":"add_nodes","count":1,"shape":"triangle"}]}}' \
  "$slate_url/operations"
```

<!-- /tabs -->

You get `200` with `ok`, `mode`, `shareId`, `message`, the materialized `operations` and a `report`. Check the report before you save.

## Apply the change

This request **writes to the slate**: without `mode`, an edit saves. Try it on a test board first. Send one `Idempotency-Key` per edit, and the same key when you retry that exact request. Keys are scoped to the token.

<!-- tabs -->

```js Node.js
const slateUrl = `${process.env.SLATEBOX_BASE_URL}/api/v1/slates/${process.env.SLATEBOX_SHARE_ID}`
const auth = { Authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}` }
const { revision } = await (await fetch(slateUrl, { headers: auth })).json()
const res = await fetch(`${slateUrl}/operations`, {
  method: 'POST',
  headers: { ...auth, 'Idempotency-Key': crypto.randomUUID(), 'Content-Type': 'application/json' },
  body: JSON.stringify({
    expectedRevision: revision,
    userMessage: 'Add a triangle',
    plan: { message: 'Add one triangle', operations: [{ kind: 'add_nodes', count: 1, shape: 'triangle' }] },
  }),
})
console.log(res.status, await res.json())
```

```python Python
import os, uuid, requests

slate_url = f"{os.environ['SLATEBOX_BASE_URL']}/api/v1/slates/{os.environ['SLATEBOX_SHARE_ID']}"
auth = {"Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}"}
revision = requests.get(slate_url, headers=auth).json()["revision"]
res = requests.post(
    f"{slate_url}/operations",
    headers={**auth, "Idempotency-Key": str(uuid.uuid4())},
    json={
        "expectedRevision": revision,
        "userMessage": "Add a triangle",
        "plan": {"message": "Add one triangle", "operations": [{"kind": "add_nodes", "count": 1, "shape": "triangle"}]},
    },
)
print(res.status_code, res.json())
```

```sh curl
slate_url="$SLATEBOX_BASE_URL/api/v1/slates/$SLATEBOX_SHARE_ID"
revision=$(curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" "$slate_url" | jq .revision)
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H 'Content-Type: application/json' \
  --data '{"expectedRevision":'"$revision"',"userMessage":"Add a triangle","plan":{"message":"Add one triangle","operations":[{"kind":"add_nodes","count":1,"shape":"triangle"}]}}' \
  "$slate_url/operations"
```

<!-- /tabs -->

A new write returns `201`. A replay of a recorded key returns the earlier result with `200`. Read the slate again to see the edit.

| Status | Check |
| --- | --- |
| 400 | `error.message`: an invalid plan, or a canvas edit without `expectedRevision` (`error.details.field`) |
| 401 | The token is current and has the scope |
| 403 or 404 | The share ID and your permission on that slate |
| 409 | Someone saved a change this edit touches, or a map edit's `expectedRevision` is out of date. Read again and preview |
| 429 | Wait before retrying with this token |

## Add a decision and its outcome

On a decision map, read `workshop.revision` and find the source station's ID in `workshop.lanes`. Send this body to the same `/operations` endpoint, with your station ID and revision:

<!-- tabs -->

```json JSON
{
  "mode": "preview",
  "plan": {
    "message": "Give the reviewer a recovery path",
    "operations": [{
      "kind": "add_map_branch",
      "fromStationId": "source-station-id",
      "label": "Repair missing rows",
      "outcome": "reconcile the missing IDs and run the comparison again.",
      "expectedRevision": 0
    }]
  }
}
```

<!-- /tabs -->

The preview lists the new station in `report.addedBranches`, and its ID appears in the source station's `next` list. To save, leave out `mode` and send an `Idempotency-Key` (a map save needs one), with the same plan and revision. The path and its instruction save in one revision.

To change an existing arrival instruction, send one `update_map_outcome` operation with `stationId`, `outcome` and `expectedRevision`. [The same edit from an exec script](terminal-and-agents.md#add-a-path-and-an-arrival-instruction)

## Order presentation scenes

`workshop.presentationOrder` lists the scene IDs in playback order. To change it, send one `set_presentation_order` operation with `laneIds` (every current scene ID, once) and `expectedRevision`. The preview returns the order in `report.presentationOrder`; save with the same revision and a new key. Layout, routes and token positions stay as they are. [The same change from an exec script](terminal-and-agents.md#choose-the-opening-scene)

## Manage an invitation link

Issuing a link needs a token with **Manage invitation links on slates I own** (`slates:share`), on a slate you own. Choose `edit` for a contributor, `comment` for a reviewer or `read` for a viewer.

<!-- tabs -->

```js Node.js
const res = await fetch(`${process.env.SLATEBOX_BASE_URL}/api/v1/slates/${process.env.SLATEBOX_SHARE_ID}/invite`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}`,
    'Idempotency-Key': crypto.randomUUID(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ role: 'edit' }),
})
console.log(res.status, await res.json())
```

```python Python
import os, uuid, requests

res = requests.post(
    f"{os.environ['SLATEBOX_BASE_URL']}/api/v1/slates/{os.environ['SLATEBOX_SHARE_ID']}/invite",
    headers={
        "Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}",
        "Idempotency-Key": str(uuid.uuid4()),
    },
    json={"role": "edit"},
)
print(res.status_code, res.json())
```

```sh curl
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H 'Content-Type: application/json' \
  --data '{"role":"edit"}' \
  "$SLATEBOX_BASE_URL/api/v1/slates/$SLATEBOX_SHARE_ID/invite"
```

<!-- /tabs -->

You get the invitation `url` and an `inviteId`. A slate has one unlisted link, so changing its role changes it for everyone who holds it. A public slate's visibility is managed in the app.

To withdraw it, set `SLATEBOX_INVITE_ID` to the returned ID and send a `DELETE` with a new key:

<!-- tabs -->

```js Node.js
const { SLATEBOX_BASE_URL, SLATEBOX_SHARE_ID, SLATEBOX_INVITE_ID, SLATEBOX_API_TOKEN } = process.env
const res = await fetch(`${SLATEBOX_BASE_URL}/api/v1/slates/${SLATEBOX_SHARE_ID}/invite/${SLATEBOX_INVITE_ID}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${SLATEBOX_API_TOKEN}`, 'Idempotency-Key': crypto.randomUUID() },
})
console.log(res.status, await res.json())
```

```python Python
import os, uuid, requests

e = os.environ
res = requests.delete(
    f"{e['SLATEBOX_BASE_URL']}/api/v1/slates/{e['SLATEBOX_SHARE_ID']}/invite/{e['SLATEBOX_INVITE_ID']}",
    headers={"Authorization": f"Bearer {e['SLATEBOX_API_TOKEN']}", "Idempotency-Key": str(uuid.uuid4())},
)
print(res.status_code, res.json())
```

```sh curl
curl --fail-with-body --silent --show-error -X DELETE \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  "$SLATEBOX_BASE_URL/api/v1/slates/$SLATEBOX_SHARE_ID/invite/$SLATEBOX_INVITE_ID"
```

<!-- /tabs -->

The invitation URL stops granting access and the slate is private again. Private team-member permissions still apply. [The same invitation from an exec script](terminal-and-agents.md#invite-a-reviewer)
