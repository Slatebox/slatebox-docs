# Slate methods

## Agent prompt

```text
Help me implement “Slate methods” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/JavascriptLibrary/slate-methods.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/JavascriptLibrary/slate-methods.md.
```

A `Slate` manages the board, its viewport and serialization. Start with the [quick slate](readme.md#quick-slate).

## nodes.add

`slate.nodes.add(options)` creates a node and returns it. `slate.addNode(options)` also runs slate-level notification and collaboration hooks. Use a stable ID when code needs to look up the same object after reload.

## nodes.remove

`slate.removeNode('decision')` removes a node through the slate. `slate.getNode('decision')` finds a node by ID. `slate.getAllNodes()` returns the current nodes.

## exportJSON

```js
const saved = slate.exportJSON()
localStorage.setItem('decision-map', saved)
```

The result is a string. Use `slate.snapshot()` for an in-memory document object.

## loadJSON

```js
const saved = localStorage.getItem('decision-map')
if (saved) await slate.loadJSON(saved)
```

Loading is asynchronous. Look up nodes again after loading. A browser's local storage is specific to that origin and browser.

## svg

`slate.svg()` returns SVG markup representing the board. Use it to produce a vector illustration.

## png

`await slate.png()` renders a raster export asynchronously. The result type is a string or Blob depending on export options.

## canvas.zoom

The direct API exposes `slate.zoom(level)`, `slate.zoomBy(factor)` and `slate.getZoom()`. Use `slate.fitToContent()` after populating a diagram to frame the entire board.

## canvas.move

Use `slate.pan({x, y})` or `slate.panBy({x, y})` to reposition the viewport. Node coordinates identify positions in the diagram.

## applyTheme

`slate.applyTheme(theme)` applies a theme definition. [Theme example](themeExample.md)

## getOrientation

`slate.getOrientation()` reports content bounds. For common framing tasks use `slate.fitToContent()` or `slate.centerContent()`. Older examples refer to `scaleToFitAndCenter`, `scaleToFitNodes` or `centerOnNodes` on the compatibility interface.

## slate.grid.show

`slate.grid.show()` displays the grid. Use `slate.grid.hide()` to turn it off again.

## slate.grid.destroy

Use `slate.grid.hide()` to hide a grid you plan to show again. Use `slate.destroy()` when unmounting the entire canvas.

## scaleToFitAndCenter

For whole-board framing on the direct API use `slate.fitToContent()`.

## scaleToFitNodes

Legacy integrations sometimes frame a selected subset. `slate.fitToContent()` frames the whole canvas. A subset view requires an explicit viewport calculation from the chosen nodes.

## centerOnNodes

For whole-board centering use `slate.centerContent()`. For a custom view, set pan and zoom from the bounds you intend to show.
