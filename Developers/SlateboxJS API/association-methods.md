---
label: Association Methods
icon: star
order: 40
---

Programatically control associations with the below methods.

||| Name
addAssociation
||| Invocation

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
  })
```

||| Description
The `node` making the call is the `parent` of the `association`.
|||
