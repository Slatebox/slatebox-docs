# Node methods

Edit the node returned by `slate.addNode()`. The examples extend the [quick slate](readme.md#quick-slate).

## position

```js
decision.position(330, 140)
decision.setSize(200, 80)
decision.setRotation(12)
```

Position is expressed in diagram coordinates and rotation in degrees. [Motion and easing](easing.md)

## editor.set

Older examples use nested editor, resize and color-picker helpers. The direct API accepts text and geometry through node methods.

```js
evidence.setText('Four rider interviews')
evidence.setColors('#cbe8d2', '#385c49')
evidence.setShape('ellipse')
```

## toFront

`decision.toFront()` raises the node above overlapping items.

## toBack

`decision.toBack()` sends it behind other items.

## hide

`decision.hide()` hides the rendered node.

## show

`decision.show()` shows it again. To remove it from the document use `slate.removeNode(decision.id)`.

## Lock and unlock

`decision.lock()` and `decision.unlock()` change its editing lock. For connections, operate on the node’s relationships manager. [Relationship methods](association-methods.md)

## move

Migrate coordinate moves to `node.position(x, y)`. [Position](#position)

## resize.set

Use `node.setSize(width, height)` to resize the node in board coordinates.

## rotate.set

Use `node.setRotation(angle)` for an absolute angle in degrees.

## spin

For a visible rotation to a target angle, supply a duration in milliseconds, for example `node.setRotation(90, 200)`.

## zoom

Zoom belongs to the viewport. `slate.zoomAtPoint(level, point)` anchors a zoom at a point. [Viewport methods](slate-methods.md#canvaszoom)

## disable

Use `node.lock()` when the intent is to lock an item against interactive edits.

## enable

Use `node.unlock()` to release the lock.

## colorPicker.set

`node.setColors(backgroundColor, borderColor)` updates the fill and border in the direct API.

## customShapes.set

Use `node.setShape(shape, vectorPath)` to update a shape. The optional second argument supplies SVG path data.

## images.set

Use `node.images.set(url, width, height)` for an image fill and `node.images.clear()` to remove it. Use an image origin available to your readers.

## links.set

`node.links.set({type: 'url', data: 'https://slatebox.com'})` attaches a URL.

## links.unset

`node.links.unset()` removes the existing link.

## toggleFilters

When porting an old global filter toggle, identify the named filter being used. The current filter manager exposes per-filter state through `isActive(name)` and removal through `remove(name)`.
