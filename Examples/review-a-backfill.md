# Decide what a reviewer needs before a backfill

## Agent prompt

```text
Help me create a private Slatebox decision map for reviewing a database backfill. Use exec scripts. Create the map with slatebox.slates.create, using the exact three-step route in this guide as the brief, and keep one idempotencyKey for that run. In one script, read the map and add an add_map_branch operation for Repair missing rows after Compare row counts, with the arrival instruction “reconcile the missing IDs and run the comparison again.” Run it with mode preview and show me both choices. When I approve, run the same script in save mode with a fresh idempotencyKey. If the map changes first, run it again so it reads the new revision. Give me the editor URL and read back the two destinations and the repair instruction from the saved map. Help me open the walkthrough with Repair missing rows: preview a set_presentation_order operation using every current station, moving the repair scene to the front. Show me the sequence and save only when I confirm. If I ask to invite a reviewer, ask which role they need, create the invitation with slatebox.slates.issueInvite, show me the confirmation reason, and give me the URL and its invite ID once I agree.

Read https://docs.slatebox.com/Examples/review-a-backfill.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/review-a-backfill.md.
```

A backfill copies customer records into a new table. If the row counts differ, the reviewer needs to know what to do. Put that decision on a map the next engineer can reopen.

## Draw the expected path

[Open the three steps in a private slate](https://app.slatebox.com/new#play=1&brief=Backfill%20review%20%E2%86%92%20Compare%20row%20counts%20%E2%86%92%20Approve%20cutover), or create the same map from code. The arrows in the brief connect the stations.

<!-- tabs -->

```js Node.js
const base = process.env.SLATEBOX_BASE_URL ?? "https://app.slatebox.com"
const response = await fetch(`${base}/api/v1/slates`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}`,
    "Content-Type": "application/json",
    "Idempotency-Key": crypto.randomUUID(),
  },
  body: JSON.stringify({ brief: "Backfill review → Compare row counts → Approve cutover" }),
})
const { url, shareId } = await response.json()
console.log({ url, shareId })
```

```python Python
import os, uuid, requests

base = os.environ.get("SLATEBOX_BASE_URL", "https://app.slatebox.com")
response = requests.post(
    f"{base}/api/v1/slates",
    headers={"Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}", "Idempotency-Key": str(uuid.uuid4())},
    json={"brief": "Backfill review → Compare row counts → Approve cutover"},
)
created = response.json()
print({"url": created["url"], "shareId": created["shareId"]})
```

```sh curl
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  --data '{"brief": "Backfill review → Compare row counts → Approve cutover"}' \
  "${SLATEBOX_BASE_URL:-https://app.slatebox.com}/api/v1/slates" | jq '{url, shareId}'
```

```sh CLI
npx --no-install slatebox exec --idempotency-key "$(uuidgen)" --intent "Create the backfill review map" \
  -e 'const map = await slatebox.slates.create({ brief: "Backfill review → Compare row counts → Approve cutover" }); return { url: map.url, shareId: map.shareId }'
```

<!-- /tabs -->

You get the private editor `url` and the `shareId`. To retry a failed request, send the same idempotency key so you get the same map, not a second one. [Install the package](../Developers/SlateboxAPI/terminal-and-agents.md#install-the-package)

## Give the reviewer a second choice

1. Open the map and send this in the side conversation:

   > After Compare row counts, add Repair missing rows. On arrival, reconcile the missing IDs and run the comparison again.

2. Check the new branch on the canvas, then choose **Keep changes**. The path and its instruction save together.
3. Move **Team** onto **Compare row counts**. Both **Approve cutover** and **Repair missing rows** are now open.
4. Drag the token onto **Repair missing rows**, or pick it with the keyboard. The map shows the reconciliation instruction.

[Make the same edit from a terminal or an agent](../Developers/SlateboxAPI/terminal-and-agents.md#add-a-path-and-an-arrival-instruction)

## Open the review with the risk

The person approving the cutover wants to see the recovery plan first.

1. Send `Present Repair missing rows first` in the side conversation.
2. Check the numbered sequence and choose **Keep changes**.
3. Choose **Presentation options → Present to everyone here**. Everyone on the slate follows. The presentation opens on **Repair missing rows**; **Next** walks through the rest.
4. **End presentation** returns everyone to the map. The token stays where you put it, and **Compare row counts** still offers both routes.

[Set the scene order from your terminal](../Developers/SlateboxAPI/terminal-and-agents.md#choose-the-opening-scene)

## Hand off the decision

Choose **Share → Create edit link**, or ask your connected agent to create an unlisted edit link. Send it to the engineer reviewing the backfill and ask them to follow the path for a missing record. The map records the decision; your database tools run the comparison.

[Create or withdraw a reviewer’s link](../Developers/SlateboxAPI/terminal-and-agents.md#invite-a-reviewer) · [Share and present a slate](../Using-Slatebox/readme.md#work-with-a-team)
