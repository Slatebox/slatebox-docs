# Slate options

## Agent prompt

```text
Help me implement “Slate options” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/JavascriptLibrary/slate-properties.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/JavascriptLibrary/slate-properties.md.
```

## Slate Properties

Pass options as the second argument to `new Slate(container, options)`. The container can be an element or a selector. Give it measurable dimensions before initialization.

| Option | Purpose |
| --- | --- |
| `name`, `description` | Identify the board in serialized metadata. |
| `containerStyle.backgroundColor` | Set the canvas background. |
| `viewPort.showGrid`, `viewPort.gridSize` | Show a grid and choose its spacing. |
| `viewPort.snapToGrid` | Align movement to the grid. |
| `showbirdsEye`, `showZoom`, `showUndoRedo` | Configure the corresponding canvas controls. |
| `allowDrag` | Configure drag interaction on the slate. |

```js
const slate = new Slate('#board', {
  name: 'Station plan',
  containerStyle: { backgroundColor: '#f8f6ef' },
  viewPort: { showGrid: true, gridSize: 20, snapToGrid: true }
})
```

Visibility and collaboration settings on a browser object do not grant a user access to a stored slate. Enforce access in the host and its relay when sharing documents. [Create the first nodes](readme.md#quick-slate)
