---
title: Keep a connection when you reopen a slate
description: Make two native notes, link them, and round-trip the document through SlateJSON.
group: Canvas
demo: canvas
---

Select **Field recording** and click one of its round connectors. A new note appears, already connected and ready for typing. Type “Transcript” and press **Enter**. Drag the new note and its line follows. **Reset** brings back the original two notes.

To put the new note somewhere specific, drag the connector into open space instead of clicking it.

Everything works from the keyboard too. Tab to a note, press Space to select it, Tab to a connector and press Enter, then type the name.

To make the same connection in your own app, create both notes and save their relationship with the slate.

Start with the [single-file HTML example](../Developers/JavascriptLibrary/readme.md#quick-slate), or serve an HTML page containing this stylesheet and canvas container.

```html
<link rel="stylesheet" href="https://slatebox.com/assets/engine/slateboxjs.css">
<div id="slate" style="height:420px"></div>
```

Run the following in a `<script type="module">` on that page.

```js
import { Slate } from 'https://slatebox.com/assets/engine/slateboxjs.mjs'

const slate = new Slate('#slate')
const recording = slate.addNode({ id: 'audio', x: 60, y: 80, width: 170, height: 75, text: 'Field recording' })
const transcript = slate.addNode({ id: 'words', x: 340, y: 80, width: 170, height: 75, text: 'Transcript' })
await Promise.all([recording.ready, transcript.ready])
recording.relationships.addAssociation(transcript)
const saved = slate.exportJSON()
await slate.loadJSON(saved)
slate.fitToContent()
console.log(slate.getNode('audio').relationships.associations.map(link => link.childId))
```

Expect `['words']` and a visible line between the two notes. Store the exported JSON string in your application’s document store to reopen it in a later session.

[Open a blank slate](https://app.slatebox.com/new)
