---
title: Read the cues for an authored scene
description: Use the cards assigned to a scene to light a rehearsal preview and prepare the crew’s briefing.
group: Interactions
---

In the theatre handoff, moving a cue toward the entrance brings the sidelight up in the stage monitor. Cancel the drag and the light goes down. The evening crew keeps its previous cue sheet until the stage manager updates the copy. [Try the rehearsal](https://slatebox.com/use-cases/creative-handoffs/#rehearsal)

## Read one scene from the workshop

Run this with the file-based SlateboxJS package. The bench lane comes first on the working board. The director wants the audience to start when the door opens.

```js
import {
  validateWorkshop, moveWorkshopCard, workshopPresentationScenes
} from 'slateboxjs/workshops/model'

const rehearsal = validateWorkshop({
  version: 1,
  title: 'Entrance rehearsal',
  lanes: [{ id: 'bench', label: 'Actor sits' }, { id: 'door', label: 'Door opens' }],
  presentationOrder: ['door', 'bench'],
  cards: [
    { id: 'rain', label: 'Fade the rain', laneId: 'door' },
    { id: 'light', label: 'Warm sidelight up', laneId: 'bench' }
  ]
})

const revised = moveWorkshopCard(rehearsal, 'light', 'door')
const [opening, next] = workshopPresentationScenes(revised)
console.log(opening.lane.label, opening.cards.map(card => card.label))
console.log(next.lane.label, next.cards.length)
```

The opening scene contains **Fade the rain** and **Warm sidelight up**. **Actor sits** stays in the running order, even with zero cues. Each scene also has a `nodeIds` array for framing its lane and current cards in native Slatebox artwork.

## Preview the light while dragging

Pass the candidate from `WorkshopBoard.onPreview` to `workshopPresentationScenes`. Find the doorway lane and check whether it contains the light cue. If the candidate is cleared, render from the last committed board. Keep a separate reference to the version the crew saw. Replace it when the stage manager approves an update.

When the stage manager publishes from the app, the server saves the workshop’s committed revision. The crew can use the same link after a later revision is published. [Publish a workshop handoff](/examples/embed-a-walkthrough/#publish-a-workshop-handoff)
