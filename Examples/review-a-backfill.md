---
title: Decide what a reviewer needs before a backfill
description: Give a reviewer a choice when the row counts differ, and leave the next engineer a map of what to check.
group: Integrations
agentPrompt: >-
  Help me create a private Slatebox decision map for reviewing a database backfill.
  Use the exact three-step route in this guide as the brief for create_slate. Keep one
  idempotency key for that request. Give me the editor link so I can add the repair path.
  Read the finished map and tell me which destinations follow Compare row counts.
  If I ask to invite a reviewer, ask which role they need, create the invitation and give me the URL and its invite ID.
---

A backfill copies customer records into a new table. The reviewer needs to know what to do if a comparison comes up short. Put that decision on a slate the next engineer can reopen.

## Draw the expected path

[Open the three steps in a private slate](https://app.slatebox.com/new/map#brief=Backfill%20review%20%E2%86%92%20Compare%20row%20counts%20%E2%86%92%20Approve%20cutover). If you work from a terminal, use the same three steps as the brief. Slatebox uses the arrows you supply to connect the stations. [Install the CLI](../Developers/SlateboxAPI/terminal-and-agents.md#install-the-tools)

```sh
create_key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox create "Backfill review → Compare row counts → Approve cutover" \
  --idempotency-key "$create_key"
```

## Give the reviewer a second choice

Open the map. Type **Add Repair missing rows after Compare row counts** in its side conversation. Choose **Keep changes**. Then type **At Repair missing rows, reconcile the missing IDs and run the comparison again** and keep the new outcome.

Move **Team** onto **Compare row counts**. Both **Approve cutover** and **Repair missing rows** are now available. Drag the token onto **Repair missing rows** or choose that destination by keyboard. The map shows the reconciliation instruction.

## Hand off the decision

As the owner, choose **Share → Create edit link** or ask your connected agent to create an unlisted edit link for this map. Give that URL to the engineer reviewing the migration. [Create or withdraw a reviewer’s link](../Developers/SlateboxAPI/terminal-and-agents.md#invite-a-reviewer) Ask them to follow the path for a missing record and read the instruction back. The slate records the decision and the check your team chose. Your database tools supply the actual comparison. [Share a slate and present the decision](../Using-Slatebox/readme.md)
