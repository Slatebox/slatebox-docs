# Decide what happens when an agent hits its budget

## Agent prompt

```text
Help my team decide what our agent should do when a job hits its spend cap. Use the two lines under Draw the alternatives as a single diagram brief in Create slate or the create_slate MCP tool with kind diagram. If using the tool, keep one idempotency key for creation and retries. Check that both paths start at the same note and that the diagram contains five notes and four arrows. Give me the private editor URL and ask who should own the decision to resume a job.

Read https://docs.slatebox.com/Examples/agent-spend-cap.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/agent-spend-cap.md.
```

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

## Create it from a terminal

The CLI uses the same drawing model. Keep the line break inside the quoted brief.

```sh
key=$(node -p 'crypto.randomUUID()')
npx --no-install slatebox create "Job reaches spend cap → Stop now → Notify on-call
Job reaches spend cap → Save checkpoint → Ask owner to resume" --kind diagram --idempotency-key "$key"
```

The result includes the private canvas URL and the five connected notes. A teammate can open that URL after receiving access. The drawing records the policy your team chooses. Your job runner enforces the spending limit. [Install the CLI and MCP tools](../Developers/SlateboxAPI/terminal-and-agents.md#install-the-tools)
