# Decide what happens when an agent hits its budget

## Agent prompt

```text
Help my team decide what our agent should do when a job hits its spend cap. Use the two lines under Draw the two policies as a diagram brief in Create slate, or in an exec script that calls slatebox.slates.create with kind diagram. If using exec, keep one idempotencyKey for the run and its retries. Check that both paths start at the same note and that the diagram has five notes and four arrows. Give me the private editor URL and ask who should own the decision to resume a job.

Read https://docs.slatebox.com/Examples/agent-spend-cap.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/agent-spend-cap.md.
```

A job hits its spending limit halfway through a customer import. Should it stop at once, or save a checkpoint first? Who may resume it? Draw both answers on one slate and hand the decision to on-call.

## Draw the two policies

Open the prepared diagram, or paste these two lines as a diagram brief. The shared first step becomes one note with two arrows.

```text
Job reaches spend cap → Stop now → Notify on-call
Job reaches spend cap → Save checkpoint → Ask owner to resume
```

[Open the spend-cap diagram in Slatebox](https://app.slatebox.com/new#brief=Job%20reaches%20spend%20cap%20%E2%86%92%20Stop%20now%20%E2%86%92%20Notify%20on-call%0AJob%20reaches%20spend%20cap%20%E2%86%92%20Save%20checkpoint%20%E2%86%92%20Ask%20owner%20to%20resume)

## Hand it to the job owner

1. Open **Share** and invite the engineer who owns the job.
2. They double-click **Ask owner to resume**, type the role that makes that call, and press Enter.
3. Follow both paths together and agree what on-call does at the next interrupted import.

[Work with a team](../Using-Slatebox/readme.md#work-with-a-team)

## Create it from code

This exec script draws the same diagram. Save it as `spend-cap.js` (or `spend-cap.ts`, and use that name below).

<!-- tabs -->

```js JavaScript
const created = await slatebox.slates.create({
  kind: "diagram",
  brief: "Job reaches spend cap → Stop now → Notify on-call\nJob reaches spend cap → Save checkpoint → Ask owner to resume",
})
const { diagram } = created
return { url: created.url, notes: diagram.nodes.length, arrows: diagram.connections.length }
```

```ts TypeScript
const created = await slatebox.slates.create({
  kind: "diagram",
  brief: "Job reaches spend cap → Stop now → Notify on-call\nJob reaches spend cap → Save checkpoint → Ask owner to resume",
})
const { diagram } = created as { diagram: DiagramSummary }
return { url: created.url, notes: diagram.nodes.length, arrows: diagram.connections.length }
```

<!-- /tabs -->

Run it once with a new idempotency key. To retry after a failure, send the same key: the run replays and returns the same slate instead of a second one.

<!-- tabs -->

```js Node.js
import { readFile } from "node:fs/promises"

const base = process.env.SLATEBOX_BASE_URL ?? "https://app.slatebox.com"
const response = await fetch(`${base}/api/v1/exec`, {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    intent: "Draw the spend-cap policies",
    code: await readFile("spend-cap.js", "utf8"),
    idempotencyKey: crypto.randomUUID(),
  }),
})
console.log(await response.json())
```

```python Python
import os, uuid, requests

base = os.environ.get("SLATEBOX_BASE_URL", "https://app.slatebox.com")
with open("spend-cap.js") as f:
    code = f.read()
response = requests.post(
    f"{base}/api/v1/exec",
    headers={"Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}"},
    json={"intent": "Draw the spend-cap policies", "code": code, "idempotencyKey": str(uuid.uuid4())},
)
print(response.json())
```

```sh curl
jq -n --rawfile code spend-cap.js --arg key "$(uuidgen)" \
  '{intent: "Draw the spend-cap policies", code: $code, idempotencyKey: $key}' |
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data @- "${SLATEBOX_BASE_URL:-https://app.slatebox.com}/api/v1/exec"
```

```sh CLI
key=$(uuidgen)
npx --no-install slatebox exec spend-cap.js --intent "Draw the spend-cap policies" --idempotency-key "$key"
```

<!-- /tabs -->

You get the private editor URL, 5 notes and 4 arrows. The HTTP result wraps it as `result`, next to `status` and `idempotencyKey`. The slate records the policy; your job runner still enforces the limit. [Install the package](../Developers/SlateboxAPI/terminal-and-agents.md#install-the-package)
