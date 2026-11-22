---
title: Give the planetarium crew a second try
description: Add one route to an AI-generated map and give a teammate the exact lens position you chose.
group: Interactions
demo: telescope
---

## Try it

In the lens test, the bright star leads to **First light**. The indoor lamp ends the test with a blurry image. Choose **Lens → Indoor lamp** and look through the eyepiece. **Back to lens bench** lets you try the other path.

## Add a route from the lamp to the star

Let the crew take the lens outside after the indoor result: give the lamp a route to the bright star.

1. Download the [workshop model](https://slatebox.com/assets/product/first-light-workshop.json) as `first-light-workshop.json`, next to your script.
2. Run this with Node.js in a project with [the `slateboxjs` package](../Developers/JavascriptLibrary/readme.md) installed.

<!-- tabs -->

```js Node.js
import { readFile } from 'node:fs/promises'
import { availableLanes, encodeWorkshopFragment, moveWorkshopCard, validateWorkshop } from 'slateboxjs/workshops/model'

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

```ts TypeScript
import { readFile } from 'node:fs/promises'
import { availableLanes, encodeWorkshopFragment, moveWorkshopCard, validateWorkshop, type WorkshopLane } from 'slateboxjs/workshops/model'

const file = new URL('./first-light-workshop.json', import.meta.url)
const draft = validateWorkshop(JSON.parse(await readFile(file, 'utf8')))
const revised = validateWorkshop({
  ...draft,
  lanes: draft.lanes.map((lane): WorkshopLane => lane.id === 'station-3' && lane.station
    ? { ...lane, station: { ...lane.station, next: ['station-2'] } }
    : lane)
})

const atLamp = moveWorkshopCard(revised, 'token', 'station-3')
console.log(availableLanes(atLamp, atLamp.cards[0]).map(lane => lane.label))
console.log('https://app.slatebox.com/new/workshop' + encodeWorkshopFragment(atLamp))
```

<!-- /tabs -->

It prints `[ 'Bright star', 'Indoor lamp' ]` and an import link.

## Try the revised test together

1. Open the printed link. It creates a private copy for whoever opens it, with the lens at **Indoor lamp** and **Bright star** available.
2. Move the lens to **Bright star**, then on to **First light**.
3. Share your saved slate from its **Share** menu.

[Work with a team](../Using-Slatebox/readme.md#work-with-a-team)
