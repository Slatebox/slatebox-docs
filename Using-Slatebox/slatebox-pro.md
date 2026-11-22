---
title: Slatebox Pro
description: Slatebox Pro is $5 a month or $50 a year for one person. It includes Pro credits for the AI and calls Slatebox pays for. Cancel any time.
---

# Slatebox Pro

Slatebox Pro is an optional personal subscription on Slatebox Cloud: $5 a month or $50 a year (two months free), plus tax where it applies. It includes Pro credits each month for the AI and calls Slatebox pays for. Everything else in Slatebox is free, with or without Pro, and your own keys are always free. [Pricing](pricing.md)

## What Pro credits include

| | Each month |
| --- | --- |
| AI drafting | 30 drafts a day |
| Voice calls you start | About 10 hours of four-person calls a month |
| Video calls you start | About 2 hours of four-person video a month |

Image search and image generation use the month's AI, not the daily count. [How we count](pricing.md#how-we-count)

- Pro credits are for the calendar month (UTC) and start again on the 1st.
- Unused Pro credits do not carry over. They have no cash value, cannot be moved to another account and end when Pro ends.
- Pro is for one account. A team does not buy it for its members; each person chooses. A team admin can still top up a team balance that members draw on. [Top-ups and refunds](top-ups.md)
- When Pro credits run out, your own keys still work, and your balance pays if you have one.

## Get Pro

<!-- feature:!pro-checkout -->
Slatebox Pro goes on sale in your profile on the date we email to every account, at least 30 days ahead. Until then, the amounts above are free for every signed-in person, and there is nothing to buy.

<!-- /feature:!pro-checkout -->
<!-- feature:pro-checkout -->
1. Confirm your email address, if you have not yet.
2. Open your profile and choose **Credits**.
3. Under **Slatebox Pro**, choose monthly or yearly and pay by card.

Pro credits are ready as soon as the payment goes through.
<!-- /feature:pro-checkout -->

## Change or cancel

Manage Pro in **Credits**, under **Slatebox Pro**.

- **Cancel any time.** Pro stays on until the end of the month or year you paid for, then stops. You can resume it before then.
- **Monthly to yearly** takes effect at once, with credit for the unused part of the month.
- **Yearly to monthly** takes effect at the end of the year.
- Pro renews automatically until you cancel. We email you before a yearly renewal.
- We change the price only with at least 30 days' notice, and the new price applies from your next renewal.

## When a payment fails

- If a payment fails, Pro credits pause until it is paid. Update your card in **Credits**. Your own keys and your balance still work.
- If it stays unpaid after the card is retried, Pro ends.
- While a payment is disputed with your bank, Pro credits pause.

## Refunds and deleting your account

- Fees for the current month or year are not refunded. If we seriously break the terms and do not fix it within 30 days of your notice, or if we stop offering Pro or Slatebox Cloud, we refund the unused part of the period you paid for, pro rata. If you are a consumer, the rights the law where you live gives you also apply. [Terms of service](https://slatebox.com/terms/)
- Deleting your account ends Pro at once, without a refund of the current period. Your unused top-up balance is refunded first; then Pro ends and the account is removed. If the refund cannot be made, nothing changes: Pro stays on and nothing is removed.

## Agents

An agent can read whether you have Pro and what is left this month, with the `get_account` tool or `GET /api/v1/me` (`ai.pro` and `ai.included`). Only you can buy or change Pro, in your profile; no token can.
