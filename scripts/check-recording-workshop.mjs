import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { availableLanes, decodeWorkshopFragment, moveWorkshopCard } from '../assets/vendor/workshop-model.mjs'

const guide = await readFile(new URL('../Developers/JavascriptLibrary/creative-slates.md', import.meta.url), 'utf8')
const section = guide.split('## Build a workshop with one recording slot\n')[1].split('\n## ')[0]
const code = section.match(/```js(?: [^\n]*)?\n([\s\S]*?)\n```/)[1]
const modelURL = new URL('../assets/vendor/workshop-model.mjs', import.meta.url).href
const executable = code.replace("'slateboxjs/workshops/model'", JSON.stringify(modelURL))
const { ready, openInSlatebox } = await import('data:text/javascript,' +
  encodeURIComponent(executable + '\nexport { ready, openInSlatebox }'))

const link = section.match(/\[Open the recording workshop\]\(([^)]+)\)/)[1]
assert.equal(link, openInSlatebox)
assert.deepEqual(decodeWorkshopFragment(new URL(link).hash), ready)
const [pitch, archive, friday] = ready.lanes
const [horn, chorus] = ready.cards
assert.equal(friday.capacity, 1)
assert.deepEqual(availableLanes(ready, chorus).map(lane => lane.id).sort(), [archive.id, pitch.id].sort())
assert.equal(moveWorkshopCard(ready, horn.id, friday.id).cards[0].laneId, friday.id)
assert.throws(() => moveWorkshopCard(ready, chorus.id, friday.id), /Move is unavailable/)
assert.equal(ready.cards[1].laneId, archive.id)
console.log('Recording workshop recipe, editable link, and destination rule passed.')
