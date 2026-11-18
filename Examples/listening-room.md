---
title: Mix two sound sculptures
description: Move a brass horn and hear a continuous crossfade before saving the mix.
group: Interactions
demo: listening
---

Roll the horn from the copper roof toward the glass chimes. Hold it halfway. The caption changes to “Rain and glass chimes overlap.” Choose **Enable sound** to hear the two loops at that position. Press Escape while holding the horn to return to the saved mix.

To set the starting mix in your own host, run this JavaScript in a project using the pinned SlateboxJS file build. The creative model exports belong to that build.

```js
import { listeningRoom, normalizeListeningRoom, listeningRoomCaption } from 'slateboxjs/workshops/model'

const room = normalizeListeningRoom({ ...listeningRoom, mix: 0.46 })
console.log(room.mix, listeningRoomCaption(room))
```

Expect `0.46 Rain and glass chimes overlap.` Pass the object to `ListeningRoomBoard` as its `value`. Save the next object from `onChange` to keep a visitor’s final position. The horn also responds to arrow keys, Home and End.

[Keep this mix in a new slate](https://app.slatebox.com/new/listening-room?mix=0.46)
