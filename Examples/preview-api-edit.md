---
title: Preview a triangle before editing the slate
description: Send an authenticated preview and inspect the operation report while the saved board stays untouched.
group: Integrations
---

Open a slate you can edit, copy its ID from the canvas URL, and load a personal API token into your shell from your secret manager. Set `SLATEBOX_BASE_URL` to your own instance's address, or leave it unset for Slatebox Cloud. This recipe uses the HTTP API and runs without an engine installation.

```sh
: "${SLATEBOX_API_TOKEN:?Load your personal token into the environment}"
: "${SLATEBOX_BASE_URL:=https://app.slatebox.com}"
: "${SLATEBOX_SHARE_ID:?Set the ID from your editable canvas URL}"
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"mode":"preview","userMessage":"Add one triangle","plan":{"message":"Place a triangle","operations":[{"kind":"add_nodes","count":1,"shape":"triangle"}]}}' \
  "$SLATEBOX_BASE_URL/api/v1/slates/$SLATEBOX_SHARE_ID/operations"
```

Expect HTTP 200 and JSON with `ok`, `mode: "preview"`, the slate ID, the materialized operations, and a report. Open the board again. Its saved note count stays the same. A committed edit is a separate request with its own idempotency key.

[Open your slate](https://app.slatebox.com/new) · [Personal tokens and authentication](../Developers/SlateboxAPI/readme.md#authentication)
