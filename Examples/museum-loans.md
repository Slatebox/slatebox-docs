# Choose two objects for a loan case

## Agent prompt

```text
Help me try the Slatebox example “Choose two objects for a loan case”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/museum-loans.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/museum-loans.md.
```

Mount the carved shell and tin lantern. Try to add the star chart, then return one object to free a mount. **Open this slate in Slatebox** keeps your arrangement and the two-mount limit in a private, editable workshop.

## Apply the capacity rule

Run this in a project using the file-based SlateboxJS package.

```js
import { validateWorkshop, moveWorkshopCard, availableLanes } from 'slateboxjs/workshops/model'

const initial = validateWorkshop({
  version: 1,
  title: 'Loans for the shoreline case',
  lanes: [{ id: 'store', label: 'Available objects' }, { id: 'case', label: 'Two mounts', capacity: 2 }],
  presentationOrder: ['case', 'store'],
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

The link opens the filled case. Select **Present** to show the two objects you mounted. Advance once to see what stayed in storage. Use `vacancy` instead of `full` to make the shell available and leave one mount free.

## Fit two lanes on a phone and preview a radio cue sheet

For a responsive two-lane workshop with a preview that changes while you drag, build the [community radio cue sheet](/examples/research-cue-sheet/).
