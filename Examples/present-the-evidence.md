---
title: Walk through evidence in a chosen order
description: Lead with a photograph, follow it with an observation, then return to the first viewpoint.
group: Canvas
demo: presentation
---

## Set the order in the app

1. In a slate with two notes, choose **Present**. As an editor, you get the controls to arrange the scenes.
2. Open **Presentation Settings** and turn on **Show Scene Boundaries**.
3. Click a scene number, change **Position in presentation**, add a narrative and choose **Save**.
4. Press Left and Right to check the order before you share.

## Set the order in your own app

Give the presentation an explicit step order, so it opens on the photo even though the observation was created first. The JavaScript version is one HTML file that loads SlateboxJS from slatebox.com. The TypeScript version uses the `slateboxjs` package in a page with `<div id="tour" style="height:420px"></div>`.

<!-- tabs -->

```html JavaScript
<!doctype html>
<link rel="stylesheet" href="https://slatebox.com/assets/engine/slateboxjs.css">
<div id="tour" style="height:420px"></div>
<script type="module">
  import { Slate } from 'https://slatebox.com/assets/engine/slateboxjs.mjs'

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
</script>
```

```ts TypeScript
import { Slate } from 'slateboxjs'
import 'slateboxjs/style.css'

const slate = new Slate('#tour')
const make = (id: string, x: number, text: string) => slate.addNode({ id, x, y: 100, width: 180, height: 80, text })
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

<!-- /tabs -->

The console shows `0`, `1`, `0`, and the camera ends on the photo. Call `tour.stop()` to return to the canvas.

[Run a local copy of the quick-slate example](../Developers/JavascriptLibrary/readme.md#quick-slate) · [Create a slate for your presentation](https://app.slatebox.com/new)
