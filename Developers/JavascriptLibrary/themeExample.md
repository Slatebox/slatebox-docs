# Apply a canvas theme

A theme brings the board background, node styles and connector color together. Apply it after adding or loading the nodes you want to restyle.

```js
slate.applyTheme({
  name: 'Field notes',
  containerStyle: { backgroundColor: '#f7f3e8' },
  defaultLineColor: '#53725a',
  styles: {
    parent: {
      backgroundColor: '#25483e', fontColor: '#ffffff', borderColor: '#25483e'
    },
    child_1: {
      backgroundColor: '#e3ebd8', fontColor: '#203c32', borderColor: '#698672'
    }
  }
})
```

Provide a `parent` style and numbered child styles such as `child_1`. Save the resulting board with `slate.exportJSON()`. [Slate methods](slate-methods.md)
