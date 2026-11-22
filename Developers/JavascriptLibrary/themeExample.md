# Apply a canvas theme

## Agent prompt

```text
Help me implement “Apply a canvas theme” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.

Read https://docs.slatebox.com/Developers/JavascriptLibrary/themeExample.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Developers/JavascriptLibrary/themeExample.md.
```

A theme sets the background, the note styles and the line color in one call. Apply it after you add or load the notes.

<!-- tabs -->

```js JavaScript
slate.applyTheme({
  name: 'Field notes',
  containerStyle: { backgroundColor: '#f7f3e8' },
  defaultLineColor: '#53725a',
  styles: {
    parent: { backgroundColor: '#25483e', fontColor: '#ffffff', borderColor: '#25483e' },
    child_1: { backgroundColor: '#e3ebd8', fontColor: '#203c32', borderColor: '#698672' }
  }
})
```

```ts TypeScript
import type { Slate, ThemeDefinition } from 'slateboxjs'

declare const slate: Slate

const fieldNotes: ThemeDefinition = {
  name: 'Field notes',
  containerStyle: { backgroundColor: '#f7f3e8' },
  defaultLineColor: '#53725a',
  styles: {
    parent: { backgroundColor: '#25483e', fontColor: '#ffffff', borderColor: '#25483e' },
    child_1: { backgroundColor: '#e3ebd8', fontColor: '#203c32', borderColor: '#698672' }
  }
}
slate.applyTheme(fieldNotes)
```

<!-- /tabs -->

The first note takes the `parent` style. Later notes take `child_1`, `child_2` and so on, in turn. Save the result with `slate.exportJSON()`. [Slate methods](slate-methods.md)
