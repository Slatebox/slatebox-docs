# Node properties

Pass these options to `slate.addNode(options)`. Give each note a unique ID when it stands for a record in your data.

| Option | Example | Meaning |
| --- | --- | --- |
| `id`, `text` | `'platform'`, `'Platform lift'` | Stable identity and visible label |
| `x`, `y` | `120`, `80` | Position in board coordinates |
| `width`, `height` | `160`, `70` | Size in board coordinates |
| `shape` | `'rectangle'`, `'ellipse'` | Registered shape name |
| `vectorPath` | `'M0 0L80 0L40 60Z'` | Custom SVG path data |
| `fontFamily`, `fontSize`, `fontColor` | `'sans-serif'`, `16`, `'#19271c'` | Label typography |
| `backgroundColor`, `borderColor`, `borderWidth` | `'#dbe9d8'`, `'#394a39'`, `2` | Shape appearance |

To change a note after it is drawn, use its methods. They update the drawing and the saved model together. [Node methods](node-methods.md)
