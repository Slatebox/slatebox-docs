# Apply a canvas theme

## Agent prompt

```text
Help me implement “Apply a canvas theme” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/JavascriptLibrary/themeExample.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/JavascriptLibrary/themeExample.md.
```

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
