---
title: Use your own keys
description: Add your own AI key or Daily key. Slatebox then charges nothing and sets no limit on what that key pays for.
---

# Use your own keys

With your own key, the provider bills you directly. Slatebox charges nothing and sets no limit on what the key pays for. Image search and image generation are not covered by an AI key: they use your free amount, then your balance.

## Add a key

1. Open your profile and choose **Free this month**.
2. Under **Your own keys**, choose **Add an AI key** or **Add a Daily key**.
3. Paste the key and save. Slatebox checks it once with the provider. If the provider refuses it, the reason is shown under the key.

A team admin adds keys for the whole team in **Team settings**, under **Team keys**. A person's own key is used before their team's key.

## Which key covers what

| Key | What it pays for |
| --- | --- |
| DeepInfra key | AI drafts, conversation and presentations. The models stay the same; only the key changes. |
| OpenAI-compatible endpoint | A base URL, a model name and, if your server needs one, a key. It must use https on a public host. Used for drafts and conversation. Presentations use your free amount or your balance. |
| Daily key | Calls you start. They run on your Daily domain, with Daily's limits and none of ours. |

## How keys are kept

Keys are encrypted at rest with AES-256-GCM. Each key is bound to its owner, so a key copied to another account cannot be read. After you save a key it is never shown again: the profile shows only its last four characters, for example "DeepInfra key ending 4f2a".

If a Slatebox server has no encryption key set, the **Your own keys** section does not appear and keys cannot be saved.

## Remove a key

Open **Free this month** and choose **Remove** beside the key. Slatebox stops using it at once and deletes it. Your free amount, then your balance, are used again.
