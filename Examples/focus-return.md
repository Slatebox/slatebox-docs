# Return focus to the print that opened the viewer

## Agent prompt

```text
Help me try the Slatebox example “Return focus to the print that opened the viewer”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/focus-return.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/focus-return.md.
```

## Try it

1. Open the second print, **Silk moth**, then close its viewer. The return wire goes to the first print, so focus lands on **Fern**.
2. Wire the return to the opener and repeat. Focus now returns to **Silk moth**, and Tab moves on to the third print.

## Author the opener route in code

The darkroom model has no DOM, so it runs in Node.js. Use a project with [the `slateboxjs` package](../Developers/JavascriptLibrary/readme.md) installed.

<!-- tabs -->

```js Node.js
import { initialFocusDarkroom, describeFocusDarkroom } from 'slateboxjs/workshops/model'

const room = initialFocusDarkroom(new URLSearchParams({
  firstPrint: 'Contact sheet',
  secondPrint: 'Night negative',
  thirdPrint: 'First exposure',
  route: 'opener'
}))
console.log(describeFocusDarkroom(room))
```

```ts TypeScript
import { initialFocusDarkroom, describeFocusDarkroom, type FocusDarkroom } from 'slateboxjs/workshops/model'

const room: FocusDarkroom = initialFocusDarkroom(new URLSearchParams({
  firstPrint: 'Contact sheet',
  secondPrint: 'Night negative',
  thirdPrint: 'First exposure',
  route: 'opener'
}))
console.log(describeFocusDarkroom(room))
```

<!-- /tabs -->

```text Output
Contact sheet · Night negative · First exposure. Each viewer returns to the print that opened it.
```

Pass `room` to `FocusDarkroomBoard` and open **Night negative** to try that path.

[Open the darkroom with the return path attached](https://app.slatebox.com/new/focus-darkroom?route=opener)
