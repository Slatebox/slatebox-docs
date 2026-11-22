---
title: Choose two objects for a loan case
description: Give a curator three candidates and two mounts, then inspect which moves remain legal.
group: Interactions
demo: museum
---

## Try it

1. Mount the carved shell and the tin lantern.
2. Try to add the star chart. The case is full.
3. Return one object to free a mount.

**Open this slate in Slatebox** keeps your arrangement and the two-mount limit in a private, editable workshop.

## Apply the capacity rule in code

This script builds the case, fills it, checks where the star chart can go, and prints a link that opens the filled case in Slatebox. Run it with Node.js in a project with [the `slateboxjs` package](../Developers/JavascriptLibrary/readme.md) installed.

<!-- tabs -->

```js Node.js
import { validateWorkshop, moveWorkshopCard, availableLanes, encodeWorkshopFragment } from 'slateboxjs/workshops/model'

const initial = validateWorkshop({
  version: 1,
  title: 'Loans for the shoreline case',
  lanes: [{ id: 'store', label: 'Available objects' }, { id: 'case', label: 'Two mounts', capacity: 2 }],
  presentationOrder: ['case', 'store'],
  cards: [
    { id: 'shell', label: 'Carved shell', laneId: 'store' },
    { id: 'lamp', label: 'Tin lantern', laneId: 'store' },
    { id: 'chart', label: 'Star chart', laneId: 'store' }
  ]
})
const full = moveWorkshopCard(moveWorkshopCard(initial, 'shell', 'case'), 'lamp', 'case')
const chart = full.cards.find(card => card.id === 'chart')
console.log(availableLanes(full, chart).map(lane => lane.id))

const vacancy = moveWorkshopCard(full, 'shell', 'store')
console.log(availableLanes(vacancy, chart).map(lane => lane.id))

const openInSlatebox = 'https://app.slatebox.com/new/workshop' + encodeWorkshopFragment(full)
console.log(openInSlatebox)
```

```ts TypeScript
import { validateWorkshop, moveWorkshopCard, availableLanes, encodeWorkshopFragment, type Workshop } from 'slateboxjs/workshops/model'

const initial: Workshop = validateWorkshop({
  version: 1,
  title: 'Loans for the shoreline case',
  lanes: [{ id: 'store', label: 'Available objects' }, { id: 'case', label: 'Two mounts', capacity: 2 }],
  presentationOrder: ['case', 'store'],
  cards: [
    { id: 'shell', label: 'Carved shell', laneId: 'store' },
    { id: 'lamp', label: 'Tin lantern', laneId: 'store' },
    { id: 'chart', label: 'Star chart', laneId: 'store' }
  ]
})
const full = moveWorkshopCard(moveWorkshopCard(initial, 'shell', 'case'), 'lamp', 'case')
const chart = full.cards.find(card => card.id === 'chart')!
console.log(availableLanes(full, chart).map(lane => lane.id))

const vacancy = moveWorkshopCard(full, 'shell', 'store')
console.log(availableLanes(vacancy, chart).map(lane => lane.id))

const openInSlatebox = 'https://app.slatebox.com/new/workshop' + encodeWorkshopFragment(full)
console.log(openInSlatebox)
```

<!-- /tabs -->

You get `[ 'store' ]` for the full case, `[ 'store', 'case' ]` after the shell goes back, and the link.

To show the same board in your own page, mount `WorkshopBoard` from `slateboxjs/workshops` with `initial` as its value, and save the model `onChange` gives you.

## Open the case in Slatebox

The printed link creates a private copy for whoever opens it, under their account or guest session. Select **Present** to show the two mounted objects, then advance once to see what stayed in storage. Encode `vacancy` instead of `full` to leave one mount free.

The link carries the whole workshop, so anyone who has it can import its contents. Keep private data out of links you share.

## Fit two lanes on a phone

For a responsive two-lane board with a preview that changes while you drag, build the [community radio cue sheet](research-cue-sheet.md).
