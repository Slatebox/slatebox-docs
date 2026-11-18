---
title: Move a refund decision from a terminal
description: Ask who can approve a refund, give the team two paths, and move its token from a shell or an MCP client.
group: Integrations
agentPrompt: >-
  Help me map who can approve a customer refund. Use create_slate with my question and one idempotency key to make a private Slatebox map.
  Give me its editor URL and the words to type to add two approval paths in the side conversation. Read the saved map through the CLI or MCP,
  show me where the team token can move, and preview my choice. When I ask you to save it,
  apply that one move with the revision you read and an idempotency key. Show me the decision
  in the reopened map.
---

## Give the team two paths

Ask your connected agent, “Create a private Slatebox decision map called Who can approve a customer refund? Give me its editor link.” Open that link as the account that issued the token. You can also [start directly in the browser](https://app.slatebox.com/new/map#brief=Who%20can%20approve%20a%20customer%20refund%3F). In the map’s side conversation, type **Ask finance or ask the account owner**. Choose **Keep changes**. Those are now two stations on your team's map. Copy the ID following `/canvas/` from the address bar.

## Preview the finance path

[Install the Slatebox tools](../Developers/SlateboxAPI/terminal-and-agents.md), load your token into `SLATEBOX_API_TOKEN`, and set `SLATEBOX_SHARE_ID` to the map ID. Preview moving the team's token to the station named **Ask finance**.

```sh
npx --no-install slatebox move "$SLATEBOX_SHARE_ID" Team "Ask finance" | tee refund-preview.json
```

The result identifies the token, its proposed destination and the revision you just reviewed. The token is still at the starting station in the browser. To see all available paths, run `npx --no-install slatebox read "$SLATEBOX_SHARE_ID"`. If two cards or stations share a name, use their IDs from that summary.

## Save the choice and show a colleague

Inspect the proposed source and destination. To save that move, generate a key once. Keep it for retries of this request.

```sh
revision=$(node -p "require('./refund-preview.json').operations[0].expectedRevision")
move_key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox move "$SLATEBOX_SHARE_ID" Team "Ask finance" \
  --apply --revision "$revision" --idempotency-key "$move_key"
npx --no-install slatebox read "$SLATEBOX_SHARE_ID"
```

Reopen the same private map. Look for **Team · Ask finance**. A colleague with a read invitation can open the map and present the decision. If a teammate changes the map after you read it, read it again and choose among the current paths before preparing a fresh move.

An MCP client can read the same choices with `get_slate`. Call `move_workshop_card` with `share_id`, `card_id`, `lane_id` and `expected_revision`. The tool previews by default. To save it, repeat the call with `dry_run: false` and an `idempotency_key`. The HTTP API accepts the plan at `POST /v1/slates/{shareId}/operations`. [MCP and HTTP request formats](../Developers/SlateboxAPI/terminal-and-agents.md#run-the-same-edit-through-mcp-or-http)
