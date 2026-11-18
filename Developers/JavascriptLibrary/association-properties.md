# Association properties

## Agent prompt

```text
Help me implement “Association properties” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/JavascriptLibrary/association-properties.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/JavascriptLibrary/association-properties.md.
```

Supply style overrides as the second argument to `source.relationships.addAssociation(destination, options)`. The manager assigns the source, destination and connection IDs.

| Property | Meaning |
| --- | --- |
| `id` | Identity of this connection, including when several connect the same nodes |
| `parentId`, `childId` | Source and destination node IDs |
| `lineColor`, `lineWidth`, `lineOpacity` | Stroke color, thickness and opacity |
| `lineType` | Connector routing, for example `'straight'` or `'orthogonal'` |
| `showParentArrow`, `showChildArrow` | Arrowheads at the source or destination |
| `label` | Text displayed on the edge |
| `sourceAnchor`, `targetAnchor` | Optional normalized point on a node, with each axis from 0 to 1 |

An anchor of `{x: 1, y: 0.5}` pins that end to the center of the node’s right edge. An automatic anchor allows the engine to choose the attachment point as nodes move. [Create and update a connection](association-methods.md)
