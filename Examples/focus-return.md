# Return focus to the print that opened the viewer

## Agent prompt

```text
Help me try the Slatebox example “Return focus to the print that opened the viewer”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/focus-return.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/focus-return.md.
```

Open the second print, **Silk moth**, then close its viewer. With the return wire connected to the first print, focus lands on **Fern**. Wire it to the opener and repeat. Focus now returns to **Silk moth** and Tab advances to the third print.

Use the DOM-free model from the pinned SlateboxJS file build to author the second route.

```js
import { initialFocusDarkroom, describeFocusDarkroom } from 'slateboxjs/workshops/model'

const room = initialFocusDarkroom(new URLSearchParams({
  firstPrint: 'Contact sheet',
  secondPrint: 'Night negative',
  thirdPrint: 'First exposure',
  route: 'opener'
}))
console.log(describeFocusDarkroom(room))
```

The description lists your three titles followed by “Each viewer returns to the print that opened it.” Pass `room` to `FocusDarkroomBoard` and open **Night negative** to exercise that path.

[Open the darkroom with the return path attached](https://app.slatebox.com/new/focus-darkroom?route=opener)
