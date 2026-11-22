---
title: Preview a triangle before editing the slate
description: Send an authenticated preview and inspect the operation report while the saved board stays untouched.
group: Integrations
---

Preview an edit over the HTTP API and see exactly what it would do. Nothing is saved, and nothing needs installing.

## Before you start

| Variable | Value |
| --- | --- |
| `SLATEBOX_API_TOKEN` | A personal API token, loaded from your secret manager |
| `SLATEBOX_SHARE_ID` | The ID after `/canvas/` in the address of a slate you can edit |
| `SLATEBOX_BASE_URL` | Your Slatebox origin. Leave it unset for `https://app.slatebox.com` |

## Send the preview

Every edit names the revision it was made on, so read the slate first, then send the plan with `mode: "preview"`.

<!-- tabs -->

```js Node.js
const base = process.env.SLATEBOX_BASE_URL ?? "https://app.slatebox.com"
const slate = `${base}/api/v1/slates/${process.env.SLATEBOX_SHARE_ID}`
const headers = { Authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}`, "Content-Type": "application/json" }

const { revision } = await (await fetch(slate, { headers })).json()
const response = await fetch(`${slate}/operations`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    mode: "preview",
    expectedRevision: revision,
    userMessage: "Add one triangle",
    plan: { message: "Place a triangle", operations: [{ kind: "add_nodes", count: 1, shape: "triangle" }] },
  }),
})
console.log(response.status, await response.json())
```

```python Python
import os, requests

base = os.environ.get("SLATEBOX_BASE_URL", "https://app.slatebox.com")
slate = f"{base}/api/v1/slates/{os.environ['SLATEBOX_SHARE_ID']}"
headers = {"Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}"}

revision = requests.get(slate, headers=headers).json()["revision"]
response = requests.post(f"{slate}/operations", headers=headers, json={
    "mode": "preview",
    "expectedRevision": revision,
    "userMessage": "Add one triangle",
    "plan": {"message": "Place a triangle", "operations": [{"kind": "add_nodes", "count": 1, "shape": "triangle"}]},
})
print(response.status_code, response.json())
```

```sh curl
slate="${SLATEBOX_BASE_URL:-https://app.slatebox.com}/api/v1/slates/$SLATEBOX_SHARE_ID"
revision=$(curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" "$slate" | jq .revision)
jq -n --argjson revision "$revision" '{mode: "preview", expectedRevision: $revision,
  userMessage: "Add one triangle",
  plan: {message: "Place a triangle", operations: [{kind: "add_nodes", count: 1, shape: "triangle"}]}}' |
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data @- "$slate/operations"
```

<!-- /tabs -->

You get HTTP 200 with `ok`, `mode: "preview"`, the slate ID, the operations it would run and a `report`. Reopen the board: its note count is unchanged.

To save the edit, send the same body without `mode`. Add an `Idempotency-Key` header so a retry cannot apply it twice.

[Open your slate](https://app.slatebox.com/new) · [Personal tokens and authentication](../Developers/SlateboxAPI/readme.md#authentication)
