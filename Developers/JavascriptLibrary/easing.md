# Motion and easing

To animate a move, pass a duration in milliseconds as the fifth argument to `node.position`. The SVG.js-based implementation moves in board coordinates using an ease-in-out quadratic curve. Its fourth argument is retained for compatibility. The historical list of named easing strings belongs to the earlier renderer.

```js
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
decision.position(340, 150, undefined, undefined, reduceMotion ? 0 : 240)
```

For an immediate move use `decision.position(340, 150)`. To perform work when the move finishes, supply a callback as the third argument. [Node methods](node-methods.md)
