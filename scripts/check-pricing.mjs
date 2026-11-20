// Pricing in the docs: Slatebox is free, and AI and calls come with a free amount each month.
//   node --test scripts/check-pricing.mjs        (after npm run build, so dist/ holds the built pages)
// SITE_DIR is a checkout of the marketing site (default ../../slatebox-home-session); its pricing page must state the
// same numbers. When it is missing, that comparison is skipped and says so.
import test from 'node:test'
import assert from 'node:assert/strict'
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs'
import {join, resolve} from 'node:path'
import {execFileSync} from 'node:child_process'

const read = file => readFileSync(file, 'utf8')
const pages = {
  'Using-Slatebox/pricing.md': ['Pricing and free amounts', '/using-slatebox/pricing/'],
  'Using-Slatebox/own-keys.md': ['Use your own keys', '/using-slatebox/own-keys/'],
  'Using-Slatebox/top-ups.md': ['Top-ups and refunds', '/using-slatebox/top-ups/'],
  'Installation/self-host-meters.md': ['A self-hosted Slatebox has no meters', '/installation/self-host-meters/'],
}
const walk = dir => readdirSync(dir).flatMap(name => statSync(join(dir, name)).isDirectory() ? walk(join(dir, name)) : [join(dir, name)])
const docs = ['Using-Slatebox', 'Examples', 'Developers', 'Installation'].flatMap(walk).filter(file => file.endsWith('.md'))

test('the four pricing pages exist, carry their titles and are in the built navigation', () => {
  const index = read('dist/using-slatebox/index.html') // every guide page carries the documentation navigation
  for (const [file, [title, url]] of Object.entries(pages)) {
    assert.ok(existsSync(file), file + ' is missing')
    assert.match(read(file), new RegExp('^# ' + title + '$', 'm'), file + ' should be titled ' + title)
    assert.ok(existsSync(join('dist', url, 'index.html')), url + ' was not built')
    assert.ok(index.includes('href="' + url + '" '), url + ' is not in the navigation')
  }
})

test('the free amounts, the margin and the budget are stated, and match the pricing page', () => {
  const pricing = read('Using-Slatebox/pricing.md')
  const numbers = ['30 drafts a day', 'about 10 hours', 'about 2 hours', '5%', '$1,000']
  for (const words of numbers) assert.ok(pricing.toLowerCase().includes(words.toLowerCase()), 'pricing.md does not say ' + words)
  for (const words of ['2,400', '500 participant-minutes', 'carries on as voice', 'Joining a call', 'never pay', 'own key', 'top up']) assert.ok(pricing.includes(words), 'pricing.md does not say ' + words)
  const site = resolve(process.env.SITE_DIR || '../../slatebox-home-session')
  const page = join(site, 'plans/index.html')
  if (!existsSync(page)) return console.log('SKIPPED: no marketing site at ' + site)
  const text = read(page).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase()
  for (const words of numbers) assert.ok(text.includes(words.toLowerCase()), 'the site pricing page does not say ' + words)
  assert.ok(text.includes('plus 5%') && pricing.includes('plus 5%'), 'both say "plus 5%"')
})

test('top-ups, own keys and self-host say what builder A built', () => {
  const top = read('Using-Slatebox/top-ups.md'), keys = read('Using-Slatebox/own-keys.md'), host = read('Installation/self-host-meters.md')
  for (const words of ['$10', '$25', 'card fee', 'plus 5%', 'never expires', 'Refund my balance', '1.5 times', '12 months']) assert.ok(top.includes(words), 'top-ups.md does not say ' + words)
  for (const words of ['Free this month', 'Team settings', 'DeepInfra', 'OpenAI-compatible', 'Daily', 'last four characters', 'Remove', 'encrypted']) assert.ok(keys.includes(words), 'own-keys.md does not say ' + words)
  for (const words of ['no meters', 'selfHosted.workshopProvider', '10,000', 'metering']) assert.ok(host.includes(words), 'self-host-meters.md does not say ' + words)
  assert.match(read('Installation/install-with-docker.md'), /\(self-host-meters\.md\)/, 'the Docker guide links the no-meters page')
  assert.match(read('Using-Slatebox/readme.md'), /\(pricing\.md\)/, 'the user guide links the pricing page')
})

// The old plans, in words a person reads. Software upgrades of a release kit and operation plans of the API are not plans.
const banned = [
  [/\bPro\b(?![-/]Con)/, 'the Pro plan'], [/\bTeam plans?\b/i, 'the Team plan'], [/\b(paid|free) (hosted )?plan\b/i, 'a plan'],
  [/\bplan chooser\b|\bPlans →|app\.slatebox\.com\/plans/i, 'the plan chooser'], [/\bguest (day )?pass|\bday pass/i, 'guest passes'],
  [/\bper seat\b/i, 'seats'], [/\$8\b|\$12\b/, 'the old prices'], [/\bupgrade (to|now|today)\b|\bunlock (AI|video|more|features)/i, 'upgrade prompts'],
  [/Compare (the )?plans/i, 'plan comparison'], [/\bsubscription\b/i, 'subscriptions (outside the former-subscriber note)'],
  [/\b(AI|image) credits?\b/i, 'credits'], [/\btiers?\b/i, 'tiers'],
]
test('no docs page speaks of plans, passes, seats or upgrade prompts', () => {
  const found = []
  for (const file of docs) read(file).split('\n').forEach((line, index) => {
    for (const [pattern, what] of banned) {
      if (!pattern.test(line)) continue
      if (what.startsWith('subscriptions') && file === 'Using-Slatebox/top-ups.md') continue
      found.push(file + ':' + (index + 1) + ' ' + what + ': ' + line.slice(0, 100))
    }
  })
  assert.deepEqual(found, [])
})

test('Developers links to the app source on GitHub only when that repository answers anonymously', () => {
  let open = false
  try {
    execFileSync('git', ['-c', 'credential.helper=', '-c', 'core.askPass=/usr/bin/false', 'ls-remote', 'https://github.com/Slatebox/slatebox', 'HEAD'],
      {env: {...process.env, GIT_TERMINAL_PROMPT: '0', GIT_ASKPASS: '/usr/bin/false'}, stdio: 'pipe', timeout: 20000})
    open = true
  } catch {}
  const linked = /github\.com\/Slatebox\/slatebox[)\s#"]/.test(read('Developers/readme.md'))
  assert.equal(linked, open, open ? 'the app repository is public: link it' : 'the app repository is not public: do not link it')
})
