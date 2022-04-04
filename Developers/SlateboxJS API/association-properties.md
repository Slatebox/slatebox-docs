---
label: Association Properties
icon: star
order: 50
---

Associations define the relationships between nodes.

| Property <br/> ~_`example`_~      | Description                                                                                                                                                                                                         | Type    | Default |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| id <br/> ~_`abcd`_~               | A unique id for the association                                                                                                                                                                                     |
| child <br/> ~_`{ Node Object }`_~ | The `child` node                                                                                                                                                                                                    | string  | `""`    |
| lineColor <br/> ~_`#000000`_~     | The line color in hex. If not set, it will use the `node.options.lineColor` property.                                                                                                                               | string  | `#000`  |
| lineOpacity <br/> ~_`.75`_~       | The line opacity (0.0 - 1.0). If not set, it will use the `node.options.lineOpacity` property.                                                                                                                      | integer | `1`     |
| lineEffect <br/> ~_`outlined`_~   | The line effect filter. If not set, it will use the `node.options.lineEffect` property. The available filters are: `dropShadow`, `postItNote`, `tattered`, `blur`, `outline`, `pixelate`, `posterize`, and `pencil` | string  | `""`    |
| lineWidth <br/> ~_`10`_~          | The line width in px. If not set, it will use the `node.options.lineWidth` property.                                                                                                                                | integer | `2`     |
| isStraightLine <br/> ~_`false`_~  | Set to true for a straight line, otherwise all associations default to bezier curves                                                                                                                                | boolean | `false` |
| showParentArrow <br/> ~_`true`_~  | Show the parent arrowhead                                                                                                                                                                                           | boolean | `true`  |
| showChildArrow <br/> ~_`true`_~   | Show the child arrowhead                                                                                                                                                                                            | boolean | `true`  |
