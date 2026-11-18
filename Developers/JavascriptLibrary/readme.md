# SlateboxJS

## Introduction

SlateboxJS creates an editable SVG diagram inside a DOM element. Use it when your application owns the page, storage and access controls. To operate on a slate already stored in the hosted app, use the [HTTP API](../SlateboxAPI/readme.md).

## Quick Slate

These examples target the SVG.js-based `slateboxjs-v2` source build. With access to the matching engine checkout, build it, pack it, then install that file into your Vite or equivalent browser project.

```sh
# In the engine checkout
npm ci
npm run build
npm pack
```

In your own project run `npm install /absolute/path/to/the-generated.tgz`, substituting the archive path printed by `npm pack`. Give the canvas a visible height in your HTML.

```html
<div id="board" aria-label="Decision map" style="width:100%;height:420px"></div>
<script type="module" src="/src/board.js"></script>
```

Create `src/board.js`:

```js
import { Slate } from 'slateboxjs'
import 'slateboxjs/style.css'

const slate = new Slate('#board', { name: 'Decision map' })
const evidence = slate.addNode({
  id: 'evidence', x: 30, y: 80, width: 170, height: 70,
  shape: 'rectangle', text: 'Rider interviews', backgroundColor: '#d8edda'
})
const decision = slate.addNode({
  id: 'decision', x: 300, y: 80, width: 180, height: 70,
  shape: 'rectangle', text: 'Pilot the transfer'
})
await Promise.all([evidence.ready, decision.ready])
const edge = evidence.relationships.addAssociation(decision, { showChildArrow: true })
slate.fitToContent()
```

Drag either node to see the connector follow. The reference examples use the same `slate`, `evidence`, `decision` and `edge` variables. Call `slate.destroy()` when unmounting the view.

## Development

Save a document with `slate.exportJSON()` and restore it with `await slate.loadJSON(saved)`. Exported board JSON can be stored in your own backend. The library creates local objects, while persistence, invitations and calls belong to the host application. [Slate methods](slate-methods.md) · [Node properties](node-properties.md) · [Relationships](association-methods.md)
