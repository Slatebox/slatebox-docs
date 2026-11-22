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

In the [research example](https://slatebox.com/use-cases/research-synthesis/), one customer wants a sample file and another wants to undo an import. Both arrows lead to a shared concern, and the last note proposes a reversible preview.

1. Choose **Open the research slate**.
2. Replace one sample quote with words from your own interview. Move it and check where its connector leads.
3. Invite your designer to edit the proposed test, then present the drawing together.

[Share a slate](../Using-Slatebox/readme.md#work-with-a-team)

## Allocate a pilot budget

A founder has $600 for onboarding research. $200 buys a newsletter placement in front of a partner’s audience, or two assisted imports where the team watches customers use the product.

1. On the [workshop page](https://slatebox.com/product/workshops/), choose **Open the $600 pilot budget**. Your private slate opens with $400 unallocated.
2. Drag **Second $200** to **Concierge onboarding**. From the keyboard: focus **Second $200**, press Enter, focus **Concierge onboarding**, press Enter. The lane now funds two assisted imports.
3. Invite your cofounder to edit. Move an allocation together, then choose **Present** to review what each channel funds.
4. After the first customer session, reopen the slate and decide where the next $200 goes.

## Put the budget board in your app

`mountWorkshop` draws the budget as movable cards in a plain DOM element and reports how many assisted imports the plan funds. Your page needs `<div id="pilot-budget"></div>` and `<p id="assisted-imports" aria-live="polite"></p>`. Use a bundled project with [the `slateboxjs` package](../Developers/JavascriptLibrary/readme.md) and its React peers installed.

<!-- tabs -->

```js JavaScript
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

```ts TypeScript
import 'slateboxjs/style.css'
import { mountWorkshop } from 'slateboxjs/workshops/mount'
import { createBudgetWorkshop, workshopBudgetResult, type Workshop } from 'slateboxjs/workshops/model'

const budget = createBudgetWorkshop()
const result = document.querySelector<HTMLParagraphElement>('#assisted-imports')!

function showAssistedImports(board: Workshop) {
  result.textContent = workshopBudgetResult(board, 'pilot')?.description ?? ''
}

showAssistedImports(budget)
const view = mountWorkshop(document.querySelector<HTMLDivElement>('#pilot-budget')!, budget, {
  onChange: showAssistedImports
})
```

<!-- /tabs -->

Drag a $200 card into the concierge lane and the count updates.

| To | Call |
| --- | --- |
| Apply a teammate’s saved changes | `view.update(nextBudget)` |
| Show a view-only board | Pass `readOnly: true` to `mountWorkshop` |
| Remove the board | `view.destroy()` |
