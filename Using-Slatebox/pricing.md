---
title: Pricing and free amounts
description: Slatebox is free. AI and calls come with a free amount each month. Use your own key or top up at cost plus 5%.
---

# Pricing and free amounts

Slatebox is free. Unlimited slates, live editing, guests without accounts, teams of any size, comments, presenting, publishing, the API, the command line and the MCP server cost nothing. AI and calls cost us money each time, so every signed-in person gets a free amount of each every month. [See pricing](https://slatebox.com/plans/)

## What is free each month

| | Free for every signed-in person | After that |
| --- | --- | --- |
| AI drafting and image search | 30 drafts a day | Use your own AI key, or top up |
| Voice calls you start | About 10 hours of four-person calls a month | Use your own Daily key, or top up |
| Video calls you start | About 2 hours of four-person video a month | Use your own Daily key, or top up |

To use the free amount, sign in with an account whose email address is confirmed. A guest can edit, comment, present, follow and join calls, but cannot start AI or a call.

**Free this month**, in your profile, shows what you have left: drafts left today, and hours of calls left this month. The daily AI count starts again at 00:00 UTC. The monthly amounts start again on the 1st of each month (UTC).

## How we count

**A draft is one request.** Each message that AI answers, each image search and each image generation is one draft. Typed steps with arrows, pasted lines and named lanes are drawn without AI and count for nothing.

**The month's free AI also has a cost limit.** Most drafts cost very little. A very large request costs more, and uses more of the month's free AI. When the month's free AI is used up, the profile says so, even if you have drafts left today.

**Calls are counted in participant-minutes:** the number of people on the call times the minutes it runs. Your free amount is 2,400 participant-minutes of voice and 500 participant-minutes of video a month. That is about 10 hours of a four-person voice call, or about 2 hours of a four-person video call. A two-person call lasts twice as long.

**When your free video is used up, the call carries on as voice.** Everyone moves to a voice call on the same slate. Nobody has to rejoin.

**Before a camera turns on, Slatebox asks.** A camera makes the whole call a video call, which uses more of the free calls of the person who started it.

There is also a limit on how much one person can start in a day, so that one account cannot use a month in an afternoon. A call that is already running is never cut short by it.

## Who pays

- **The person who asks pays for an AI request.** Their own key is used first, then their free amount, then their balance.
- **The person who starts a call pays for it.** Joining a call uses nothing of yours. Guests never pay, and need no account.
- Everyone else on the slate pays nothing.

## Three ways to use AI and calls

1. **Your own key.** Add a DeepInfra key or an OpenAI-compatible endpoint for AI, or a Daily key for calls. We charge nothing and set no limit. [Use your own keys](own-keys.md)
2. **The free amount.** The amounts above, every month.
3. **A balance you top up.** From $10. You pay what the AI provider or Daily charges us, plus 5%. The card fee is shown as its own line before you pay. [Top-ups and refunds](top-ups.md)

Nothing is ever charged to a card that you did not top up. When a balance reaches $0, paid use stops; there is no bill afterwards.

## Limits on every call

A call holds up to 20 people and runs for up to 3 hours. A call ends when one person has been alone on it for 10 minutes. Everyone sees a notice 2 minutes before a call ends.

## The monthly budget

The free amounts come from a budget of $1,000 a month for everyone together. If a month's free use runs short, the free amounts change in this order, until the 1st of the next month:

| Free use this month | What changes |
| --- | --- |
| 70% of the budget | New free video calls start as voice. Calls already running carry on. |
| 90% of the budget | Free AI drops from 30 to 10 drafts a day. |
| 100% of the budget | New free calls pause. Free calls already running end within 10 minutes. AI stays at 10 drafts a day. |
| 110% of the budget | Free AI pauses. |

The same 100% rules apply for the rest of a day (UTC) in which free use reaches one twentieth of the monthly budget. Your own keys and your balance keep working at every stage. We announce any change to the free amounts 30 days ahead.

## Self-hosted Slatebox

A self-hosted Slatebox has no meters: no free amounts, no top-ups and no limits from us. [A self-hosted Slatebox has no meters](../Installation/self-host-meters.md)

## Organisations

Organisations that run Slatebox across many teams and want one policy, sign-in through their identity provider and an uptime commitment can write to [tim@slatebox.com](mailto:tim@slatebox.com?subject=Slatebox%20for%20organisations).
