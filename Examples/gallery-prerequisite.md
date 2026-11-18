# Hang the coast before the moon

## Agent prompt

```text
Help me try the Slatebox example “Hang the coast before the moon”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/gallery-prerequisite.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/gallery-prerequisite.md.
```

Start with the dunes already hanging. In your own exhibit, make the coast the next piece. The physical positions of the three frames can stay the same while the hanging order changes.

Run this with the pinned SlateboxJS file build. The `after` field names the panel that must already be on the wall.

```js
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

Expect `false true` before placing the coast and `true` afterward. The saved panel IDs are now `dunes` and `coast`. Supply the validated exhibit to `MoonGalleryBoard` to try the same rule by dragging.

[Create an editable gallery](https://app.slatebox.com/new/moon-gallery)
