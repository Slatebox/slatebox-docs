# Move a refund decision from a terminal

## Agent prompt

```text
Help me map who can approve a customer refund. Run an exec script that calls slatebox.slates.create with my question, and keep one idempotencyKey for the run and its retries. Give me its editor URL and the words to type to add two approval paths in the side conversation. Then, in one exec script, read the saved map, show me where the team token can move, and preview my choice with mode preview. When I ask you to save it, run the same script in save mode. Show me the decision in the reopened map.

Read https://docs.slatebox.com/Examples/refund-approval.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/refund-approval.md.
```

Map who can approve a customer refund, then move the team's token to a decision with one exec script. Preview the move first; save it when you agree.

## Give the team two paths

1. Ask your connected agent: “Create a private Slatebox decision map called Who can approve a customer refund? Give me its editor link.” Or [start it in the browser](https://app.slatebox.com/new#play=1&brief=Who%20can%20approve%20a%20customer%20refund%3F).
2. Open the link as the account that owns the token.
3. In the side conversation, type **Ask finance or ask the account owner** and choose **Keep changes**. The map now has two stations.
4. Copy the ID after `/canvas/` in the address bar.

## Preview the finance path

[Install the Slatebox package](../Developers/SlateboxAPI/terminal-and-agents.md#install-the-package) and load your token into `SLATEBOX_API_TOKEN`.

This script reads the map, finds the **Team** token and the **Ask finance** station by name, and moves the token against the revision it read. If the rules refuse the move, it returns the stations the token can reach. Save it as `refund-move.js` and put your map ID in place of `your-share-id`.

<!-- tabs -->

```js JavaScript
const shareId = "your-share-id"
const { workshop: map } = await slatebox.slates.get({ shareId })
if (!map) throw new Error("This slate has no decision map")
const team = map.cards.find(card => card.label === "Team")
const finance = map.lanes.find(lane => lane.label === "Ask finance")
try {
  const result = await slatebox.slates.applyOperations({
    shareId,
    plan: {
      message: "Move Team to Ask finance",
      operations: [{ kind: "move_workshop_card", cardId: team.id, laneId: finance.id, expectedRevision: map.revision }],
    },
  })
  return { mode: result.mode, team: result.workshop.cards.find(card => card.id === team.id) }
} catch (error) {
  if (error.code !== "move_refused") throw error
  return { refused: error.message, canReach: team.legalLaneIds.map(id => map.lanes.find(lane => lane.id === id).label) }
}
```

```ts TypeScript
const shareId = "your-share-id"
const { workshop: map } = await slatebox.slates.get({ shareId })
if (!map) throw new Error("This slate has no decision map")
const team = map.cards.find(card => card.label === "Team")!
const finance = map.lanes.find(lane => lane.label === "Ask finance")!
try {
  const result = await slatebox.slates.applyOperations({
    shareId,
    plan: {
      message: "Move Team to Ask finance",
      operations: [{ kind: "move_workshop_card", cardId: team.id, laneId: finance.id, expectedRevision: map.revision }],
    },
  })
  return { mode: result.mode, team: result.workshop?.cards.find(card => card.id === team.id) }
} catch (error) {
  if ((error as SlateboxError).code !== "move_refused") throw error
  return { refused: (error as Error).message, canReach: team.legalLaneIds.map(id => map.lanes.find(lane => lane.id === id)!.label) }
}
```

<!-- /tabs -->

Run it in preview mode.

<!-- tabs -->

```js Node.js
import { readFile } from "node:fs/promises"

const base = process.env.SLATEBOX_BASE_URL ?? "https://app.slatebox.com"
const response = await fetch(`${base}/api/v1/exec`, {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    intent: "Move Team to Ask finance",
    code: await readFile("refund-move.js", "utf8"),
    mode: "preview",
  }),
})
console.log(await response.json())
```

```python Python
import os, requests

base = os.environ.get("SLATEBOX_BASE_URL", "https://app.slatebox.com")
with open("refund-move.js") as f:
    code = f.read()
response = requests.post(
    f"{base}/api/v1/exec",
    headers={"Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}"},
    json={"intent": "Move Team to Ask finance", "code": code, "mode": "preview"},
)
print(response.json())
```

```sh curl
jq -n --rawfile code refund-move.js \
  '{intent: "Move Team to Ask finance", code: $code, mode: "preview"}' |
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data @- "${SLATEBOX_BASE_URL:-https://app.slatebox.com}/api/v1/exec"
```

```sh CLI
npx --no-install slatebox exec refund-move.js --intent "Move Team to Ask finance" --preview
```

<!-- /tabs -->

The result shows the token at **Ask finance** with `mode: "preview"`. In the browser it has not moved. If two cards or stations share a name, use their IDs from `workshop` instead of the labels.

## Save the choice and show a colleague

1. Run the same request without preview mode, and with a new idempotency key: drop `mode` and add `idempotencyKey` (HTTP), or swap `--preview` for `--idempotency-key "$(uuidgen)"` (CLI). Reuse that key if you retry.
2. Reopen the map. It shows **Team · Ask finance**.
3. Share it. A colleague with a read invitation can open the map and present the decision.

If a teammate changes the map after your script reads it, the save fails with `slate_changed`. Run the script again: it reads the current map first.

An agent runs the same script with one `exec` call. The HTTP API also accepts the plan directly at `POST /api/v1/slates/{shareId}/operations`. [Exec, HTTP and the CLI side by side](../Developers/SlateboxAPI/terminal-and-agents.md#run-the-same-edit-over-http)
