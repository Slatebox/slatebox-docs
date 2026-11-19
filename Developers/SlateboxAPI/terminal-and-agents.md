---
agentPrompt: >-
  Help me install the Slatebox shell and MCP tools from the checksummed package in this guide.
  Ask whether I want to open an existing board or create a private decision map from my question.
  For a new map, create it once, reuse the same key on retries, and give me the editor URL.
  For an existing whiteboard, ask which note I want to add.
  For a note edit, read the board, preview my edit, and show me the result. When I ask to save it, reuse one
  idempotency key if you retry. Read the note back and show me where to find it on the whiteboard.
  Use my configured token without asking me to paste it into chat.
---

# Edit a shared slate from a terminal or an agent

Suppose two engineers are reviewing what happens to a customer's uploaded file. One engineer can add the next question from a terminal. The other can open the same private whiteboard, see the question and answer it beside the drawing.

## Connect to your board

In **Profile → Developer access**, choose the token permissions you need. **Read slates** and **Create and edit slates** are selected by default. To issue or withdraw invitation links for your own boards, also select **Manage invitation links on slates I own** (`slates:share`). Load it from your secret manager into the environment variable `SLATEBOX_API_TOKEN`. An MCP client can pass that variable to its child process through its secret settings. For a self-hosted board, also set `SLATEBOX_BASE_URL` to the HTTPS origin of your Slatebox instance. [Developer access](https://app.slatebox.com/profile)

## Install the tools

Use Node.js 20 or later. Download the package and its checksum into the project where you want to use them. The following commands verify the archive and install both executables locally.

```sh
download=https://docs.slatebox.com/assets/downloads
package=slatebox-mcp-0.2.4.tgz
curl -fsSLO "$download/$package"
curl -fsSLO "$download/$package.sha256"
shasum -a 256 -c "$package.sha256" && npm install "./$package"
npx --no-install slatebox --help
```

On Linux, `sha256sum -c` can also verify the checksum. If the downloads host is unavailable to your agent, use `https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/assets/downloads` for the download directory. For an MCP client, point its stdio server at the installed executable. Replace the example path with the absolute path on your machine and pass the token through your client's secret settings.

```json
{
  "mcpServers": {
    "slatebox": {
      "command": "/absolute/path/to/project/node_modules/.bin/slatebox-mcp"
    }
  }
}
```

[Download the tools](https://docs.slatebox.com/assets/downloads/slatebox-mcp-0.2.4.tgz) · [SHA-256 checksum](https://docs.slatebox.com/assets/downloads/slatebox-mcp-0.2.4.tgz.sha256)

## Create a private decision map

Put the question your team needs to answer in the brief. This command creates a real slate in the account that issued the token. Generate a key once for this map and keep it for retries.

```sh
create_key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox create "Who can approve a customer refund?" \
  --idempotency-key "$create_key"
```

Open the returned `url` while signed in to that account. In the side conversation, type **Ask finance or ask the account owner**, then choose **Keep changes** to put both paths on the map. To start the same way from an MCP client, call `create_slate` with `brief` and `idempotency_key`. [Move the team token and present the decision](../../Examples/refund-approval.md)

## Add a path and an arrival instruction

On the backfill map, an editor can give the reviewer a recovery path. Use the share ID from creation. A station can be identified by its exact unique label or its ID. This command previews the change.

```sh
npx --no-install slatebox branch "$SLATEBOX_SHARE_ID" "Compare row counts" "Repair missing rows" \
  --outcome "reconcile the missing IDs and run the comparison again."
```

Read `workshop.revision` from the preview. For a new map at revision 0, save that proposal with the following command. Keep its key for retries.

```sh
branch_key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox branch "$SLATEBOX_SHARE_ID" "Compare row counts" "Repair missing rows" \
  --outcome "reconcile the missing IDs and run the comparison again." \
  --apply --revision 0 --idempotency-key "$branch_key"
```

The result includes the new station ID in `report.addedBranches`. To change just its instruction, preview `slatebox outcome "$SLATEBOX_SHARE_ID" "Repair missing rows" "Compare the repaired IDs with the source table."` and save against its preview revision with a fresh key. If someone saves first, read the slate and review a new preview.

In MCP, call `add_map_branch` with `share_id`, `from_station`, `label` and `outcome`. To revise an instruction, call `update_map_outcome` with `share_id`, `station` and `outcome`. Both tools preview by default. To save, supply `dry_run: false`, `expected_revision` and `idempotency_key`. Use a token with read and write scopes and a board you can edit. [Try the backfill map](../../Examples/review-a-backfill.md)

## Invite a reviewer

On your own instance, read `/api/v1/openapi.json` and look for `/slates/{shareId}/invite`. If that path is missing, the owner can issue the link from **Share** in the canvas or upgrade the instance before using these agent tools.

Use the `shareId` from creation or the owner’s canvas URL. An invitation turns a private slate into an unlisted slate. Anyone with the invitation URL can use its role. Choose `read` for someone reviewing a decision, `comment` for feedback, or `edit` for someone making changes on the board.

```sh
invite_key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox share "$SLATEBOX_SHARE_ID" --role edit --idempotency-key "$invite_key"
```

Give the reviewer the returned `url` and keep the `inviteId` for your records. Issuing a different role updates the board’s single unlisted link for everyone using it. To do the same from an MCP client, call `create_slate_invite` with `share_id`, `role` and `idempotency_key`.

When the review ends, set `SLATEBOX_INVITE_ID` to the returned ID and withdraw that invitation. Use a fresh key for this action and reuse it if you retry.

```sh
revoke_key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox unshare "$SLATEBOX_SHARE_ID" --invite-id "$SLATEBOX_INVITE_ID" --idempotency-key "$revoke_key"
```

The MCP equivalent is `revoke_slate_invite` with `share_id`, `invite_id` and `idempotency_key`. The board returns to private. People with separate private team grants can still use their assigned access. [HTTP examples](slates.md#manage-an-invitation-link)

## Preview a question

On an ordinary whiteboard you can edit, copy the ID following `/canvas/` in its URL and set `SLATEBOX_SHARE_ID` to that value. Read the board and save the following JSON as `retention-question.json`.

```json
{
  "message": "Add a question for the architecture review",
  "operations": [
    {"kind": "add_nodes", "count": 1, "shape": "rectangle", "text": "Who owns deletion of the retained copy?"}
  ]
}
```

```sh
npx --no-install slatebox read "$SLATEBOX_SHARE_ID"
npx --no-install slatebox preview "$SLATEBOX_SHARE_ID" retention-question.json
```

The preview returns the operation report. Read the slate again to check its saved note count before applying the change. A pipeline can pass the plan on standard input by supplying `-` in place of the filename.

## Save and reopen

Generate a key for this edit and keep it if you retry the same command. The service uses that key to recognize a request it already saved.

```sh
edit_key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox apply "$SLATEBOX_SHARE_ID" retention-question.json --idempotency-key "$edit_key"
npx --no-install slatebox read "$SLATEBOX_SHARE_ID" --full
```

Reopen the whiteboard in the browser. Find “Who owns deletion of the retained copy?” and edit the note to name the owner. Read the slate again from the terminal or ask your agent to read it. A teammate needs access to the private board to see your edit.

## Run the same edit through MCP or HTTP

| Action | MCP tool | HTTP request |
| --- | --- | --- |
| Read the board | `get_slate` with `share_id` and optional `include_full` | `GET /v1/slates/{shareId}` with optional `?include=full` |
| Preview the question | `apply_slate_operations` with `dry_run: true` | `POST /v1/slates/{shareId}/operations` with `dryRun: true` |
| Save the question | `apply_slate_operations` with `dry_run: false` and an `idempotency_key` | POST the same plan with `dryRun: false` and an `Idempotency-Key` header |

For `apply_slate_operations`, supply the board's `share_id`, the plan's `message` and `operations`, and a `user_message` describing your request. To try an agent with the saved board, tell it “Read my slate and find the note about the retained copy. Show me the change you would make to assign it to the data team.” Give it the board ID. It can read the note and preview the edit through MCP. On a playable map, the side conversation, CLI and MCP tools can add a branch with an arrival instruction. The `move_workshop_card` tool reads the same rules as the app and lets you preview or save a token’s move. [Move a refund decision from a terminal](../../Examples/refund-approval.md) A read-only collaborator can read the slate. Previewing or applying edits requires write scope and edit permission on that board. [HTTP request bodies, responses and retries](slates.md)
