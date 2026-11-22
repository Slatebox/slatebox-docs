# Slate options

## Agent prompt

```text
Help me implement “Slate options” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/JavascriptLibrary/slate-properties.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/JavascriptLibrary/slate-properties.md.
```

Pass options as the second argument to `new Slate(container, options)`. The container is an element or a selector, and it needs a visible size before you create the slate.

| Option | Purpose |
| --- | --- |
| `name`, `description` | Names the board in its saved JSON |
| `containerStyle.backgroundColor` | Sets the canvas background |
| `viewPort.showGrid`, `viewPort.gridSize` | Shows a grid and sets its spacing |
| `viewPort.snapToGrid` | Snaps moves to the grid |
| `showbirdsEye`, `showZoom`, `showUndoRedo` | Shows the birds-eye view, zoom and undo controls |
| `allowDrag` | Turns dragging on or off |

<!-- tabs -->

```js JavaScript
import { Slate } from 'slateboxjs'

const slate = new Slate('#board', {
  name: 'Station plan',
  containerStyle: { backgroundColor: '#f8f6ef' },
  viewPort: { showGrid: true, gridSize: 20, snapToGrid: true }
})
```

```ts TypeScript
import { Slate } from 'slateboxjs'

const slate: Slate = new Slate('#board', {
  name: 'Station plan',
  containerStyle: { backgroundColor: '#f8f6ef' },
  viewPort: { showGrid: true, gridSize: 20, snapToGrid: true }
})
```

<!-- /tabs -->

You get a cream canvas with a 20-unit grid that notes snap to. These options do not control who can open a stored slate: enforce access in your server and relay. [Create the first notes](readme.md#quick-slate)
