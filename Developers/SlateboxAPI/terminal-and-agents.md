---
agentPrompt: >-
  Help me install the Slatebox package from the checksummed archive in this guide and connect my agent through exec.
  Call describe first to learn the client. Ask whether I want to open an existing board, draw a flow, or build a playable decision map.
  For a drawing use kind diagram; for a playable map use kind map. Create it once, keep the same exec idempotencyKey on retries, and give me the editor URL.
  For an existing slate, read it in the same script before changing it. For a playable map, read its stations and legal destinations,
  then run the change with mode preview and show me the branch, arrival instruction, token move or presentation order it would save.
  Save only when I ask, with the same code and the same idempotencyKey. If the result says confirmation_required, show me the reasons
  and confirm only when I agree. Read back the saved edit and give me the canvas URL.
  Use my configured token without asking me to paste it into chat.
---

# Edit a shared slate from a terminal or an agent

Suppose two engineers are reviewing what happens to a customer's uploaded file. One engineer can add the next question from a terminal. The other can open the same private whiteboard, see the question and answer it beside the drawing.

From a terminal or an agent, you work with Slatebox by running a short script against a typed client. An agent gets two tools, `exec` and `describe`. The terminal gets two commands, `slatebox exec` and `slatebox describe`. Every call in a script is checked as if you made it yourself. [How exec works, where scripts run and what is checked](exec.md)

## Connect to your board

In **Profile → Developer access**, choose the token permissions you need. **Read slates** and **Create and edit slates** are selected by default. To issue or withdraw invitation links for your own boards, also select **Manage invitation links on slates I own** (`slates:share`). Load the token from your secret manager into the environment variable `SLATEBOX_API_TOKEN`. An MCP client can pass that variable to its child process through its secret settings. Set `SLATEBOX_BASE_URL` to your Slatebox origin: `https://app.slatebox.com` for Slatebox Cloud, or the HTTPS origin of your own instance. [Developer access](https://app.slatebox.com/profile)

## Install the package

Use Node.js 22.13 or later. Download the package and its checksum into the project where you want to use them. The following commands verify the archive and install both executables, `slatebox-mcp` and `slatebox`, locally.

```sh
download=https://docs.slatebox.com/assets/downloads
package=slatebox-mcp-0.3.0.tgz
curl -fsSLO "$download/$package"
curl -fsSLO "$download/$package.sha256"
shasum -a 256 -c "$package.sha256" && npm install "./$package"
npx --no-install slatebox help
```

On Linux, `sha256sum -c` can also verify the checksum. If the downloads host is unavailable to your agent, use `https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/assets/downloads` for the download directory.

Version 0.3.0 replaces the earlier per-action tools and commands with `exec` and `describe`. An agent that used them now writes a script that calls the same actions through the client.

## Give your agent exec

Point your MCP client's stdio server at the installed executable. Replace the example path with the absolute path on your machine. Scripts then run on your machine, in the package's own process, with no sandbox: they have your rights there. Your client's approval prompt for `exec` is your check.

```json
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

The `${SLATEBOX_API_TOKEN}` form is how Claude Code reads the token and the origin from your environment; other clients have their own secret settings. To run scripts on your Slatebox instance instead, connect the client to the instance's `/mcp` endpoint with a bearer token. Nothing is installed locally then, and scripts run in the instance's sealed runner. [Connect an agent](exec.md#connect-an-agent)

The agent gets two tools. `describe` lists every method in the client with the scope it needs, and returns their full types. `exec` runs a script with `intent`, `code` and optionally `mode: "preview"`, `confirm` and `idempotencyKey`.

## Run a script from the terminal

Save a script to a file, pipe it on standard input with `-`, or pass a line with `-e`. Top-level `await` and `return` work. The returned value is printed as JSON on standard output, with a one-line summary of the calls on standard error.

```sh
npx --no-install slatebox exec add-question.js --preview
npx --no-install slatebox exec - --intent "Add the retention question" < add-question.js
npx --no-install slatebox exec -e 'return (await slatebox.slates.get({ shareId: "your-share-id" })).summary'
npx --no-install slatebox describe invite
```

| Option | Effect |
| --- | --- |
| `--preview` | Run the whole script in preview: every write is previewed and nothing is saved |
| `--intent TEXT` | The sentence recorded with the run. The default is `slatebox exec FILE` |
| `--idempotency-key KEY` | Reuse it to retry the same script: writes that already saved replay instead of repeating |
| `--confirm ID` | Confirm a held save (see [Saves that wait for confirmation](exec.md#saves-that-wait-for-confirmation)) |
| `--remote` | Send the script to `POST /api/v1/exec` so it runs in the instance's sealed runner, not on your machine |
| `--json` | Print the full result: status, result, logs, each call, any confirmation and usage |
| `--base-url ORIGIN` | Use this Slatebox origin instead of `SLATEBOX_BASE_URL` |

When a save is held for confirmation in a terminal, the CLI prints the reasons and asks `Save anyway? [y/N]`. Without a terminal, it prints the exact command that confirms and exits with code 6.

| Exit code | Meaning |
| --- | --- |
| 0 | The script completed |
| 1 | Any other failure |
| 2 | The command line was not understood |
| 3 | The run was refused before the script ran because the token was refused (401), as `--remote` can be |
| 4 | The run was refused before the script ran because access was refused (403 or 404), as `--remote` can be |
| 5 | The run was refused before the script ran (409 or 422), as `--remote` can be |
| 6 | A save is waiting for confirmation |
| 7 | The script failed, including when a call in it was refused (for example 401 for the token or 404 for a slate); the error names the call and has its line and column |

## Create a diagram from source material

Which customers can still talk to support during a call-service outage? Use the public call-status example to start with two paths. New sessions failed to start while existing sessions stayed connected. Save this script as `call-status.js`. It saves the five notes and four arrows to your own private canvas.

```js
const created = await slatebox.slates.create({
  kind: "diagram",
  source: "call-status",
  brief: "What should support tell someone starting a new call during the outage?",
})
return { url: created.url, notes: created.diagram.nodes.length, arrows: created.diagram.connections.length }
```

```sh
create_key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox exec call-status.js --idempotency-key "$create_key"
```

Open the returned `url` to edit a note, add your team’s fallback or present the drawing. `diagram.nodes` and `diagram.connections` describe what the script created. If the command fails part-way, run it again with the same key: the creation replays and returns the original slate instead of making a second one. Creating a slate cannot be previewed, so `--preview` refuses this script with `preview_unavailable`. Read the slate again to see later edits.

With a source selected, a question such as “Who owns the callback?” opens in the conversation beside the drawing. To put the fallback on the canvas immediately, use the brief `New session → Offer a callback`. Slatebox reuses the existing **New session** note and draws an arrow to the new note. Paste additional paths or evidence notes on separate lines.

To draw your own flow, leave out `source` and pass steps such as `Request -> Review -> Release` as the brief. Each new line can begin a separate path or a standalone note. A diagram brief accepts up to 1,200 characters. The other available public sources are `interview-notes`, `sign-in-outage` and `friday-launch`. [See the example drawing](https://slatebox.com/product/intelligence/) · [Draw two spend-cap policies from a brief](../../Examples/agent-spend-cap.md) · [HTTP request](slates.md#create-a-native-diagram)

## Create a private decision map

Put the question your team needs to answer in the brief. This creates a real slate in the account that issued the token. Generate a key once for this map and keep it for retries.

```sh
create_key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox exec --idempotency-key "$create_key" --intent "Create the refund decision map" \
  -e 'const map = await slatebox.slates.create({ brief: "Who can approve a customer refund?" }); return { url: map.url, shareId: map.shareId }'
```

Open the returned `url` while signed in to that account. In the side conversation, type **Ask finance or ask the account owner**, then choose **Keep changes** to put both paths on the map. An agent does the same with one `exec` call. [Move the team token and present the decision](../../Examples/refund-approval.md)

## Add a path and an arrival instruction

On the backfill map, an editor can give the reviewer a recovery path. This script reads the map, finds the station by its label and the current revision, and adds the branch with its instruction in one plan. Save it as `repair-branch.js` and replace the share ID with the one from creation.

```js
const shareId = "your-share-id"
const { summary } = await slatebox.slates.get({ shareId })
const map = summary.workshop
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

```sh
npx --no-install slatebox exec repair-branch.js --preview
branch_key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox exec repair-branch.js --idempotency-key "$branch_key"
```

The first command shows the branch without saving it. The second saves it. The result includes the new station in `report.addedBranches`. To change just its instruction, use one `update_map_outcome` operation with `stationId`, `outcome` and `expectedRevision`. If someone saves first, the script fails with `slate_changed`: run it again, and it reads the new revision.

## Choose the opening scene

On the backfill map, put the recovery instruction first for a reviewer. The plan names every scene once, by ID, in the new order.

```js
const shareId = "your-share-id"
const { summary } = await slatebox.slates.get({ shareId })
const map = summary.workshop
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

Run it with `--preview` first and read `order`. To commit the sequence you reviewed, run it again without `--preview`. Open **Present together** on the saved slate. Your reviewer can follow through their read link. A previously published walkthrough gets the new order when its owner republishes. [Run the team walkthrough](../../Examples/review-a-backfill.md#open-the-review-with-the-risk)

## Invite a reviewer

Run `npx --no-install slatebox describe invite` to see the two invitation methods and the scope they need, `slates:share`. A token without **Manage invitation links on slates I own** gets `403 insufficient_scope` from them; the owner can still issue the link from **Share** in the canvas.

An invitation turns a private slate into an unlisted slate. Anyone with the invitation URL can use its role. Choose `read` for someone reviewing a decision, `comment` for feedback, or `edit` for someone making changes on the board.

```sh
npx --no-install slatebox exec --intent "Invite an editor to the backfill review" \
  -e 'return await slatebox.slates.issueInvite({ shareId: "your-share-id", role: "edit" })'
```

Granting access is a save that waits for you. In a terminal the CLI shows the reason and asks `Save anyway? [y/N]`. Answer `y` to create the link. Give the reviewer the returned `url` and keep the `inviteId` for your records. Issuing a different role updates the board’s single unlisted link for everyone using it.

When the review ends, withdraw that invitation. Put the `inviteId` the invitation returned in place of the example ID. Withdrawing also waits for your confirmation.

```sh
npx --no-install slatebox exec --intent "Withdraw the backfill review link" \
  -e 'return await slatebox.slates.revokeInvite({ shareId: "your-share-id", inviteId: "0123456789abcdef0123456789abcdef" })'
```

The board returns to private. People with separate private team grants can still use their assigned access. [HTTP examples](slates.md#manage-an-invitation-link)

## Preview a question

On an ordinary whiteboard you can edit, copy the ID following `/canvas/` in its URL. Save the following script as `add-question.js` with that ID.

```js
const shareId = "your-share-id"
const result = await slatebox.slates.applyOperations({
  shareId,
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

```sh
npx --no-install slatebox exec add-question.js --preview
```

The preview returns the operations it would save and their report. Nothing on the board changes.

## Save and reopen

Generate a key for this edit and keep it if you retry the same command. Slatebox derives each write's key from it, so a retry recognizes a write it already saved.

```sh
edit_key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox exec add-question.js --idempotency-key "$edit_key"
```

Reopen the whiteboard in the browser. Find “Who owns deletion of the retained copy?” and edit the note to name the owner. Read the slate again from the terminal or ask your agent to read it. A teammate needs access to the private board to see your edit.

## Run the same edit over HTTP

| Action | In an exec script | HTTP request |
| --- | --- | --- |
| Read the board | `slatebox.slates.get({ shareId, include: "full" })` | `GET /api/v1/slates/{shareId}` with optional `?include=full` |
| Preview the question | `slatebox.slates.applyOperations({ shareId, plan, mode: "preview" })`, or the whole script with `--preview` | `POST /api/v1/slates/{shareId}/operations` with `mode: "preview"` |
| Save the question | The same call without `mode`, run with an `idempotencyKey` | POST the same plan with an `Idempotency-Key` header |
| Run a whole script on the instance | `slatebox exec FILE --remote` | `POST /api/v1/exec` with `intent` and `code` |

For creating, sharing or presenting a map, see the [editor, exec and HTTP table](readme.md#work-on-the-same-decision-map). `npx --no-install slatebox describe` lists the methods of the package you installed. A self-hosted instance older than the package answers a method it does not have yet with `404`.

To try an agent with the saved board, tell it “Read my slate and find the note about the retained copy. Show me the change you would make to assign it to the data team.” Give it the board ID. It reads the note and previews the edit in one `exec` call. On a playable map, the same script can add a branch with an arrival instruction or move a token, under the same rules as the app. [Move a refund decision from a terminal](../../Examples/refund-approval.md) A read-only collaborator can read the slate. Previewing or saving edits requires write scope and edit permission on that board.
