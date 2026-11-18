---
title: Build a community radio cue sheet
description: Fit two lanes on a phone, preview rehearsal cues while dragging and open the committed sound check in a private slate.
group: Interactions
---

Drag the microphone note into **Next sound check** and hold it there. The producer’s cue sheet shows the second rehearsal cue while the note is still in your hand. Press Escape to keep the original sheet. Drop the note to include both cues when you open the workshop in Slatebox. [Try the community radio sound check](https://slatebox.com/use-cases/research-synthesis/#sound-check).

## Fit two lanes on a phone

With the file-based SlateboxJS build, pass `fitLanes` to `WorkshopBoard` to wrap labels at the available width. Give its container the width of the board. On a 320px screen, two ordinary lanes fit side by side. Visitors can also choose **Move a card by name** to change lanes with the keyboard.

```jsx
import React, { useState } from 'react'
import { WorkshopBoard } from 'slateboxjs/workshops'
import { encodeWorkshopFragment, validateWorkshop } from 'slateboxjs/workshops/model'

const initial = validateWorkshop({
  version: 1,
  title: 'Community radio · first broadcast',
  lanes: [{ id: 'notes', label: 'Field notes' }, { id: 'check', label: 'Next sound check', capacity: 2 }],
  presentationOrder: ['check', 'notes'],
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

## Open the committed cue sheet

Use `onPreview` for a linked view that can change while dragging. Use `onChange` to replace the committed model. Encoding that model with `encodeWorkshopFragment` carries the chosen cues and the two-slot rule into an editable private slate.

## Present the rehearsal first

The producer sorts observations from left to right on the board. At the rehearsal, the hosts need to see the two cues they picked first. Set `presentationOrder` to the lane IDs in speaking order. Select **Present** on the imported slate to open **Next sound check**, then advance to **Field notes**. A teammate can swap a cue before the review and the first scene will show the new selection.

To change the order in the app, return to the board and choose **Presentation order**. Pick a scene, set its position and save.

Include each lane ID exactly once. Leaving the field out uses the board’s lane order. To render your own readout, import `workshopPresentationLanes` from `slateboxjs/workshops/model` and pass it the saved workshop. Each returned lane has its board ID, so you can select its cards by `laneId`.

For hosts who missed the rehearsal, the owner can publish the two scenes and put the player in the studio handbook. [Publish a workshop handoff](/examples/embed-a-walkthrough/#publish-a-workshop-handoff)
