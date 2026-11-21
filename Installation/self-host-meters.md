---
title: A self-hosted Slatebox has no meters
description: On your own server there are no free amounts, no top-ups and no limits from Slatebox. AI and calls use your own provider and Daily account.
---

# A self-hosted Slatebox has no meters

A Slatebox you run yourself has no free amounts, no top-ups and no limits from us. Nobody sees a balance or a draft count.

| | Paid by |
| --- | --- |
| AI | The provider you set with `SLATEBOX_AI_KEY` or `SLATEBOX_AI_URL` (the server's `selfHosted.workshopProvider`): a key, or a model server on your network. |
| Calls | Your own Daily account, with its key in `SLATEBOX_SETTINGS`. A free Daily account includes 10,000 participant-minutes a month. |

## Turn on limits

To limit use, turn on the same meter Slatebox Cloud uses: set `metering.enabled` to `true` in the server settings, for example `SLATEBOX_SETTINGS='{"metering":{"enabled":true}}'`. It is the only setting.

- The free amounts start at the Cloud's. An admin changes the monthly budget and the hold on top-up video in **Admin → Free budget**.
- Top-ups need your own Stripe keys.
- Own keys need `SLATEBOX_KEY_ENCRYPTION_KEY` (32 random bytes, base64) in the app's environment. The Docker image does not accept that variable, so a metered server in the image runs without own keys.

[Install with Docker](install-with-docker.md) · [Pricing on Slatebox Cloud](../Using-Slatebox/pricing.md)
