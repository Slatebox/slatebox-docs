---
label: SlateboxJS API
icon: star
---

### Introduction

Slateboxjs is an [MIT-licensed standalone javascript library](https://github.com/Slatebox/Slateboxjs) that can be used to create diagrams, mind-maps, and more on an infinite campus. It's the same underlying library used in the [Slatebox App](./development.md) and at [Slatebox.com](https://app.slatebox.com).

### Installation

The easiest is just as an npm module.

`npm i slateboxjs`

### Development

Do you want to contribute to the slateboxjs core to do bug fixes or feature enhancements? Excellent. Please reach out on the [community forums](https://community.slatebox.com) with questions.

`git clone git@github.com:Slatebox/slateboxjs.git`

`cd slateboxjs`

`npm install`

`npm run start`

!!!
Under the covers, Slateboxjs uses the amazing [parcel](https://parceljs.org) library to build and serve the module.
!!!

### Quick Slate

Here is a simple codepen example of a slate with 2 connected nodes.

<iframe height="600" style="width: 100%;" scrolling="no" title="Slatebox - 2 Nodes" src="https://codepen.io/timheckel/embed/JjMNKmP?default-tab=js%2Cresult&editable=true&theme-id=dark" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/timheckel/pen/JjMNKmP">
  Slatebox - 2 Nodes</a> by Tim Heckel (<a href="https://codepen.io/timheckel">@timheckel</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

<br/>
<br/>

### Slate

=== &nbsp;

+++ Properties
Below are all the [available properties](https://github.com/Slatebox/slateboxjs/blob/main/src/core/slate.js#L30) when you create a slate. Feel free to change the above code with these options and see a live preview.

Take note of these badges:

| Badge                                                  | Description                                                                                                                  |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| [!badge variant="warning" text="Experimental"]         | This is an expirimental feature.                                                                                             |
| [!badge variant="success" text="Slatebox App Enabled"] | This property works in conjuction with the [Slatebox App](./development.md).                                                 |
| [!badge variant="info" text="Collaboration Feature"]   | This property works in collaboration mode, which must be bootrstrapped either with the Slatebox App or some other mechanism. |

| Property <br/> ~_`example`_~                                                                                            | Description                                                                                                                                                                            | Type    | Default       |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------- |
| id <br/> ~_`abcd`_~                                                                                                     | Unique identifier for the slate                                                                                                                                                        | string  | `""`          |
| container <br/> ~_`abcd`_~                                                                                              | The id of the container that will host the slate (so this would be `slateCanvas` if the container was `<div id='slateCanvas'></div>`)                                                  | string  | `""`          |
| instance <br/> ~_`abcd`_~                                                                                               | Unique instance id of the slate (only necessary in collaboration mode)                                                                                                                 | string  | `""`          |
| name <br/> ~_`slate name`_~                                                                                             | Name of the slate                                                                                                                                                                      | string  | `""`          |
| description <br/> ~_`slate description`_~                                                                               | Description of the slate                                                                                                                                                               | string  | `""`          |
| basedOnThemeId <br/> ~_`theme12`_~                                                                                      | Apply a specific theme to the slate using the [theme](Theme API)                                                                                                                       | string  | `null`        |
| [!badge variant="warning" text="Experimental"]<br/>syncWithTheme <br/> ~_`true`_~                                       | Sync the shape creation with the theme in question                                                                                                                                     | boolean | `false`       |
| containerStyle.backgroundColor <br/> ~_`#333` or `transparent`_~                                                        | Static hex background color of the slate (hex or transparent)                                                                                                                          | string  | `transparent` |
| containerStyle.backgroundImage <br/> ~_`https://picsum.photos/id/237/200/300`_~                                         | Background src image of the slate                                                                                                                                                      | string  | `""`          |
| containerStyle.backgroundSize <br/> ~_cover_~                                                                           | [CSS Background Size Property](https://developer.mozilla.org/en-US/docs/Web/CSS/background-size). (`cover` or `contain`, etc)                                                          | string  | `""`          |
| [!badge variant="warning" text="Experimental"]<br/>containerStyle.backgroundEffect <br/> ~_abcd_~                       | Use an SVG filter effect for the background                                                                                                                                            | string  | `null`        |
| containerStyle.backgroundColorAsGradient <br/> ~_`true`_~                                                               | Enable background gradient                                                                                                                                                             | boolean | `null`        |
| containerStyle.backgroundGradientType <br/> ~_`linear` or `radial`_~                                                    | Specify the background gradient to apply to the slate                                                                                                                                  | string  | `null`        |
| containerStyle.backgroundGradientColors <br/> ~_['#ccc', '#333]_~                                                       | Array of hex colors that make up the gradient                                                                                                                                          | array   | `[]`          |
| [!badge variant="success" text="Slatebox App Enabled"]<br/>containerStyle.backgroundGradientStrategy <br/> ~_`shades`_~ | Define the gradient strategy (only when using the Slatebox App to generate the colors). Either `shades` (variance of a single color) or `pallette` (complementary colors) can be used. | string  | `shades`      |
| viewPort.useIntertiaScrolling <br/> ~_true_~                                                                            | Use inertia scrolling for the Slate canvas. (Two finger touchpad slide navigation)                                                                                                     | boolean | `true`        |
| viewPort.showGrid <br/> ~_true_~                                                                                        | Show background alignment 50 x 50 grid                                                                                                                                                 | boolean | false         |
| viewPort.snapToObjects <br/> ~_false_~                                                                                  | Auto-snap to the neighboring objects when positioning nodes                                                                                                                            | boolean | true          |
| viewPort.gridSize <br/> ~_100_~                                                                                         | Size of square outline inside the grid                                                                                                                                                 | integer | 50            |
| viewPort.width <br/> ~_10000_~                                                                                          | Width in px of the canvas                                                                                                                                                              | integer | 50000         |
| viewPort.height <br/> ~_10000_~                                                                                         | Height in px of the canvas                                                                                                                                                             | integer | 50000         |
| viewPort.left <br/> ~_abcd_~                                                                                            | Initial left (x) position of the canvas                                                                                                                                                | integer | 25000         |
| viewPort.top <br/> ~_abcd_~                                                                                             | Initial top (y) position of the canvas                                                                                                                                                 | integer | 25000         |
| enabled <br/> ~_false_~                                                                                                 | Set to false to disable the slate and make it non-interactive                                                                                                                          | boolean | true          |
| allowDrag <br/> ~_false_~                                                                                               | Allow the canvas to be draggable                                                                                                                                                       | boolean | true          |
| showbirdsEye <br/> ~_abcd_~                                                                                             | Show the birds eye view in the upper                                                                                                                                                   | boolean | true          |
| sizeOfbirdsEye <br/> ~_150_~                                                                                            | Default size of birds eye square in px                                                                                                                                                 | integer | 200           |
| showMultiSelect <br/> ~_false_~                                                                                         | Show the multi select button on the slate                                                                                                                                              | boolean | true          |
| showZoom <br/> ~_false_~                                                                                                | Show the zoom slider on the slate                                                                                                                                                      | boolean | true          |
| showUndoRedo <br/> ~_abcd_~                                                                                             | Show undo / redo buttons on the slate                                                                                                                                                  | boolean | true          |
| showStatus <br/> ~_abcd_~                                                                                               | Show the status x,y coordinates in the upper left                                                                                                                                      | boolean | false         |
| showLocks <br/> ~_abcd_~                                                                                                | Show the node locks on the slate when a node has `options.locked` set to true                                                                                                          | boolean | true          |
| mindMapMode <br/> ~_abcd_~                                                                                              | Enable mind map mode on the slate. Mind-map mode automatically creates parent -> child relationships when a node is added from another node.                                           | boolean | true          |
| [!badge variant="success" text="Slatebox App Enabled"]<br/>isPublic <br/> ~_false_~                                     | Determine if a slate is public, private, or unlisted when using the Slatebox App.                                                                                                      | boolean | true          |
| [!badge variant="success" text="Slatebox App Enabled"]<br/>isUnlisted <br/> ~_false_~                                   | Determine if a slate is public, private, or unlisted when using the Slatebox App.                                                                                                      | boolean | false         |
| [!badge variant="success" text="Slatebox App Enabled"]<br/>isPrivate <br/> ~_false_~                                    | Determine if a slate is public, private, or unlisted when using the Slatebox App.                                                                                                      | boolean | false         |
| [!badge variant="warning" text="Experimental"]<br/>autoEnableDefaultFilters <br/> ~_abcd_~                              | Auto enable SVG background filters for slate                                                                                                                                           | boolean | false         |
| [!badge variant="info" text="Collaboration Feature"]<br/>followMe <br/> ~_abcd_~                                        | Enable follow-me mode: enforce the Slate canvas and zoom positions to be synced across all collaborators                                                                               | boolean | false         |

+++ Methods
Slate Methods will be documented here.
+++
===

### Node

=== &nbsp;

+++ Properties
Node Properties will be documented here.
+++ Methods
Node Methods will be documented here.
+++
===
