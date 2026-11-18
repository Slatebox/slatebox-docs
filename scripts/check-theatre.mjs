import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const recipe = await readFile(new URL('../Examples/theatre-cues.md', import.meta.url), 'utf8')
const code = recipe.match(/```js\n([\s\S]*?)\n```/)[1]
const modelURL = new URL('../assets/vendor/workshop-model.mjs', import.meta.url).href
const executable = code.replace("'slateboxjs/workshops/model'", JSON.stringify(modelURL))
const capture = 'export const rows = []; const console = {log: (...args) => rows.push(args)};'
const { rows, opening, next, rehearsal } = await import('data:text/javascript;charset=utf-8,' +
  encodeURIComponent(capture + '\n' + executable + '\nexport {opening, next, rehearsal}'))
assert.deepEqual(rows, [['Door opens', ['Fade the rain', 'Warm sidelight up']], ['Actor sits', 0]])
assert.deepEqual(opening.nodeIds, ['lane-door', 'card-rain', 'card-light'])
assert.deepEqual(next.nodeIds, ['lane-bench'])
assert.equal(rehearsal.cards.find(card => card.id === 'light').laneId, 'bench')
console.log('Theatre scene recipe, cue placement and native viewpoint IDs passed.')
