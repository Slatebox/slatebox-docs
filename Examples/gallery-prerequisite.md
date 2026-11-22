# Hang the coast before the moon

## Agent prompt

```text
Help me try the Slatebox example “Hang the coast before the moon”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/gallery-prerequisite.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/gallery-prerequisite.md.
```

The dunes are already hanging. Make the coast the next piece: the three frames stay where they are, only the hanging order changes.

## Set the hanging order

Each panel's `after` field names the panel that must already be on the wall. Run this with Node.js in a project with [the `slateboxjs` package](../Developers/JavascriptLibrary/readme.md) installed.

<!-- tabs -->

```js Node.js
import { moonGallery, normalizeMoonGallery, canHangPanel, hangGalleryPanel } from 'slateboxjs/workshops/model'

const exhibit = normalizeMoonGallery({
  ...moonGallery,
  panels: moonGallery.panels.map(panel => ({
    ...panel,
    after: { dunes: null, coast: 'dunes', moon: 'coast' }[panel.id]
  }))
})
console.log(canHangPanel(exhibit, 'moon'), canHangPanel(exhibit, 'coast'))
const second = hangGalleryPanel(exhibit, 'coast')
console.log(canHangPanel(second, 'moon'), second.hung)
```

```ts TypeScript
import { moonGallery, normalizeMoonGallery, canHangPanel, hangGalleryPanel } from 'slateboxjs/workshops/model'

const order: Record<string, string | null> = { dunes: null, coast: 'dunes', moon: 'coast' }
const exhibit = normalizeMoonGallery({
  ...moonGallery,
  panels: moonGallery.panels.map(panel => ({ ...panel, after: order[panel.id] }))
})
if (!exhibit) throw new Error('The exhibit is not valid')
console.log(canHangPanel(exhibit, 'moon'), canHangPanel(exhibit, 'coast'))
const second = hangGalleryPanel(exhibit, 'coast')
console.log(canHangPanel(second, 'moon'), second.hung)
```

<!-- /tabs -->

```text Output
false true
true [ 'dunes', 'coast' ]
```

The moon cannot hang until the coast does. Pass the validated exhibit to `MoonGalleryBoard` to try the same rule by dragging.

[Create an editable gallery](https://app.slatebox.com/new/moon-gallery)
