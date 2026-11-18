# SlateboxJS

## Introduction

SlateboxJS creates an editable SVG diagram inside a DOM element. Use it when your application owns the page, storage and access controls. To operate on a slate already stored in the hosted app, use the [HTTP API](../SlateboxAPI/readme.md).

Working with an existing integration that calls `new Slatebox.slate(...)`? See [SlateboxJS 2.x and the current canvas](../slateboxjs-api.md).

## Quick Slate

Build a two-note decision map in a single HTML file. Move the notes, give one a new name, then save and reload to see the same map and connection. [Run the listening bench](/assets/examples/quick-slate.html) · <a href="/assets/examples/quick-slate.html" download="quick-slate.html">Download the HTML</a>

To run it on your computer, open a terminal in the folder containing the downloaded file and start a local server.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/quick-slate.html`. The downloadable example includes its MIT license and imports the same public SlateboxJS browser module and stylesheet used in the docs. It needs an internet connection to load them. The board saves to this browser on this origin. To use your own subject, change the two `text` values in the HTML before the first save, or rename the notes on the canvas.

### Connect two notes

To create a new connected note with the pointer or keyboard, follow the [connected-notes exercise](../../Examples/connected-notes.md).

The example gives each note a stable ID and a visible label. Once both notes are ready, connect the observation to the decision. These are the variables used in the library reference.

```js
const evidence = slate.addNode({
  id: 'evidence', x: 40, y: 80, width: 180, height: 84,
  text: 'Visitors stop to listen'
})
const decision = slate.addNode({
  id: 'decision', x: 300, y: 135, width: 180, height: 84,
  text: 'Set a bench by the speaker'
})
await Promise.all([evidence.ready, decision.ready])
const edge = evidence.relationships.addAssociation(decision, { showChildArrow: true })
slate.fitToContent()
```

To make a move change what the audience sees, try the [entrance rehearsal](../../Examples/theatre-cues.md). Moving a lighting cue lets the crew preview the doorway before committing the change.

### Use a pinned package in your application

With access to a matching SVG.js-based `slateboxjs-v2` checkout, build the engine and pack it locally.

```sh
npm ci
npm run build
npm pack
```

Install the archive path printed by `npm pack` in your browser project. Use the package imports below in place of the hosted module and stylesheet. Give `#board` a visible height in your HTML.

```js
import { Slate } from 'slateboxjs'
import 'slateboxjs/style.css'

const slate = new Slate('#board', { name: 'Listening bench' })
```

Call `slate.destroy()` when unmounting the view.

## Development

Save a document with `slate.exportJSON()` and restore it with `await slate.loadJSON(saved)`. Exported board JSON can be stored in your own backend. The library creates local objects, while persistence, invitations and calls belong to the host application. [Slate methods](slate-methods.md) · [Node properties](node-properties.md) · [Relationships](association-methods.md)
