# Association properties

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
