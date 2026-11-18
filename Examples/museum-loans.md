---
title: Choose two objects for a loan case
description: Give a curator three candidates and two mounts, then inspect which moves remain legal.
group: Interactions
demo: museum
---

Mount the carved shell and tin lantern. Try to add the star chart, then return one object to free a mount. **Open this slate in Slatebox** keeps your arrangement and the two-mount limit in a private, editable workshop.

## Apply the capacity rule

Run this in a project using the file-based SlateboxJS package.

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

## Open your own workshop in the app

Use the same link format for a different validated workshop. The app creates a private copy under the visitor’s account or guest session. The fragment contains the workshop itself, so anyone with the link can import its contents. Keep private source data out of links you distribute.

```js
import { encodeWorkshopFragment } from 'slateboxjs/workshops/model'

const openInSlatebox = 'https://app.slatebox.com/new/workshop' + encodeWorkshopFragment(full)
console.log(openInSlatebox)
```

The link from this code opens the filled case. Use `vacancy` instead of `full` to make the shell available and leave one mount free.

## Fit two lanes on a phone and preview a radio cue sheet

Drag the microphone note into **Next sound check** and hold it there. The producer’s cue sheet shows the second rehearsal cue while the note is still in your hand. Press Escape to keep the original sheet. Drop the note to include both cues when you open the workshop in Slatebox. [Try the community radio sound check](https://slatebox.com/use-cases/research-synthesis/).

With the file-based SlateboxJS build, pass `fitLanes` to `WorkshopBoard` to wrap labels at the available width. Give its container the width of the board. On a 320px screen, two ordinary lanes fit side by side. Visitors can also choose **Move a card by name** to change lanes with the keyboard.

```jsx
import React, { useState } from 'react'
import { WorkshopBoard } from 'slateboxjs/workshops'
import { encodeWorkshopFragment, validateWorkshop } from 'slateboxjs/workshops/model'

const initial = validateWorkshop({
  version: 1,
  title: 'Community radio · first broadcast',
  lanes: [{ id: 'notes', label: 'Field notes' }, { id: 'check', label: 'Next sound check', capacity: 2 }],
  cards: [
    { id: 'lamp', label: 'The host missed the red light. Try a headphone cue.', laneId: 'check' },
    { id: 'mic', label: 'Both guests reached for one mic. Mark each mic position.', laneId: 'notes' },
    { id: 'handoff', label: 'Two hosts spoke over the intro. Rehearse a hand signal.', laneId: 'notes' }
  ]
})

export default function RadioSoundCheck() {
  const [saved, setSaved] = useState(initial)
  const [preview, setPreview] = useState(null)
  const cues = (preview ?? saved).cards.filter(card => card.laneId === 'check')
  const href = 'https://app.slatebox.com/new/workshop' + encodeWorkshopFragment(saved)
  return <>
    <WorkshopBoard fitLanes value={saved} onPreview={setPreview}
      onChange={next => { setSaved(next); setPreview(null) }} />
    <ol aria-label="Producer’s cue sheet" aria-live="polite">
      {cues.map(card => <li key={card.id}>{card.label}</li>)}
    </ol>
    <a href={href}>Open this sound check in Slatebox</a>
  </>
}
```

Use `onPreview` for a linked view that can change while dragging. Use `onChange` to replace the committed model. Encoding that model with `encodeWorkshopFragment` carries the chosen cues and the two-slot rule into an editable private slate.
