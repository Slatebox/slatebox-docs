# SlateboxJS

## Agent prompt

```text
Help me implement “SlateboxJS” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/JavascriptLibrary/readme.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/JavascriptLibrary/readme.md.
```

SlateboxJS draws an editable SVG diagram inside a DOM element. Use it when your application owns the page, the storage and the access rules. To change a slate stored in Slatebox, use the [HTTP API](../SlateboxAPI/readme.md).

To build a playable board, pass a workshop model and an element. [Mount a map from plain JavaScript](creative-slates.md#mount-a-map-from-plain-javascript)

## Quick slate

Build a two-note decision map in one HTML file. Move the notes, rename one, then save and reload: the map and its connection come back. [Run the listening bench](/assets/examples/quick-slate.html) · <a href="/assets/examples/quick-slate.html" download="quick-slate.html">Download the HTML</a>

To run the download on your computer, start a local server in its folder:

<!-- tabs -->

```sh Node.js
npx --yes http-server -p 8000 -a 127.0.0.1
```

```sh Python
python3 -m http.server 8000 --bind 127.0.0.1
```

<!-- /tabs -->

Open `http://127.0.0.1:8000/quick-slate.html`. You get the map, saved in this browser.

- The page loads the SlateboxJS module and stylesheet from slatebox.com, so it needs an internet connection.
- To change the subject, edit the two `text` values before the first save, or rename the notes on the canvas.
- The file carries its MIT license.

### Connect two notes

Give each note a stable ID and a label. Wait until both are ready, then connect them. The reference pages use these names: `slate`, `evidence` and `decision`.

<!-- tabs -->

```js JavaScript
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

```ts TypeScript
import type { Association, Node, Slate } from 'slateboxjs'

declare const slate: Slate

const evidence: Node = slate.addNode({
  id: 'evidence', x: 40, y: 80, width: 180, height: 84,
  text: 'Visitors stop to listen'
})
const decision: Node = slate.addNode({
  id: 'decision', x: 300, y: 135, width: 180, height: 84,
  text: 'Set a bench by the speaker'
})
await Promise.all([evidence.ready, decision.ready])
const edge: Association = evidence.relationships.addAssociation(decision, { showChildArrow: true })
slate.fitToContent()
```

<!-- /tabs -->

You get two notes joined by an arrow, framed in the view. To add notes with the pointer or keyboard, try [connected notes](../../Examples/connected-notes.md). To make a move change what an audience sees, try the [entrance rehearsal](../../Examples/theatre-cues.md).

### Install the package

1. In a clone of the [SlateboxJS repository](https://github.com/Slatebox/slateboxjs), build and pack the engine:

   ```sh
   npm ci
   npm run build
   npm pack
   ```

2. In your browser project, run `npm install` with the archive path that `npm pack` printed.
3. Import the module and stylesheet, and create the slate in an element with a visible height:

<!-- tabs -->

```js JavaScript
import { Slate } from 'slateboxjs'
import 'slateboxjs/style.css'

const slate = new Slate('#board', { name: 'Listening bench' })
```

```ts TypeScript
import { Slate } from 'slateboxjs'
import 'slateboxjs/style.css'

const slate: Slate = new Slate('#board', { name: 'Listening bench' })
```

<!-- /tabs -->

Types ship with the package. Call `slate.destroy()` when you unmount the view.

## Save and load

`slate.exportJSON()` returns the board as a JSON string. `await slate.loadJSON(saved)` restores it. Store the JSON in your own backend.

SlateboxJS only creates the board in the page. Your application handles persistence, invitations and calls. [Slate methods](slate-methods.md) · [Node properties](node-properties.md) · [Relationships](association-methods.md)
