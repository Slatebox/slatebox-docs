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
  'Using-Slatebox/slatebox-private.md': ['Slatebox Private', '/using-slatebox/slatebox-private/'],
}
const walk = dir => readdirSync(dir).flatMap(name => statSync(join(dir, name)).isDirectory() ? walk(join(dir, name)) : [join(dir, name)])
const docs = ['Using-Slatebox', 'Examples', 'Developers', 'Installation'].flatMap(walk).filter(file => file.endsWith('.md'))

test('the five pricing pages exist, carry their titles and are in the built navigation', () => {
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

test('Slatebox Private: three yearly sizes, Medium not for sale, nothing to buy, and the site says the same', () => {
  const priv = read('Using-Slatebox/slatebox-private.md')
  for (const words of ['$6,000 a year ($500/mo, billed yearly)', '$24,000 a year', 'Coming soon, not for sale yet', 'From $60,000 a year, by quote', '15,000 participant-minutes', 'About $100 of AI', 'About $400 of AI', 'about $100 of AI a month', '100 GB',
    'one provider', 'Your own keys are free', '$2,400 a year', 'plus 5%, the same as Cloud top-ups', 'renews as another two years at the same 10% off', '30 days of go-live', 'Leave any time with everything, in one command', 'No feature or seat subscriptions. Ever.', 'mailto:tim@slatebox.com?subject=Slatebox%20Private%20waitlist'])
    assert.ok(priv.includes(words), 'slatebox-private.md does not say ' + words)
  assert.doesNotMatch(priv, /checkout|buy now|\]\(https:\/\/[^)]*stripe/i, 'Private sells nothing yet')
  assert.match(read('Using-Slatebox/pricing.md'), /\(slatebox-private\.md\)/, 'the pricing page links Slatebox Private')
  const site = resolve(process.env.SITE_DIR || '../../slatebox-home-session'), page = join(site, 'plans/index.html')
  if (!existsSync(page)) return console.log('SKIPPED: no marketing site at ' + site)
  const text = read(page).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  if (!text.includes('Slatebox Private')) return console.log('SKIPPED: the marketing site at ' + site + ' has no Private section yet')
  for (const words of ['$6,000', '$500/mo, billed yearly', '$24,000', '$60,000', '15,000 participant-minutes', 'About $100 of AI a month', 'About $400 of AI a month', 'about $100 of AI a month', '$2,400 a year', 'plus 5%, the same as Cloud top-ups', 'No feature or seat subscriptions. Ever.']) assert.ok(text.includes(words), 'the site pricing page does not say ' + words)
  // AI on Private is counted in dollars of provider cost, as the app catalogue states it, never in drafts.
  assert.doesNotMatch(priv, /\d drafts/, 'slatebox-private.md counts AI in dollars')
  // Private overage is Cloud's +5%; the self-host top-up does not exist in the app, so neither page offers one.
  assert.doesNotMatch(priv, /plus 20%|35%/, 'slatebox-private.md: no +20% overage, no self-host top-up')
  assert.doesNotMatch(text.slice(text.indexOf('Slatebox Private')), /plus 20%|35%/, 'the site Private section: no +20% overage, no self-host top-up')
  assert.doesNotMatch(text.slice(text.indexOf('Slatebox Private')), /\d drafts/, 'the site Private section counts AI in dollars')
})

test('top-ups, own keys and self-host say what builder A built', () => {
  const top = read('Using-Slatebox/top-ups.md'), keys = read('Using-Slatebox/own-keys.md'), host = read('Installation/self-host-meters.md')
  for (const words of ['$10', '$25', 'card fee', 'plus 5%', 'never expires', 'Refund my balance']) assert.ok(top.includes(words), 'top-ups.md does not say ' + words)
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
  [/Compare (the )?plans/i, 'plan comparison'], [/\bsubscription\b/i, 'subscriptions'],
  [/\b(AI|image) credits?\b/i, 'credits'], [/\btiers?\b/i, 'tiers'],
]
test('no docs page speaks of plans, passes, seats or upgrade prompts', () => {
  const found = []
  for (const file of docs) read(file).split('\n').forEach((line, index) => {
    for (const [pattern, what] of banned) {
      if (!pattern.test(line)) continue
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

// What the docs say about money must be what the app does (the metering in the app's feat/pricing branch).
test('the money claims match the app: own keys, images, the card fee, refunds, call limits and self-host settings', () => {
  const pricing = read('Using-Slatebox/pricing.md'), top = read('Using-Slatebox/top-ups.md')
  const keys = read('Using-Slatebox/own-keys.md'), host = read('Installation/self-host-meters.md')
  // An own AI key covers AI only (policy.mjs ownKeyCovers): image search and image generation use the free amount, then the balance.
  const deepinfra = keys.split('\n').find(line => line.startsWith('| DeepInfra key')) || ''
  assert.doesNotMatch(deepinfra, /image/i, 'own-keys.md: a DeepInfra key does not pay for image search or image generation')
  assert.doesNotMatch(keys, /Your free amount and your balance are left untouched\./, 'own-keys.md: images still use the free amount and the balance')
  assert.match(keys, /Image search and image generation[^.]*free amount, then your balance/, 'own-keys.md: say images use the free amount, then the balance')
  // Images are not drafts (holds.mjs: a draft is kind ai): they use the month's free AI.
  assert.doesNotMatch(pricing, /each image search and each image generation is one draft/i, 'pricing.md: images are not drafts')
  assert.doesNotMatch(pricing, /\| AI drafting and image search \|/, 'pricing.md: image search is not in the 30 drafts a day')
  assert.match(pricing, /Image search and image generation use the month's free AI, not the daily count/, 'pricing.md: images use the month\'s free AI')
  // The card fee on a $10 top-up (ledger.mjs cardFeeCents(1000) = 61).
  assert.match(top, /You pay \$10\.61: \$10\.00 of balance and a \$0\.61 card fee/, 'top-ups.md: the dialog example is $10.61 with a $0.61 fee')
  assert.doesNotMatch(top, /\$10\.59|\$0\.59/, 'top-ups.md: no $10.59 example')
  // A refund waits while the balance is in use. The docs carry no former-subscriber notice (greenfield).
  assert.doesNotMatch(top, /refunded to your card at any time/, 'top-ups.md: the refundable part is not fixed')
  assert.doesNotMatch(top, /former subscriber|1\.5 times/i, 'top-ups.md: no former-subscriber notice')
  assert.match(top, /while a call or a request is being paid from it/, 'top-ups.md: a refund waits while the balance is in use')
  // Call limits apply to calls we pay for; an own Daily key has Daily's limits (calls.mjs, own-keys.md).
  assert.doesNotMatch(pricing, /## Limits on every call/, 'pricing.md: the limits are not on every call: own Daily keys have none of ours')
  assert.doesNotMatch(pricing, /Everyone sees a notice 2 minutes before a call ends\./, 'pricing.md: the 3-hour end has no notice')
  // Self-host: only metering.enabled is a setting; the free amounts are not set in the settings file.
  assert.doesNotMatch(host, /with your own free amounts/, 'self-host-meters.md: the free amounts are not a server setting')
  assert.match(host, /Admin → Free budget/, 'self-host-meters.md: the budget is changed in Admin → Free budget')
  assert.match(host, /SLATEBOX_KEY_ENCRYPTION_KEY/, 'self-host-meters.md: own keys need the encryption key')
})

// Every subscription was cancelled with no conversion and no balance, so there is nothing for a
// former subscriber to read: the top-ups page carries no hidden former-subscribers anchor either.
test('the top-ups page has no former-subscribers anchor', () => {
  const legacy = JSON.parse(read('scripts/legacy-routes.json'))
  assert.ok(!Object.values(legacy).flat().includes('former-subscribers'), 'scripts/legacy-routes.json keeps a former-subscribers anchor')
  assert.doesNotMatch(read('dist/using-slatebox/top-ups/index.html'), /id="former-subscribers"/, 'the built top-ups page has a former-subscribers anchor')
})

// The image accepts SLATEBOX_KEY_ENCRYPTION_KEY (self-host configure.mjs: 32 bytes of base64, written to
// the app's environment only), so the install page lists it and no page says the image refuses it.
test('the image takes SLATEBOX_KEY_ENCRYPTION_KEY, and the docs say so', () => {
  const install = read('Installation/install-with-docker.md')
  assert.match(install, /^\| `SLATEBOX_KEY_ENCRYPTION_KEY` \|.*openssl rand -base64 32/m, 'install-with-docker.md: the Options table lists the key and how to make it')
  for (const file of docs) assert.doesNotMatch(read(file), /does not accept that variable|runs without own keys/, file + ': the image accepts SLATEBOX_KEY_ENCRYPTION_KEY')
})
