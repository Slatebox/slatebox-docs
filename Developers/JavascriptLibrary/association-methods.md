# Relationship methods

## Connect two notes

Wait for both notes' `ready` promises, then call `addAssociation` on the source note. You get the new connection with its own `id`. Keep that ID: two connections can join the same pair of notes.

<!-- tabs -->

```js JavaScript
const connection = evidence.relationships.addAssociation(decision, {
  lineColor: '#2c6259',
  lineWidth: 3,
  showChildArrow: true
})
evidence.relationships.applyLineProperty(connection.id, 'lineColor', '#875120')
```

```ts TypeScript
import type { Association, Node } from 'slateboxjs'

declare const evidence: Node, decision: Node

const connection: Association = evidence.relationships.addAssociation(decision, {
  lineColor: '#2c6259',
  lineWidth: 3,
  showChildArrow: true
})
evidence.relationships.applyLineProperty(connection.id, 'lineColor', '#875120')
```

<!-- /tabs -->

## Read and remove connections

- `evidence.relationships.getAssociations()` returns the note's outgoing connections.
- `evidence.relationships.removeAssociation(connection.id)` removes one.

[Association properties](association-properties.md)
