---
title: Export and import Mermaid
description: Write any slate as Mermaid text, or draw Mermaid as real notes and lines. Free on every slate, in the app, over HTTP and from an exec script.
---

# Export and import Mermaid

Any slate you can open comes out as Mermaid text, and a Mermaid flowchart, mind map or Gantt chart goes in as real notes and lines. It is free, uses no AI, and works the same on Slatebox Cloud and on your own server.

## Export a slate

1. In the slate, open the slate menu and choose **Mermaid**. The **Export** tab shows the slate as Mermaid.
2. Pick a **Format** if you want another kind of diagram than the one chosen for you. Turn on **Include colors** to keep each note's colors.
3. Choose **Copy Mermaid**, **Copy as Markdown**, **Download .mmd** or **Download .md**.

You can also open it from **Export → Mermaid: export or import**. A guest registers first, as for any export.

| Format | What you get |
| --- | --- |
| Automatic | A mind map that is one tree as `mindmap`; anything else as `flowchart` |
| Flowchart | Notes and lines. Direction comes from the way the lines run. Shapes, labels, arrowheads and dotted, thick or hidden lines are kept; a note drawn behind the notes it holds becomes a `subgraph`; a workshop's lanes become subgraphs of their cards |
| Mind map | The tree under the root note |
| Gantt chart | Launch plans only. Each lane is a section, each card's points are days, and the chart starts today |

What Mermaid cannot say is listed as a warning, never dropped quietly. Mermaid has one broken-line style, so a dashed line is written as dotted. A line with an arrow only at its start is written from its other end. A line from a note to itself is left out.

### Share a public slate's Mermaid

A public slate also has a plain-text address that always shows the slate as it is now. The **Export** tab shows it as **Public Mermaid address**.

| Address | Returns |
| --- | --- |
| `/slates/your-share-id.mmd` | The Mermaid, as `text/plain` |
| `/slates/your-share-id.md` | The same, in a Markdown code block |

Add `?format=mindmap` (or `flowchart`, `gantt`) to choose the format. It needs no token. A private slate answers `404`.

## Import Mermaid

1. In a slate you can edit, open the slate menu, choose **Mermaid**, then **Import**.
2. Paste Mermaid, or choose **Open a file** for a `.mmd` file or a Markdown file with a Mermaid block. A line such as “Ready: a flowchart of 3 notes and 2 lines, in 1 frame.” says what will be drawn.
3. Choose **Add to this slate** or **Open as a new slate**.

You get real notes and lines laid out in the diagram's direction. Subgraphs and Gantt sections arrive as frames. Everyone on the slate sees the diagram drawn.

| Mermaid | Read |
| --- | --- |
| `flowchart` and `graph` | Every link form, chains, `&`, subgraphs, `@{ shape: … }`, `classDef`, `class` and `style` colors, and `click` links to web pages |
| `mindmap` | The tree, with its node shapes |
| `gantt` | Sections as frames and tasks as notes; durations stay in the note's text |
| Any other kind | Refused by name, and nothing is added |

One import takes up to 100,000 characters and 1,000 notes, counting frames.

## Export and import from an exec script

Agents use the same two calls on every surface: the hosted MCP endpoint, the `slatebox` command and `POST /api/v1/exec`. Save the script as `mermaid.js`:

<!-- tabs -->

```js JavaScript
const shareId = "your-share-id"
const { mermaid, warnings } = await slatebox.slates.exportMermaid({ shareId })

const drawn = await slatebox.slates.importMermaid({
  mermaid: "flowchart LR\n  idea --> plan --> ship",
  name: "From the README",
})
return { mermaid, warnings, url: drawn.url, notes: drawn.notes }
```

```ts TypeScript
const shareId: string = "your-share-id"
const { mermaid, warnings } = await slatebox.slates.exportMermaid({ shareId })

const drawn = await slatebox.slates.importMermaid({
  mermaid: "flowchart LR\n  idea --> plan --> ship",
  name: "From the README",
})
return { mermaid, warnings, url: drawn.url, notes: drawn.notes }
```

<!-- /tabs -->

Preview it first. The Node.js and Python tabs use the `exec.mjs` and `exec.py` helpers from [Run a script](../Developers/SlateboxAPI/terminal-and-agents.md#run-a-script).

<!-- tabs -->

```sh Node.js
node exec.mjs mermaid.js --preview
```

```sh Python
python3 exec.py mermaid.js --preview
```

```sh curl
jq -n --rawfile code mermaid.js --arg key "$(uuidgen)" \
  '{intent: "Export and import Mermaid", code: $code, mode: "preview", idempotencyKey: $key}' |
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" -H 'Content-Type: application/json' \
  --data @- "$SLATEBOX_BASE_URL/api/v1/exec"
```

```sh CLI
npx --no-install slatebox exec mermaid.js --remote --preview
```

<!-- /tabs -->

The result holds the slate's Mermaid and what the import would draw; a preview saves nothing. Run it again without `--preview` (or with `mode: "save"`) to create the new slate. Leave out `name` and pass `shareId` to `importMermaid` to add the diagram to a slate you can edit.

| Call | Input | Returns |
| --- | --- | --- |
| `slatebox.slates.exportMermaid` | `shareId`, `format` (`auto`, `flowchart`, `mindmap`, `gantt`), `styles`, `start` (a Gantt chart's first day, `YYYY-MM-DD`) | `mermaid`, `markdown`, `format`, `formats`, `warnings`, `publicUrl` |
| `slatebox.slates.importMermaid` | `mermaid` (or Markdown with a Mermaid block), `shareId` or `name` | `shareId`, `url`, `kind`, `notes`, `frames`, `lines`, `created`, `warnings`, `message` |

## Export and import over HTTP

Read a slate as Mermaid with `slates:read`. A public slate needs no token.

<!-- tabs -->

```js Node.js
const res = await fetch(`${process.env.SLATEBOX_BASE_URL}/api/v1/slates/${process.env.SLATEBOX_SHARE_ID}/mermaid?format=auto`, {
  headers: { Authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}` },
})
const { mermaid, warnings } = await res.json()
console.log(mermaid, warnings)
```

```python Python
import os, requests

res = requests.get(
    f"{os.environ['SLATEBOX_BASE_URL']}/api/v1/slates/{os.environ['SLATEBOX_SHARE_ID']}/mermaid",
    params={"format": "auto"},
    headers={"Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}"},
)
body = res.json()
print(body["mermaid"], body["warnings"])
```

```sh curl
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  "$SLATEBOX_BASE_URL/api/v1/slates/$SLATEBOX_SHARE_ID/mermaid?format=auto"
```

<!-- /tabs -->

You get `200` with `mermaid`, `markdown` and any `warnings`.

Draw Mermaid with `slates:write`. Send `shareId` to add to that slate, or leave it out for a new private slate. Send `"mode": "preview"` to see the counts without saving.

<!-- tabs -->

```js Node.js
const res = await fetch(`${process.env.SLATEBOX_BASE_URL}/api/v1/slates/mermaid`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.SLATEBOX_API_TOKEN}`,
    'Idempotency-Key': crypto.randomUUID(),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ mermaid: 'flowchart LR\n  idea --> plan --> ship', name: 'From the README' }),
})
console.log(res.status, await res.json())
```

```python Python
import os, uuid, requests

res = requests.post(
    f"{os.environ['SLATEBOX_BASE_URL']}/api/v1/slates/mermaid",
    headers={
        "Authorization": f"Bearer {os.environ['SLATEBOX_API_TOKEN']}",
        "Idempotency-Key": str(uuid.uuid4()),
    },
    json={"mermaid": "flowchart LR\n  idea --> plan --> ship", "name": "From the README"},
)
print(res.status_code, res.json())
```

```sh curl
curl --fail-with-body --silent --show-error \
  -H "Authorization: Bearer $SLATEBOX_API_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H 'Content-Type: application/json' \
  --data '{"mermaid":"flowchart LR\n  idea --> plan --> ship","name":"From the README"}' \
  "$SLATEBOX_BASE_URL/api/v1/slates/mermaid"
```

<!-- /tabs -->

You get `201` with the new slate's `shareId` and `url`, and `notes: 3`, `lines: 2`. A retry with the same key returns the original result.

## What a round trip keeps

Mermaid → slate → Mermaid keeps the notes, labels, lines, arrowheads and subgraphs, and a second trip writes the same text.

| Changes | Why |
| --- | --- |
| A shape with no slate counterpart becomes the nearest one (a cylinder or subroutine becomes a rectangle) | The slate has no such shape |
| `o` and `x` line ends become arrows | The slate draws arrowheads only |
| Two lines between the same two notes become one | A slate holds one line per pair |
| An id a note cannot hold changes (`v1.2` becomes `v1_2`) | Note ids take letters, digits, `-` and `_` |

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| “This is a sequence diagram, which it can't draw as notes yet, so nothing was added.” | Only flowcharts, mind maps and Gantt charts are drawn. Export them from your source as one of those. |
| `400 mermaid_invalid` naming a line | Fix that line. Write `A -- text --> B` with spaces around the label. |
| `422 mermaid_too_large` | Split the diagram: one import takes up to 1,000 notes and 5,000 lines, frames up to 50 deep. |
| **Mermaid** is missing from the slate menu | You can read this slate but not change it. A public slate's Mermaid is still at its `.mmd` address. |
| **Gantt chart** is not in the Format list | Gantt is offered for launch plans only. |
