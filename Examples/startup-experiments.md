# Plan a design partner experiment

## Agent prompt

```text
Help me try the Slatebox example “Plan a design partner experiment”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/startup-experiments.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/startup-experiments.md.
```

A founder has $600 for onboarding research. A $200 newsletter placement gets the team in front of a partner’s audience. The same $200 covers two assisted imports in which the team can watch customers use the product.

1. Open the pilot budget. Drag its second $200 allocation over **Partner newsletter**. While you hold it there, the placement count changes. Press Escape to cancel.
2. Select the allocation with Enter and choose **Concierge onboarding**. The resulting budget includes two assisted imports. Open that budget in Slatebox and invite your cofounder to edit the allocation.
3. Select **Present** to walk through the funded experiments. Reopen the slate after your first customer session to decide where the next $200 goes. [Try the pilot budget](https://slatebox.com/product/workshops/#example)

## Render the same workshop in your app

Use the startup workshop component from the file-based SlateboxJS package. The component previews a move while someone drags and calls `onChange` with the accepted workshop when they release. The host owns the committed value, so canceled gestures leave the link pointing at the previous decision.

```jsx
import { useState } from 'react'
import { StartupWorkshopBoard } from 'slateboxjs/workshops'
import { createBudgetWorkshop, encodeWorkshopFragment } from 'slateboxjs/workshops/model'

export default function PilotBudget() {
  const [budget, setBudget] = useState(createBudgetWorkshop)
  return <>
    <StartupWorkshopBoard value={budget} onChange={setBudget} />
    <a href={'https://app.slatebox.com/new/workshop' + encodeWorkshopFragment(budget)}>
      Open this budget in Slatebox
    </a>
  </>
}
```

For the interview exercise, initialize state with `createInterviewWorkshop` from the same model entry point. Pick Bea’s quote about clients already added by hand. The component displays its built-in duplicate-client example and saves Bea’s quote in the brief. The screen layout and client rows are part of the example component. To make your own diagram, use the whiteboard editor to add notes and connect them. Pass `readOnly` when embedding a workshop for viewing. [Try the interview workshop](https://slatebox.com/use-cases/research-synthesis/)
