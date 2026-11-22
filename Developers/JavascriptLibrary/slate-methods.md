# Slate methods

A `Slate` owns the board, its viewport and saving. The examples use `slate` from the [quick slate](readme.md#quick-slate).

## Add and find notes

| Method | Effect |
| --- | --- |
| `slate.addNode(options)` | Creates a note and returns it. Also updates the birds-eye view, announces the note to screen readers and broadcasts it to collaborators. |
| `slate.nodes.add(options)` | Creates a note and returns it, without those notifications |
| `slate.getNode(id)` | Returns the note with that ID |
| `slate.getAllNodes()` | Returns every note |
| `slate.removeNode(id)` | Removes the note |

Give notes stable IDs when code must find them again after a reload. [Node properties](node-properties.md)

## Save and load

<!-- tabs -->

```js JavaScript
localStorage.setItem('decision-map', slate.exportJSON())

const saved = localStorage.getItem('decision-map')
if (saved) await slate.loadJSON(saved)
```

```ts TypeScript
import type { Slate } from 'slateboxjs'

declare const slate: Slate

localStorage.setItem('decision-map', slate.exportJSON())

const saved: string | null = localStorage.getItem('decision-map')
if (saved) await slate.loadJSON(saved)
```

<!-- /tabs -->

`exportJSON()` returns a string. `snapshot()` returns the same document as an object. Loading is asynchronous, so look up notes again after it finishes. Browser storage belongs to one browser on one origin.

## Export an image

`slate.svg()` returns SVG markup. `await slate.png()` returns a PNG data URL. Pass `{ asBinary: true }` for a `Blob` or `{ base64: true }` for the bare base64 text.

## Zoom and pan

| Method | Effect |
| --- | --- |
| `slate.zoom(level)`, `slate.zoomBy(factor)` | Sets or multiplies the zoom (1 is 100%) |
| `slate.zoomAtPoint(level, {x, y})` | Zooms around a point |
| `slate.getZoom()` | Returns the zoom |
| `slate.pan({x, y})`, `slate.panBy({x, y})` | Moves the viewport to a point or by an offset |
| `slate.fitToContent()` | Frames every note |
| `slate.centerContent()` | Centers the notes without zooming |
| `slate.fitToWidth({x, y, width, height}, padding, maxZoom)` | Frames one region, such as a group of notes |
| `slate.getOrientation()` | Returns the content bounds and whether they are landscape or portrait |

## Grid, theme and teardown

- `slate.grid.show()` and `slate.grid.hide()` show and hide the grid.
- `slate.applyTheme(theme)` restyles the board. [Apply a canvas theme](themeExample.md)
- `slate.destroy()` removes the slate when you unmount the view.
