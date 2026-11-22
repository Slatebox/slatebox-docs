# Motion and easing

To animate a move, pass a duration in milliseconds as the fifth argument to `node.position(x, y, callback, easing, duration)`. The note glides on an ease-in-out curve. The curve is fixed, so pass `undefined` as the fourth argument.

<!-- tabs -->

```js JavaScript
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
decision.position(340, 150, () => console.log('Moved'), undefined, reduceMotion ? 0 : 240)
```

```ts TypeScript
import type { Node } from 'slateboxjs'

declare const decision: Node

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
decision.position(340, 150, () => console.log('Moved'), undefined, reduceMotion ? 0 : 240)
```

<!-- /tabs -->

The callback runs when the note arrives. A duration of `0`, or `decision.position(340, 150)`, moves it at once. `node.setRotation(angle, duration)` uses the same curve. [Node methods](node-methods.md)
