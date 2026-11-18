# Mix two sound sculptures

## Agent prompt

```text
Help me try the Slatebox example “Mix two sound sculptures”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.

Read https://docs.slatebox.com/Examples/listening-room.md first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.

If your client cannot fetch the documentation, read the same published file at https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype/Examples/listening-room.md.
```

Roll the horn from the copper roof toward the glass chimes. Hold it halfway. The caption changes to “Rain and glass chimes overlap.” Choose **Enable sound** to hear the two loops at that position. Press Escape while holding the horn to return to the saved mix.

To set the starting mix in your own host, run this JavaScript in a project using the pinned SlateboxJS file build. The creative model exports belong to that build.

```js
import { listeningRoom, normalizeListeningRoom, listeningRoomCaption } from 'slateboxjs/workshops/model'

const room = normalizeListeningRoom({ ...listeningRoom, mix: 0.46 })
console.log(room.mix, listeningRoomCaption(room))
```

Expect `0.46 Rain and glass chimes overlap.` Pass the object to `ListeningRoomBoard` as its `value`. Save the next object from `onChange` to keep a visitor’s final position. The horn also responds to arrow keys, Home and End.

[Keep this mix in a new slate](https://app.slatebox.com/new/listening-room?mix=0.46)
