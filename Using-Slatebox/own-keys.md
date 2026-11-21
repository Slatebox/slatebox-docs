---
title: Use your own keys
description: Connect your own AI, a cloud key or any OpenAI-compatible endpoint, or add your own Daily key. Slatebox then charges nothing and sets no limit on what it pays for.
---

# Use your own keys

With your own AI or Daily key, the provider bills you directly, or nobody does for a model you run. Slatebox charges nothing and sets no limit on what it pays for.

## Connect your own AI

Open **Profile → AI** and choose **Connect a model**: a cloud provider with your key (OpenAI, Anthropic or DeepInfra), or any OpenAI-compatible endpoint with its address, a key if it needs one and a model name. Choose it for every feature or only some. [Choose your AI](choose-your-ai.md)

A team admin connects AI for the whole team under **Your team's** in the same tab. Your own choice is used before your team's.

## Add a Daily key

1. Open your profile and choose **Free this month**.
2. Under **Your own keys**, choose **Add a Daily key**.
3. Paste the key and save. Slatebox checks it once with Daily and shows any refusal under the key.

A team admin adds a Daily key for the whole team in **Team settings → Team balance and keys**. Your own key is used before your team's.

## What each covers

| Yours | Pays for |
| --- | --- |
| Your own AI connection | Each AI feature you choose it for: conversation and edits, drafts and layouts, presentation planning, reading images and diagrams, and generating images when the model makes images. |
| Daily key | Calls you start, on your Daily domain, with Daily's limits and none of ours. |

Image search always uses your free amount, then your balance. Image generation does too, unless you choose a connection that makes images for **Generating images**.

## How keys are kept

- Keys are encrypted at rest with AES-256-GCM and bound to their owner; a key copied to another account cannot be read.
- A saved key is never shown again. An AI connection says "key saved"; a Daily key shows its last four characters, for example "Daily key ending 4f2a".
- A server with no encryption key set hides **Your own keys** and refuses AI keys. An endpoint that needs no key still works.

## Remove a key

Choose **Remove** beside the AI connection in **Profile → AI**, or beside the Daily key in **Free this month**. Slatebox stops using it and deletes it at once.
