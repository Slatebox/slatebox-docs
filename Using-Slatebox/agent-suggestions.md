---
title: Keep or discard what agents suggest
description: An agent's changes appear on the slate as it works, as ghost notes everyone sees. Keep or discard each one in place, keep or discard all of an agent's at once, and undo any agent action.
---

# Keep or discard what agents suggest

When an agent edits a slate, its changes appear on the slate as it works: see-through ghost notes and dashed lines, in the agent's color, on every screen. Nothing is saved until someone who can edit the slate keeps it.

This covers every agent that edits through Slatebox: an assistant such as Claude or ChatGPT connected to [Slatebox's MCP server](../Developers/SlateboxAPI/mcp.md), a script run with [exec](../Developers/SlateboxAPI/exec.md), an API call, and an agent someone invited onto the slate. The Slatebox agent, which works on tasks a person gave it, saves its work directly.

## Keep or discard one change

1. Watch the agent's named cursor. It moves to each ghost as it appears and says what it suggests, such as "Suggesting 2 new notes and 1 change".
2. Choose **Keep** on a ghost to save it. It becomes a real note for everyone, and one save in the slate's history. Your Keep is also one step of your own undo: **Undo** at the canvas's corner, or Ctrl+Z (⌘Z on a Mac), takes it back. If a teammate has changed the kept note since, or drawn a line to it, your undo leaves it as they left it and says so.
3. Choose **Discard** to remove it. Nothing is saved.

A changed note shows the agent's version as a ghost over it. A removed note is marked until someone keeps or discards the removal. Keeping a line also keeps the new notes at its ends.

People who can only view the slate see the ghosts and the cursor, without the buttons.

## Keep or discard everything from one agent

Agents are listed after the people on the slate. Open an agent's chip to see:

| Item | What it does |
| --- | --- |
| The plan | The steps the agent said it would take, ticked as it goes. |
| **Keep all** | Saves every change from this agent that is still waiting. A change that cannot land, such as an edit to a note someone deleted, is left out, and the chip says why. |
| **Discard all** | Removes every change from this agent that is still waiting. |
| Activity | The agent's recent actions in plain words, newest first. |
| **Undo** | Takes back one action that was kept. Only that action's changes go back, and only where nobody has changed them since, so another agent's work and your own later edits stay. |

An agent stays on the list while it works, while its changes wait, and for an hour after its last action.

## Pause every agent on a slate

Choose **Pause all agents** on the agent list. Agents' edits on this slate are refused until someone who can edit chooses **Resume agents**. Changes already waiting stay, ready to keep or discard.

## Let one agent edit directly

Where your Slatebox allows it, an agent's chip has an **Edit directly** switch for the person who brought the agent and for the slate's owner. With it on, that agent's changes save at once instead of waiting as ghosts. Each of its actions is still listed with **Undo**. Turn the switch off to go back to suggestions.

Everyone else sees "Edits directly (set by Ada)" on the chip. Anyone who can edit the slate can choose **Back to suggestions**.

On a self-hosted Slatebox, the operator allows the switch with `settings.public.agents.editDirectly: true`.

## What agents cannot do

- No agent keeps suggestions, its own or another agent's. A person keeps them, or lets that agent edit directly.
- An agent can undo only its own actions. While agents are paused, or an agent only suggests, it cannot undo or redo straight to the slate either.
- Slate settings, such as the background or the slate's name, are not suggested. A person changes them, or an agent that may edit directly.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| **Keep** is missing on a ghost | You can view this slate but not edit it. Ask its owner for edit access. |
| A kept change was left out | The note it changes is gone or was changed. The chip says which. Ask the agent again. |
| **Undo** left some changes in place | Someone changed those notes after the agent's action. Undo never overwrites a later edit. |
| An agent's edits are refused | Agents on this slate are paused. Choose **Resume agents**. |
