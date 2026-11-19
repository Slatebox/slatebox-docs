---
title: Use the interactive boards
description: Embed a controlled board or build a branching map your team can open in Slatebox.
---

A board takes its saved model as `value`. Supply `onChange` to receive the committed decision. For a presentation, pass `readOnly` to show that decision. A facilitator can choose a different result later by returning to the editor.

## Mount a map from plain JavaScript

Give the board a container, import the stylesheet and mount a validated model. This example gives a release reviewer another place to send a change. Drag the token along a route or use its keyboard control. The map uses native SlateboxJS objects and Dragology handles the permitted moves.

```html
<div id="review-map"></div>
```

```js
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

Use `view.update(next)` when your server sends a revised model. Call `view.destroy()` when removing the embed. Install the React and React DOM peers listed in the matched engine package. The embedding page and the agent author only JavaScript and board data. [Get the matched engine build](readme.md#quick-slate)

## Pick a board

| What your visitor does | React component | Try it |
| --- | --- | --- |
| Roll a horn between two sculptures. Sound and captions follow the mix. | `ListeningRoomBoard` | [Mix a soundscape](../../Examples/listening-room.md) |
| Hang panels in an order chosen by the curator. The visitor’s view fills in as pieces reach their hooks. | `MoonGalleryBoard` | [Change a hanging rule](../../Examples/gallery-prerequisite.md) |
| Wire a print viewer’s return path, open the viewer, and press Escape to follow the connection. | `FocusDarkroomBoard` | [Try keyboard focus](../../Examples/focus-return.md) |
| Bring a field test into review, compare it with the desk copy and pick the handoff the crew will see. | `OfflineHandoffBoard` | [Review a field note](../../Examples/field-note-handoff.md) |

## Build a workshop with one recording slot

An audio producer has one recorder for Friday. New pitches can take that slot. A recording already in the archive can go back to the pitch meeting for review.

```js
import {
  createLaneWorkshop, addWorkshopLane, addWorkshopCard, encodeWorkshopFragment
} from 'slateboxjs/workshops/model'

const workshop = createLaneWorkshop()
workshop.title = 'Friday field recordings'
const [pitches, archive] = workshop.lanes
pitches.label = 'Pitches'
archive.label = 'Archive'

const plan = addWorkshopLane(workshop, { label: 'Record on Friday', capacity: 1 })
const friday = plan.lanes[2]
const pitched = addWorkshopCard(plan, pitches.id, { label: 'Ferry horn' })
const ready = addWorkshopCard(pitched, archive.id, {
  label: 'Dawn chorus from last week',
  allowedLaneIds: [archive.id, pitches.id]
})
const openInSlatebox = 'https://app.slatebox.com/new/workshop' + encodeWorkshopFragment(ready)
```

Move **Ferry horn** to **Record on Friday**. Friday now shows one occupied slot. Move the horn back to **Pitches** and try moving **Dawn chorus from last week** to Friday. Its destination rule keeps it out even with the recorder available. [Open the recording workshop](https://app.slatebox.com/new/workshop#model=%7B%22version%22%3A1%2C%22title%22%3A%22Friday+field+recordings%22%2C%22lanes%22%3A%5B%7B%22id%22%3A%22lane-1%22%2C%22label%22%3A%22Pitches%22%7D%2C%7B%22id%22%3A%22lane-2%22%2C%22label%22%3A%22Archive%22%7D%2C%7B%22id%22%3A%22lane-3%22%2C%22label%22%3A%22Record+on+Friday%22%2C%22capacity%22%3A1%7D%5D%2C%22cards%22%3A%5B%7B%22id%22%3A%22card-1%22%2C%22label%22%3A%22Ferry+horn%22%2C%22laneId%22%3A%22lane-1%22%7D%2C%7B%22id%22%3A%22card-2%22%2C%22label%22%3A%22Dawn+chorus+from+last+week%22%2C%22laneId%22%3A%22lane-2%22%2C%22allowedLaneIds%22%3A%5B%22lane-2%22%2C%22lane-1%22%5D%7D%5D%7D)

Use the model helpers to add a card, set its destinations and update the mounted board. To build the same workshop in Slatebox, send these changes in the conversation beside the canvas. [Try the recording workshop](../../Using-Slatebox/readme.md#start-a-blank-workshop)

## Add a path to a map

A field recorder hears birdsong under a bridge. Give the sound editor a choice of microphone positions. This example adds a second path from the starting station and gives it an outcome the team can hear described when they move the token.

Use the current file build from the [SlateboxJS quickstart](readme.md#quick-slate).

```js
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
```

Open the generated URL and move **Field microphone** to **By the reeds**. The audience sees the outcome you wrote. Station IDs stay stable when labels change. To build the same map in the app, ask the side conversation to “Add By the reeds after Bridge entrance” and keep the change. [Create a slate](https://app.slatebox.com/new)

## Give a map station an image

A gallery guide can take visitors from the whole painting to a detail. Pass an image address and a description with the branch. Moving the visitor token to that station shows the detail. Presenting the station frames the same artwork alongside its outcome.

```js
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
```

The image stays at its HTTPS address. Choose one your audience can load. The shared map contains its address and description, the paths you added and the current token position. [Try the gallery guide](https://slatebox.com/product/interactive-diagrams/#gallery-guide) · [Painting in the Art Institute of Chicago collection](https://www.artic.edu/artworks/27992/a-sunday-on-la-grande-jatte-1884)

## Mount the listening room

Install the matching file build as described in the [SlateboxJS quickstart](readme.md#quick-slate). Mount this component in a React application. The saved mix drives the caption even with the audio off.

```jsx
import { useState } from 'react'
import { ListeningRoomBoard } from 'slateboxjs/workshops'
import { listeningRoom } from 'slateboxjs/workshops/model'

export default function SoundTable() {
  const [model, setModel] = useState(listeningRoom)
  return <ListeningRoomBoard value={model} onChange={setModel} />
}
```

Drag toward the glass and release. The component receives a new mix. To keep the decision across visits, persist the committed model in your application and validate it with `normalizeListeningRoom` when loading it. Treat a null result as an invalid document. Audio playback is local and requires an explicit action from the listener.

## Move from a demo to team work

Each hands-on exhibit has a link that opens an owned slate in the app. The listening room link carries the final mix, the gallery carries the wall arrangement, the darkroom carries the print names and wire, and the handoff carries the review stage and decision. The app creates a private canvas by default. Its Share menu determines who can view or edit the saved work.

For a multi-user integration, validate writes on the server and check the revision the editor saw. A pointer moving across a candidate position can update the local view before the visitor decides to drop. Save after a committed change. When a collaborator has already changed the board, show their current state before accepting a new decision.

[Open a listening slate](https://app.slatebox.com/new/listening-room)

[Read the cues for an authored scene](../../Examples/theatre-cues.md) to build a rehearsal monitor from the same cards the native presenter frames.
