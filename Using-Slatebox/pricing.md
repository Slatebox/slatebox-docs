---
title: Pricing
description: Slatebox is free, MIT-licensed and open source, except outside-agent connections. On Slatebox Cloud, AI and calls come with Slatebox Pro, or from a balance you top up. Teams can choose Slatebox Business.
---

# Pricing

Slatebox is free. It is MIT-licensed and open source, except outside-agent connections. Free for individuals and companies alike. [See pricing](https://slatebox.com/plans/)

The app's `enterprise/` folder, which holds the outside-agent connections, is under the Slatebox Enterprise License: you can read, change and test it, but not run it in production without an agreement. Slatebox Cloud runs it. A self-hosted Slatebox carries it switched off, and an on-prem license, a flat yearly fee per install, switches it on there. Everything else in the app, the SlateboxJS engine and the relay is MIT licensed. [Licenses](../Developers/readme.md#licenses)

## Free for everyone

On Slatebox Cloud, <!-- feature:agents-invite -->every feature but one is free<!-- /feature:agents-invite --><!-- feature:!agents-invite -->every feature is free<!-- /feature:!agents-invite -->, with no limit on people or slates: unlimited slates, live editing, guests, teams of any size, comments, smart components, presenting, publishing, the API, the CLI and the MCP server. <!-- feature:agents-invite -->The one exception is inviting outside agents onto your slates, which comes with Slatebox Pro or Slatebox Business. [Invite an outside agent](invite-agents.md)<!-- /feature:agents-invite --><!-- feature:!agents-invite -->No feature is ever sold separately.<!-- /feature:!agents-invite -->

Only AI and the calls you start cost money. On Slatebox Cloud they come with Slatebox Pro, or from a balance you top up. Nobody brings their own AI or call key on Cloud: own keys are for self-hosted Slatebox, where they are free. [Use your own keys](own-keys.md)

## Slatebox Pro

Slatebox Pro is for one person, paid monthly or yearly, plus tax where applicable. It includes Pro credits each month for the AI and calls Slatebox pays for, sized to what the AI provider and Daily charge us. The pricing page on slatebox.com has the current price and what Pro credits hold. [See pricing](https://slatebox.com/plans/)

| | Pro credits each month |
| --- | --- |
| AI drafting | Drafts for the month, with a daily limit |
| Voice calls you start | Hours of four-person calls |
| Video calls you start | Hours of four-person video |

Each row is its own amount for the month: what you do not use of one does not add to another.

- Each person chooses Pro for themselves. A team that wants to pay for its members' AI and calls can choose [Slatebox Business](slatebox-business.md).
- Pro credits are for the calendar month (UTC). They start again on the 1st and do not carry over. The daily count resets at 00:00 UTC.
- In the month you start Pro, and the month it ends, you get the share of that month's Pro credits for the days Pro covers.
- **Credits**, in your profile, shows drafts left today and call hours left this month.
- Pro needs an account with a confirmed email address.
- Cancel any time. Pro stays on until the end of the month or year you paid for.
- Need more? Top up, with or without Pro. [Top-ups and refunds](top-ups.md)

[Slatebox Pro](slatebox-pro.md)

## How we count

- **A draft is one request**: each message AI answers. Typed steps with arrows, pasted lines and named lanes are drawn without AI and cost nothing.
- **Images:** Image search and image generation use the month's AI from your Pro credits, not the daily count. An image search costs very little; a generated image uses much more.
- **The month's AI has a cost limit.** A very large request uses more of it. When it runs out, the profile says so, even with drafts left today.
- **Calls are counted in participant-minutes**: people on the call times minutes. Pro credits hold separate participant-minutes of voice and of video each month. A two-person call lasts twice as long as a four-person one.
- **When the month's video runs out, the call carries on as voice** on the same slate. Nobody rejoins.
- **Slatebox asks before a camera turns on**, because a camera makes the whole call a video call.
- **A daily limit** stops one account using a month in an afternoon. It never cuts a running call short.

## Who pays

- **AI:** the person who asks. Their Pro credits are used, then their balance, then their team's balance.
- **Calls:** the person who starts the call. Joining a call uses nothing of yours. Guests never pay and need no account.
- Everyone else on the slate pays nothing.

## Two ways to pay for AI and calls

1. **Slatebox Pro**, with its Pro credits every month.
2. **A balance you top up**, with or without Pro, at what the AI provider or Daily charges us plus a small margin, shown on the pricing page on slatebox.com. The card fee shows as its own line before you pay. A team admin can top up a team balance that members draw on. [Top-ups and refunds](top-ups.md)

We never charge a card for anything you did not choose: a top-up you made, or Pro until you cancel it. When the balance runs out, paid use stops; there is no bill afterwards.

## Without Pro

Everything above stays free. Your balance pays for AI and calls you start. Without Pro or a balance, AI does not run and a call does not start. A message says how to go on: get Pro or top up.

- Joining a call is always free.
- Presentation plans, the AI that lays out a slate for Present, stay free without Pro, up to a daily number for each person. Present still lays out a slate without AI when they run out.

## Limits on calls from Pro credits or a balance

Such a call holds up to 20 people and runs up to 3 hours. It ends when one person has been alone for 10 minutes, or when the Pro credits or balance paying for it run out; everyone sees a notice 2 minutes before either.

## The shared budget

Free presentation plans come from a shared monthly budget. If free use passes it, free presentation plans pause until the 1st of the next month; Present still lays out a slate without AI. Pro credits never shrink or pause because of it, and your balance works at every stage.

## Price changes

We announce any change to the price of Slatebox Pro, or to what Pro credits include, 30 days ahead. A new price applies from your next renewal.

## Self-hosted Slatebox

A Slatebox you run yourself is free. People there use their own AI and call keys, for free: AI is whatever they connect, and calls use the server's own Daily account. Slatebox Pro and balances exist only on Slatebox Cloud. [Who pays for what on your own server](../Installation/self-host-costs.md) · [Choose your AI](choose-your-ai.md) · [Use your own keys](own-keys.md)

## Slatebox Business

Slatebox Business is for a team on Slatebox Cloud, the same shared, fully managed service, priced per member, monthly or yearly, plus tax where applicable. It includes the team's shared pool of AI and calls, with each member adding the same amount as Pro credits. Every feature but inviting outside agents stays free for every team without it, and Business includes that one for every member. <!-- feature:business-checkout -->A team's owner or an admin buys it on the team's page in the app, or talks to us.<!-- /feature:business-checkout --><!-- feature:!business-checkout -->Talk to us to set your team up.<!-- /feature:!business-checkout --> [Slatebox Business](slatebox-business.md) · [Talk to us about Business](https://slatebox.com/contact/?topic=business) · [See pricing](https://slatebox.com/plans/)
