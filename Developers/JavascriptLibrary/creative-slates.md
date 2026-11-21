---
title: Use the interactive boards
description: Embed a controlled board or build a branching map your team can open in Slatebox.
---

A board draws a saved model. Pass the model as `value` and an `onChange` callback to receive each committed move. Pass `readOnly` to present a decision without changing it.

## Mount a map from plain JavaScript

Give the board a container such as `<div id="review-map"></div>`, import the stylesheet and mount a model. This map gives a release reviewer a second route. Visitors drag the token along a route or move it with the keyboard.

<!-- tabs -->

```js JavaScript
import 'slateboxjs/style.css'
import { mountWorkshop } from 'slateboxjs/workshops/mount'
import { createWorkshopMap, addWorkshopBranch } from 'slateboxjs/workshops/model'

const draft = createWorkshopMap()
draft.lanes[0].label = 'Review change'
const review = addWorkshopBranch(draft, draft.lanes[0].id, {
  label: 'Request evidence',
  outcome: 'Attach an example before the review continues.'
})
const view = mountWorkshop(document.querySelector('#review-map'), review, {
  onChange(next) {
    localStorage.setItem('review-map', JSON.stringify(next))
  }
})
```

```ts TypeScript
import 'slateboxjs/style.css'
import { mountWorkshop } from 'slateboxjs/workshops/mount'
import { createWorkshopMap, addWorkshopBranch, type Workshop } from 'slateboxjs/workshops/model'

const draft: Workshop = createWorkshopMap()
draft.lanes[0].label = 'Review change'
const review = addWorkshopBranch(draft, draft.lanes[0].id, {
  label: 'Request evidence',
  outcome: 'Attach an example before the review continues.'
})
const view = mountWorkshop(document.querySelector<HTMLElement>('#review-map')!, review, {
  onChange(next: Workshop) {
    localStorage.setItem('review-map', JSON.stringify(next))
  }
})
```

<!-- /tabs -->

- `view.update(next)` shows a revised model, for example one your server sends.
- `view.destroy()` removes the board.
- Boards need the `react` and `react-dom` peers (18 or 19). [Install the package](readme.md#install-the-package)

## Pick a board

Each board is a React component exported by `slateboxjs/workshops`.

| What your visitor does | Component | Try it |
| --- | --- | --- |
| Rolls a horn between two sculptures. Sound and captions follow the mix. | `ListeningRoomBoard` | [Mix a soundscape](../../Examples/listening-room.md) |
| Hangs panels in the curator's order. The view fills in as pieces reach their hooks. | `MoonGalleryBoard` | [Change a hanging rule](../../Examples/gallery-prerequisite.md) |
| Wires a print viewer's return path, opens the viewer and presses Escape to follow it. | `FocusDarkroomBoard` | [Try keyboard focus](../../Examples/focus-return.md) |
| Brings a field test into review, compares it with the desk copy and picks the handoff. | `OfflineHandoffBoard` | [Review a field note](../../Examples/field-note-handoff.md) |

## Build a workshop with one recording slot

An audio producer has one recorder on Friday. Any pitch can take the slot. A recording already in the archive can only go back to the pitch meeting. The model helpers run in Node or the browser.

<!-- tabs -->

```js Node.js
import {
  createLaneWorkshop, addWorkshopLane, addWorkshopCard, encodeWorkshopFragment
} from 'slateboxjs/workshops/model'

const workshop = createLaneWorkshop()
workshop.title = 'Friday field recordings'
const [pitches, archive] = workshop.lanes
pitches.label = 'Pitches'
archive.label = 'Archive'

const plan = addWorkshopLane(workshop, { label: 'Record on Friday', capacity: 1 })
const pitched = addWorkshopCard(plan, pitches.id, { label: 'Ferry horn' })
const ready = addWorkshopCard(pitched, archive.id, {
  label: 'Dawn chorus from last week',
  allowedLaneIds: [archive.id, pitches.id]
})
const openInSlatebox = 'https://app.slatebox.com/new/workshop' + encodeWorkshopFragment(ready)
console.log(openInSlatebox)
```

```ts TypeScript
import {
  createLaneWorkshop, addWorkshopLane, addWorkshopCard, encodeWorkshopFragment, type Workshop
} from 'slateboxjs/workshops/model'

const workshop: Workshop = createLaneWorkshop()
workshop.title = 'Friday field recordings'
const [pitches, archive] = workshop.lanes
pitches.label = 'Pitches'
archive.label = 'Archive'

const plan: Workshop = addWorkshopLane(workshop, { label: 'Record on Friday', capacity: 1 })
const pitched: Workshop = addWorkshopCard(plan, pitches.id, { label: 'Ferry horn' })
const ready: Workshop = addWorkshopCard(pitched, archive.id, {
  label: 'Dawn chorus from last week',
  allowedLaneIds: [archive.id, pitches.id]
})
const openInSlatebox: string = 'https://app.slatebox.com/new/workshop' + encodeWorkshopFragment(ready)
console.log(openInSlatebox)
```

<!-- /tabs -->

You get a link that opens the workshop in Slatebox: [Open the recording workshop](https://app.slatebox.com/new/workshop#model=%7B%22version%22%3A1%2C%22title%22%3A%22Friday+field+recordings%22%2C%22lanes%22%3A%5B%7B%22id%22%3A%22lane-1%22%2C%22label%22%3A%22Pitches%22%7D%2C%7B%22id%22%3A%22lane-2%22%2C%22label%22%3A%22Archive%22%7D%2C%7B%22id%22%3A%22lane-3%22%2C%22label%22%3A%22Record+on+Friday%22%2C%22capacity%22%3A1%7D%5D%2C%22cards%22%3A%5B%7B%22id%22%3A%22card-1%22%2C%22label%22%3A%22Ferry+horn%22%2C%22laneId%22%3A%22lane-1%22%7D%2C%7B%22id%22%3A%22card-2%22%2C%22label%22%3A%22Dawn+chorus+from+last+week%22%2C%22laneId%22%3A%22lane-2%22%2C%22allowedLaneIds%22%3A%5B%22lane-2%22%2C%22lane-1%22%5D%7D%5D%7D)

1. Move **Ferry horn** to **Record on Friday**. Friday shows one occupied slot.
2. Move the horn back to **Pitches**.
3. Try to move **Dawn chorus from last week** to Friday. Its destination rule refuses the move, even with the slot free.

To build the same workshop in the app, describe the changes in the conversation beside the canvas. [Start a blank workshop](../../Using-Slatebox/readme.md#start-a-blank-workshop)

## Add a path to a map

A field recordist hears birdsong under a bridge. This map gives the sound editor a second microphone position, with an outcome the team reads when they move the token there.

<!-- tabs -->

```js Node.js
import {
  addWorkshopBranch, createWorkshopMap, encodeWorkshopFragment
} from 'slateboxjs/workshops/model'

const map = createWorkshopMap()
map.title = 'Where should we put the microphone?'
map.lanes[0].label = 'Bridge entrance'
map.lanes[0].station.outcome = 'Listen for the bird above the traffic.'
map.lanes[1].label = 'Under the arch'
map.lanes[1].station.outcome = 'The stone arch adds a long echo.'
map.cards[0].label = 'Field microphone'

const routes = addWorkshopBranch(map, 'start', {
  label: 'By the reeds',
  outcome: 'The bank screens the road noise. The birdsong comes through.'
})
const openInSlatebox = 'https://app.slatebox.com/new/workshop' + encodeWorkshopFragment(routes)
console.log(openInSlatebox)
```

```ts TypeScript
import {
  addWorkshopBranch, createWorkshopMap, encodeWorkshopFragment, type Workshop
} from 'slateboxjs/workshops/model'

const map: Workshop = createWorkshopMap()
map.title = 'Where should we put the microphone?'
map.lanes[0].label = 'Bridge entrance'
map.lanes[0].station!.outcome = 'Listen for the bird above the traffic.'
map.lanes[1].label = 'Under the arch'
map.lanes[1].station!.outcome = 'The stone arch adds a long echo.'
map.cards[0].label = 'Field microphone'

const routes: Workshop = addWorkshopBranch(map, 'start', {
  label: 'By the reeds',
  outcome: 'The bank screens the road noise. The birdsong comes through.'
})
const openInSlatebox: string = 'https://app.slatebox.com/new/workshop' + encodeWorkshopFragment(routes)
console.log(openInSlatebox)
```

<!-- /tabs -->

Open the printed link and move **Field microphone** to **By the reeds**. You see the outcome you wrote. Station IDs stay the same when labels change. In the app, ask the conversation to "Add By the reeds after Bridge entrance" and keep the change. [Create a slate](https://app.slatebox.com/new)

## Give a map station an image

Pass an image address and a description with the branch. Moving the token to that station shows the image, and presenting the station frames it beside the outcome.

<!-- tabs -->

```js Node.js
import { addWorkshopBranch, createWorkshopMap } from 'slateboxjs/workshops/model'

const guide = createWorkshopMap()
guide.title = 'A closer look at Seurat'
guide.cards[0].label = 'Visitor'
const illustrated = addWorkshopBranch(guide, 'start', {
  label: 'Look at the brushwork',
  outcome: 'Look at the flecks of blue and orange that give the hat its shadow.',
  image: {
    src: 'https://slatebox.com/assets/product/grande-jatte-brushwork.webp',
    alt: 'Detail of a child in a light hat standing in the grass.'
  }
})
console.log(illustrated.lanes.at(-1))
```

```ts TypeScript
import { addWorkshopBranch, createWorkshopMap, type Workshop } from 'slateboxjs/workshops/model'

const guide: Workshop = createWorkshopMap()
guide.title = 'A closer look at Seurat'
guide.cards[0].label = 'Visitor'
const illustrated: Workshop = addWorkshopBranch(guide, 'start', {
  label: 'Look at the brushwork',
  outcome: 'Look at the flecks of blue and orange that give the hat its shadow.',
  image: {
    src: 'https://slatebox.com/assets/product/grande-jatte-brushwork.webp',
    alt: 'Detail of a child in a light hat standing in the grass.'
  }
})
console.log(illustrated.lanes.at(-1))
```

<!-- /tabs -->

The map stores the image address, not the image, so choose one your audience can load. A shared map carries the address and description, your paths and the token position. [Try the gallery guide](https://slatebox.com/product/interactive-diagrams/#gallery-guide) · [The painting at the Art Institute of Chicago](https://www.artic.edu/artworks/27992/a-sunday-on-la-grande-jatte-1884)

## Mount the listening room

Render the board in a React application. The saved mix sets the caption, even with the audio off.

<!-- tabs -->

```jsx React
import { useState } from 'react'
import { ListeningRoomBoard } from 'slateboxjs/workshops'
import { listeningRoom } from 'slateboxjs/workshops/model'

export default function SoundTable() {
  const [model, setModel] = useState(listeningRoom)
  return <ListeningRoomBoard value={model} onChange={setModel} />
}
```

```tsx React + TypeScript
import { useState } from 'react'
import { ListeningRoomBoard } from 'slateboxjs/workshops'
import { listeningRoom, type ListeningRoomModel } from 'slateboxjs/workshops/model'

export default function SoundTable() {
  const [model, setModel] = useState<ListeningRoomModel>(listeningRoom)
  return <ListeningRoomBoard value={model} onChange={setModel} />
}
```

<!-- /tabs -->

Drag toward the glass and release: `onChange` receives the new mix. To keep it across visits, save the model and pass the stored value through `normalizeListeningRoom` when you load it. A `null` result means the document is invalid. Audio plays only after the listener starts it.

## Move from a demo to team work

Each example board has a link that opens it as a slate you own in Slatebox. The link carries the board's state: the mix, the wall arrangement, the print names and wire, or the review stage and decision. The new slate is private, and its **Share** menu decides who can view or edit it. [Open a listening slate](https://app.slatebox.com/new/listening-room)

For several editors on one board:

- Validate writes on the server, and check the revision the editor saw.
- Let a pointer preview a position locally, but save only a committed move.
- When someone else has changed the board, show their state before you accept a new decision.

To build a rehearsal monitor from the cards the presenter frames, [read the cues for an authored scene](../../Examples/theatre-cues.md).
