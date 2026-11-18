---
title: Show what changes when a cue moves
description: Give a cue two outcomes, preview the light during a drag, and publish the cue sheet the crew will use.
group: Interactions
---

The director wants the doorway lit for the actor’s entrance. Move **Warm sidelight up** to **Door opens** and watch the stage monitor. Move it away and the doorway goes dark. Open the rehearsal as your own slate to change the cue and what the crew reads. [Try the rehearsal](https://slatebox.com/use-cases/creative-handoffs/#rehearsal)

## Give the cue a consequence

A placement outcome refers to one card and one lane by ID. Its two messages describe what the crew sees when the cue is in that scene and when it is elsewhere. The same definition travels with the board. Run this example with the file-based SlateboxJS package.

```js
import {
  validateWorkshop, resolveWorkshopSignals, moveWorkshopCard, workshopPresentationScenes
} from 'slateboxjs/workshops/model'

const rehearsal = validateWorkshop({
  version: 1,
  title: 'Entrance rehearsal',
  lanes: [{ id: 'bench', label: 'Actor sits' }, { id: 'door', label: 'Door opens' }],
  presentationOrder: ['door', 'bench'],
  cards: [
    { id: 'rain', label: 'Fade the rain', laneId: 'door' },
    { id: 'light', label: 'Warm sidelight up', laneId: 'bench' }
  ],
  signals: [{
    id: 'entrance', label: 'Entrance light', cardId: 'light', laneId: 'door',
    whenPresent: 'The doorway glows amber.', whenAbsent: 'The doorway stays dark.'
  }]
})

console.log(resolveWorkshopSignals(rehearsal)[0].text)
const revised = moveWorkshopCard(rehearsal, 'light', 'door')
const [opening, next] = workshopPresentationScenes(revised)
console.log(opening.lane.label, opening.signals[0].text)
console.log(next.lane.label, next.cards.length)
```

Before the move, the doorway stays dark. The opening scene now reads **The doorway glows amber**. Both the rain and sidelight cues are in that scene. **Actor sits** stays in the running order even with zero cues. Each scene’s `nodeIds` lists the native canvas objects to frame.

## Try a different light

In your slate, choose **Edit an object**, select **Warm sidelight up**, then open **Entrance call** under **Placement outcomes**. Choose the scene and write the two messages your crew needs. For a blackout, try “Wait for the door to close” when the cue is present and “Stand by for the entrance” when it is elsewhere. Save, move the cue and present the scene to check the new call.

In a custom monitor, pass the candidate board from `WorkshopBoard.onPreview` into `resolveWorkshopSignals`. Use the resolved `present` value to paint the light and `text` for the crew’s call. When the preview clears, render from the committed board again. Publishing saves that revision for the crew. Later edits become visible at the same link when you publish again. [Publish a workshop handoff](/examples/embed-a-walkthrough/#publish-a-workshop-handoff)
