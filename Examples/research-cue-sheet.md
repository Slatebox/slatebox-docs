# Build a community radio cue sheet

## Agent prompt

```text
Help me try the Slatebox example “Build a community radio cue sheet”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/research-cue-sheet.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/research-cue-sheet.md.
```

## Try it

Drag the microphone note into **Next sound check** and hold it. The producer’s cue sheet already shows the second cue. Press Escape to keep the original sheet, or drop the note to keep both cues when you open the workshop in Slatebox. [Try the community radio sound check](https://slatebox.com/use-cases/research-synthesis/#sound-check)

## Build it in React

This component fits two lanes side by side on a 320px screen, previews the cue sheet while a note is held, and links to the placed board in Slatebox.

- `fitLanes` wraps lane labels to the available width. Give the board's container the board's width.
- `onPreview` feeds a view that changes during a drag. `onChange` replaces the placed model.
- `encodeWorkshopFragment` puts the chosen cues and the two-slot rule into a link that opens an editable private slate.

Use a React project with [the `slateboxjs` package](../Developers/JavascriptLibrary/readme.md) installed.

<!-- tabs -->

```jsx React
import { useState } from 'react'
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

```tsx React + TypeScript
import { useState } from 'react'
import { WorkshopBoard } from 'slateboxjs/workshops'
import { encodeWorkshopFragment, validateWorkshop, type Workshop } from 'slateboxjs/workshops/model'

const initial: Workshop = validateWorkshop({
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
  const [saved, setSaved] = useState<Workshop>(initial)
  const [preview, setPreview] = useState<Workshop | null>(null)
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

<!-- /tabs -->

Visitors can also choose **Move a card by name** to change lanes from the keyboard.

## Present the rehearsal first

The producer sorts notes left to right, but at the rehearsal the hosts need the two chosen cues first. `presentationOrder` lists the lane IDs in speaking order, each exactly once. Leave it out to use the board’s lane order.

1. Open the link from the component. Your slate opens with the placed cues.
2. Select **Present**. It opens on **Next sound check**; advance to **Field notes**.
3. To change the order in the app, send “Present Field notes first” in the side conversation, check the sequence and keep the change.

To build your own readout, pass the saved workshop to `workshopPresentationLanes` from `slateboxjs/workshops/model`. Each lane it returns has its board ID, so you can pick its cards by `laneId`.

For hosts who missed the rehearsal, publish the two scenes and put the player in the studio handbook. [Publish a workshop handoff](embed-a-walkthrough.md#publish-a-workshop-handoff)
