# Node properties

Pass node options to `slate.addNode(options)`. Supply unique IDs when linking imported records to a diagram.

| Option | Example | Meaning |
| --- | --- | --- |
| `id`, `text` | `'platform'`, `'Platform lift'` | Stable identity and visible label |
| `x`, `y` | `120`, `80` | Position in board coordinates |
| `width`, `height` | `160`, `70` | Size in board coordinates |
| `shape` | `'rectangle'`, `'ellipse'` | Registered shape name |
| `vectorPath` | `'M0 0L80 0L40 60Z'` | Custom SVG path data |
| `fontFamily`, `fontSize`, `fontColor` | `'sans-serif'`, `16`, `'#19271c'` | Label typography |
| `backgroundColor`, `borderColor`, `borderWidth` | `'#dbe9d8'`, `'#394a39'`, `2` | Shape appearance |

When adapting a legacy integration, use `x` and `y` for `xPos` and `yPos`, `shape` for `shapeHint`, and `fontColor` for `foregroundColor`. Change a rendered node through its methods so the SVG and its model are updated together. [Node methods](node-methods.md)
