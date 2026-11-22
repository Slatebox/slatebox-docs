// Pricing in the docs: Slatebox is free (MIT, open source). AI and calls are free with your own keys, or come with
// Slatebox Pro ($5 a month or $50 a year, Pro credits each month); top-ups work with or without Pro (owner, 2026-11-22).
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
  'Using-Slatebox/pricing.md': ['Pricing', '/using-slatebox/pricing/'],
  'Using-Slatebox/slatebox-pro.md': ['Slatebox Pro', '/using-slatebox/slatebox-pro/'],
  'Using-Slatebox/own-keys.md': ['Use your own keys', '/using-slatebox/own-keys/'],
  'Using-Slatebox/top-ups.md': ['Top-ups and refunds', '/using-slatebox/top-ups/'],
  'Installation/self-host-meters.md': ['A self-hosted Slatebox has no meters', '/installation/self-host-meters/'],
}
// Slatebox Private is written but not published until a measured load test backs its figures: scripts/features.json
// switches it (default off), and the build leaves the page and every <!-- feature:private --> block out while it is off.
const privateOn = JSON.parse(read('scripts/features.json')).private === true
const privatePage = ['Using-Slatebox/slatebox-private.md', ['Slatebox Private', '/using-slatebox/slatebox-private/']]
if (privateOn) pages[privatePage[0]] = privatePage[1]
const walk = dir => readdirSync(dir).flatMap(name => statSync(join(dir, name)).isDirectory() ? walk(join(dir, name)) : [join(dir, name)])
const docs = ['Using-Slatebox', 'Examples', 'Developers', 'Installation'].flatMap(walk).filter(file => file.endsWith('.md'))

test('the pricing pages exist, carry their titles and are in the built navigation', () => {
  const index = read('dist/using-slatebox/index.html') // every guide page carries the documentation navigation
  for (const [file, [title, url]] of Object.entries(pages)) {
    assert.ok(existsSync(file), file + ' is missing')
    assert.match(read(file), new RegExp('^# ' + title + '$', 'm'), file + ' should be titled ' + title)
    assert.ok(existsSync(join('dist', url, 'index.html')), url + ' was not built')
    assert.ok(index.includes('href="' + url + '" '), url + ' is not in the navigation')
  }
})

test('Slatebox Private is published only when its switch is on', () => {
  const [file, [title, url]] = privatePage
  assert.match(read(file), /^feature: private$/m, file + ' is held by the private switch')
  assert.match(read(file), new RegExp('^# ' + title + '$', 'm'))
  const built = ['dist/using-slatebox/index.html', 'dist/using-slatebox/pricing/index.html', 'dist/search.json', 'dist/sitemap.xml', 'dist/llms.txt'].map(read).join('\n')
  if (privateOn) {
    assert.ok(existsSync(join('dist', url, 'index.html')), url + ' was not built')
    assert.match(read('dist/using-slatebox/pricing/index.html'), /Slatebox Private/)
    return
  }
  assert.ok(!existsSync(join('dist', url)), url + ' was built while Private is switched off')
  assert.ok(!existsSync(join('dist', file)), file + ' was mirrored while Private is switched off')
  assert.doesNotMatch(built, /slatebox-private|Slatebox Private|\$6,000|\$24,000|\$60,000|waitlist/i, 'a built page, the search index, the sitemap or the agent index mentions Private')
  for (const page of docs.filter(page => page !== file)) {
    const text = read(page).replace(/<!-- feature:private -->[\s\S]*?<!-- \/feature:private -->/g, '')
    assert.doesNotMatch(text, /slatebox-private\.md|Slatebox Private/, page + ' mentions Private outside a <!-- feature:private --> block')
  }
})

// The headline and subheading are the owner's words (2026-11-22), on the site's plans page and here.
const HEADLINE = ['Slatebox is free', 'MIT-licensed and open source, free for individuals and companies alike']
// What Slatebox Pro costs and includes: one price for one person, the former free amounts as Pro credits.
const PRO = ['$5 a month', '$50 a year', 'two months free', '30 drafts a day', 'about 10 hours', 'about 2 hours']
test('Slatebox is free, Slatebox Pro and its credits are stated, and match the pricing page', () => {
  const pricing = read('Using-Slatebox/pricing.md'), pro = read('Using-Slatebox/slatebox-pro.md')
  for (const words of [...HEADLINE, ...PRO, '5%', '$1,000']) assert.ok(pricing.toLowerCase().includes(words.toLowerCase()), 'pricing.md does not say ' + words)
  for (const words of ['2,400', '500 participant-minutes', 'carries on as voice', 'Joining a call', 'never pay', 'own key', 'top up', 'with or without Pro', 'Pro credits never shrink or pause', '5 a day for each person', 'do not carry over', 'Cancel any time', '30 days ahead'])
    assert.ok(pricing.includes(words), 'pricing.md does not say ' + words)
  // Own keys are free for everyone; nothing but AI and calls Slatebox pays for needs money.
  assert.match(pricing, /AI and calls work free with your own keys/, 'pricing.md: own keys are free, with or without Pro')
  assert.match(pricing, /every feature is free/i, 'pricing.md: every feature is free')
  // The subscription page: price, credits, cancelling, failed payments, refunds as the terms say, deleting the account.
  for (const words of [...PRO, 'Cancel any time', 'Monthly to yearly', 'Yearly to monthly', 'end of the year', 'do not carry over', 'no cash value', 'Pro credits pause', 'pro rata', '30 days of your notice', 'Deleting your account ends Pro at once', 'Your unused top-up balance is refunded first', 'Credits', 'confirm', '30 days\' notice'])
    assert.ok(pro.toLowerCase().includes(words.toLowerCase()), 'slatebox-pro.md does not say ' + words)
  assert.match(pricing, /\(slatebox-pro\.md\)/, 'the pricing page links Slatebox Pro')
  const site = resolve(process.env.SITE_DIR || '../../slatebox-home-session')
  const page = join(site, 'plans/index.html')
  if (!existsSync(page)) return console.log('SKIPPED: no marketing site at ' + site)
  const text = read(page).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase()
  for (const words of [...HEADLINE, ...PRO]) assert.ok(text.includes(words.toLowerCase()), 'the site pricing page does not say ' + words)
  assert.ok(text.includes('plus 5%') && pricing.includes('plus 5%'), 'both say "plus 5%"')
})

// The old promise is gone everywhere: Slatebox Pro is a subscription, so no page may say there are none.
test('no docs page promises "no subscriptions" or a free monthly amount for everyone', () => {
  for (const file of docs) {
    const text = read(file)
    assert.doesNotMatch(text, /No feature or seat subscriptions|we will not add one|free amount each month|Free this month|Admin → Free budget/i, file + ' still describes the old free amounts')
  }
})

test('Slatebox Private: three yearly sizes, Small for sale directly, Medium not for sale, and the site says the same', () => {
  const priv = read('Using-Slatebox/slatebox-private.md')
  for (const words of ['$6,000 a year ($500/mo, billed yearly)', '$24,000 a year', 'Coming soon, not for sale yet', 'From $60,000 a year, by quote', '15,000 participant-minutes', 'About $100 of AI', 'About $400 of AI', 'about $100 of AI a month', 'teams of 50 to 100', 'teams of 200 to 400', 'adds 20,000 participant-minutes', '100 GB',
    'one provider', 'Your own keys are free', '$2,400 a year', 'plus 5%, the same as Cloud top-ups', 'renews as another two years at the same 10% off', '30 days of go-live', 'Leave any time with everything, in one command', 'Every feature, free everywhere. No seat plans.', 'On sale now', 'without running Slatebox itself first', 'you do not need to run Slatebox yourself first', 'mailto:tim@slatebox.com?subject=Slatebox%20Private%20Medium'])
    assert.ok(priv.includes(words), 'slatebox-private.md does not say ' + words)
  // Small is bought directly. The self-serve link goes through the app's redirect, never a payment vendor's address, and
  // only while the private-checkout switch is on (with the app's public.privateCheckout); while off, people write to us.
  assert.doesNotMatch(priv, /waitlist|stripe/i, 'slatebox-private.md: no waitlist and no payment vendor address')
  assert.match(priv, /<!-- feature:private-checkout --> \[Buy Small, \$6,000 a year\]\(https:\/\/app\.slatebox\.com\/buy\/private-small\)<!-- \/feature:private-checkout -->/, 'the self-serve link is held by the private-checkout switch')
  assert.match(priv, /<!-- feature:!private-checkout --> \[Write to us to buy Small\]\(mailto:tim@slatebox\.com\?subject=Slatebox%20Private%20Small\)<!-- \/feature:!private-checkout -->/, 'while the switch is off, people write to us to buy Small')
  const checkoutOn = JSON.parse(read('scripts/features.json'))['private-checkout'] === true
  if (privateOn) {
    const built = read('dist/using-slatebox/slatebox-private/index.html')
    assert.equal(built.includes('app.slatebox.com/buy/private-small'), checkoutOn, 'the built Private page carries the buy link only while private-checkout is on')
    assert.equal(built.includes('Write to us to buy Small'), !checkoutOn, 'the built Private page asks people to write only while private-checkout is off')
  }
  assert.match(read('Using-Slatebox/pricing.md'), /\(slatebox-private\.md\)/, 'the pricing page links Slatebox Private')
  const site = resolve(process.env.SITE_DIR || '../../slatebox-home-session'), page = join(site, 'plans/index.html')
  if (!existsSync(page)) return console.log('SKIPPED: no marketing site at ' + site)
  // The site keeps Private behind its own switch (site/features.json); its section then lives in a partial.
  const partial = join(site, 'site/features/private/plans-section.html')
  const text = read(existsSync(partial) ? partial : page).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  if (!text.includes('Slatebox Private')) return console.log('SKIPPED: the marketing site at ' + site + ' has no Private section yet')
  for (const words of ['$6,000', '$500/mo, billed yearly', '$24,000', '$60,000', '15,000 participant-minutes', 'About $100 of AI a month', 'About $400 of AI a month', 'about $100 of AI a month', 'teams of 50 to 100', 'teams of 200 to 400', 'adds 20,000 participant-minutes', '$2,400 a year', 'plus 5%, the same as Cloud top-ups', 'Every feature, free everywhere. No seat plans.']) assert.ok(text.includes(words), 'the site pricing page does not say ' + words)
  // AI on Private is counted in dollars of provider cost, as the app catalogue states it, never in drafts.
  assert.doesNotMatch(priv, /\d drafts/, 'slatebox-private.md counts AI in dollars')
  // Private overage is Cloud's +5%; the self-host top-up does not exist in the app, so neither page offers one.
  assert.doesNotMatch(priv, /plus 20%|35%/, 'slatebox-private.md: no +20% overage, no self-host top-up')
  assert.doesNotMatch(text.slice(text.indexOf('Slatebox Private')), /plus 20%|35%/, 'the site Private section: no +20% overage, no self-host top-up')
  assert.doesNotMatch(text.slice(text.indexOf('Slatebox Private')), /\d drafts/, 'the site Private section counts AI in dollars')
})

test('top-ups, own keys and self-host say what builder A built', () => {
  const top = read('Using-Slatebox/top-ups.md'), keys = read('Using-Slatebox/own-keys.md'), host = read('Installation/self-host-meters.md')
  for (const words of ['$10', '$25', 'card fee', 'plus 5%', 'never expires', 'Refund my balance', '**Credits**', 'You do not need Pro to top up', 'then your Pro credits if you have Slatebox Pro, then your balance']) assert.ok(top.includes(words), 'top-ups.md does not say ' + words)
  for (const words of ['**Credits**', 'with or without Slatebox Pro', 'Team settings', 'DeepInfra', 'OpenAI-compatible', 'Daily', 'last four characters', 'Remove', 'encrypted']) assert.ok(keys.includes(words), 'own-keys.md does not say ' + words)
  // Restated (feat/any-ai-selfhost): the image writes the operator's AI to settings.ai (ai-config.mjs).
  for (const words of ['no meters', 'settings.ai', '10,000', 'metering', 'nobody needs Slatebox Pro']) assert.ok(host.includes(words), 'self-host-meters.md does not say ' + words)
  assert.match(read('Installation/install-with-docker.md'), /\(self-host-meters\.md\)/, 'the Docker guide links the no-meters page')
  assert.match(read('Using-Slatebox/readme.md'), /\(pricing\.md\)/, 'the user guide links the pricing page')
})

// The old plans, in words a person reads. Software upgrades of a release kit and operation plans of the API are not plans.
// Slatebox Pro (owner, 2026-11-22) is one personal subscription, not a plan: pages say "Slatebox Pro" or "Pro credits".
// A bare "Pro" is for the pages about Pro and money only, and "subscription" for the Slatebox Pro page only.
const PRO_PAGES = ['Using-Slatebox/pricing.md', 'Using-Slatebox/slatebox-pro.md', 'Using-Slatebox/top-ups.md']
const named = line => line.replace(/Slatebox Pro\b|\bPro credits\b|Admin → Budget and Pro\*\*/g, '')
const banned = [
  [/\bPro\b(?![-/]Con)/, 'a bare "Pro"', (file, line) => !PRO_PAGES.includes(file) && /\bPro\b(?![-/]Con)/.test(named(line))],
  [/\bPro plans?\b|\bPro tier\b/i, 'the Pro plan'], [/\bTeam plans?\b/i, 'the Team plan'], [/\b(paid|free) (hosted )?plan\b/i, 'a plan'],
  [/\bplan chooser\b|\bPlans →|app\.slatebox\.com\/plans/i, 'the plan chooser'], [/\bguest (day )?pass|\bday pass/i, 'guest passes'],
  [/\bper seat\b/i, 'seats'], [/\$8\b|\$12\b/, 'the old prices'], [/\bupgrade (to|now|today)\b|\bget Pro now\b|\bunlock (AI|video|more|features)/i, 'upgrade prompts'],
  [/Compare (the )?plans/i, 'plan comparison'],
  [/\bsubscri/i, 'subscriptions', (file, line) => file !== 'Using-Slatebox/slatebox-pro.md' && /\bsubscri/i.test(line)],
  [/\b(AI|image|video|call) credits?\b/i, 'credits'], [/\btiers?\b/i, 'tiers'],
]
test('no docs page speaks of plans, passes, seats or upgrade prompts, and Pro is named as Slatebox Pro', () => {
  const found = []
  for (const file of docs) read(file).split('\n').forEach((line, index) => {
    for (const [pattern, what, hit] of banned) {
      if (!(hit ? hit(file, line) : pattern.test(line))) continue
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
  // Restated (feat/any-ai, connections.mjs): image search is always the built-in service, so it uses Pro credits,
  // then the balance. Image generation does too, unless the person chose for Generating images an own connection that
  // makes images (capabilities.images true); an own key saved before choices existed never makes images (fromLegacy).
  const ai = keys.split('\n').find(line => line.startsWith('| Your own AI')) || ''
  assert.doesNotMatch(ai, /image search/i, 'own-keys.md: own AI does not pay for image search')
  assert.doesNotMatch(keys, /Your (free amount|Pro credits) and your balance are left untouched\./, 'own-keys.md: images still use Pro credits and the balance')
  assert.match(keys, /Image search[^.]*Pro credits, then your balance/, 'own-keys.md: say image search uses Pro credits, then the balance')
  assert.match(keys, /Image generation[^.]*unless you choose[^.]*makes images[^.]*\*\*Generating images\*\*/, 'own-keys.md: image generation is yours only with a connection that makes images, chosen for Generating images')
  // Images are not drafts (holds.mjs: a draft is kind ai): they use the month's AI of Pro credits.
  assert.doesNotMatch(pricing, /each image search and each image generation is one draft/i, 'pricing.md: images are not drafts')
  assert.doesNotMatch(pricing, /\| AI drafting and image search \|/, 'pricing.md: image search is not in the 30 drafts a day')
  assert.match(pricing, /Image search and image generation use the month's AI from your Pro credits, not the daily count/, 'pricing.md: images use the month\'s AI of Pro credits')
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
  assert.match(host, /Admin → Budget and Pro/, 'self-host-meters.md: the budget is changed in Admin → Budget and Pro')
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
