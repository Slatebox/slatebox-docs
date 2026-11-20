---
title: Decide what happens when an agent hits its budget
description: Put two recovery policies on one whiteboard and give your on-call engineer a decision to review.
group: Canvas
agentPrompt: >-
  Help my team decide what our agent should do when a job hits its spend cap.
  Use the two lines under Draw the alternatives as a single diagram brief in Create slate, or in an exec script that calls slatebox.slates.create with kind diagram.
  If using exec, keep one idempotencyKey for the run and its retries.
  Check that both paths start at the same note and that the diagram contains five notes and four arrows.
  Give me the private editor URL and ask who should own the decision to resume a job.
---

A job reaches its spending limit halfway through a customer import. Engineering needs to decide whether to stop at once or let the job save a checkpoint. Support needs to know who can resume it. A reader raised this trade-off in the Maritime launch discussion. [Hacker News discussion](https://news.ycombinator.com/item?id=50554975)

## Draw the alternatives

Open the prepared diagram or paste the following two lines as a diagram brief. The repeated first step becomes one note with two outgoing arrows.

```text
Job reaches spend cap → Stop now → Notify on-call
Job reaches spend cap → Save checkpoint → Ask owner to resume
```

[Open the spend-cap diagram in Slatebox](https://app.slatebox.com/new#brief=Job%20reaches%20spend%20cap%20%E2%86%92%20Stop%20now%20%E2%86%92%20Notify%20on-call%0AJob%20reaches%20spend%20cap%20%E2%86%92%20Save%20checkpoint%20%E2%86%92%20Ask%20owner%20to%20resume)

## Make the handoff specific

Open **Share** and invite the engineer who owns the job. Have them double-click **Ask owner to resume** and replace it with the name of the role that actually makes that call. Press Enter to save. Follow the two paths together and decide what the on-call engineer should do during the next interrupted import. [Share and present a slate](../Using-Slatebox/readme.md#work-with-a-team)

## Create it from a terminal or an agent

An exec script uses the same drawing model. Keep the line break inside the brief.

```js
const created = await slatebox.slates.create({
  kind: "diagram",
  brief: "Job reaches spend cap → Stop now → Notify on-call\nJob reaches spend cap → Save checkpoint → Ask owner to resume",
})
return { url: created.url, notes: created.diagram.nodes.length, arrows: created.diagram.connections.length }
```

Save it as `spend-cap.js` and run it once with a key you keep for retries.

```sh
key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox exec spend-cap.js --idempotency-key "$key"
```

The result includes the private canvas URL and the five connected notes. A teammate can open that URL after receiving access. The drawing records the policy your team chooses. Your job runner enforces the spending limit. [Install the package and give your agent exec](../Developers/SlateboxAPI/terminal-and-agents.md#install-the-package)
