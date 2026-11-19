# Decide what a reviewer needs before a backfill

## Agent prompt

```text
Help me create a private Slatebox decision map for reviewing a database backfill. Use the exact three-step route in this guide as the brief for create_slate. Keep one idempotency key for creation. Use add_map_branch to preview Repair missing rows after Compare row counts, with the arrival instruction “reconcile the missing IDs and run the comparison again.” Show me both choices. When I approve, save against the preview revision with a fresh key for this edit. If the map changes first, read it again and show me a fresh preview. Give me the editor URL and read back the two destinations and the repair instruction from the saved map. Help me open the walkthrough with Repair missing rows. Preview set_presentation_order using every current station in the saved order, moving the repair scene to the front. Show me the sequence. Save only when I confirm, with the preview revision and a separate idempotency key. If I ask to invite a reviewer, ask which role they need, create the invitation and give me the URL and its invite ID.

Read https://docs.slatebox.com/Examples/review-a-backfill.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/review-a-backfill.md.
```

A backfill copies customer records into a new table. The reviewer needs to know what to do if a comparison comes up short. Put that decision on a slate the next engineer can reopen.

## Draw the expected path

[Open the three steps in a private slate](https://app.slatebox.com/new#play=1&brief=Backfill%20review%20%E2%86%92%20Compare%20row%20counts%20%E2%86%92%20Approve%20cutover). If you work from a terminal, use the same three steps as the brief. Slatebox uses the arrows you supply to connect the stations. [Install the CLI](../Developers/SlateboxAPI/terminal-and-agents.md#install-the-tools)

```sh
create_key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox create "Backfill review → Compare row counts → Approve cutover" \
  --idempotency-key "$create_key"
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
