---
title: Invite an outside agent onto a slate
description: Bring an MCP server such as Excalidraw, Linear or GitHub onto a slate as a named agent. Ask it something and its answer appears as suggestions everyone on the slate sees. On Slatebox Cloud with Slatebox Pro or Slatebox Business; on a self-hosted Slatebox with an on-prem license.
feature: agents-invite
---

# Invite an outside agent onto a slate

Invite an outside agent, any MCP server, onto a slate. Ask it something, and Slatebox AI turns its answer into notes and lines that appear on the slate as suggestions. Everyone on the slate sees the agent's cursor and its suggestions, and anyone who can edit keeps or discards them.

On Slatebox Cloud, inviting agents is part of Slatebox Pro, and of Slatebox Business for every member of a Business team, for the person who invites them, on any slate they can edit. On a self-hosted Slatebox it needs an on-prem license from Slatebox, a flat yearly fee per install; there is no Slatebox Pro there. [Slatebox Pro](slatebox-pro.md)

## Invite an agent

1. On a slate you can edit, choose **+ Invite agent**.
2. Choose an agent from the gallery, or paste an MCP server's address under **Paste an MCP address** and choose **Next**. Without Slatebox Pro or a Business team, the payment sheet opens in the app. Nothing else changes on the page.
3. If the server needs you to sign in, a window opens on the server's own sign-in page, or you paste a key or token it gave you and choose **Use key**. See [Agents that need sign-in](#agents-that-need-sign-in).
4. Read what it can do. Slatebox lists its tools in plain words:
   - **Look things up**: on to start. Clear any you do not want it to use.
   - **Change things outside Slatebox**: always off. Posting or changing things elsewhere is not available.
5. Set **Name on your slate**. A name cannot say Slatebox, admin, support or a person's name, or be the name of another agent on the slate.
6. Choose what it may see under **It may see**. The dialog says exactly what leaves Slatebox for each choice.
7. Choose **Invite**. The agent's cursor arrives on the slate and says hello.

Consent is to each tool exactly as the server described it. If the server changes a tool later, the agent pauses before it calls anything, and you look at the change before asking again.

## What it may see

| Choice | What leaves Slatebox when you ask |
| --- | --- |
| **Only what I ask** | What you type. |
| **What I ask, and the notes I select** | What you type, and the text of the notes you select. |
| **What I ask, and every note on this slate** | What you type, and the text of every note on the slate, including notes by others. |

Never: other slates, people's names or email addresses, comments, links or share settings.

## Ask it something

Each invited agent is on the strip of people at the foot of the slate, as its own chip. Only the person who invited it can ask it, in either of two places:

- **Its chip.** Choose the chip, type your request in its box and choose **Ask**.
- **Ask Slatebox.** Put the agent's name after an `@` anywhere in the message, such as `@Excalidraw draw how a card payment is retried` or `@GitHub open issues about sign-in`. This works in the slate's own conversation, not in a board's (workshop) conversation. Its answer appears in the conversation under its own name, in its colour, beside its mark. Your agents' names are also offered above the message box.

1. Ask it, such as "Draw how a card payment is retried".
2. Watch the slate. Each part of the answer appears as ghost notes and lines in the agent's colour, in the part of the slate you can see, and its cursor moves to them. The chip shows how many changes wait.
   Others on the slate who are looking elsewhere see a marker at the edge of their screen, such as "Excalidraw is working →". Choose it to go there.
3. Keep or discard each ghost, or choose **Keep all** or **Discard all** on the chip. Each part is one action you can undo. [Keep or discard what agents suggest](agent-suggestions.md)

Pictures in an answer are left out, and the ask box says so. Links are kept only when they are secure `https` addresses the server really sent.

## Who sees and does what

| Person | Can |
| --- | --- |
| The person who invited it | Ask it, sign it in again, remove it, let it edit directly. |
| The slate's owner | Remove it. |
| Anyone who can edit the slate | See its cursor and suggestions, keep, discard and undo them. |
| Anyone who can view the slate | See its cursor and suggestions. |

A slate holds up to 8 invited agents, and up to 3 from one person.

## Agents that need sign-in

Some servers, such as Linear and GitHub, need you to sign in.

- A sign-in window opens on the server's own page. When you allow access, the window closes and the walkthrough carries on. Sign-in works only from the slate in your own signed-in browser.
- The walkthrough names where your sign-in is sent, and what it lets Slatebox do. A GitHub sign-in reaches your public repositories and the names of your organisations, and is sent only to GitHub's own MCP server.
- What the server gives Slatebox is stored encrypted for you alone. Nobody on the slate sees it, and it is sent only to that server.
- A server that takes a key or token instead: paste it and choose **Use key**. Slatebox checks it with the server first.
- If the server stops accepting the sign-in, the agent's chip says it needs sign-in. Choose **Sign in again**.
- If your Slatebox Pro ends (and you are not on a Business team), the chip says so and asking is refused. Renew Slatebox Pro from the chip and the agent works again.

## Remove an agent

Choose **Remove** on the agent's chip, then **Remove** again to confirm. Its waiting suggestions are discarded; what people kept stays. When no other slate of yours uses that server, its sign-in is revoked at the server and deleted.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| **+ Invite agent** is missing | You can view this slate but not edit it, or you are on a self-hosted Slatebox without an on-prem license. |
| "That is not a web address" or a private-address message | Use the server's public `https` address. Private and local addresses are refused. |
| The agent paused because its tools changed | Look at the changes the chip lists, then invite it again to choose. |
| "Only … can ask" | Only the person who invited an agent can ask it. Invite your own. |
| **Ask** is greyed out | Agents are paused on this slate. Choose **Resume agents** in the list of agents, then ask. |
| The sign-in window was blocked | Allow pop-ups for Slatebox and choose sign in again. |
