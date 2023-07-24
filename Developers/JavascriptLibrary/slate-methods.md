---
label: Slate Methods
icon: star
order: 80
---

Programatically control the slate with the below methods.

### nodes.add

||| adds new node(s) to the slate

```
    slate.nodes.add([{
       new Slatebox.node({
          id: 'first_node',
          name: 'first_node',
          text: 'drag me',
          xPos: 25110,
          yPos: 25120,
          height: 60,
          width: 120,
          vectorPath: 'roundedrectangle',
          backgroundColor: '#24A8E0',
          lineColor: '#333',
          lineWidth: 5,
          allowMenu: true,
          filters: {
            vect: 'dropShadow',
          },
        })
    }]);
```

||| arguments

| Name   | Type   | Description                                                               |
| ------ | ------ | ------------------------------------------------------------------------- |
| `node` | object | either [a node object](./node-properties.md) or an array of node objects. |

|||

||| returns

null

|||

### nodes.remove

||| remove node(s) from the slate

```
    slate.nodes.remove([{
      options: {
        id: "id_to_remove"
      }
    }]);
```

||| arguments

| Name   | Type   | Description                                                               |
| ------ | ------ | ------------------------------------------------------------------------- |
| `node` | object | either [a node object](./node-properties.md) or an array of node objects. |

|||

||| returns

null

|||

### svg

||| download the slate as svg

```
    slate.svg();
```

||| arguments

None

|||

||| returns

browser will download a `slate_timestamp.svg` svg file

|||

### png

||| download the slate as png

```
    slate.png();
```

||| arguments

None

|||

||| returns

browser will download a `slate_timestamp.png` png file

|||

### canvas.zoom

||| zoom the slate on the z plane

```
slate.canvas.zoom({
  dur: 500,
  callbacks: {
      after: () => {
        console.log('called at the end of the zoom');
    },
    during: () => {
      console.log('called once per animationFrame while zooming');
    }
  },
  easing: 'easeFromTo',
  zoomPercent: 100,
});
```

||| arguments

| Name        | Type    | Description                             |
| ----------- | ------- | --------------------------------------- |
| `dur`       | integer | duration in millis                      |
| `callbacks` | object  | callbacks for `after` and `during` move |
| `easing`    | string  | [see all easing options](./easing.md)   |

|||

||| returns

null

|||

### canvas.move

||| move the slate on the x, y plane

```
slate.canvas.move({
    x: 125,
    y: 40,
    dur: 500,
    callbacks: {
      after: () => {
        console.log('called at the end of the move');
      },
      during: () => {
        console.log('called once per animationFrame while moving');
      }
    },
    isAbsolute: false,
    easing: 'easeFromTo',
  });
```

||| arguments

| Name         | Type    | Description                                                                    |
| ------------ | ------- | ------------------------------------------------------------------------------ |
| `x`          | integer | `x` in px to move the canvas (relative or absolute, depending on `isAbsolute`) |
| `y`          | integer | `y` in px to move the canvas (relative or absolute, depending on `isAbsolute`) |
| `dur`        | integer | duration in millis                                                             |
| `callbacks`  | object  | callbacks for `after` and `during` move                                        |
| `isAbsolute` | boolean | relative or absolute `x,y` coordinates                                         |
| `easing`     | string  | [see all easing options](./easing.md)                                          |

|||

||| returns

null

|||

### applyTheme

||| applyTheme

```
slate.applyTheme(theme, syncWithTheme);
```

||| arguments

| Name            | Type    | Description                                                                                                                                                       |
| --------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme`         | object  | [A theme object](./themeExample.md)                                                                                                                               |
| `syncWithTheme` | boolean | Setting to `true` syncs the properties with created children with the theme properties instead of the default (children inheriting properties from their parents. |

|||

||| returns

null

|||

### exportJSON

||| a JSON representation of the slate

```
slate.exportJSON();
```

||| arguments

None

|||

||| returns an array of [...nodeObject](./node-properties.md)(s) and a [...slateObject](./slate-properties.md).

```
{
 "_id": "CsiJNp8G8LiPHhxRD",
	"created": 1650100223609,
	"lastSaved": 1650100223609,
	"nodes": [
    {
      ...nodeObject
    }
  ]
  "options": {
    ...slateObject
  },
  "shareId": "ebc8e555",
  "userId": "xxx",
  "orgId": "yyy"
}
```

|||

### loadJSON

||| load a slate with the JSON string exported from `exportJSON`

```
  slate.loadJSON(jsonSlate, blnPreserve, blnSkipZoom);
```

||| arguments

| Name          | Type    | Description                                                         |
| ------------- | ------- | ------------------------------------------------------------------- |
| `jsonSlate`   | string  | A JSON string as described in the `exportJSON` return               |
| `blnPreserve` | boolean | Setting to `true` will preserve the contents of the targeted slate. |
| `blnSkipZoom` | boolean | Setting to `true` will not zoom the slate after loading the nodes   |

|||

||| returns

null

|||

### getOrientation

||| orientation details for the slate

```
slate.getOrientation(nodesToOrient, alwaysOne);
```

||| arguments

| Name            | Type    | Description                                                                                                        |
| --------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `nodesToOrient` | array   | An optional array of node `id`s to use when calculating the orientation, if ommited or null, defaults to all nodes |
| `alwaysOne`     | boolean | Defaults to false. Set to true to always enforce a zoom level of 1 (fit to screen) for the orientation             |

|||

||| returns

```
  {
    orientation: 'landscape|portrait',
    height: 448, // height of slate in px
    width: 780, // width of slate in px
    left: 45, // left (x) of the slate as positioned against the infinite canvas in px
    top: 23, // top (y) coords of the slate as positioned against the infinite canvas in px
  }
```

|||

### scaleToFitAndCenter

!!! info
This function combines the `scaleToFitNodes` and `centerOnNodes` methods into one simplified call.
!!!

||| scale and center the slate on all its nodes

```
  slate.scaleToFitAndCenter(dur, cb);
```

||| arguments

| Name  | Type     | Description                                                                     |
| ----- | -------- | ------------------------------------------------------------------------------- |
| `dur` | integer  | The duration in milliseconds for the scaling and centering animations to happen |
| `cb`  | function | Optional callback to fire after scaling and centering completes                 |

|||

||| returns

```
  null
```

|||

### scaleToFitNodes

||| scale the slate to show all nodes (or those selected) in the viewport

```
  slate.scaleToFitNodes({
    nodes: [],
    dur: 0,
    cb: null
  });
```

||| arguments

| Name    | Type     | Description                                                                                                    |
| ------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `nodes` | array    | An optional array of node `id`s to use when calculating the scaling, if ommited or null, defaults to all nodes |
| `dur`   | integer  | The duration in milliseconds for the scaling animation to happen                                               |
| `cb`    | function | Optional callback to fire after scaling completes                                                              |

|||

||| returns

```
  null
```

|||

### centerOnNodes

||| scale the slate to show all nodes (or those selected) in the viewport

```
  slate.scaleToFitNodes({
    nodes: [],
    dur: 0,
    cb: null
  });
```

||| arguments

| Name    | Type     | Description                                                                                                      |
| ------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `nodes` | array    | An optional array of node `id`s to use when calculating the centering, if ommited or null, defaults to all nodes |
| `dur`   | integer  | The duration in milliseconds for the center move animation to happen                                             |
| `cb`    | function | Optional callback to fire after centering completes                                                              |

|||

||| returns

```
  null
```

|||

### slate.grid.show

||| show the background grid on the slate canvas

```
  slate.grid.show();
```

||| arguments

none

|||

||| returns

```
  null
```

|||

### slate.grid.destroy

||| remove the background grid on the slate canvas

```
  slate.grid.destroy();
```

||| arguments

none

|||

||| returns

```
  null
```

|||
