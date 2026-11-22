# Edit a shared slate from a terminal or an agent

## Agent prompt

```text
Help me install the Slatebox package from the checksummed archive in this guide and connect my agent through exec. Call describe first to learn the client. Ask whether I want to open an existing board, draw a flow, or build a playable decision map. For a drawing use kind diagram; for a playable map use kind map. Create it once, keep the same exec idempotencyKey on retries, and give me the editor URL. For an existing slate, read it in the same script before changing it. For a playable map, read its stations and legal destinations, then run the change with mode preview and show me the branch, arrival instruction, token move or presentation order it would save. Save only when I ask, with the same code and the same idempotencyKey. If the result says confirmation_required, show me the reasons and confirm only when I agree. Read back the saved edit and give me the canvas URL. Use my configured token without asking me to paste it into chat.

Read https://docs.slatebox.com/Developers/SlateboxAPI/terminal-and-agents.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/SlateboxAPI/terminal-and-agents.md.
```

Run a short script against your slates from a terminal, or let an agent do it. The terminal has `slatebox exec` and `slatebox describe`; an agent gets the `exec` and `describe` tools. Every call in a script is checked as if you made it yourself. [How exec works](exec.md)

## Connect to your board

1. In **Profile → Developer access**, create a token with the permissions you need. [Developer access](https://app.slatebox.com/profile)
2. Load it from your secret manager into `SLATEBOX_API_TOKEN`.
3. Set `SLATEBOX_BASE_URL` to your Slatebox origin: `https://app.slatebox.com` for Slatebox Cloud, or your own instance's HTTPS origin.

| Permission | Scope | Default |
| --- | --- | --- |
| **Read slates** | `slates:read` | On |
| **Create and edit slates** | `slates:write` | On |
| **Manage invitation links on slates I own** | `slates:share` | Off |

## Install the package

Use Node.js 22.13 or later. Download the package and its checksum into your project, verify it, and install both executables (`slatebox-mcp` and `slatebox`):

<!-- tabs -->

```sh Shell
download=https://docs.slatebox.com/assets/downloads
package=slatebox-mcp-0.3.0.tgz
curl -fsSLO "$download/$package"
curl -fsSLO "$download/$package.sha256"
shasum -a 256 -c "$package.sha256" && npm install "./$package"
npx --no-install slatebox help
```

<!-- /tabs -->

On Linux, `sha256sum -c` also verifies the checksum. If your agent cannot reach the downloads host, use `https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/assets/downloads` instead.

## Give your agent exec

Point your MCP client's stdio server at the installed executable, with its absolute path:

<!-- tabs -->

```json JSON
{
  "mcpServers": {
    "slatebox": {
      "command": "/absolute/path/to/project/node_modules/.bin/slatebox-mcp",
      "env": {
        "SLATEBOX_API_TOKEN": "${SLATEBOX_API_TOKEN}",
        "SLATEBOX_BASE_URL": "${SLATEBOX_BASE_URL:-https://app.slatebox.com}"
      }
    }
  }
}
```

<!-- /tabs -->

Scripts then run on your machine with your rights, so your client's approval prompt for `exec` is your check. To run scripts on your instance instead, with nothing installed, connect to its `/mcp` endpoint. [Connect an agent](exec.md#connect-an-agent)

The agent gets two tools. `describe` lists every client method with the scope it needs, and returns their types. `exec` runs a script with `intent`, `code` and optionally `mode: "preview"`, `confirm` and `idempotencyKey`.

## Run a script

Save a script to a file, such as `add-question.js`, then run it. Each example below runs it the same way:

| Tab | Where the script runs |
| --- | --- |
| Node.js, Python, curl | In your instance's sealed runner, through `POST /api/v1/exec` |
| CLI | On your machine, through the package |

The Node.js and Python tabs are a small helper: save it once as `exec.mjs` or `exec.py`, then run `node exec.mjs add-question.js --preview` or `python3 exec.py add-question.js --preview`. The curl and CLI tabs preview the same file directly.

<!-- tabs -->

```js Node.js
// exec.mjs — node exec.mjs FILE [--preview] [--key KEY] [--confirm ID] [--intent TEXT]
import { readFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'

const { values: opts, positionals: [file] } = parseArgs({
  allowPositionals: true,
  options: { preview: { type: 'boolean' }, key: { type: 'string' }, confirm: { type: 'string' }, intent: { type: 'string' } },
})
const res = await fetch(`${process.env.SLATEBOX_BASE_URL}/api/v1/exec`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    intent: opts.intent ?? `Run ${file}`,
    code: await readFile(file, 'utf8'),
    mode: opts.preview ? 'preview' : 'save',
    idempotencyKey: opts.key ?? crypto.randomUUID(),
    confirm: opts.confirm,
  }),
})
console.log(JSON.stringify(await res.json(), null, 2))
```

```python Python
# exec.py — python3 exec.py FILE [--preview] [--key KEY] [--confirm ID] [--intent TEXT]
import argparse, json, os, uuid
import requests

p = argparse.ArgumentParser()
p.add_argument("file")
p.add_argument("--preview", action="store_true")
p.add_argument("--key", default=str(uuid.uuid4()))
p.add_argument("--confirm")
p.add_argument("--intent")
args = p.parse_args()

body = {
    "intent": args.intent or f"Run {args.file}",
    "code": open(args.file, encoding="utf-8").read(),
    "mode": "preview" if args.preview else "save",
    "idempotencyKey": args.key,
}
if args.confirm:
    body["confirm"] = args.confirm
res = requests.post(
    f"{os.environ['SLATEBOX_BASE_URL']}/api/v1/exec",
    headers={"Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}"},
    json=body,
)
print(json.dumps(res.json(), indent=2))
```

```sh curl
# Needs jq to put the script into the JSON body.
jq -n --rawfile code add-question.js --arg key "$(uuidgen)" \
  '{intent: "Run add-question.js", code: $code, mode: "preview", idempotencyKey: $key}' |
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H 'Content-Type: application/json' \
  --data @- "$SLATEBOX_BASE_URL/api/v1/exec"
```

```sh CLI
npx --no-install slatebox exec add-question.js --preview
```

<!-- /tabs -->

You get the run's `status`, the script's returned `result`, its `logs` and each call it made. Then:

- **Preview first.** A preview run saves nothing.
- **Keep the key.** Rerun with the same key to retry: writes that already saved replay instead of repeating.
- **Confirm when held.** If `status` is `confirmation_required`, read `confirmation.reasons`. To go ahead, rerun the same file with `--confirm` set to `confirmation.id` and `--key` set to the result's `idempotencyKey` (the CLI asks instead). [Saves that wait for confirmation](exec.md#saves-that-wait-for-confirmation)

## Run a script from the terminal

`slatebox exec` takes a file, `-` for standard input, or `-e` with one line. It prints the returned value as JSON on standard output and a one-line summary of the calls on standard error.

<!-- tabs -->

```sh CLI
npx --no-install slatebox exec add-question.js --preview
npx --no-install slatebox exec - --intent "Add the retention question" < add-question.js
npx --no-install slatebox exec -e 'return (await slatebox.slates.get({ shareId: "your-share-id" })).nodeCount'
npx --no-install slatebox describe invite
```

<!-- /tabs -->

| Option | Effect |
| --- | --- |
| `--preview` | Preview every write and save nothing |
| `--intent TEXT` | The sentence recorded with the run. The default is `slatebox exec FILE` |
| `--idempotency-key KEY` | Reuse it to retry the same script: saved writes replay |
| `--confirm ID` | Confirm a held save |
| `--remote` | Run the script in the instance's sealed runner (`POST /api/v1/exec`), not on your machine |
| `--json` | Print the full result: status, result, logs, each call, any confirmation and usage |
| `--base-url ORIGIN` | Use this origin instead of `SLATEBOX_BASE_URL` |

When a save is held, the CLI prints the reasons. In a terminal it asks `Save anyway? [y/N]`. With no terminal, or a script read from standard input, it prints the exact command that confirms and exits with code 6.

| Exit code | Meaning |
| --- | --- |
| 0 | The script completed |
| 1 | Any other failure |
| 2 | The command line was not understood |
| 3 | The token was refused (401) before the script ran, as `--remote` can be |
| 4 | Access was refused (403 or 404) before the script ran, as `--remote` can be |
| 5 | The run was refused (409 or 422) before the script ran, as `--remote` can be |
| 6 | A save is waiting for confirmation |
| 7 | The script failed, including when a call in it was refused (such as 401 for the token or 404 for a slate); the error names the call, line and column |

## Create a diagram from source material

Draw who can still reach support during a call-service outage, from the public `call-status` source. Save the script as `call-status.js`:

<!-- tabs -->

```js JavaScript
const created = await slatebox.slates.create({
  kind: "diagram",
  source: "call-status",
  brief: "What should support tell someone starting a new call during the outage?",
})
return { url: created.url, notes: created.diagram.nodes.length, arrows: created.diagram.connections.length }
```

```ts TypeScript
const created = await slatebox.slates.create({
  kind: "diagram",
  source: "call-status",
  brief: "What should support tell someone starting a new call during the outage?",
})
const diagram = created.diagram as DiagramSummary
return { url: created.url, notes: diagram.nodes.length, arrows: diagram.connections.length }
```

<!-- /tabs -->

Run it in save mode (creating a slate cannot be previewed), and keep the key for retries:

<!-- tabs -->

```sh Node.js
key=$(uuidgen)
node exec.mjs call-status.js --key "$key"
```

```sh Python
key=$(uuidgen)
python3 exec.py call-status.js --key "$key"
```

```sh curl
jq -n --rawfile code call-status.js --arg key "$(uuidgen)" \
  '{intent: "Draw the call-status paths", code: $code, idempotencyKey: $key}' |
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" -H 'Content-Type: application/json' \
  --data @- "$SLATEBOX_BASE_URL/api/v1/exec"
```

```sh CLI
key=$(uuidgen)
npx --no-install slatebox exec call-status.js --idempotency-key "$key"
```

<!-- /tabs -->

You get a private canvas with five notes and four arrows, and its `url`. A retry with the same key returns the original slate instead of a second one.

- **Your own flow.** Leave out `source` and pass steps such as `Request -> Review -> Release`. Each line can start a new path or a standalone note, up to 1,200 characters.
- **Other sources.** `interview-notes`, `sign-in-outage` and `friday-launch`.
- **Add to it.** With a source, the brief `New session → Offer a callback` reuses the **New session** note and draws an arrow to the new note.

[See the example drawing](https://slatebox.com/product/intelligence/) · [Draw two spend-cap policies](../../Examples/agent-spend-cap.md) · [HTTP request](slates.md#create-a-native-diagram)

## Create a private decision map

Put your team's question in the brief (up to 160 characters). Save as `refund-map.js`:

<!-- tabs -->

```js JavaScript
const map = await slatebox.slates.create({ brief: "Who can approve a customer refund?" })
return { url: map.url, shareId: map.shareId }
```

```ts TypeScript
const map = await slatebox.slates.create({ brief: "Who can approve a customer refund?" })
const result: { url: string; shareId: string } = { url: map.url, shareId: map.shareId }
return result
```

<!-- /tabs -->

<!-- tabs -->

```sh Node.js
node exec.mjs refund-map.js --key "$(uuidgen)" --intent "Create the refund decision map"
```

```sh Python
python3 exec.py refund-map.js --key "$(uuidgen)" --intent "Create the refund decision map"
```

```sh curl
jq -n --rawfile code refund-map.js --arg key "$(uuidgen)" \
  '{intent: "Create the refund decision map", code: $code, idempotencyKey: $key}' |
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" -H 'Content-Type: application/json' \
  --data @- "$SLATEBOX_BASE_URL/api/v1/exec"
```

```sh CLI
npx --no-install slatebox exec refund-map.js --idempotency-key "$(uuidgen)" --intent "Create the refund decision map"
```

<!-- /tabs -->

Open the returned `url` while signed in to the token's account. In the side conversation, type **Ask finance or ask the account owner**, then choose **Keep changes**: both paths land on the map. [Move the team token and present the decision](../../Examples/refund-approval.md)

## Add a path and an arrival instruction

Give the reviewer a recovery path on the backfill map. The script finds the station by its label and adds the branch with its instruction in one plan. Save it as `repair-branch.js`, with your share ID:

<!-- tabs -->

```js JavaScript
const shareId = "your-share-id"
const { workshop: map } = await slatebox.slates.get({ shareId })
const compare = map.lanes.find(lane => lane.label === "Compare row counts")
const result = await slatebox.slates.applyOperations({
  shareId,
  plan: {
    message: "Give the reviewer a recovery path",
    operations: [{
      kind: "add_map_branch",
      fromStationId: compare.id,
      label: "Repair missing rows",
      outcome: "reconcile the missing IDs and run the comparison again.",
      expectedRevision: map.revision,
    }],
  },
})
return { mode: result.mode, added: result.report.addedBranches, revision: result.workshop.revision }
```

```ts TypeScript
const shareId = "your-share-id"
const { workshop: map } = await slatebox.slates.get({ shareId })
if (!map) throw new Error("This slate is not a decision map")
const compare = map.lanes.find(lane => lane.label === "Compare row counts")!
const result = await slatebox.slates.applyOperations({
  shareId,
  plan: {
    message: "Give the reviewer a recovery path",
    operations: [{
      kind: "add_map_branch",
      fromStationId: compare.id,
      label: "Repair missing rows",
      outcome: "reconcile the missing IDs and run the comparison again.",
      expectedRevision: map.revision,
    }],
  },
})
return { mode: result.mode, added: result.report.addedBranches, revision: result.workshop?.revision }
```

<!-- /tabs -->

Preview, then save with a key you keep for retries:

<!-- tabs -->

```sh Node.js
node exec.mjs repair-branch.js --preview
node exec.mjs repair-branch.js --key "$(uuidgen)"
```

```sh Python
python3 exec.py repair-branch.js --preview
python3 exec.py repair-branch.js --key "$(uuidgen)"
```

```sh curl
jq -n --rawfile code repair-branch.js --arg key "$(uuidgen)" \
  '{intent: "Add the repair branch", code: $code, idempotencyKey: $key}' |
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" -H 'Content-Type: application/json' \
  --data @- "$SLATEBOX_BASE_URL/api/v1/exec"
```

```sh CLI
npx --no-install slatebox exec repair-branch.js --preview
npx --no-install slatebox exec repair-branch.js --idempotency-key "$(uuidgen)"
```

<!-- /tabs -->

The saved result lists the new station in `report.addedBranches`. To change only its instruction, send one `update_map_outcome` operation with `stationId`, `outcome` and `expectedRevision`. If someone saves first, the script fails with `slate_changed`: run it again to read the new revision.

## Choose the opening scene

Open the backfill review with the recovery instruction. The plan names every scene once, by ID, in the new order. Save as `opening-scene.js`:

<!-- tabs -->

```js JavaScript
const shareId = "your-share-id"
const { workshop: map } = await slatebox.slates.get({ shareId })
const repair = map.lanes.find(lane => lane.label === "Repair missing rows")
const order = [repair.id, ...map.presentationOrder.filter(id => id !== repair.id)]
const result = await slatebox.slates.applyOperations({
  shareId,
  plan: {
    message: "Open the review with the repair instruction",
    operations: [{ kind: "set_presentation_order", laneIds: order, expectedRevision: map.revision }],
  },
})
return { mode: result.mode, order: result.report.presentationOrder }
```

```ts TypeScript
const shareId = "your-share-id"
const { workshop: map } = await slatebox.slates.get({ shareId })
if (!map) throw new Error("This slate is not a decision map")
const repair = map.lanes.find(lane => lane.label === "Repair missing rows")!
const order: string[] = [repair.id, ...map.presentationOrder.filter(id => id !== repair.id)]
const result = await slatebox.slates.applyOperations({
  shareId,
  plan: {
    message: "Open the review with the repair instruction",
    operations: [{ kind: "set_presentation_order", laneIds: order, expectedRevision: map.revision }],
  },
})
return { mode: result.mode, order: result.report.presentationOrder }
```

<!-- /tabs -->

<!-- tabs -->

```sh Node.js
node exec.mjs opening-scene.js --preview
node exec.mjs opening-scene.js --key "$(uuidgen)"
```

```sh Python
python3 exec.py opening-scene.js --preview
python3 exec.py opening-scene.js --key "$(uuidgen)"
```

```sh curl
jq -n --rawfile code opening-scene.js --arg key "$(uuidgen)" \
  '{intent: "Open the review with the repair instruction", code: $code, idempotencyKey: $key}' |
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" -H 'Content-Type: application/json' \
  --data @- "$SLATEBOX_BASE_URL/api/v1/exec"
```

```sh CLI
npx --no-install slatebox exec opening-scene.js --preview
npx --no-install slatebox exec opening-scene.js --idempotency-key "$(uuidgen)"
```

<!-- /tabs -->

Read `order` in the preview, then save. On the saved slate, choose **Presentation options → Present to everyone here**; your reviewer follows through their read link. A published walkthrough gets the new order when its owner publishes again. [Run the team walkthrough](../../Examples/review-a-backfill.md#open-the-review-with-the-risk)

## Invite a reviewer

Invitations need a token with **Manage invitation links on slates I own** (`slates:share`); without it the call fails with `403 insufficient_scope`, and the owner can still use **Share** in the canvas. An invitation makes a private slate unlisted: anyone with the URL gets its role (`read`, `comment` or `edit`). Save as `invite.js`:

<!-- tabs -->

```js JavaScript
return await slatebox.slates.issueInvite({ shareId: "your-share-id", role: "edit" })
```

```ts TypeScript
const invite = await slatebox.slates.issueInvite({ shareId: "your-share-id", role: "edit" })
return invite
```

<!-- /tabs -->

<!-- tabs -->

```sh Node.js
node exec.mjs invite.js --intent "Invite an editor to the backfill review"
```

```sh Python
python3 exec.py invite.js --intent "Invite an editor to the backfill review"
```

```sh curl
jq -n --rawfile code invite.js --arg key "$(uuidgen)" \
  '{intent: "Invite an editor to the backfill review", code: $code, idempotencyKey: $key}' |
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" -H 'Content-Type: application/json' \
  --data @- "$SLATEBOX_BASE_URL/api/v1/exec"
```

```sh CLI
npx --no-install slatebox exec invite.js --intent "Invite an editor to the backfill review"
```

<!-- /tabs -->

Granting access waits for you: the CLI asks `Save anyway? [y/N]`, and the other tabs return `confirmation_required` for you to confirm. You get the invitation `url` for the reviewer and an `inviteId` for your records. Issuing a different role changes the slate's single unlisted link for everyone using it.

When the review ends, withdraw the link with the `inviteId` you kept. Withdrawing also waits for confirmation, and the slate becomes private again; private team grants still apply.

<!-- tabs -->

```js JavaScript
return await slatebox.slates.revokeInvite({ shareId: "your-share-id", inviteId: "your-invite-id" })
```

```ts TypeScript
const revoked = await slatebox.slates.revokeInvite({ shareId: "your-share-id", inviteId: "your-invite-id" })
return revoked
```

<!-- /tabs -->

[HTTP examples](slates.md#manage-an-invitation-link)

## Add a question to a whiteboard

Copy the ID after `/canvas/` in the URL of a whiteboard you can edit. Save this as `add-question.js`:

<!-- tabs -->

```js JavaScript
const shareId = "your-share-id"
const { revision } = await slatebox.slates.get({ shareId })
const result = await slatebox.slates.applyOperations({
  shareId,
  expectedRevision: revision,
  userMessage: "Add a question for the architecture review",
  plan: {
    message: "Add a question for the architecture review",
    operations: [
      { kind: "add_nodes", count: 1, shape: "rectangle", text: "Who owns deletion of the retained copy?" },
    ],
  },
})
return { mode: result.mode, operations: result.operations, report: result.report }
```

```ts TypeScript
const shareId: string = "your-share-id"
const { revision } = await slatebox.slates.get({ shareId })
const result = await slatebox.slates.applyOperations({
  shareId,
  expectedRevision: revision,
  userMessage: "Add a question for the architecture review",
  plan: {
    message: "Add a question for the architecture review",
    operations: [
      { kind: "add_nodes", count: 1, shape: "rectangle", text: "Who owns deletion of the retained copy?" },
    ],
  },
})
return { mode: result.mode, operations: result.operations, report: result.report }
```

<!-- /tabs -->

Preview it, then save with a key you keep for retries:

<!-- tabs -->

```sh Node.js
node exec.mjs add-question.js --preview
node exec.mjs add-question.js --key "$(uuidgen)"
```

```sh Python
python3 exec.py add-question.js --preview
python3 exec.py add-question.js --key "$(uuidgen)"
```

```sh curl
jq -n --rawfile code add-question.js --arg key "$(uuidgen)" \
  '{intent: "Add the retention question", code: $code, idempotencyKey: $key}' |
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" -H 'Content-Type: application/json' \
  --data @- "$SLATEBOX_BASE_URL/api/v1/exec"
```

```sh CLI
npx --no-install slatebox exec add-question.js --preview
npx --no-install slatebox exec add-question.js --idempotency-key "$(uuidgen)"
```

<!-- /tabs -->

The preview returns the operations it would save and their report; the board does not change. After saving, reopen the whiteboard and find "Who owns deletion of the retained copy?". Teammates need access to the private board to see it.

To try an agent, give it the board ID and say: "Read my slate, find the note about the retained copy, and show me the change that assigns it to the data team." It reads the note and previews the edit in one `exec` call.

## Run the same edit over HTTP

| Action | In an exec script | HTTP request |
| --- | --- | --- |
| Read the board | `slatebox.slates.get({ shareId, include: "full" })` | `GET /api/v1/slates/{shareId}`, optionally `?include=full` |
| Preview the question | `applyOperations({ shareId, plan, mode: "preview" })`, or the whole run in preview | `POST /api/v1/slates/{shareId}/operations` with `mode: "preview"` |
| Save the question | The same call without `mode`, in a run with an `idempotencyKey` | The same plan with an `Idempotency-Key` header |
| Run a whole script on the instance | `slatebox exec FILE --remote` | `POST /api/v1/exec` with `intent` and `code` |

`npx --no-install slatebox describe` lists the client methods. Each instance serves its operations at `/api/v1/openapi.json`. [Every request, step by step](slates.md) · [Editor, exec and HTTP side by side](readme.md#work-on-the-same-decision-map)
