---
title: Show what changes when a cue moves
description: Give a cue two outcomes, preview the light during a drag, and publish the cue sheet the crew will use.
group: Interactions
---

The director wants the doorway lit for the actor’s entrance. Move **Warm sidelight up** to **Door opens** and watch the stage monitor. Move it away and the doorway goes dark. Open the rehearsal as your own slate to change the cue and what the crew reads. [Try the rehearsal](https://slatebox.com/use-cases/creative-handoffs/#rehearsal)

## Run your own light cue

[Open the standalone HTML rehearsal](/assets/examples/entrance-rehearsal.html). In the light console, drag **Warm sidelight up** across the rail toward **Door opens**. Hold there to preview the amber doorway. Press Escape to leave the saved scene alone, or release to place the cue. The scene names also work as buttons. **Open this rehearsal in Slatebox** carries the last committed placement and both messages into an editable workshop.

To change the rule yourself, <a href="/assets/examples/entrance-rehearsal.html" download="entrance-rehearsal.html">download the rehearsal HTML</a> into an empty directory, or use the commands below. It imports the public SlateboxJS workshop model over HTTPS and runs in your browser.

```sh
curl -fLO https://docs.slatebox.com/assets/examples/entrance-rehearsal.html
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000/entrance-rehearsal.html>. In the HTML file, find `whenPresent` and change its text to “The doorway signals the entrance.” Save the file and refresh the browser. Focus the cue, press Right Arrow, then Enter. The stage monitor now displays your line. An internet connection loads the model module. The HTML supplies its own pointer and keyboard controls. To restrict the cue to the bench, add `allowedLaneIds: ['bench']` to the light card and refresh. **Door opens** becomes unavailable.

## Give the cue a consequence

A placement outcome refers to one card and one lane by ID. Its two messages describe what the crew sees when the cue is in that scene and when it is elsewhere. The same definition travels with the board. The standalone file uses these model calls. In a project with the matching file-based SlateboxJS package, use the import below.

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

In the side conversation, send `Set outcome Entrance call for Warm sidelight up in Door opens: Wait for the door to close | Stand by for the entrance`. Keep the change, move the cue and present the scene to check the new call.

In a custom monitor, pass the candidate board from `WorkshopBoard.onPreview` into `resolveWorkshopSignals`. Use the resolved `present` value to paint the light and `text` for the crew’s call. When the preview clears, render from the committed board again. Publishing saves that revision for the crew. Later edits become visible at the same link when you publish again. [Publish a workshop handoff](/examples/embed-a-walkthrough/#publish-a-workshop-handoff)
