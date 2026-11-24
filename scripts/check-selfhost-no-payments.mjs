// A self-hosted Slatebox has no payments to set up (owner, 2026-11-24): Slatebox Pro, balances, top-ups, the meter and
// its budgets are Slatebox Cloud's only. No self-hosting page, and no agent prompt, mentions Stripe, the meter, top-ups,
// balances, price IDs or webhooks, or tells an operator how to switch payments or limits on. The one sentence a
// self-hoster needs is allowed: "Slatebox Pro exists only on Slatebox Cloud."
// Restated (round-2 review finding 9): the allowed sentence no longer names balances, so no self-hosting page
// mentions them at all (stricter: "balances" is now refused everywhere under Installation/).
//   node --test scripts/check-selfhost-no-payments.mjs   (after npm run build, so dist/ holds the built prompts)
import test from 'node:test'
import assert from 'node:assert/strict'
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs'
import {join} from 'node:path'

const read = file => readFileSync(file, 'utf8')
const walk = dir => readdirSync(dir).flatMap(name => statSync(join(dir, name)).isDirectory() ? walk(join(dir, name)) : [join(dir, name)])
const ALLOWED = /Slatebox Pro exists only on Slatebox Cloud\./
const ALLOWED_ALL = new RegExp(ALLOWED.source, 'g')
const PAYMENTS = [
  [/stripe/i, 'Stripe'], [/\bmeter(ing|ed|s)?\b/i, 'the meter'], [/\btop(ped)?[- ]?ups?\b|\btop up\b/i, 'top-ups'],
  [/\bbalances?\b/i, 'balances'], [/\bprice[ _-]?ids?\b|\bprice_[A-Za-z0-9]/i, 'price IDs'], [/\bwebhooks?\b/i, 'webhooks'],
  [/Budget and Pro/i, 'the Budget and Pro admin page'], [/\b(pk|sk|rk)_(live|test)_/, 'payment keys'],
]
const findings = (where, text) => {
  const found = []
  text.replace(ALLOWED_ALL, '').split('\n').forEach((line, index) => {
    for (const [pattern, what] of PAYMENTS) if (pattern.test(line)) found.push(where + ':' + (index + 1) + ' ' + what + ': ' + line.trim().slice(0, 120))
  })
  return found
}
// The Slatebox Cloud pages about money: their prompts are about Cloud, never about a self-hosted Slatebox.
const CLOUD_MONEY = ['pricing', 'slatebox-pro', 'top-ups', 'slatebox-business'].map(page => join('dist', 'using-slatebox', page, 'index.html'))
const unescape = text => text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')

test('no self-hosting page mentions Stripe, the meter, top-ups, balances, price IDs or webhooks', () => {
  const pages = walk('Installation').filter(file => file.endsWith('.md'))
  assert.ok(pages.length >= 4, 'the self-hosting pages were not found')
  assert.deepEqual(pages.flatMap(file => findings(file, read(file))), [])
})

test('the page about costs on your own server says Slatebox Pro is Cloud only', () => {
  const text = read('Installation/self-host-costs.md')
  assert.match(text, ALLOWED, 'self-host-costs.md: say "Slatebox Pro exists only on Slatebox Cloud."')
  assert.doesNotMatch(text, /^## Turn on limits/m, 'self-host-costs.md: no section turns limits on')
})

test('no agent prompt mentions payments: front matter, the built-in self-hosting prompt and every built page but Cloud pricing', () => {
  const docs = ['Using-Slatebox', 'Examples', 'Developers', 'Installation'].flatMap(walk).filter(file => file.endsWith('.md'))
  const found = []
  for (const file of docs) {
    const prompt = read(file).match(/^agentPrompt: >-\n((?: {2}.*\n?)+)/m)
    if (prompt) found.push(...findings(file + ' (agentPrompt)', prompt[1]))
  }
  const build = read('scripts/build.mjs')
  const selfHosting = build.slice(build.indexOf("if (p.section === 'Self-hosting'"), build.indexOf('const task = {'))
  assert.ok(selfHosting.length > 200, 'scripts/build.mjs: the self-hosting prompt was not found')
  found.push(...findings('scripts/build.mjs (self-hosting prompt)', selfHosting))
  assert.ok(existsSync('dist'), 'run npm run build first')
  for (const file of walk('dist').filter(file => file.endsWith('.html') && !CLOUD_MONEY.includes(file))) {
    for (const [, prompt] of read(file).matchAll(/<pre[^>]*data-agent-prompt[^>]*>([\s\S]*?)<\/pre>/g)) found.push(...findings(file + ' (agent prompt)', unescape(prompt)))
  }
  assert.deepEqual(found, [])
})
