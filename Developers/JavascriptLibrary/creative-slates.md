---
title: Use the interactive boards
description: Embed the same four controlled boards that Slatebox opens as editable slates.
---

A board takes its saved model as `value`. Supply `onChange` to receive the committed decision. For a presentation, pass `readOnly` to show that decision. A facilitator can choose a different result later by returning to the editor.

## Pick a board

| What your visitor does | React component | Try it |
| --- | --- | --- |
| Roll a horn between two sculptures. Sound and captions follow the mix. | `ListeningRoomBoard` | [Mix a soundscape](../../Examples/listening-room.md) |
| Hang panels in an order chosen by the curator. The visitor’s view fills in as pieces reach their hooks. | `MoonGalleryBoard` | [Change a hanging rule](../../Examples/gallery-prerequisite.md) |
| Wire a print viewer’s return path, open the viewer, and press Escape to follow the connection. | `FocusDarkroomBoard` | [Try keyboard focus](../../Examples/focus-return.md) |
| Bring a field test into review, compare it with the desk copy and pick the handoff the crew will see. | `OfflineHandoffBoard` | [Review a field note](../../Examples/field-note-handoff.md) |

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
