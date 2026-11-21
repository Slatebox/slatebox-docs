---
title: A self-hosted Slatebox has no meters
description: On your own server there are no free amounts, no top-ups and no limits from Slatebox. AI and calls use your own provider and Daily account.
---

# A self-hosted Slatebox has no meters

A Slatebox you run yourself has no free amounts, no top-ups and no limits from us. Nobody on your server sees a balance or a count of drafts.

- **AI** uses the provider you set up for the server, in `selfHosted.workshopProvider`: a key, or a model server on your own network. Your provider bills you, or nobody does.
- **Calls** use your own Daily account, with the Daily key in your server settings. A free Daily account includes 10,000 participant-minutes a month.

## If you want limits

An operator who wants limits can turn on the same meter that Slatebox Cloud uses. Set `metering.enabled` to `true` in the server settings; that switch is the only setting. The free amounts start at the Cloud's amounts, and an admin changes the monthly budget and the hold on video paid from a top-up in **Admin → Free budget**. Own keys need `SLATEBOX_KEY_ENCRYPTION_KEY` in the environment, and top-ups need your own Stripe keys. Leave the switch out, and the server has no meters.

[Install with Docker](install-with-docker.md) · [Pricing on Slatebox Cloud](../Using-Slatebox/pricing.md)
