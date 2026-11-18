# Relationship methods

## Agent prompt

```text
Help me implement “Relationship methods” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/JavascriptLibrary/association-methods.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/JavascriptLibrary/association-methods.md.
```

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
