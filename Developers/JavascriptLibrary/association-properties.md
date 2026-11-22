# Association properties

## Agent prompt

```text
Help me implement “Association properties” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/JavascriptLibrary/association-properties.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/JavascriptLibrary/association-properties.md.
```

Pass style options as the second argument to `source.relationships.addAssociation(destination, options)`. The engine sets the IDs.

| Property | Meaning |
| --- | --- |
| `id` | This connection's identity, even when several join the same notes |
| `parentId`, `childId` | Source and destination note IDs |
| `lineColor`, `lineWidth`, `lineOpacity` | Stroke color, thickness and opacity |
| `lineType` | Routing: `'bezier'` (curved, the default), `'straight'` or `'orthogonal'` |
| `showParentArrow`, `showChildArrow` | Arrowhead at the source or destination |
| `label` | Text shown on the line |
| `sourceAnchor`, `targetAnchor` | Fixed point on a note, each axis from 0 to 1 |

An anchor of `{x: 1, y: 0.5}` pins that end to the middle of the note's right edge. Without an anchor, the engine picks the attachment point as notes move. [Connect two notes](association-methods.md)
