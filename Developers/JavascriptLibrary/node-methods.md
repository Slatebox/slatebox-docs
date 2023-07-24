---
label: Node Methods
icon: star
order: 60
---

Programatically control a node with the below methods.

### move

||| move a node by x, y coordinates

```
    node.move({
        x: 30,
        y: 20,
        dur: 500
    });
```

||| arguments

| Name  | Type    | Description                                                          |
| ----- | ------- | -------------------------------------------------------------------- |
| `x`   | integer | Relative number of px to move the node on x axis                     |
| `y`   | integer | Relative number of px to move the node on y axis                     |
| `dur` | intger  | The milliseconds for animating the move. Set to 0 to move instantly. |

|||

||| returns
null
|||

### toFront

||| move a node to front on the z axis

```
    node.toFront();
```

||| arguments

none

|||

||| returns
null
|||

### toBack

||| move a node to back on the z axis

```
    node.toBack();
```

||| arguments

none

|||

||| returns
null
|||

### hide

||| hide the node

```
    node.hide();
```

||| arguments

none

|||

||| returns
null
|||

### show

||| show the node

```
    node.show();
```

||| arguments

none

|||

||| returns
null
|||

### toggleFilters

||| show or hide the node effect (dropshadow, etc)

```
    node.toggleFilters(blnHide);
```

||| arguments

| Name      | Type    | Description                           |
| --------- | ------- | ------------------------------------- |
| `blnHide` | boolean | Set to true ot hide the filter effect |

|||

||| returns
null
|||

### spin

||| Apply a perpetual spin effect to a node

```
    node.spin({
        angle: 280,
        duration: 500
    });
```

||| arguments

| Name       | Type    | Description                                  |
| ---------- | ------- | -------------------------------------------- |
| `angle`    | integer | The angle to spin the node                   |
| `duration` | integer | Milliseconds to take for each spin animation |

|||

||| returns
null
|||

### zoom

||| Zoom in on the node

```
    node.zoom(zoomPercent, duration, cb);
```

||| arguments

| Name          | Type     | Description                       |
| ------------- | -------- | --------------------------------- |
| `zoomPercent` | integer  | The zoom percent                  |
| `duration`    | integer  | Milliseconds to take for the zoom |
| `cb`          | function | Callback once the zoom completes  |

|||

||| returns
null
|||

### position

||| Position the node

```
    node.position(location, cb, easing, dur);
```

||| arguments

| Name       | Type     | Description                                                                                                            |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `location` | string   | Position on the slate to put this node. Options are `lowerright`, `lowerleft`, `upperright`, `upperleft` and `center`. |
| `cb`       | function | Callback once the position completes                                                                                   |
| `easing`   | function | The [easing](./easing.md) options                                                                                      |
| `dur`      | function | The milliseconds in which to animate the position                                                                      |

|||

||| returns
null
|||

### disable

!!! info
Optionally set `node.options.isLocked = true` prior to making this `disable` call to enable lock icons that the user can programmatically click to re-enable the node.
!!!

||| Disables the node from any interaction

```
    node.disable();
```

||| arguments
None
|||

||| returns
null
|||

### enable

||| Enable the node for user interaction

```
    node.enable();
```

||| arguments
None
|||

||| returns
null
|||

### colorPicker.set

||| Set the background color and opacity for the node

```
    node.colorPicker.set({
        color: '#333',
        opacity: 1.0
    });
```

||| arguments

| Name      | Type    | Description                                                                                               |
| --------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `color`   | string  | The hex color for the node. Gradients can also be defined: `90-#031634-#2D579A` (angle-start_hex-end_hex) |
| `opacity` | integer | the opacity percentage (0.0 - 1.0) for the node color                                                     |

|||

||| returns
null
|||

### customShapes.set

||| Set the node to a custom svg path

```
    node.customShapes.set(path, width, height, sendCollab);
```

||| arguments

| Name         | Type    | Description                                                                             |
| ------------ | ------- | --------------------------------------------------------------------------------------- |
| `path`       | string  | The custom svg path to attach to the node (e.g., `M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z`) |
| `width`      | integer | The width of the shape in px                                                            |
| `height`     | integer | The height of the shape in px                                                           |
| `sendCollab` | boolean | Set to false to NOT send the collaboration data, defaults to true                       |

|||

||| returns
null
|||

### editor.set

||| Set the node to a custom svg path

```
    node.editor.set(text, fontSize, fontColor, fontOpacity, textXAlign, textYAlign);
```

||| arguments

| Name          | Type    | Description                                                                      |
| ------------- | ------- | -------------------------------------------------------------------------------- |
| `text`        | string  | The text to go in the node. Include appropriate `\n` line breaks where necessary |
| `fontSize`    | integer | The width of the shape in px                                                     |
| `fontColor`   | string  | The hex color of the text (`#333`)                                               |
| `fontOpacity` | integer | The opacity percentage of the text (0.0 - 1.0)                                   |
| `textXAlign`  | string  | Text horizontal align (`middle`, `left`, `right`)                                |
| `textYAlign`  | string  | Text vertical align (`middle`, `top`, `bottom`)                                  |

|||

||| returns
null
|||

### images.set

||| Set an image to the background of the node

```
    node.images.set(img, width, height);
```

||| arguments

| Name     | Type    | Description                                                |
| -------- | ------- | ---------------------------------------------------------- |
| `image`  | string  | The img src url (e.g., `https://e.com/i.png`)              |
| `width`  | integer | The width of the image (used for proportionally resizing)  |
| `height` | integer | The height of the image (used for proportionally resizing) |

|||

||| returns
null
|||

### links.set

||| Set a link on the node

```
    node.links.set({
        type: 'url|currentSlate',
        data: 'https://slatebox.com|other_node_id'
    }, blnSendCollab);
```

||| arguments

| Name            | Type    | Description                                                                                                          |
| --------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `opts.type`     | string  | The type of link, either `url` (links to external site) or `currentSlate` (links to another node on the same slate). |
| `opts.data`     | string  | The link data (either the url or the other node's `id`)                                                              |
| `blnSendCollab` | boolean | Boolean as to whether to send the collab data                                                                        |

|||

||| returns
null
|||

### links.unset

||| Remove a link from the node

```
    node.links.unset(blnSendCollab);
```

||| arguments

| Name            | Type    | Description                                   |
| --------------- | ------- | --------------------------------------------- |
| `blnSendCollab` | boolean | Boolean as to whether to send the collab data |

|||

||| returns
null
|||

### resize.set

||| Resize a node

```
    node.resize.set(width, height);
```

||| arguments

| Name     | Type    | Description                     |
| -------- | ------- | ------------------------------- |
| `width`  | integer | Width in px to resize the node  |
| `height` | integer | Height in px to resize the node |

|||

||| returns
null
|||

### rotate.set

||| Rotate a node

```
    node.rotate.set(rotationAngle);
```

||| arguments

| Name            | Type    | Description                         |
| --------------- | ------- | ----------------------------------- |
| `rotationAngle` | integer | The rotation angle (0-360) to apply |

|||

||| returns
null
|||
