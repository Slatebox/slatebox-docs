---
title: Decide what a reviewer needs before a backfill
description: Give a reviewer a choice when the row counts differ, and leave the next engineer a map of what to check.
group: Integrations
agentPrompt: >-
  Help me create a private Slatebox decision map for reviewing a database backfill.
  Use exec scripts. Create the map with slatebox.slates.create, using the exact three-step route in this guide as the brief,
  and keep one idempotencyKey for that run. In one script, read the map and add an add_map_branch operation for Repair missing rows
  after Compare row counts, with the arrival instruction “reconcile the missing IDs and run the comparison again.”
  Run it with mode preview and show me both choices. When I approve, run the same script in save mode with a fresh idempotencyKey.
  If the map changes first, run it again so it reads the new revision. Give me the editor URL
  and read back the two destinations and the repair instruction from the saved map.
  Help me open the walkthrough with Repair missing rows: preview a set_presentation_order operation using
  every current station, moving the repair scene to the front. Show me the sequence and save only when I confirm.
  If I ask to invite a reviewer, ask which role they need, create the invitation with slatebox.slates.issueInvite,
  show me the confirmation reason, and give me the URL and its invite ID once I agree.
---

A backfill copies customer records into a new table. The reviewer needs to know what to do if a comparison comes up short. Put that decision on a slate the next engineer can reopen.

## Draw the expected path

[Open the three steps in a private slate](https://app.slatebox.com/new#play=1&brief=Backfill%20review%20%E2%86%92%20Compare%20row%20counts%20%E2%86%92%20Approve%20cutover). If you work from a terminal, use the same three steps as the brief. Slatebox uses the arrows you supply to connect the stations. [Install the package](../Developers/SlateboxAPI/terminal-and-agents.md#install-the-package)

```sh
create_key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox exec --idempotency-key "$create_key" --intent "Create the backfill review map" \
  -e 'const map = await slatebox.slates.create({ brief: "Backfill review → Compare row counts → Approve cutover" }); return { url: map.url, shareId: map.shareId }'
```

## Give the reviewer a second choice

Open the map. Send this in the side conversation.

> After Compare row counts, add Repair missing rows. On arrival, reconcile the missing IDs and run the comparison again.

Look at the branch on the canvas, then choose **Keep changes** to save the path and its instruction together. You can also make this edit from a [terminal or connected agent](../Developers/SlateboxAPI/terminal-and-agents.md#add-a-path-and-an-arrival-instruction).

Move **Team** onto **Compare row counts**. Both **Approve cutover** and **Repair missing rows** are now available. Drag the token onto **Repair missing rows** or choose that destination by keyboard. The map shows the reconciliation instruction.

## Open the review with the risk

The person deciding whether to approve the cutover wants to see the recovery plan first. In the side conversation, send this message.

> Present Repair missing rows first

Read the numbered sequence and choose **Keep changes**. Choose **Present together** to open on the repair instruction. Use **Next station** to explain how the team reached that decision. **End presentation** returns you to the same map. The token stays where you placed it, and **Compare row counts** still offers both routes. [Set the same scene order from your terminal](../Developers/SlateboxAPI/terminal-and-agents.md#choose-the-opening-scene)

## Hand off the decision

As the owner, choose **Share → Create edit link** or ask your connected agent to create an unlisted edit link for this map. Give that URL to the engineer reviewing the migration. [Create or withdraw a reviewer’s link](../Developers/SlateboxAPI/terminal-and-agents.md#invite-a-reviewer) Ask them to follow the path for a missing record and read the instruction back. The slate records the decision and the check your team chose. Your database tools supply the actual comparison. [Share a slate and present the decision](../Using-Slatebox/readme.md)
