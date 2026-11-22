# Keep a connection when you reopen a slate

## Agent prompt

```text
Help me try the Slatebox example “Keep a connection when you reopen a slate”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/connected-notes.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/connected-notes.md.
```

## Add a connected note

1. Select **Field recording** and click one of its round connectors. A new note appears, already connected.
2. Type “Transcript” and press **Enter**.
3. Drag the new note. Its line follows.

To place the new note yourself, drag the connector into open space instead of clicking it. **Reset** brings back the original two notes.

From the keyboard: Tab to a note, press Space to select it, Tab to a connector, press Enter, then type the name.

## Do the same in your own app

Create both notes, connect them, and save the slate as JSON. The JavaScript version is one HTML file that loads SlateboxJS from slatebox.com. The TypeScript version uses the `slateboxjs` package, which ships its types, in a page with `<div id="slate" style="height:420px"></div>`.

<!-- tabs -->

```html JavaScript
<!doctype html>
<link rel="stylesheet" href="https://slatebox.com/assets/engine/slateboxjs.css">
<div id="slate" style="height:420px"></div>
<script type="module">
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
</script>
```

```ts TypeScript
import { Slate } from 'slateboxjs'
import 'slateboxjs/style.css'

const slate = new Slate('#slate')
const recording = slate.addNode({ id: 'audio', x: 60, y: 80, width: 170, height: 75, text: 'Field recording' })
const transcript = slate.addNode({ id: 'words', x: 340, y: 80, width: 170, height: 75, text: 'Transcript' })
await Promise.all([recording.ready, transcript.ready])
recording.relationships.addAssociation(transcript)

const saved: string = slate.exportJSON()
await slate.loadJSON(saved)
slate.fitToContent()
console.log(slate.getNode('audio')?.relationships.associations.map(link => link.childId))
```

<!-- /tabs -->

The console shows `['words']`, and a line joins the two notes. Store the `saved` string in your own database to reopen the slate later.

[Run a local copy of the quick-slate example](../Developers/JavascriptLibrary/readme.md#quick-slate) · [Open a blank slate](https://app.slatebox.com/new)
