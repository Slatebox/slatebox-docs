---
title: Review two conflicting field notes
description: Compare a technician’s field test with the desk copy and keep the evidence behind either decision.
group: Interactions
demo: handoff
---

## Try it

1. Drag Noor’s badge test onto Jules’s notebook and hold it. Read both reports.
2. Drop it and choose **Merge field test**.
3. Choose **Reopen review**, then **Keep shared note**.

The fallback instructions survive both choices. The board simulates an offline handoff inside one document.

## Run the same review in code

The SlateboxJS workshop model runs the same transitions without a browser. Run it with Node.js in a project with [the `slateboxjs` package](../Developers/JavascriptLibrary/readme.md) installed.

<!-- tabs -->

```js Node.js
import { offlineHandoff, reviewHandoff, resolveHandoff, handoffSummary } from 'slateboxjs/workshops/model'

const review = reviewHandoff({
  ...offlineHandoff,
  fieldNote: 'The reader missed the test badge.',
  deskNote: 'The reader passed the morning test.',
  fallback: 'Use the staffed entrance.'
})
const field = resolveHandoff(review, 'field')
console.log(handoffSummary(field))
console.log(handoffSummary(resolveHandoff(reviewHandoff(field), 'desk')))
```

```ts TypeScript
import { offlineHandoff, reviewHandoff, resolveHandoff, handoffSummary, type OfflineHandoffModel } from 'slateboxjs/workshops/model'

const review: OfflineHandoffModel = reviewHandoff({
  ...offlineHandoff,
  fieldNote: 'The reader missed the test badge.',
  deskNote: 'The reader passed the morning test.',
  fallback: 'Use the staffed entrance.'
})
const field = resolveHandoff(review, 'field')
console.log(handoffSummary(field))
console.log(handoffSummary(resolveHandoff(reviewHandoff(field), 'desk')))
```

<!-- /tabs -->

```text Output
The reader missed the test badge. Use the staffed entrance.
The reader passed the morning test. Use the staffed entrance.
```

Save the whole handoff object so the desk can reopen the review later.

[Open a handoff at the review step](https://app.slatebox.com/new/offline-handoff?stage=review)
