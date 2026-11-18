import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const recipe = await readFile(new URL('../Examples/theatre-cues.md', import.meta.url), 'utf8')
const code = recipe.match(/```js\n([\s\S]*?)\n```/)[1]
const modelURL = new URL('../assets/vendor/workshop-model.mjs', import.meta.url).href
const executable = code.replace("'slateboxjs/workshops/model'", JSON.stringify(modelURL))
const capture = 'export const rows = []; const console = {log: (...args) => rows.push(args)};'
const { rows, opening, next, rehearsal } = await import('data:text/javascript;charset=utf-8,' +
  encodeURIComponent(capture + '\n' + executable + '\nexport {opening, next, rehearsal}'))
assert.deepEqual(rows, [['The doorway stays dark.'], ['Door opens', 'The doorway glows amber.'], ['Actor sits', 0]])
assert.deepEqual(opening.nodeIds, ['lane-door', 'card-rain', 'card-light'])
assert.equal(opening.signals[0].present, true)
assert.deepEqual(next.signals, [])
const { resolveWorkshopSignals } = await import(modelURL)
const blackout = { ...rehearsal, signals: rehearsal.signals.map(cue => ({ ...cue, whenAbsent: 'Stand by for the entrance' })) }
assert.equal(resolveWorkshopSignals(blackout)[0].text, 'Stand by for the entrance')
assert.deepEqual(next.nodeIds, ['lane-bench'])
assert.equal(rehearsal.cards.find(card => card.id === 'light').laneId, 'bench')
console.log('Theatre scene recipe, cue placement and native viewpoint IDs passed.')

const standalone = await readFile(new URL('../assets/examples/entrance-rehearsal.html', import.meta.url), 'utf8')
const boardDefinition = standalone.match(/const rehearsal = validateWorkshop\([\s\S]*?\n  \}\)/)[0]
const standaloneModel = await import('data:text/javascript,' + encodeURIComponent(
  'import { validateWorkshop } from ' + JSON.stringify(modelURL) + '; export ' + boardDefinition))
assert.deepEqual(standaloneModel.rehearsal, rehearsal)
assert.ok(recipe.includes('/assets/examples/entrance-rehearsal.html'))
