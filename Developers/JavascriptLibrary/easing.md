# Motion and easing

## Agent prompt

```text
Help me implement “Motion and easing” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/JavascriptLibrary/easing.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/JavascriptLibrary/easing.md.
```

To animate a move, pass a duration in milliseconds as the fifth argument to `node.position`. The SVG.js-based implementation moves in board coordinates using an ease-in-out quadratic curve. Its fourth argument is retained for compatibility. The historical list of named easing strings belongs to the earlier renderer.

```js
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
decision.position(340, 150, undefined, undefined, reduceMotion ? 0 : 240)
```

For an immediate move use `decision.position(340, 150)`. To perform work when the move finishes, supply a callback as the third argument. [Node methods](node-methods.md)
