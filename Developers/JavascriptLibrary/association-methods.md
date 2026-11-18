# Relationship methods

## relationships.addAssociation

After both nodes’ `ready` promises resolve, add a directed relationship from the source node to the destination node. The returned association has its own ID. Two connections can join the same pair of nodes, so retain that ID to address a particular edge.

```js
const connection = evidence.relationships.addAssociation(decision, {
  lineColor: '#2c6259',
  lineWidth: 3,
  showChildArrow: true
})
evidence.relationships.applyLineProperty(connection.id, 'lineColor', '#875120')
```

Call `evidence.relationships.getAssociations()` to inspect outbound associations. Call `evidence.relationships.removeAssociation(connection.id)` to remove that connection. [Association properties](association-properties.md)
