---
title: Move a refund decision from a terminal
description: Ask who can approve a refund, give the team two paths, and move its token with one exec script from a terminal or an agent.
group: Integrations
agentPrompt: >-
  Help me map who can approve a customer refund. Run an exec script that calls slatebox.slates.create with my question, and keep one
  idempotencyKey for the run and its retries. Give me its editor URL and the words to type to add two approval paths in the side conversation.
  Then, in one exec script, read the saved map, show me where the team token can move, and preview my choice with mode preview.
  When I ask you to save it, run the same script in save mode. Show me the decision in the reopened map.
---

## Give the team two paths

Ask your connected agent, “Create a private Slatebox decision map called Who can approve a customer refund? Give me its editor link.” Open that link as the account that issued the token. You can also [start directly in the browser](https://app.slatebox.com/new#play=1&brief=Who%20can%20approve%20a%20customer%20refund%3F). In the map’s side conversation, type **Ask finance or ask the account owner**. Choose **Keep changes**. Those are now two stations on your team's map. Copy the ID following `/canvas/` from the address bar.

## Preview the finance path

[Install the Slatebox package](../Developers/SlateboxAPI/terminal-and-agents.md#install-the-package) and load your token into `SLATEBOX_API_TOKEN`. Save this script as `refund-move.js`, with the map ID in place of `your-share-id`. It reads the map, finds the team's token and the **Ask finance** station by name, and moves the token against the revision it just read. If the move is not allowed, it lists the stations the token can reach.

```js
const shareId = "your-share-id"
const { summary } = await slatebox.slates.get({ shareId })
const map = summary.workshop
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

```sh
npx --no-install slatebox exec refund-move.js --preview
```

The result shows the token at its proposed station, with `mode` set to `preview`. The token is still at the starting station in the browser. If two cards or stations share a name, use their IDs from `summary.workshop` instead of the labels.

## Save the choice and show a colleague

Inspect the proposed destination. To save that move, run the same script without `--preview`. Generate a key once and keep it for retries of this move.

```sh
move_key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox exec refund-move.js --idempotency-key "$move_key"
```

Reopen the same private map. Look for **Team · Ask finance**. A colleague with a read invitation can open the map and present the decision. If a teammate changes the map after you read it, the save fails with `slate_changed`. Run the script again: it reads the current paths before it moves the token.

An agent runs the same script with one `exec` call, first with `mode: "preview"`, then in save mode when you agree. The HTTP API accepts the same plan at `POST /api/v1/slates/{shareId}/operations`. [Exec, HTTP and the CLI side by side](../Developers/SlateboxAPI/terminal-and-agents.md#run-the-same-edit-over-http)
