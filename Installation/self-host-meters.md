---
title: A self-hosted Slatebox has no meters
description: On your own server there is no Slatebox Pro, no top-ups and no limits from Slatebox. AI is whatever you and your people connect; calls use your Daily account.
agentPrompt: >-
  Help me understand what a Slatebox I run myself pays for and how to turn on limits.
  Ask whether I want limits at all; if I do, show me the one setting and where an admin changes the budget.
---

# A self-hosted Slatebox has no meters

A Slatebox you run yourself has no Slatebox Pro, no top-ups and no limits from us. Nobody sees a balance or a draft count.

| | Paid by |
| --- | --- |
| AI | Whatever you and your people connect, local or cloud. The server's AI is set with `SLATEBOX_AI_URL` or `SLATEBOX_AI_CONFIG` (the app's `settings.ai`); people add their own in **Profile → AI**. [Choose your AI](../Using-Slatebox/choose-your-ai.md) |
| Calls | Your own Daily account, with its key in `SLATEBOX_SETTINGS`. A free Daily account includes 10,000 participant-minutes a month. |

## Turn on limits

To limit use, turn on the same meter Slatebox Cloud uses: set `metering.enabled` to `true` in the server settings, for example `SLATEBOX_SETTINGS='{"metering":{"enabled":true}}'`. It is the only setting.

- Every signed-in person with a confirmed email gets the amounts Slatebox Pro includes on the Cloud, at no cost; nobody needs Slatebox Pro. An admin changes the monthly budget and the hold on top-up video in **Admin → Budget and Pro**.
- Top-ups need your own Stripe keys.
- Own keys, for AI and calls, need `SLATEBOX_KEY_ENCRYPTION_KEY` (32 random bytes, base64). Add it with `-e SLATEBOX_KEY_ENCRYPTION_KEY=…`<!-- feature:self-host -->, as in [Options](install-with-docker.md#options)<!-- /feature:self-host -->.

<!-- feature:self-host -->[Install with Docker](install-with-docker.md)<!-- /feature:self-host --><!-- feature:!self-host -->[Run your own Slatebox](self-hosting.md)<!-- /feature:!self-host --> · [Pricing on Slatebox Cloud](../Using-Slatebox/pricing.md)
