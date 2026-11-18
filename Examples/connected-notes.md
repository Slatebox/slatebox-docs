---
title: Keep a connection when you reopen a slate
description: Make two native notes, link them, and round-trip the document through SlateJSON.
group: Canvas
demo: canvas
---

In the live canvas, select **Field recording**. Click its left round connector to add a blank note in the space beside it, or drag the connector into open space to place the note there. Select the new note, press **F2**, type “Transcript” and press **Enter**. Move the transcript to see the line follow. Choose **Reset** to return to the original two notes.

With a keyboard, Tab to **Field recording** and press Space to select it. Tab through the direction buttons to **Add connected note to the left** and press Enter. The new blank note receives focus. Press F2, type “Transcript” and press Enter to keep the name. Escape from a direction button returns you to the source note.

To reproduce that connection in your own app, create both notes and save their relationship with the slate.

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
