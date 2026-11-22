# Top-ups and refunds

## Agent prompt

```text
Help me complete my task in Slatebox using the official app guide. Ask which outcome I want, then walk me through the relevant steps and verify it on my slate.

Read https://docs.slatebox.com/Using-Slatebox/top-ups.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Using-Slatebox/top-ups.md.
```

A balance pays for AI and calls once your Pro credits are used, or on its own without Slatebox Pro. It is spent at what the AI provider or Daily charges us, plus 5%. You do not need Pro to top up.

## Top up

Open your profile, choose **Credits**, then **Top up**. Before you pay, the dialog shows the whole amount, for example: "You pay $10.61: $10.00 of balance and a $0.61 card fee." The card fee is what the card network charges; it is not part of the balance.

| | |
| --- | --- |
| Smallest top-up | $10 |
| First top-up | Up to $25 |
| Largest balance | $500 |
| Expiry | A balance never expires. |
| Video | Video paid from a top-up can start 24 hours after that top-up. |

The 5% covers the card fee kept on refunds, $15 for a disputed payment, and the gap between token-based prices and the provider's bill. It is not a profit line.

## How a balance is spent

Your own key is used first, then your Pro credits if you have Slatebox Pro, then your balance. A team admin can top up a shared team balance in **Team settings**; it is used after your own balance.

At $0, paid use stops. The last request finishes, and there is no bill afterwards.

## Refunds

Choose **Refund my balance** in **Credits**. What is left goes back to the card it came from; card fees are not refunded.

- A refund waits while a call or a request is being paid from it. Try again when it ends.
- A team admin refunds a team balance in **Team settings**.
- Deleting your account refunds your balance first.
- A balance is on hold while its payment is disputed with your bank. Write to help@slatebox.com about a held balance.

Slatebox Pro is not a balance: its fees follow their own rules. [Slatebox Pro](slatebox-pro.md#refunds-and-deleting-your-account)
