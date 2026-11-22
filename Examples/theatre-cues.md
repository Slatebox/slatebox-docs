---
title: Show what changes when a cue moves
description: Give a cue two outcomes, preview the light during a drag, and publish the cue sheet the crew will use.
group: Interactions
---

The director wants the doorway lit for the actor’s entrance. Move **Warm sidelight up** to **Door opens** and the stage monitor shows the doorway lit. Move it away and the doorway goes dark. [Try the rehearsal](https://slatebox.com/use-cases/creative-handoffs/#rehearsal)

## Run the rehearsal yourself

1. Open the [standalone rehearsal](/assets/examples/entrance-rehearsal.html).
2. In the light console, drag **Warm sidelight up** toward **Door opens** and hold. The doorway previews amber.
3. Press Escape to keep the saved scene, or release to place the cue. The scene names also work as buttons.

**Open this rehearsal in Slatebox** carries the last placed cue and both messages into an editable workshop.

## Change the rule

1. In an empty folder, save the file: <a href="/assets/examples/entrance-rehearsal.html" download="entrance-rehearsal.html">download the rehearsal HTML</a>.
2. In that folder, start a local server:

<!-- tabs -->

```sh Node.js
npx --yes http-server -p 8000 -a 127.0.0.1
```

```sh Python
python3 -m http.server 8000 --bind 127.0.0.1
```

<!-- /tabs -->

3. Open <http://127.0.0.1:8000/entrance-rehearsal.html>.
4. In the HTML, find `whenPresent`, change its text to “The doorway signals the entrance.”, save and refresh.
5. Focus the cue, press Right Arrow, then Enter. The stage monitor shows your line.

To keep the cue on the bench, add `allowedLaneIds: ['bench']` to the light card and refresh. **Door opens** becomes unavailable. The page loads the SlateboxJS workshop model from slatebox.com, so it needs an internet connection.

## Give the cue a consequence

A signal ties one card to one lane by ID. Its two messages say what the crew sees when the cue is in that scene and when it is not. The signal travels with the board.

The standalone file uses these model calls. To run them in Node.js, use a project with [the `slateboxjs` package](../Developers/JavascriptLibrary/readme.md) installed.

<!-- tabs -->

```js Node.js
import { validateWorkshop, resolveWorkshopSignals, moveWorkshopCard, workshopPresentationScenes } from 'slateboxjs/workshops/model'

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

```ts TypeScript
import { validateWorkshop, resolveWorkshopSignals, moveWorkshopCard, workshopPresentationScenes, type Workshop } from 'slateboxjs/workshops/model'

const rehearsal: Workshop = validateWorkshop({
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

<!-- /tabs -->

```text Output
The doorway stays dark.
Door opens The doorway glows amber.
Actor sits 0
```

After the move, the opening scene reads “The doorway glows amber.” and holds both the rain and sidelight cues. **Actor sits** stays in the running order with zero cues. Each scene’s `nodeIds` lists the canvas objects to frame.

## Try a different light

In the side conversation, send `Set outcome Entrance call for Warm sidelight up in Door opens: Wait for the door to close | Stand by for the entrance`. Keep the change, move the cue and present the scene to check the new call.

For a custom monitor, pass the board from `WorkshopBoard`’s `onPreview` to `resolveWorkshopSignals`. Use `present` to paint the light and `text` for the crew’s call. When the preview clears, render from the placed board again.

Publishing saves that revision for the crew. Later edits reach the same link when you publish again. [Publish a workshop handoff](embed-a-walkthrough.md#publish-a-workshop-handoff)
