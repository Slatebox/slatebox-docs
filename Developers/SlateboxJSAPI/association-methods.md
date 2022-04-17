---
label: Association Methods
icon: star
order: 40
---

Programatically control associations with the below methods.

### relationships.addAssociation

!!! info
The `node` making the call is the `parent` of the `association`.
!!!

||| Set an image to the background of the node

```
  node.relationships.addAssociation({
    child: otherNode,
    lineColor: '#000',
    lineOpacity: 1,
    lineEffect: 'outline',
    lineWidth: 10,
    isStraightLine: false,
    showParentArrow: true,
    showChildArrow: false
  });
```

||| arguments

| Name              | Type    | Description                                                                                          |
| ----------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `child`           | object  | The child `node` to connect to                                                                       |
| `lineColor`       | string  | The hex color of the connecting line                                                                 |
| `lineOpacity`     | integer | The opacity percentage of the connecting line (0.0 - 1.0)                                            |
| `lineEffect`      | string  | The line effect to apply (`postItNote`, `dropShadow`, `outlined`, `tattered`, `posterize`, `pencil`) |
| `lineWidth`       | integer | The width in px of the connecting line                                                               |
| `isStraightLine`  | boolean | Set to `true` to make the line straight, defaults to bezier curve                                    |
| `showParentArrow` | boolean | Show the arrowhead on the parent side                                                                |
| `showChildArrow`  | boolean | Show the arrowhead on the child side                                                                 |

|||

||| returns
null
|||
