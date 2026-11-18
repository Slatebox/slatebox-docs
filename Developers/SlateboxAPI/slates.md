# Read and edit a slate

## Create a private decision map

Load a personal token with `slates:write` into `SLATEBOX_TOKEN`. Generate one key for the intended board and keep it until you have the response.

```sh
create_key=$(uuidgen)
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_TOKEN" \
  -H "Idempotency-Key: $create_key" \
  -H 'Content-Type: application/json' \
  --data '{"brief":"Who can approve a customer refund?"}' \
  https://api.slatebox.com/v1/slates
```

HTTP 201 returns the new board's `shareId`, editor `url` and `workshop` summary. The board is private to the token owner. Open the editor to give the team alternative paths through the side conversation. A retry with the same token, key and brief returns HTTP 200 and the original board. Reusing the key for another brief returns HTTP 409.

## /v1/slates endpoint

Use a personal token and a slate you control. The following shell examples use the same two environment variables. Run them in a single session. [Set up a token](readme.md#authentication)

```sh
: "${SLATEBOX_SHARE_ID:?Set this to the ID in your canvas URL}"
: "${SLATEBOX_TOKEN:?Load your personal token from your secret manager}"
slate_url="https://api.slatebox.com/v1/slates/$SLATEBOX_SHARE_ID"
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_TOKEN" "$slate_url"
```

## Manage an invitation link

Create a token with **Manage invitation links on slates I own**. Use the owner’s `shareId` in `slate_url`. To let a teammate contribute, create an unlisted edit link. Use `read` for a viewer or `comment` for a reviewer who needs to leave feedback.

```sh
invite_key=$(uuidgen)
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_TOKEN" \
  -H "Idempotency-Key: $invite_key" \
  -H 'Content-Type: application/json' \
  --data '{"role":"edit"}' "$slate_url/invite"
```

The returned `url` opens the slate with the chosen role. The `inviteId` identifies this invitation for revocation. The board has one active unlisted link, so changing its role also changes what existing holders can do. If the board is public, manage its visibility in the app.

To close access through this link, set `SLATEBOX_INVITE_ID` to the returned ID. Use a new idempotency key for revocation. A retry of either request uses its original key.

```sh
revoke_key=$(uuidgen)
curl --fail-with-body --silent --show-error -X DELETE \
  -H "Authorization: Bearer $SLATEBOX_TOKEN" \
  -H "Idempotency-Key: $revoke_key" \
  "$slate_url/invite/$SLATEBOX_INVITE_ID"
```

After revocation the original invitation URL stops granting access. The board is private again, with any private team-member permissions applying. [Use the shell or MCP](terminal-and-agents.md#invite-a-reviewer)

## Response

A successful read returns JSON with `shareId` and `summary`. Append `?include=full` to receive a `slate` field with the full document. Treat the response as private board data.

## Preview one change

This request previews a triangle on the existing slate. The JSON boolean `true` keeps the change out of the saved document. Previewing still requires edit permission.

```sh
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"dryRun":true,"userMessage":"Add a triangle","plan":{"message":"Add one triangle","operations":[{"kind":"add_nodes","count":1,"shape":"triangle"}]}}' \
  "$slate_url/operations"
```

The preview returns HTTP 200 and includes `ok`, `dryRun`, `shareId`, `message`, materialized `operations` and a `report`. Inspect the report before applying a plan.

## Apply the change

This request **writes to the slate**. Use it on an editable test board first. Generate an idempotency key once per intended mutation, and keep the same key when retrying that exact request. Keys are scoped to the token, so use a new key for a different slate or edit.

```sh
request_id=$(uuidgen)
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_TOKEN" \
  -H "Idempotency-Key: $request_id" \
  -H 'Content-Type: application/json' \
  --data '{"dryRun":false,"userMessage":"Add a triangle","plan":{"message":"Add one triangle","operations":[{"kind":"add_nodes","count":1,"shape":"triangle"}]}}' \
  "$slate_url/operations"
```

A new write returns HTTP 201. A replay of a recorded key returns the prior result with HTTP 200. Re-read the board to see the saved edit.

| HTTP status | What to check |
| --- | --- |
| 400 | Inspect `error.message` for an invalid operation plan. |
| 401 | Confirm that the bearer token is current and has the required scope. |
| 403 or 404 | Check the share ID and the account's permission on that slate. |
| 409 | Another save changed the slate. Read it again and preview against its current state. |
| 429 | Pause before retrying requests for this token. |
