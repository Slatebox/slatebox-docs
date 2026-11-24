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

Public reads answer with `Cache-Control: public` and `Access-Control-Allow-Origin: *`, so a web page on any site can call them. Shared caches keep a list or an item for at most a minute, so an item taken out of the library stops being served soon after. Answers to a token are never cached. An item that is not published answers `404` to everyone but its author and reviewers.

Each person has a daily allowance: 10 submissions, 200 saves, 50 new builder slates, 100 copies and 100 messages in review threads. Past it the answer is `429` (`submit_limit` for submissions, `library_limit` for the rest) with a sentence saying when to try again. Browsing has no allowance.

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

`mode: "preview"` answers the board and where it would go (`canvas`) and saves nothing.

### Every operation on every surface

Each operation is one server method, so the app, the HTTP API, exec, the MCP server and the terminal make the same checks and record the same audit line.

| HTTP | Exec client | MCP tool |
| --- | --- | --- |
| `GET /library` | `slatebox.library.list` | `list_library` |
| `GET /library/{itemId}` | `slatebox.library.get` | `get_library_item` |
| `GET /library/stats` | `slatebox.library.stats` | `get_library_stats` |
| `GET /library/export` | `slatebox.library.export` | `export_library` |
| `GET /library/mine` | `slatebox.library.mine` | `list_my_library` |
| `POST /library/{itemId}/fork` | `slatebox.library.fork` | `use_library_item` |
| `POST /library/{itemId}/branch` | `slatebox.library.branch` | `branch_library_component` |
| `POST /library/drafts` | `slatebox.library.saveDraft` | `save_library_draft` |
| `POST /library/submissions` | `slatebox.library.submit` | `submit_to_library` |
| `POST /library/{itemId}/withdraw` | `slatebox.library.withdraw` | `withdraw_library_item` |
| `DELETE /library/{itemId}` | `slatebox.library.discard` | `discard_library_draft` |
| `POST /library/{itemId}/comments` | `slatebox.library.comment` | `comment_on_library_item` |
| `GET /library/review` | `slatebox.library.review.queue` | `list_library_queue` |
| `POST /library/review/{itemId}/open` | `slatebox.library.review.open` | `open_library_review` |
| `POST /library/review/{itemId}/refine` | `slatebox.library.review.refine` | `refine_library_item` |
| `PATCH /library/review/{itemId}` | `slatebox.library.review.update` | `update_library_item` |
| `POST /library/review/{itemId}/approve` | `slatebox.library.review.approve` | `approve_library_item` |
| `POST /library/review/{itemId}/changes` | `slatebox.library.review.requestChanges` | `request_library_changes` |
| `POST /library/review/{itemId}/reject` | `slatebox.library.review.reject` | `reject_library_item` |
| `POST /library/review/{itemId}/unpublish` | `slatebox.library.review.unpublish` | `unpublish_library_item` |

`submit` and `approve` wait for a person's confirmation when a script or an agent calls them. In the terminal, run any of them through `slatebox exec`: [Terminal and agents](terminal-and-agents.md)

```sh
npx --no-install slatebox exec -e 'return slatebox.library.stats({})'
npx --no-install slatebox exec -e 'return slatebox.library.mine({})'
npx --no-install slatebox describe library
```
 A slate holds up to 8 boards; past that the fork answers `409 component_opens_new_slate`. When people on the slate have paused its agents, an agent's fork onto it answers `423 agents_paused`, as its edits do; so does an agent's kept refinement of a review copy. `slates.applyOperations` with an `add_component` operation also takes `library: { itemId }` in place of a catalog `component`.

## Build and submit a component

1. `POST /library/new/branch` (or `/library/{itemId}/branch` to start from another component) answers the `shareId` of a private builder slate.
2. Grow the board on that slate: chat in the app, or `slates.applyOperations` with `workshop_edits`.
3. `POST /library/drafts` with `shareId`, `title`, `summary` and `category` saves it as your own component. You can add it to any slate at once.
4. `POST /library/submissions` with `kind: "component"` and the `itemId` sends it for review. From a script, the person agrees first.

A slate or presentation is submitted with `kind: "slate"` or `kind: "presentation"` and its `shareId`. You must own the slate or administer its team. Sending a published item again proposes an update: the published version stays until the update is approved.

Saving a draft of a published component changes nothing the public reads. Its new details wait beside the published ones (`draftMeta`, shown only to you) and go public only with an update a reviewer approves. While an update waits for review (`submitted` or `in_review`), you can't save over it or send another; withdraw it first.

| Status | Means |
| --- | --- |
| `draft` | Saved, private to you |
| `submitted` | Waiting for review |
| `in_review` | A reviewer has it open |
| `changes_requested` | Sent back to you with a message; submit again when it is ready |
| `published` | Public: anyone can find, use and change it |
| `rejected` | Not accepted, with the reason in the thread |
| `unpublished` | Taken out of the library; copies people made stay theirs |

### After you submit

- **The review thread.** Every item has one thread: your note, the reviewer's messages and each status change. `GET /library/mine` returns it with the status. Write in it with `POST /library/{itemId}/comments` and `message`.
- **Notices.** When a reviewer publishes your item, asks for changes, turns it down, takes it out or writes to you, you get a notice in the app and an email (where the server sends email), with their message and a link to My library.
- **Changes asked for.** The item comes back as `changes_requested`. Change it (for a component, on its builder slate, then `POST /library/drafts` again), then `POST /library/submissions` with the same `itemId` to send it again.
- **What is published.** The reviewer can refine your submission on a private copy before approving. What is published is that copy, so it may differ a little from what you sent. Your own slate or builder slate is never changed.
- **Take it back.** `POST /library/{itemId}/withdraw` takes back a waiting submission. On a published item with an update waiting, it takes back only the update: the published version stays, and the update is your draft again. On a published item with nothing waiting, it takes the item out of the library. An update a reviewer has open can't be taken back; write to them instead. Copies people already made stay theirs.
- **What you see of the thread.** You see your messages, the reviewer's messages and every decision, and when a reviewer kept a change, what changed. You don't see the reviewer's own chat with the refine AI, or anyone's account id.
- **Version numbers.** `publishedCount` says how many times an item has been published once it is more than one; absent means once. The app shows "Version 1" for the first publication.

### Rules set with the controls on the board

On a builder slate, the controls drawn on the board (a lane's limit line, its − and +, the arrows between lanes, a lane's bin, a plan's snap and a launch line's hard or soft) make the same rule edits that chat, exec and `workshop_edits` make. Each rule records who set it, when, and how: `set.via` is `"canvas"` for a control, beside `"chat"` and `"exec"`. A control's change is saved on its own, never in the same save as a card move or rename: "Change the rules on their own, then move cards."

## Review submissions (administrators)

Reviewing needs an administrator of the Slatebox server and, for a token, the `library:review` scope (**Review library submissions (administrators)**). Anyone else gets `403 reviewer_required`.

A second person reviews what someone publishes: an administrator can't open, refine, edit or approve their own submission (`403 self_review`). On a server with one administrator, add `selfReview: true` to those calls; the thread records that the author reviewed it.

| Request | Does |
| --- | --- |
| `GET /library/review` | The queue, oldest first: `status` (`waiting` by default, `in_review`, `changes_requested`, `rejected`, `published`, `all`), `kind`, `source=migration` |
| `POST /library/review/{itemId}/open` | Make your private review copy of the waiting version, a slate you can change on the canvas |
| `POST /library/review/{itemId}/refine` | Ask for a change in plain words; `mode: "preview"` shows it and answers a `previewId`; save with that `previewId` keeps exactly what was shown |
| `PATCH /library/review/{itemId}` | Change the title, summary, description, category or search words |
| `POST /library/review/{itemId}/approve` | Publish the review copy as it stands, as a new version |
| `POST /library/review/{itemId}/changes` | Send it back with a message |
| `POST /library/review/{itemId}/reject` | Turn it down with a message |
| `POST /library/review/{itemId}/unpublish` | Take a published item out, with a message |

```js exec
const { items } = await slatebox.library.review.queue({})
const { reviewShareId } = await slatebox.library.review.open({ itemId: items[0].id })
const proposal = await slatebox.library.review.refine({ itemId: items[0].id, message: 'Write a clearer one-line summary', mode: 'preview' })
await slatebox.library.review.refine({ itemId: items[0].id, message: 'Write a clearer one-line summary', previewId: proposal.previewId })
return slatebox.library.review.approve({ itemId: items[0].id, message: 'Thanks' })
```

"rename it to …", "put it in Decide" and "summary: …" are read without AI. Other requests use the AI connection chosen for **Library review and refinement** (`settings.ai.use.library`), which follows the conversation choice (`use.chat`) until you set one.

A preview is kept for half an hour; keeping one that has gone answers `409 preview_expired` and asks nothing of the AI. The proposal's `check` lists what to look at before publishing, starting with any email address or long number the server finds in the item, whatever the AI says. The AI is given the item as data in the request, never as instructions.

A slate moved from Community slates that its owner never sent again is published only while it is still public: if the owner has made it private or deleted it, opening or approving it answers `409 source_not_public`. Once the owner sends it again, it is their submission like any other.
