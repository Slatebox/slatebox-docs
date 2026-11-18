# Give the planetarium crew a second try


In the original lens test, a bright star can lead to First light. Trying the indoor lamp ends the exercise with a blurry image. Choose **Lens → Indoor lamp** in the example and inspect the eyepiece. **Back to lens bench** lets you try the other path.

## Change the rule

Suppose the crew can take the lens outside after seeing the indoor result. Give the lamp a route to the bright star. The board will offer that move when the lens reaches the lamp.

Download the [original workshop model](https://slatebox.com/assets/product/first-light-workshop.json) beside your script as `first-light-workshop.json`. Run this ES module with Node and the SlateboxJS file build.

```js
import { readFile } from 'node:fs/promises'
import {
  availableLanes, encodeWorkshopFragment, moveWorkshopCard, validateWorkshop
} from 'slateboxjs/workshops/model'

const file = new URL('./first-light-workshop.json', import.meta.url)
const draft = validateWorkshop(JSON.parse(await readFile(file, 'utf8')))
const revised = validateWorkshop({
  ...draft,
  lanes: draft.lanes.map(lane => lane.id === 'station-3'
    ? { ...lane, station: { ...lane.station, next: ['station-2'] } }
    : lane)
})

const atLamp = moveWorkshopCard(revised, 'token', 'station-3')
console.log(availableLanes(atLamp, atLamp.cards[0]).map(lane => lane.label))
console.log('https://app.slatebox.com/new/workshop' + encodeWorkshopFragment(atLamp))
```

## Try the revised test together

Open the printed URL. The lens starts at **Indoor lamp** with **Bright star** available. Move it there, then continue to **First light**. Share the saved canvas URL with a teammate through the board’s **Share** menu. Opening the generated import URL creates a private copy for its visitor. [Work with a team](../Using-Slatebox/readme.md#work-with-a-team)
