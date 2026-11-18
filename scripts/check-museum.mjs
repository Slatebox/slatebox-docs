import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {museumLoans, museumLoanURL} from '../assets/museum-loans.mjs'
import {decodeWorkshopFragment, moveWorkshopCard} from '../assets/vendor/workshop-model.mjs'

const recipe = await readFile(new URL('../Examples/museum-loans.md', import.meta.url), 'utf8')
const modelURL = new URL('../assets/vendor/workshop-model.mjs', import.meta.url).href
const code = [...recipe.matchAll(/```js\n([\s\S]*?)\n```/g)].map(match => match[1]).join('\n')
const executable = code.replaceAll("'slateboxjs/workshops/model'", JSON.stringify(modelURL))
const capture = 'export const output = []; const console = {log: value => output.push(value)};\n'
const moduleURL = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(capture + executable + '\nexport {initial, full, vacancy, openInSlatebox}')
const {initial, full, vacancy, openInSlatebox, output} = await import(moduleURL)
assert.deepEqual(output, [['store'], ['store', 'case'], openInSlatebox])
assert.deepEqual(initial, museumLoans)
assert.deepEqual(decodeWorkshopFragment(new URL(openInSlatebox).hash), full)
assert.throws(() => moveWorkshopCard(full, 'chart', 'case'), /unavailable/i)
const exchanged = moveWorkshopCard(vacancy, 'chart', 'case')
assert.deepEqual(decodeWorkshopFragment(new URL(museumLoanURL(exchanged)).hash), exchanged)
assert.deepEqual(exchanged.cards.filter(c => c.laneId === 'case').map(c => c.id), ['lamp', 'chart'])
console.log('Museum Loans recipe, two-mount limit and editable app links passed.')
