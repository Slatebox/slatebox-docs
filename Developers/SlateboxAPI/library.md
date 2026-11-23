# The shared library

Browse, use, build and publish smart components, slates and presentations from your own code. Paths are relative to `/api/v1`. [Authentication](readme.md#authentication)

## What is in it

| Kind | Is | Using it gives you |
| --- | --- | --- |
| `component` | A smart component: a board that keeps its rules (a retro, a pipeline, a launch plan). The ones built into Slatebox and the ones people built | The board on a new slate, or beside the boards of a slate you can edit |
| `slate` | A slate someone published | A private copy of it |
| `presentation` | A slate with its deck | A private copy with its presentation |

Every item has one category: `plan`, `decide`, `meetings`, `track` or `map`. A component branched off another stays in its parent's category. Published items are shared under CC BY 4.0, and each one credits where it came from (`provenance.branchedFrom` or `provenance.forkedFrom`).

## Endpoints

| Request | Does | Needs |
| --- | --- | --- |
| `GET /library` | List published items: `kind`, `category`, `origin` (`builtin` or `user`), `q`, `sort` (`new` or `popular`), `cursor`, `limit` (at most 48) | Nothing; a token works too |
| `GET /library/{itemId}` | One item by id or slug, with a version's content (`version` to choose one) | Nothing for a published item. Its author and reviewers read the rest |
| `GET /library/stats` | How many published components (built in, from the community, total), slates, presentations and items per category | Nothing |
| `GET /library/export` | Every published item with its content, 50 per page | Nothing |
| `GET /library/mine` | Your own items with their status and thread | `slates:read` |
| `POST /library/{itemId}/fork` | Use an item: a new private slate, or a component beside a slate's boards (`targetShareId`) | `slates:write` and an optional `Idempotency-Key` |
| `POST /library/{itemId}/branch` | Start your own component on a new builder slate: a copy to change, or `new` for an empty one | `slates:write` |
| `POST /library/drafts` | Save the board of your builder slate as your own component | `slates:write` |
| `POST /library/submissions` | Send a component, slate or presentation for review | `slates:share`. A guest account signs up first |
| `POST /library/{itemId}/withdraw` | Take back a submission, or take your published item out | `slates:write` |
| `DELETE /library/{itemId}` | Delete your own draft | `slates:write` |
| `POST /library/{itemId}/comments` | Write in an item's review thread | `slates:write`, as its author or a reviewer |

Public reads answer with `Cache-Control: public` and `Access-Control-Allow-Origin: *`, so a web page on any site can call them. Answers to a token are never cached. An item that is not published answers `404` to everyone but its author and reviewers.

<!-- tabs -->

```js Node.js
const base = process.env.SLATEBOX_BASE_URL ?? 'https://app.slatebox.com'
const stats = await (await fetch(`${base}/api/v1/library/stats`)).json()
const list = await (await fetch(`${base}/api/v1/library?kind=component&category=decide`)).json()
console.log(stats.components.total, list.items.map((item) => item.title))
```

```python Python
import os, requests

base = os.environ.get("SLATEBOX_BASE_URL", "https://app.slatebox.com")
stats = requests.get(f"{base}/api/v1/library/stats").json()
items = requests.get(f"{base}/api/v1/library", params={"kind": "component", "category": "decide"}).json()["items"]
print(stats["components"]["total"], [item["title"] for item in items])
```

```sh curl
curl --fail-with-body --silent --show-error \
  "${SLATEBOX_BASE_URL:-https://app.slatebox.com}/api/v1/library?kind=component&category=decide"
```

<!-- /tabs -->

## Use an item from a script

Each endpoint is a method of the exec client (`slatebox.library.*`) and a typed MCP tool (`list_library`, `get_library_item`, `use_library_item`, `branch_library_component`, `save_library_draft`, `submit_to_library` and the rest). [Exec: how agents work with Slatebox](exec.md)

```js exec
const { items } = await slatebox.library.list({ kind: 'component', q: 'retro' })
const preview = await slatebox.library.fork({ itemId: items[0].id, targetShareId: 'YOUR_SHARE_ID', mode: 'preview' })
return slatebox.library.fork({ itemId: items[0].id, targetShareId: 'YOUR_SHARE_ID', topic: 'Q3 launch' })
```

`mode: "preview"` answers the board and where it would go (`canvas`) and saves nothing. A slate holds up to 8 boards; past that the fork answers `409 component_opens_new_slate`. `slates.applyOperations` with an `add_component` operation also takes `library: { itemId }` in place of a catalogue `component`.

## Build and submit a component

1. `POST /library/new/branch` (or `/library/{itemId}/branch` to start from another component) answers the `shareId` of a private builder slate.
2. Grow the board on that slate: chat in the app, or `slates.applyOperations` with `workshop_edits`.
3. `POST /library/drafts` with `shareId`, `title`, `summary` and `category` saves it as your own component. You can add it to any slate at once.
4. `POST /library/submissions` with `kind: "component"` and the `itemId` sends it for review. From a script, the person agrees first.

A slate or presentation is submitted with `kind: "slate"` or `kind: "presentation"` and its `shareId`. You must own the slate or administer its team. Sending a published item again proposes an update: the published version stays until the update is approved.

| Status | Means |
| --- | --- |
| `draft` | Saved, private to you |
| `submitted` | Waiting for review |
| `in_review` | A reviewer has it open |
| `changes_requested` | Sent back to you with a message; submit again when it is ready |
| `published` | Public: anyone can find, use and change it |
| `rejected` | Not accepted, with the reason in the thread |
| `unpublished` | Taken out of the library; copies people made stay theirs |

## Review submissions (administrators)

Reviewing needs an administrator of the Slatebox server and, for a token, the `library:review` scope (**Review library submissions (administrators)**). Anyone else gets `403 reviewer_required`.

| Request | Does |
| --- | --- |
| `GET /library/review` | The queue, oldest first: `status` (`waiting` by default, `in_review`, `changes_requested`, `rejected`, `published`, `all`), `kind`, `source=migration` |
| `POST /library/review/{itemId}/open` | Make your private review copy of the waiting version, a slate you can change on the canvas |
| `POST /library/review/{itemId}/refine` | Ask for a change in plain words; `mode: "preview"` shows it, save keeps it |
| `PATCH /library/review/{itemId}` | Change the title, summary, description, category or search words |
| `POST /library/review/{itemId}/approve` | Publish the review copy as it stands, as a new version |
| `POST /library/review/{itemId}/changes` | Send it back with a message |
| `POST /library/review/{itemId}/reject` | Turn it down with a message |
| `POST /library/review/{itemId}/unpublish` | Take a published item out, with a message |

```js exec
const { items } = await slatebox.library.review.queue({})
const { reviewShareId } = await slatebox.library.review.open({ itemId: items[0].id })
await slatebox.library.review.refine({ itemId: items[0].id, message: 'rename it to Weekly retro' })
return slatebox.library.review.approve({ itemId: items[0].id, message: 'Thanks' })
```

"rename it to …", "put it in Decide" and "summary: …" are read without AI. Other requests use the AI connection chosen for **Library review and refinement** (`settings.ai.use.library`), which follows the conversation choice (`use.chat`) until you set one.
