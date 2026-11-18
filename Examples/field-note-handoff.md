# Review two conflicting field notes

## Agent prompt

```text
Help me try the Slatebox example “Review two conflicting field notes”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/field-note-handoff.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/field-note-handoff.md.
```

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
