---
title: Walk through evidence in a chosen order
description: Lead with a photograph, follow it with an observation, then return to the first viewpoint.
group: Canvas
demo: presentation
---

In a slate with two notes, open **Presentation options → Edit or publish presentation**. Turn on **Show Scene Boundaries** under **Presentation Settings**. Click a scene number, change **Position in presentation**, add a narrative and save. Use Left and Right to check the order before sharing.

Copy `slateboxjs.mjs` and `slateboxjs.css` from the pinned file build’s `dist/` directory beside your HTML page. Serve the page over HTTP with this container and stylesheet.

```html
<link rel="stylesheet" href="./slateboxjs.css">
<div id="tour" style="height:420px"></div>
```

Run the following in a `<script type="module">` on that page.

```js
import { Slate } from './slateboxjs.mjs'

const slate = new Slate('#tour')
const make = (id, x, text) => slate.addNode({ id, x, y: 100, width: 180, height: 80, text })
const note = make('observation', 350, 'The tide line moved.')
const photo = make('photo', 40, 'Photo from the pier')
await Promise.all([note.ready, photo.ready])
const tour = slate.presentation
tour.setStepOrder(['photo', 'observation'])
tour.start(0)
console.log(tour.getCurrentStep())
tour.next(0)
console.log(tour.getCurrentStep())
tour.previous(0)
console.log(tour.getCurrentStep())
```

Expect the indices `0`, `1`, `0`. The camera ends on the photograph, although the observation was the first node created. Call `tour.stop()` when the audience returns to the canvas.

[Create a slate for your presentation](https://app.slatebox.com/new)
