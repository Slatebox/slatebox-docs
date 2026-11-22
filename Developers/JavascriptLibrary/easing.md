# Motion and easing

## Agent prompt

```text
Help me implement “Motion and easing” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/JavascriptLibrary/easing.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/JavascriptLibrary/easing.md.
```

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
