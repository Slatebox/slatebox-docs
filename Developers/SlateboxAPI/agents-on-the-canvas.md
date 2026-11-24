---
title: "Agents on the canvas: suggestions, video notes and invited agents"
description: An agent's canvas edits are live suggestions people keep or discard. Read, keep, discard and undo them, add video notes, and (on Slatebox Cloud) invite and ask outside agents, from the API, exec or MCP.
---

# Agents on the canvas: suggestions, video notes and invited agents

When an agent edits a slate's canvas, the edit is not saved: it appears live on the slate as suggestions for people to keep or discard. This page lists the calls that read and decide those suggestions, add video notes, and invite outside agents. Each call is the same on every surface, with the same checks: an HTTP route, a method in the exec client, and a typed tool on Slatebox's hosted MCP server.

## How an agent's edit lands

`POST /api/v1/slates/{shareId}/operations` (`edit_slate`, `slatebox.slates.applyOperations`) from an agent's token answers `202` with `outcome: "suggested"`. Nothing is saved and `revision` is unchanged.

| Field | Meaning |
| --- | --- |
| `outcome` | `suggested`: shown live on the slate, waiting for a person. `saved`: a person lets this agent edit directly, so it saved. |
| `suggestion.actionId` | The suggestion, as `include=suggestions` lists it. |
| `suggestion.items[]` | One item per change: `add`, `update`, `remove`, `link` or `unlink`, each with its `state` (`pending` until someone decides). |
| `operations[].ids` | The new notes' ids. They work in your next edit, so you can connect, change or take back your own waiting notes. |

- People who can edit the slate keep or discard each item, or all of an agent's at once. Each kept action can be undone on its own.
- Slate settings (`update_slate`) are not suggested: the call answers `409 needs_direct_edit`.
- When people pause the slate's agents, an agent's edit answers `423 agents_paused`.
- The Slatebox agent, working on a task a person gave it, saves directly. [Agent tasks](slates.md#agent-tasks)

[Keep or discard what agents suggest](../../Using-Slatebox/agent-suggestions.md) shows what people see.

## Read and decide suggestions

| Request | Tool | Exec | Does |
| --- | --- | --- | --- |
| `GET /api/v1/slates/{shareId}?include=suggestions` | `get_slate` | `slates.get` | Reads the slate with what agents suggested: what waits, and what became of each agent's recent actions |
| `POST /api/v1/slates/{shareId}/suggestions/decide` | `decide_suggestions` | `suggestions.decide` | `decision` is `keep`, `discard` or `undo`, for one `actionId`; `itemIds` picks some of its items |

- Deciding needs edit access to the slate and `slates:write`.
- Only people keep suggestions. An agent's `keep` answers `403 people_only`, for its own suggestions and for any other agent's.
- An agent can `undo` only its own actions. Undoing another agent's action answers `403 people_only`.
- In an exec script, a `keep` or `undo` is held for the person to confirm, because it can remove notes (`confirmation_required`). [Exec](exec.md)
- A kept item that cannot land, such as a change to a note someone deleted, is refused with its reason; the rest are kept.
- `undo` takes back only what that action changed, and only where nobody changed it since. `left[]` says what stayed and why.

<!-- tabs -->

```js JavaScript
const slate = await slatebox.slates.get({ shareId: 'your-share-id', include: 'suggestions' })
const waiting = slate.suggestions.actions.filter((action) => action.items.some((item) => item.state === 'pending'))
return waiting.map(({ actionId, label, summary }) => ({ actionId, label, summary }))
```

```ts TypeScript
const slate = await slatebox.slates.get({ shareId: 'your-share-id', include: 'suggestions' })
const waiting = slate.suggestions.actions.filter((action) => action.items.some((item) => item.state === 'pending'))
return waiting.map(({ actionId, label, summary }) => ({ actionId, label, summary }))
```

<!-- /tabs -->

Discarding one action over HTTP:

<!-- tabs -->

```js Node.js
const base = process.env.SLATEBOX_BASE_URL ?? 'https://app.slatebox.com'
const res = await fetch(`${base}/api/v1/slates/your-share-id/suggestions/decide`, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}`,
    'content-type': 'application/json',
    'idempotency-key': crypto.randomUUID(),
  },
  body: JSON.stringify({ decision: 'discard', actionId: 'your-action-id' }),
})
console.log(res.status, await res.json())
```

```python Python
import os, uuid, requests

base = os.environ.get("SLATEBOX_BASE_URL", "https://app.slatebox.com")
res = requests.post(
    f"{base}/api/v1/slates/your-share-id/suggestions/decide",
    headers={"Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}", "Idempotency-Key": str(uuid.uuid4())},
    json={"decision": "discard", "actionId": "your-action-id"},
)
print(res.status_code, res.json())
```

```sh curl
curl --fail-with-body --silent --show-error \
  -X POST "${SLATEBOX_BASE_URL:-https://app.slatebox.com}/api/v1/slates/your-share-id/suggestions/decide" \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{"decision":"discard","actionId":"your-action-id"}'
```

<!-- /tabs -->

The answer lists `discarded[]`, each with its `actionId` and `itemId`.

## Video notes

| Request | Tool | Exec | Does |
| --- | --- | --- | --- |
| `POST /api/v1/media/lookup` | `lookup_media` | `media.lookup` | Reads a YouTube, Vimeo or Loom address: `{ media, found, notice? }`, with the title, author and a poster stored by the app |
| `POST /api/v1/slates/{shareId}/media` | `add_media_note` | `slates.addMedia` | Adds a video note. `x` and `y` place its top-left corner (320 by 180); without them it goes beside the slate's notes |

- Both need `slates:write`; adding needs edit access to the slate.
- Added by an agent, the note is a suggestion like any canvas edit (`202`, `outcome: "suggested"`). Added by a person, it saves.
- Only YouTube, Vimeo and Loom addresses are video notes. Any other address answers `400 not_a_video`.
- Slatebox asks only each host's own oEmbed address, and fetches the poster only from that host's picture server. A host that shares nothing still gets a note with its play button, and `notice` says what was missing.
- A person may look up 60 new videos an hour. A video already looked up does not count.

<!-- tabs -->

```js JavaScript
const added = await slatebox.slates.addMedia({ shareId: 'your-share-id', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' })
return { outcome: added.outcome, nodeId: added.nodeId, title: added.media.title }
```

```ts TypeScript
const added = await slatebox.slates.addMedia({ shareId: 'your-share-id', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' })
return { outcome: added.outcome, nodeId: added.nodeId, title: added.media.title }
```

<!-- /tabs -->

[Add a video to a slate](../../Using-Slatebox/video-notes.md) shows the note in the app.

<!-- feature:agents-invite -->
## Invited agents

On Slatebox Cloud, a person with Slatebox Pro, or on a Slatebox Business team, can invite an outside MCP server onto a slate they can edit, as a named agent. A self-hosted Slatebox serves these routes only once an on-prem license switches them on (there is no Slatebox Pro there); without one they are not there.

| Request | Tool | Exec | Does |
| --- | --- | --- | --- |
| `GET /api/v1/slates/{shareId}/agents` | `list_invited_agents` | `connectors.list` | The slate's invited agents, who invited each, and (for your own) the tools they may use |
| `POST /api/v1/slates/{shareId}/agents/discover` | `discover_agent` | `connectors.discover` | Reaches a server's address and says what it can do, or how to sign in to it |
| `POST /api/v1/slates/{shareId}/agents/key` | `use_agent_key` | `connectors.useKey` | Gives Slatebox a key or token for a server that takes one, kept encrypted for you alone |
| `POST /api/v1/slates/{shareId}/agents` | `invite_agent` | `connectors.connect` | Invites it: its name, the tools it may use (each with the hash you agreed to) and what it may see |
| `POST /api/v1/agents/{connectionId}/ask` | `ask_invited_agent` | `connectors.call` | Asks it. Its answer lands as suggestions: `{ items, actions, saved, say, left }`. Send `view` (the part of the canvas you can see, in slate units) and its notes land there |
| `POST /api/v1/agents/{connectionId}/remove` | `remove_agent` | `connectors.disconnect` | Removes it and discards what it still has waiting |

- On Slatebox Cloud, discovering, signing in, inviting and asking need Slatebox Pro, or a seat on a Slatebox Business team, for the person who invited the agent, checked on the server. Without it they answer `402 pro_required`.
- On a self-hosted Slatebox whose on-prem license has ended, they answer `403 enterprise_locked`.
- Only the person who invited an agent can ask it (`403 inviter_only`). The inviter or the slate's owner can remove it. Everyone who can read the slate sees it.
- Signing in to a server that needs it happens in the slate, in your own signed-in browser. There is no route or tool for it, so no sign-in link can be passed to someone else.
- A token reaches only slates its own account can open. A link to an unlisted slate does not count.
- These calls reach outside servers, so each account can make 20 of them a minute, and 3 at a time. Over that they answer `429`.
- When people pause the slate's agents, asking answers `423 agents_paused` before anything is sent to the outside server.
- A slate holds up to 8 invited agents, and up to 3 from one person.
- Keep, discard and undo what an invited agent suggests with `suggestions.decide`, like any agent's.

[Invite an outside agent onto a slate](../../Using-Slatebox/invite-agents.md)
<!-- /feature:agents-invite -->

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `202` with `outcome: "suggested"` | Your edit is waiting for a person on the slate. Read it back with `include=suggestions`. |
| `403 people_only` | Only people keep suggestions, and an agent undoes only its own actions. Ask a person on the slate. |
| `423 agents_paused` | People on the slate paused its agents. Ask one of them to resume agents. |
| `409 needs_direct_edit` | Slate settings are changed by a person, or by an agent a person lets edit directly. |
