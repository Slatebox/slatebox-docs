# Mix two sound sculptures

## Agent prompt

```text
Help me try the Slatebox example “Mix two sound sculptures”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/listening-room.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/listening-room.md.
```

## Try it

1. Roll the horn from the copper roof toward the glass chimes and hold it halfway. The caption reads “Rain and glass chimes overlap.”
2. Choose **Enable sound** to hear both loops at that position.
3. Press Escape while holding the horn to return to the saved mix.

The horn also moves with the arrow keys, Home and End.

## Set the starting mix in your app

Run this with Node.js in a project with [the `slateboxjs` package](../Developers/JavascriptLibrary/readme.md) installed.

<!-- tabs -->

```js Node.js
import { listeningRoom, normalizeListeningRoom, listeningRoomCaption } from 'slateboxjs/workshops/model'

const room = normalizeListeningRoom({ ...listeningRoom, mix: 0.46 })
console.log(room.mix, listeningRoomCaption(room))
```

```ts TypeScript
import { listeningRoom, normalizeListeningRoom, listeningRoomCaption } from 'slateboxjs/workshops/model'

const room = normalizeListeningRoom({ ...listeningRoom, mix: 0.46 })
if (!room) throw new Error('The mix is not valid')
console.log(room.mix, listeningRoomCaption(room))
```

<!-- /tabs -->

```text Output
0.46 Rain and glass chimes overlap.
```

Pass `room` to `ListeningRoomBoard` as its `value`. Save the object `onChange` gives you to keep a visitor’s final position.

[Keep this mix in a new slate](https://app.slatebox.com/new/listening-room?mix=0.46)
