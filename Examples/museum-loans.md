---
title: Choose two objects for a loan case
description: Give a curator three candidates and two mounts, then inspect which moves remain legal.
group: Interactions
---

Put the carved shell and the tin lantern in the loan case. The star chart has to wait until a mount is free. The capacity belongs to the case, so both a pointer move and an agent proposal can use the same rule.

Run this in a project using the pinned SlateboxJS file build.

```js
import { validateWorkshop, moveWorkshopCard, availableLanes } from 'slateboxjs/workshops/model'

const initial = validateWorkshop({
  version: 1,
  title: 'Loans for the shoreline case',
  lanes: [{ id: 'store', label: 'Available objects' }, { id: 'case', label: 'Two mounts', capacity: 2 }],
  cards: [
    { id: 'shell', label: 'Carved shell', laneId: 'store' },
    { id: 'lamp', label: 'Tin lantern', laneId: 'store' },
    { id: 'chart', label: 'Star chart', laneId: 'store' }
  ]
})
const one = moveWorkshopCard(initial, 'shell', 'case')
const full = moveWorkshopCard(one, 'lamp', 'case')
const chart = full.cards.find(card => card.id === 'chart')
console.log(availableLanes(full, chart).map(lane => lane.id))
const vacancy = moveWorkshopCard(full, 'shell', 'store')
console.log(availableLanes(vacancy, chart).map(lane => lane.id))
```

Expect `['store']` for the full case and `['store', 'case']` after returning the shell. Mount `WorkshopBoard` from `slateboxjs/workshops` with the validated `initial` value and save the model passed to `onChange`.

[Open the workshop builder](https://app.slatebox.com/workshops)
