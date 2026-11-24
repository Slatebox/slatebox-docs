// Pricing in the docs: Slatebox is free (MIT, open source, except the app's Cloud-only enterprise/ folder: owner, 2026-11-23). On Slatebox Cloud, AI and calls come with Slatebox Pro ($5 a
// month or $50 a year plus tax, Pro credits sized by the app, on sale now) and top-ups; own AI and call keys are for
// self-hosted Slatebox only, where they are free (owner, 2026-11-22; the app's own-keys.mjs); top-ups work with or
// without Pro; teams can choose Slatebox Business, sold by talking to us until its billing is built (owner, 2026-11-22).
//   node --test scripts/check-pricing.mjs        (after npm run build, so dist/ holds the built pages)
//   npm run check:cross                          the same, and the app and the site must be found (REQUIRE_APP, REQUIRE_SITE)
// Every figure is the app's: scripts/pro-figures.json is a copy of the app's web/app/imports/api/pro/pro-figures.json.
// APP_DIR is a checkout of the app (default: one beside the docs); the copy must equal what its scripts/pro-figures.mjs
// computes. SITE_DIR is a checkout of the marketing site (default: one beside the docs); its pricing page must state the
// same figures. Where either is missing, that comparison is skipped and says so, unless REQUIRE_APP=1 / REQUIRE_SITE=1.
import test from 'node:test'
import assert from 'node:assert/strict'
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs'
import {join, resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {execFileSync} from 'node:child_process'

const read = file => readFileSync(file, 'utf8')
const pages = {
  'Using-Slatebox/pricing.md': ['Pricing', '/using-slatebox/pricing/'],
  'Using-Slatebox/slatebox-pro.md': ['Slatebox Pro', '/using-slatebox/slatebox-pro/'],
  'Using-Slatebox/own-keys.md': ['Use your own keys on a self-hosted Slatebox', '/using-slatebox/own-keys/'],
  'Using-Slatebox/top-ups.md': ['Top-ups and refunds', '/using-slatebox/top-ups/'],
  'Installation/self-host-meters.md': ['A self-hosted Slatebox has no meters', '/installation/self-host-meters/'],
  'Using-Slatebox/slatebox-business.md': ['Slatebox Business', '/using-slatebox/slatebox-business/'],
}
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

// The headline and subheading are the owner's words (2026-11-22), on the site's plans page and here, with the
// license carve-out (owner, 2026-11-23): outside-agent connections are Cloud-only, under the Slatebox Enterprise License.
const HEADLINE = ['Slatebox is free', 'MIT-licensed and open source, except Cloud-only outside-agent connections', 'free for individuals and companies alike']
// What Slatebox Pro costs and includes: one price for one person, plus tax, with Pro credits as the app meters them
// (scripts/pro-figures.json): separate allowances of AI, voice and video, sized to what full use costs Slatebox.
const FIGURES = JSON.parse(read('scripts/pro-figures.json'))
const CREDITS = FIGURES.pro.credits
const half = hours => (hours % 1 ? (Math.floor(hours) || '') + '½' : String(hours))
const hoursWords = hours => 'about ' + half(hours) + ' ' + (hours === 1 ? 'hour' : 'hours')
const money = dollars => '$' + (Number.isInteger(dollars) ? dollars : dollars.toFixed(2))
const thousands = n => n.toLocaleString('en-US')
const PRO = ['$' + FIGURES.pro.monthCents / 100 + ' a month', '$' + FIGURES.pro.yearCents / 100 + ' a year', 'two months free', 'plus tax where applicable',
  'about ' + money(CREDITS.costDollars), 'about ' + CREDITS.draftsPerMonth + ' drafts a month', 'up to ' + CREDITS.draftsPerDay + ' a day',
  hoursWords(CREDITS.voiceHours), hoursWords(CREDITS.videoHours)]
const BUSINESS_LINK = '[Talk to us about Business](' + FIGURES.business.contactUrl + ')'
const section = (source, heading) => source.split(/^## /m).find(s => s.startsWith(heading)) ?? ''
// The app's refusal on Cloud (imports/api/common/own-keys.mjs OWN_KEYS_CLOUD) and its MCP listing line (the 0.3.4 package
// README); the docs quote both word for word, and check:cross compares them with the app.
const OWN_KEYS_CLOUD = 'Own AI and call keys are for self-hosted Slatebox. On Slatebox Cloud, AI and calls come with Slatebox Pro credits and top-ups.'
const LISTING = 'The canvas is free. On Slatebox Cloud, AI comes with Slatebox Pro; a self-hosted Slatebox can use its own AI key.'
const beside = (env, candidates, marker) => [env, ...candidates].filter(Boolean).map(dir => resolve(dir)).find(dir => existsSync(join(dir, marker)))

test('scripts/pro-figures.json is the app\'s own figures', async t => {
  const app = beside(process.env.APP_DIR, ['../app', '../app.slatebox.com'], 'scripts/pro-figures.mjs')
  if (!app) {
    assert.notEqual(process.env.REQUIRE_APP, '1', 'REQUIRE_APP=1 and no app checkout found: set APP_DIR')
    return t.skip('no app checkout beside the docs (set APP_DIR): the figures were not compared with the app')
  }
  const {figures} = await import(pathToFileURL(join(app, 'scripts/pro-figures.mjs')).href)
  assert.deepEqual(FIGURES, figures(), 'scripts/pro-figures.json differs from the app at ' + app + ': copy its web/app/imports/api/pro/pro-figures.json and update the pages')
})
test('Slatebox is free, Slatebox Pro and its credits are stated, and match the pricing page', () => {
  const pricing = read('Using-Slatebox/pricing.md'), pro = read('Using-Slatebox/slatebox-pro.md')
  for (const words of [...HEADLINE, ...PRO, '5%', '$1,000']) assert.ok(pricing.toLowerCase().includes(words.toLowerCase()), 'pricing.md does not say ' + words)
  for (const words of [thousands(CREDITS.voiceMinutes) + ' participant-minutes of voice', thousands(CREDITS.videoMinutes) + ' participant-minutes of video', 'Each row is its own amount for the month', 'the share of that month\'s Pro credits', 'carries on as voice', 'Joining a call', 'never pay', 'own key', 'top up', 'with or without Pro', 'Pro credits never shrink or pause', '5 a day for each person', 'do not carry over', 'Cancel any time', '30 days ahead', '(slatebox-business.md)', BUSINESS_LINK])
    assert.ok(pricing.includes(words), 'pricing.md does not say ' + words)
  // Own keys are a self-hosted feature (owner, 2026-11-22): on Cloud, AI and calls come with Pro and top-ups.
  assert.match(pricing, /Nobody brings their own AI or call key on Cloud: own keys are for self-hosted Slatebox, where they are free/, 'pricing.md: own keys are for self-hosted Slatebox only')
  assert.doesNotMatch(pricing, /## Three ways to pay|\*\*Your own key\.\*\*/, 'pricing.md: own keys are not a way to pay on Cloud')
  assert.match(section(pricing, 'Self-hosted Slatebox'), /own AI and call keys, for free/, 'pricing.md: a self-hosted Slatebox keeps own keys, free')
  assert.match(pricing, /every feature is free/i, 'pricing.md: every feature is free')
  // The carve-out (owner, 2026-11-23): the app's enterprise/ folder is source-available, Cloud only; inviting outside
  // agents comes with Slatebox Pro, said only while the agents-invite switch is on.
  assert.match(pricing, /`enterprise\/` folder[^.]*Slatebox Enterprise License/, 'pricing.md: enterprise/ is under the Slatebox Enterprise License')
  assert.match(pricing, /<!-- feature:agents-invite -->The one exception is inviting outside agents onto your slates, which comes with Slatebox Pro\.[\s\S]*?<!-- \/feature:agents-invite --><!-- feature:!agents-invite -->No feature is ever sold separately\.<!-- \/feature:!agents-invite -->/, 'pricing.md: the Slatebox Pro exception is held by the agents-invite switch')
  // The subscription page: price, credits, cancelling, failed payments, refunds as the terms say, deleting the account.
  assert.doesNotMatch(pricing + pro, /in any mix/i, 'Pro credits are separate allowances, not one pool')
  for (const words of [...PRO, '(' + thousands(CREDITS.voiceMinutes) + ' participant-minutes)', '(' + thousands(CREDITS.videoMinutes) + ' participant-minutes)', 'the share of that month\'s Pro credits', 'Cancel any time', 'Monthly to yearly', 'Yearly to monthly', 'end of the year', 'do not carry over', 'no cash value', 'Pro credits pause', 'pro rata', '30 days of your notice', 'Deleting your account ends Pro at once', 'Your unused top-up balance is refunded first; then Pro ends', 'Pro stays on and nothing is removed', 'Credits', 'confirm', '30 days\' notice'])
    assert.ok(pro.toLowerCase().includes(words.toLowerCase()), 'slatebox-pro.md does not say ' + words)
  // Buying Pro: the app sells it only once its Pro date is set, so the steps are held by the pro-checkout switch.
  const proCheckoutOn = JSON.parse(read('scripts/features.json'))['pro-checkout'] === true
  assert.match(pro, /<!-- feature:pro-checkout -->\n1\. Confirm your email address[\s\S]*?pay by card\.[\s\S]*?<!-- \/feature:pro-checkout -->/, 'the steps to buy Pro are held by the pro-checkout switch')
  assert.match(pro, /<!-- feature:!pro-checkout -->\nSlatebox Pro is not on sale in your profile yet\./, 'while the switch is off, the page says Pro is not on sale yet')
  const builtPro = read('dist/using-slatebox/slatebox-pro/index.html')
  assert.equal(builtPro.includes('pay by card'), proCheckoutOn, 'the built Pro page carries the steps to buy only while pro-checkout is on')
  assert.equal(builtPro.includes('not on sale in your profile yet'), !proCheckoutOn, 'the built Pro page says Pro is not on sale only while pro-checkout is off')
  assert.match(pricing, /\(slatebox-pro\.md\)/, 'the pricing page links Slatebox Pro')
  const site = beside(process.env.SITE_DIR, ['../site', '../../slatebox-home'], 'plans/index.html')
  if (!site) {
    assert.notEqual(process.env.REQUIRE_SITE, '1', 'REQUIRE_SITE=1 and no marketing site found: set SITE_DIR')
    return console.log('SKIPPED: no marketing site beside the docs (set SITE_DIR)')
  }
  const text = read(join(site, 'plans/index.html')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase()
  for (const words of [...HEADLINE, ...PRO]) assert.ok(text.includes(words.toLowerCase()), 'the site pricing page at ' + site + ' does not say ' + words)
  // the site keeps its own copy of the figures: it must be the same file
  const siteFigures = join(site, 'site/pro-figures.json')
  assert.ok(existsSync(siteFigures), 'the site has no site/pro-figures.json')
  assert.deepEqual(JSON.parse(read(siteFigures)), FIGURES, 'the site\'s pro-figures.json differs from the docs\'')
  assert.ok(text.includes('plus 5%') && pricing.includes('plus 5%'), 'both say "plus 5%"')
})

// The old promise is gone everywhere: Slatebox Pro is a subscription, so no page may say there are none. Pro is on sale
// now (owner, 2026-11-22: no notice period), so no page promises free amounts until an emailed date or a trial.
test('no docs page promises "no subscriptions", a free monthly amount for everyone, or free amounts until a date', () => {
  for (const file of docs) {
    const text = read(file)
    assert.doesNotMatch(text, /No feature or seat subscriptions|we will not add one|free amount each month|Free this month|Admin → Free budget/i, file + ' still describes the old free amounts')
    assert.doesNotMatch(text, /date we email|Until the date above|free trial|trial until/i, file + ' still promises free amounts until a switch date')
  }
})

// Slatebox Private (a dedicated server billed yearly by size) is replaced by Slatebox Business (owner, 2026-11-22): a team
// inside the shared Cloud at $6 a person a month or $60 a person a year, sold through the contact form until its billing ships.
test('Slatebox Business replaces Slatebox Private, and is sold by talking to us', () => {
  const biz = read('Using-Slatebox/slatebox-business.md')
  for (const words of ['$6 a person a month', '$60 a person a year', 'plus tax where applicable', 'shared, fully managed', 'shared pool of AI and calls', 'same amount as Pro credits', 'about ' + money(CREDITS.costDollars), 'Single sign-on and the audit log', 'not on Slatebox Cloud yet', 'Hands-on help for large teams', 'is coming', 'No own keys on Cloud', 'not on sale in the app yet', BUSINESS_LINK])
    assert.ok(biz.includes(words), 'slatebox-business.md does not say ' + words)
  // single sign-on and the audit log are not on Cloud: promised for when they come, never stated as there today
  for (const file of docs) assert.doesNotMatch(read(file), /Enterprise features, free for every team on Cloud anyway|audit log are not sold separately/i, file + ' says single sign-on and the audit log are on Cloud today')
  // the Business link is the app's (an email while the site's contact form is off), never a page that does not exist yet
  assert.equal(FIGURES.business.billingBuilt, false, 'the app sells Business: these pages still say to talk to us')
  for (const file of docs) if (FIGURES.business.contactUrl.startsWith('mailto:')) assert.doesNotMatch(read(file), /slatebox\.com\/contact\//, file + ' links the contact form, which is not live')
  assert.doesNotMatch(biz, /app\.slatebox\.com\/buy|stripe|checkout/i, 'slatebox-business.md: no Business checkout or payment link')
  assert.equal(JSON.parse(read('scripts/redirects.json'))['/using-slatebox/slatebox-private/'], '/using-slatebox/slatebox-business/', 'the old Private address redirects to Business')
  const built = ['dist/using-slatebox/index.html', 'dist/using-slatebox/pricing/index.html', 'dist/search.json', 'dist/sitemap.xml', 'dist/llms.txt'].map(read).join('\n')
  assert.doesNotMatch(built, /Slatebox Private|\$6,000|\$24,000|\$60,000|dedicated server/i, 'a built page, the search index, the sitemap or the agent index still mentions Private')
  for (const file of [...docs, 'STYLE.md', 'readme.md']) {
    const text = read(file).replace(/Never "dedicated server", sizes, or "Slatebox Private"\./, '')
    assert.doesNotMatch(text, /Slatebox Private|slatebox-private\.md|dedicated server|\$6,000|Billed yearly by size|by size, never by person|No seat plans|feature:private/i, file + ' still describes Slatebox Private')
  }
  assert.ok(!('private' in JSON.parse(read('scripts/features.json'))), 'scripts/features.json has no Private switch')
})

test('top-ups, own keys and self-host say what builder A built', () => {
  const top = read('Using-Slatebox/top-ups.md'), keys = read('Using-Slatebox/own-keys.md'), host = read('Installation/self-host-meters.md')
  for (const words of ['$10', '$25', 'card fee', 'plus 5%', 'never expires', 'Refund my balance', '**Credits**', 'You do not need Pro to top up', 'Your Pro credits are used first if you have Slatebox Pro, then your balance']) assert.ok(top.includes(words), 'top-ups.md does not say ' + words)
  // own-keys.md is the self-hosted page: on Cloud, nothing is saved or used, and a key saved before stays, unused, removable.
  assert.match(keys, /^# Use your own keys on a self-hosted Slatebox$/m, 'own-keys.md: the title says self-hosted')
  assert.match(keys.split('\n## ')[0], /Own AI and call keys are for self-hosted Slatebox\.[\s\S]*On Slatebox Cloud, AI and calls come with Slatebox Pro credits and top-ups\./, 'own-keys.md: the intro says own keys are self-hosted and Cloud has Pro and top-ups')
  for (const words of [OWN_KEYS_CLOUD, 'before 22 November 2026 stays stored, unused', 'Slatebox never sends a request with it', 'can still remove it', 'remove: [']) assert.ok(section(keys, 'On Slatebox Cloud').includes(words), 'own-keys.md, On Slatebox Cloud, does not say ' + words)
  for (const words of ['**Credits**', 'Team settings', 'DeepInfra', 'OpenAI-compatible', 'Daily', 'last four characters', 'Remove', 'encrypted']) assert.ok(keys.includes(words), 'own-keys.md does not say ' + words)
  // Restated (feat/any-ai-selfhost): the image writes the operator's AI to settings.ai (ai-config.mjs).
  for (const words of ['no meters', 'settings.ai', '10,000', 'metering', 'nobody needs Slatebox Pro']) assert.ok(host.includes(words), 'self-host-meters.md does not say ' + words)
  assert.match(read('Installation/install-with-docker.md'), /\(self-host-meters\.md\)/, 'the Docker guide links the no-meters page')
  assert.match(read('Using-Slatebox/readme.md'), /\(pricing\.md\)/, 'the user guide links the pricing page')
})

// The old plans, in words a person reads. Software upgrades of a release kit and operation plans of the API are not plans.
// Slatebox Pro (owner, 2026-11-22) is one personal subscription, not a plan: pages say "Slatebox Pro" or "Pro credits".
// A bare "Pro" is for the pages about Pro and money only, and "subscription" for the Slatebox Pro page only.
const PRO_PAGES = ['Using-Slatebox/pricing.md', 'Using-Slatebox/slatebox-pro.md', 'Using-Slatebox/top-ups.md', 'Using-Slatebox/slatebox-business.md']
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
  assert.match(keys, /Image search[^.]*(Pro credits|included amount), then your balance/, 'own-keys.md: say image search uses the included amount, then the balance')
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

// Own AI and call keys are for self-hosted Slatebox only (owner, 2026-11-22). Slatebox Cloud refuses own-key writes and never
// uses a key saved before, so no sentence outside a self-hosted context may say own keys work, pay or are free. A sentence
// that names a self-hosted Slatebox (or your own server) is about self-hosting and may say so.
const SELF_HOSTED = /self-host|your own server|run yourself|on your own Slatebox/i
const OWN_KEYS_ON_CLOUD = [
  /free with (your )?own keys|(work|works) free with your own/i,
  /your own (AI |call |Daily )?keys? (is|are|stay|stays) (always )?free/i,
  /own keys? (still )?works?\b|own keys and (your|the) balance/i,
  /AI on your own key/i,
  /own (AI|connections?|keys?)[^.]*costs? nothing/i,
  /Your own keys? (is|are) used first|own key(s)?,? then (your )?Pro credits/i,
  /connect your own AI, add a Daily key/i,
  /Bring your own (AI|key|Daily)/i,
  /own keys (stay|are) free with or without/i,
]
const sentences = text => text.replace(/<!--[\s\S]*?-->/g, ' ').split(/(?<=[.!?])\s+|\n+/)
test('no page says own AI or call keys work or are free on Slatebox Cloud', () => {
  const found = []
  for (const file of [...docs, 'STYLE.md', 'readme.md']) {
    for (const sentence of sentences(read(file))) {
      if (SELF_HOSTED.test(sentence)) continue
      for (const pattern of OWN_KEYS_ON_CLOUD) if (pattern.test(sentence)) found.push(file + ': ' + sentence.trim().slice(0, 140))
    }
  }
  assert.deepEqual(found, [])
  // the guard itself catches the old words
  for (const old of ['AI and calls work free with your own keys.', 'Your own keys stay free.', 'Your own keys and your balance still work.', 'The canvas is free, and so is AI on your own key.', 'Your own key is used first, then your Pro credits.'])
    assert.ok(OWN_KEYS_ON_CLOUD.some(p => p.test(old)), 'the guard misses: ' + old)
  // the pages that speak of Cloud money say own keys are not there
  for (const [file, words] of [['Using-Slatebox/slatebox-pro.md', 'own keys are for self-hosted Slatebox'], ['Using-Slatebox/slatebox-business.md', 'Own AI and call keys are for self-hosted Slatebox'], ['Using-Slatebox/choose-your-ai.md', 'Personal and team connections are for self-hosted Slatebox only'], ['Using-Slatebox/choose-your-ai.md', OWN_KEYS_CLOUD], ['Developers/SlateboxAPI/mcp.md', LISTING], ['Developers/SlateboxAPI/mcp.md', OWN_KEYS_CLOUD]])
    assert.ok(read(file).includes(words), file + ' does not say ' + words)
  assert.doesNotMatch(read('Developers/SlateboxAPI/mcp.md'), /so is AI on your own key|AI on your own key is free/i, 'mcp.md: the old listing line')
})

test('the Cloud refusal and the MCP listing line are the app\'s words', t => {
  const app = beside(process.env.APP_DIR, ['../app', '../app.slatebox.com'], 'web/app/imports/api/common/own-keys.mjs')
  if (!app) {
    assert.notEqual(process.env.REQUIRE_APP, '1', 'REQUIRE_APP=1 and no app checkout with own-keys.mjs found: set APP_DIR')
    return t.skip('no app checkout beside the docs (set APP_DIR): the refusal and the listing line were not compared with the app')
  }
  const source = read(join(app, 'web/app/imports/api/common/own-keys.mjs'))
  assert.ok(source.includes("'" + OWN_KEYS_CLOUD + "'"), 'the app\'s OWN_KEYS_CLOUD at ' + app + ' differs from the docs\' quote')
  for (const readme of ['README.md', 'packages/slatebox-mcp/README.md'])
    assert.ok(read(join(app, readme)).includes(LISTING), app + '/' + readme + ' does not carry the listing line the docs quote')
})
