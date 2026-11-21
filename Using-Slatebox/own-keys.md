---
title: Use your own keys
description: Add your own AI key or Daily key. Slatebox then charges nothing and sets no limit on what that key pays for.
---

# Use your own keys

With your own key, the provider bills you directly. Slatebox charges nothing and sets no limit on what the key pays for. Image search and image generation are not covered by an AI key: they use your free amount, then your balance.

## Add a key

1. Open your profile and choose **Free this month**.
2. Under **Your own keys**, choose **Add an AI key** or **Add a Daily key**.
3. Paste the key and save. Slatebox checks it once with the provider and shows any refusal under the key.

A team admin adds keys for the whole team in **Team settings → Team balance and keys**. Your own key is used before your team's.

## What each key covers

| Key | Pays for |
| --- | --- |
| DeepInfra key | AI drafts, conversation and presentations, on the same models. |
| OpenAI-compatible endpoint | Drafts and conversation. Give a base URL, a model name and a key if your server needs one. It must use https on a public host. Presentations use your free amount or balance. |
| Daily key | Calls you start, on your Daily domain, with Daily's limits and none of ours. |

## How keys are kept

- Keys are encrypted at rest with AES-256-GCM and bound to their owner; a key copied to another account cannot be read.
- A saved key is never shown again. The profile shows its last four characters, for example "DeepInfra key ending 4f2a".
- A server with no encryption key set hides **Your own keys**.

## Remove a key

In **Free this month**, choose **Remove** beside the key. Slatebox stops using it and deletes it at once.
