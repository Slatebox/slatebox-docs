---
title: Slatebox Pro
description: Slatebox Pro is $5 a month or $50 a year for one person, plus tax where applicable. It includes Pro credits for the AI and calls Slatebox pays for. Cancel any time.
---

# Slatebox Pro

Slatebox Pro is an optional personal subscription on Slatebox Cloud: $5 a month or $50 a year (two months free), plus tax where applicable. It includes Pro credits each month for the AI and calls Slatebox pays for, worth about $3.75 of what the AI provider and Daily charge us. When they run out, top up. Everything else in Slatebox is free, with or without Pro. On Slatebox Cloud, nobody brings their own AI or call key: own keys are for self-hosted Slatebox. [Pricing](pricing.md)

## What Pro credits include

| | Each month |
| --- | --- |
| AI drafting | About 180 drafts a month, up to 30 a day |
| Voice calls you start | About 5½ hours of four-person calls a month (1,380 participant-minutes) |
| Video calls you start | About 1 hour of four-person video a month (330 participant-minutes) |

Each row is its own amount for the month: what you do not use of one does not add to another.

Image search and image generation use the month's AI, not the daily count. [How we count](pricing.md#how-we-count)

- Pro credits are for the calendar month (UTC) and start again on the 1st. In the month you start Pro, and the month it ends, you get the share of that month's Pro credits for the days Pro covers.
- Unused Pro credits do not carry over. They have no cash value, cannot be moved to another account and end when Pro ends.
- Pro is for one account; each person chooses. A team that wants to pay for its members' AI and calls can choose [Slatebox Business](slatebox-business.md). A team admin can also top up a team balance that members draw on. [Top-ups and refunds](top-ups.md)
- When Pro credits run out, your balance pays if you have one. Otherwise, top up.

## Get Pro

<!-- feature:!pro-checkout -->
Slatebox Pro is not on sale in your profile yet. Meanwhile a top-up pays for AI and calls.

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
- We change the price, or what Pro credits include, only with at least 30 days' notice, and a new price applies from your next renewal.

## When a payment fails

- If a payment fails, Pro credits pause until it is paid. Update your card in **Credits**. Your balance still works.
- If it stays unpaid after the card is retried, Pro ends.
- While a payment is disputed with your bank, Pro credits pause.

## Refunds and deleting your account

- Fees for the current month or year are not refunded. If we seriously break the terms and do not fix it within 30 days of your notice, or if we stop offering Pro or Slatebox Cloud, we refund the unused part of the period you paid for, pro rata. If you are a consumer, the rights the law where you live gives you also apply. [Terms of service](https://slatebox.com/terms/)
- Deleting your account ends Pro at once, without a refund of the current period. Your unused top-up balance is refunded first; then Pro ends and the account is removed. If the refund cannot be made, nothing changes: Pro stays on and nothing is removed.

## Agents

An agent can read whether you have Pro and what is left this month, with the `get_account` tool or `GET /api/v1/me` (`ai.pro` and `ai.included`). Only you can buy or change Pro, in your profile; no token can.
