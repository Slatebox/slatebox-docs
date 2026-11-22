# Use your own keys

## Agent prompt

```text
Help me complete my task in Slatebox using the official app guide. Ask which outcome I want, then walk me through the relevant steps and verify it on my slate.

Read https://docs.slatebox.com/Using-Slatebox/own-keys.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Using-Slatebox/own-keys.md.
```

With your own AI or Daily key, the provider bills you directly, or nobody does for a model you run. Slatebox charges nothing and sets no limit on what it pays for. Your own keys are free with or without Slatebox Pro.

## Connect your own AI

Open **Profile → AI** and choose **Connect a model**: a cloud provider with your key (OpenAI, Anthropic or DeepInfra), or any OpenAI-compatible endpoint with its address, a key if it needs one and a model name. Choose it for every feature or only some. [Choose your AI](choose-your-ai.md)

A team admin connects AI for the whole team under **Your team's** in the same tab. Your own choice is used before your team's.

## Add a Daily key

1. Open your profile and choose **Credits**.
2. Under **Your own keys**, choose **Add a Daily key**.
3. Paste the key and save. Slatebox checks it once with Daily and shows any refusal under the key.

A team admin adds a Daily key for the whole team in **Team settings → Team balance and keys**. Your own key is used before your team's.

## What each covers

| Yours | Pays for |
| --- | --- |
| Your own AI connection | Each AI feature you choose it for: conversation and edits, drafts and layouts, presentation planning, reading images and diagrams, and generating images when the model makes images. |
| Daily key | Calls you start, on your Daily domain, with Daily's limits and none of ours. |

Image search always uses your Pro credits, then your balance. Image generation does too, unless you choose a connection that makes images for **Generating images**.

## How keys are kept

- Keys are encrypted at rest with AES-256-GCM and bound to their owner; a key copied to another account cannot be read.
- A saved key is never shown again. An AI connection says "key saved"; a Daily key shows its last four characters, for example "Daily key ending 4f2a".
- A server with no encryption key set hides **Your own keys** and refuses AI keys. An endpoint that needs no key still works.

## Remove a key

Choose **Remove** beside the AI connection in **Profile → AI**, or beside the Daily key in **Credits**. Slatebox stops using it and deletes it at once.
