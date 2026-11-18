---
title: Return focus to the print that opened the viewer
description: Compare two focus paths in a three-print exhibition using only the keyboard.
group: Interactions
demo: focus
---

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
