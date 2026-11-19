---
title: Plan a design partner experiment
description: Turn an interview quote into a prototype brief, or allocate a pilot budget and present the result to a teammate.
group: Interactions
agentPrompt: >-
  Help my team choose what to test in a design partner interview. Ask for our interview notes or pilot budget.
  For interview notes, trace each quote to a shared concern and propose one test on a private slate.
  For the pilot budget, open the linked example and show how moving one $200 allocation changes the number of assisted imports.
  Give me the editable slate URL and a way for my cofounder to review the decision.
---

## Turn interviews into a test

In the research example, one customer wants a sample file and another wants to undo an import. Follow both arrows to the concern they share. The final note proposes a reversible preview. [See the research slate](https://slatebox.com/use-cases/research-synthesis/)

Choose **Open the research slate**. Replace one sample quote with words from your own interview. Move it and check where its connector leads. Invite your designer to edit the proposed test, then present the drawing together. [Share a slate](../Using-Slatebox/readme.md#work-with-a-team)

## Allocate a pilot budget

A founder has $600 for onboarding research. A $200 newsletter placement gets the team in front of a partner’s audience. The same $200 covers two assisted imports in which the team can watch customers use the product.

1. Choose **Open the $600 pilot budget** on the workshop page. Your private slate opens with $400 unallocated. [Open the workshop page](https://slatebox.com/product/workshops/)
2. In your slate, drag **Second $200** to **Concierge onboarding**. With a keyboard, focus **Second $200**, press Enter, then focus **Concierge onboarding** and press Enter again. The lane now funds two assisted imports.
3. Invite your cofounder to edit the slate. Move a different allocation together, then choose **Present** to review what each channel can fund. Reopen the slate after the first customer session to decide where the next $200 goes.

## Render the same workshop in your app

Give the SlateboxJS budget model to a DOM element. This example renders the allocations as movable cards and reports how many assisted imports the team can fund. Drag a $200 card into the concierge lane to update the total.

```html
<div id="pilot-budget"></div>
<p aria-live="polite" id="assisted-imports"></p>
```

```js
import 'slateboxjs/style.css'
import { mountWorkshop } from 'slateboxjs/workshops/mount'
import { createBudgetWorkshop, workshopBudgetResult } from 'slateboxjs/workshops/model'

const budget = createBudgetWorkshop()
const result = document.querySelector('#assisted-imports')

function showAssistedImports(board) {
  result.textContent = workshopBudgetResult(board, 'pilot').description
}

showAssistedImports(budget)
const view = mountWorkshop(document.querySelector('#pilot-budget'), budget, {
  onChange: showAssistedImports
})
```

Use `view.update(nextBudget)` to apply a teammate’s saved changes. Call `view.destroy()` when removing the embed. For a view-only preview, pass `readOnly: true` when mounting. The embedding code is plain JavaScript. The engine adapter uses its React peers internally. [Set up the SlateboxJS package](../Developers/JavascriptLibrary/creative-slates.md#mount-a-map-from-plain-javascript)
