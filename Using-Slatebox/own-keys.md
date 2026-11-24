# Use your own keys on a self-hosted Slatebox

## Agent prompt

```text
Help me complete my task in Slatebox using the official app guide. Ask which outcome I want, then walk me through the relevant steps and verify it on my slate.

Read https://docs.slatebox.com/Using-Slatebox/own-keys.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Using-Slatebox/own-keys.md.
```

Own AI and call keys are for self-hosted Slatebox. On a self-hosted Slatebox, your own AI connection is free: the provider bills you directly, or nobody does for a model you run. Slatebox charges nothing and sets no limit on a self-hosted server.

On Slatebox Cloud, AI and calls come with Slatebox Pro credits and top-ups. Nobody brings their own key there. [Slatebox Pro](slatebox-pro.md) · [Top-ups and refunds](top-ups.md)

## On Slatebox Cloud

- **Profile → AI** shows which AI each feature uses. It has no personal or team connections.
- **Credits** has no **Your own keys**, and team settings have no team keys.
- Saving a key or an AI connection is refused with: "Own AI and call keys are for self-hosted Slatebox. On Slatebox Cloud, AI and calls come with Slatebox Pro credits and top-ups."
- A key or connection added on Cloud before 22 November 2026 stays stored, unused. Slatebox never sends a request with it. Its owner can still remove it. To remove an AI connection, an agent sends `slatebox.ai.update` (or `PUT /api/v1/ai`) with only `remove`, such as `{ level: "me", remove: ["your-connection-name"] }`. `slatebox.ai.get` lists what you saved. [Set it up with an agent](choose-your-ai.md#set-it-up-with-an-agent)

## Connect your own AI

On a self-hosted Slatebox, open **Profile → AI** and choose **Connect a model**: a cloud provider with your key (OpenAI, Anthropic or DeepInfra), or any OpenAI-compatible endpoint with its address, a key if it needs one and a model name. Choose it for every feature or only some. [Choose your AI](choose-your-ai.md)

A team admin connects AI for the whole team under **Your team's** in the same tab. Your own choice is used before your team's.

## Calls

On a self-hosted Slatebox, every call uses the server's Daily account. The operator adds its key in `SLATEBOX_SETTINGS`, such as `{"daily":{"apiKey":"your-daily-key"}}`. Calls then run on that Daily domain, with Daily's limits and none of ours. [Who pays for what on your own server](../Installation/self-host-costs.md)

## What your own AI covers

| Yours | Pays for |
| --- | --- |
| Your own AI connection | Each AI feature you choose it for: conversation and edits, drafts and layouts, presentation planning, reading images and diagrams, and generating images when the model makes images. |

Your own connections are free, and on a self-hosted Slatebox nobody needs Slatebox Pro. Image search always uses the server's own image service. Image generation does too, unless you choose a connection that makes images for **Generating images**.

## How keys are kept

- Keys are encrypted at rest with AES-256-GCM and bound to their owner; a key copied to another account cannot be read.
- A saved key is never shown again. An AI connection says "key saved".
- A server with no encryption key set refuses AI keys. An endpoint that needs no key still works.

## Remove a key

Choose **Remove** beside the AI connection in **Profile → AI**. Slatebox stops using it and deletes it at once.
