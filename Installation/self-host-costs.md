---
title: Who pays for what on your own server
description: A Slatebox you run yourself is free. Its AI is whatever you and your people connect, and calls use your own Daily account. Slatebox Pro and balances exist only on Slatebox Cloud.
agentPrompt: >-
  Help me understand who pays for what on a Slatebox I run myself.
  Ask which AI I want, local or cloud, or none, and whether I want audio and video calls; show me where each one is set.
---

# Who pays for what on your own server

A Slatebox you run yourself is free. Slatebox charges nothing for it and sets no limits on it. Its AI and calls run on accounts you connect, so their providers bill you directly.

| | Paid by |
| --- | --- |
| The app, the relay and the database | Nobody. They run in your one container. |
| AI | Whatever you and your people connect, local or cloud, or none. The provider bills you directly, or nobody does for a model you run. The server's AI is set with `SLATEBOX_AI_URL` or `SLATEBOX_AI_CONFIG` (the app's `settings.ai`); people add their own in **Profile → AI**. [Choose your AI](../Using-Slatebox/choose-your-ai.md) |
| Calls | Your own Daily account, with its key in `SLATEBOX_SETTINGS`, such as `{"daily":{"apiKey":"your-daily-key"}}`. Daily bills you directly: [Daily's pricing](https://www.daily.co/pricing/). |
| Single sign-on | Nobody. Keycloak is in the image and needs no license. |
| Outside-agent connections | An on-prem license from Slatebox, a flat yearly fee per install. [Contact us](https://slatebox.com/contact/?topic=on-prem) |

Slatebox Pro and balances exist only on Slatebox Cloud. Nobody on your own server needs Slatebox Pro or sees a draft count.

## Keep people's keys readable

People's own AI keys are encrypted with `SLATEBOX_KEY_ENCRYPTION_KEY` (32 random bytes, base64). Add it with `-e SLATEBOX_KEY_ENCRYPTION_KEY=…`<!-- feature:self-host -->, as in [Options](install-with-docker.md#options)<!-- /feature:self-host -->, and keep it with your backups.

<!-- feature:self-host -->[Install with Docker](install-with-docker.md)<!-- /feature:self-host --><!-- feature:!self-host -->[Run your own Slatebox](self-hosting.md)<!-- /feature:!self-host --> · [Use your own keys](../Using-Slatebox/own-keys.md)
