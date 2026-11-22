# Node methods

## Agent prompt

```text
Help me implement “Node methods” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/JavascriptLibrary/node-methods.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/JavascriptLibrary/node-methods.md.
```

Change a note through the node that `slate.addNode()` returns. The examples use `evidence` and `decision` from the [quick slate](readme.md#quick-slate).

## Position, size and rotation

<!-- tabs -->

```js JavaScript
decision.position(330, 140)
decision.setSize(200, 80)
decision.setRotation(12)
```

```ts TypeScript
import type { Node } from 'slateboxjs'

declare const decision: Node

decision.position(330, 140)
decision.setSize(200, 80)
decision.setRotation(12)
```

<!-- /tabs -->

Positions and sizes are in board coordinates. Angles are in degrees. To animate a rotation, add a duration in milliseconds: `decision.setRotation(90, 200)`. [Motion and easing](easing.md)

## Text, colors and shape

<!-- tabs -->

```js JavaScript
evidence.setText('Four rider interviews')
evidence.setColors('#cbe8d2', '#385c49')
evidence.setShape('ellipse')
```

```ts TypeScript
import type { Node } from 'slateboxjs'

declare const evidence: Node

evidence.setText('Four rider interviews')
evidence.setColors('#cbe8d2', '#385c49')
evidence.setShape('ellipse')
```

<!-- /tabs -->

`setColors(backgroundColor, borderColor)` sets the fill and border. `setShape(shape, vectorPath)` takes optional SVG path data as its second argument.

## Order, visibility and locks

| Method | Effect |
| --- | --- |
| `toFront()` | Raises the note above overlapping items |
| `toBack()` | Sends the note behind other items |
| `hide()`, `show()` | Hides the rendered note, then shows it again |
| `lock()`, `unlock()` | Locks the note against interactive edits, then releases it |

To delete a note from the document, call `slate.removeNode(decision.id)`.

## Images and links

<!-- tabs -->

```js JavaScript
decision.images.set('https://example.com/bench.png', 64, 64)
decision.links.set({ type: 'url', data: 'https://slatebox.com' })
```

```ts TypeScript
import type { Node } from 'slateboxjs'

declare const decision: Node

decision.images.set('https://example.com/bench.png', 64, 64)
decision.links.set({ type: 'url', data: 'https://slatebox.com' })
```

<!-- /tabs -->

`images.set(url, width, height)` fills the note with an image. Use an address your readers can load. `images.clear()` removes the image and `links.unset()` removes the link.

## Filters

`node.filters.apply(name)` adds a named effect. `node.filters.isActive(name)` reports it and `node.filters.remove(name)` removes it. `getFilterNames()`, exported by `slateboxjs`, lists the registered names.

## Zoom and connections

Zoom belongs to the slate: see [zoom and pan](slate-methods.md#zoom-and-pan). Connections belong to the note's relationships: see [relationship methods](association-methods.md).
