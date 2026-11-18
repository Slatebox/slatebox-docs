---
title: Review two conflicting field notes
description: Compare a technician’s field test with the desk copy and keep the evidence behind either decision.
group: Interactions
demo: handoff
---

Drag Noor’s badge test onto Jules’s notebook. While holding it, read the two reports. Drop it, choose **Merge field test**, then **Reopen review** and choose **Keep shared note**. The fallback instructions survive both choices. This interaction simulates an offline handoff inside one document.

The pinned SlateboxJS file build exposes the same transitions to a host or agent. Try them with two original reports.

```js
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

The first line starts with the missed badge and the second starts with the morning test. Both end with “Use the staffed entrance.” Persist the whole handoff so the desk can reopen it later.

[Open a handoff at the review step](https://app.slatebox.com/new/offline-handoff?stage=review)
