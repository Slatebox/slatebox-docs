# Apply a canvas theme

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
