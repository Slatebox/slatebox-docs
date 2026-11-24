// Pricing in the docs: Slatebox is free (MIT, open source, except the app's enterprise/ folder: owner, 2026-11-23/24). On Slatebox Cloud, AI and calls come with Slatebox Pro (monthly
// or yearly plus tax, Pro credits sized by the app, on sale now) and top-ups; own AI and call keys are for
// self-hosted Slatebox only, where they are free (owner, 2026-11-22; the app's own-keys.mjs); top-ups work with or
// without Pro; teams can choose Slatebox Business, priced per member, bought in the app once its checkout is on and by talking to us
// until then (owner, 2026-11-24).
//   node --test scripts/check-pricing.mjs        (after npm run build, so dist/ holds the built pages)
//   npm run check:cross                          the same, and the app and the site must be found (REQUIRE_APP, REQUIRE_SITE)
// No docs page states a price, a margin or a numbered allowance (owner, 2026-11-24: "link to the central pricing page instead
// of hardcoding the prices all over because they will change over time"). The one page that states them is the site's
// pricing page, https://slatebox.com/plans/ (and the terms); the docs say what things are and link "See pricing" there.
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
  'Installation/self-host-costs.md': ['Who pays for what on your own server', '/installation/self-host-costs/'],
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
// license carve-out (owner, 2026-11-23): outside-agent connections are under the Slatebox Enterprise License, on Cloud and,
// with an on-prem license, on a self-hosted Slatebox (owner, 2026-11-24).
const HEADLINE = ['Slatebox is free', 'MIT-licensed and open source, except outside-agent connections', 'free for individuals and companies alike']
// What Slatebox Pro costs and includes: one price for one person, plus tax, with Pro credits as the app meters them
// (scripts/pro-figures.json): separate allowances of AI, voice and video, sized to what full use costs Slatebox. These are
// stated on the central pricing page (the site's /plans/), never on a docs page.
const FIGURES = JSON.parse(read('scripts/pro-figures.json'))
const CREDITS = FIGURES.pro.credits
const half = hours => (hours % 1 ? (Math.floor(hours) || '') + '½' : String(hours))
const hoursWords = hours => 'about ' + half(hours) + ' ' + (hours === 1 ? 'hour' : 'hours')
const money = dollars => '$' + (Number.isInteger(dollars) ? dollars : dollars.toFixed(2))
const PRO = ['$' + FIGURES.pro.monthCents / 100 + ' a month', '$' + FIGURES.pro.yearCents / 100 + ' a year', 'two months free', 'plus tax where applicable',
  'about ' + money(CREDITS.costDollars), 'about ' + CREDITS.draftsPerMonth + ' drafts a month', 'up to ' + CREDITS.draftsPerDay + ' a day',
  hoursWords(CREDITS.voiceHours), hoursWords(CREDITS.videoHours)]
const BUSINESS = ['$' + FIGURES.business.monthCentsPerSeat / 100 + ' per member per month', '$' + FIGURES.business.yearCentsPerSeat / 100 + ' per member per year']
const PRICING_URL = 'https://slatebox.com/plans/'
const SEE_PRICING = '[See pricing](' + PRICING_URL + ')'
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
  for (const words of [...HEADLINE, 'plus tax where applicable']) assert.ok(pricing.toLowerCase().includes(words.toLowerCase()), 'pricing.md does not say ' + words)
  for (const words of ['participant-minutes', 'Each row is its own amount for the month', 'the share of that month\'s Pro credits', 'carries on as voice', 'Joining a call', 'never pay', 'own key', 'top up', 'with or without Pro', 'Pro credits never shrink or pause', 'a daily number for each person', 'do not carry over', 'Cancel any time', '30 days ahead', '(slatebox-business.md)', BUSINESS_LINK, SEE_PRICING])
    assert.ok(pricing.includes(words), 'pricing.md does not say ' + words)
  // Own keys are a self-hosted feature (owner, 2026-11-22): on Cloud, AI and calls come with Pro and top-ups.
  assert.match(pricing, /Nobody brings their own AI or call key on Cloud: own keys are for self-hosted Slatebox, where they are free/, 'pricing.md: own keys are for self-hosted Slatebox only')
  assert.doesNotMatch(pricing, /## Three ways to pay|\*\*Your own key\.\*\*/, 'pricing.md: own keys are not a way to pay on Cloud')
  assert.match(section(pricing, 'Self-hosted Slatebox'), /own AI and call keys, for free/, 'pricing.md: a self-hosted Slatebox keeps own keys, free')
  // Every feature but one (inviting outside agents, with Slatebox Pro or Slatebox Business) is free on Cloud, said while the agents-invite switch is on.
  assert.match(pricing, /<!-- feature:agents-invite -->every feature but one is free<!-- \/feature:agents-invite --><!-- feature:!agents-invite -->every feature is free<!-- \/feature:!agents-invite -->/i, 'pricing.md: every feature but one is free')
  // The carve-out (owner, 2026-11-23/24): the app's enterprise/ folder is source-available; inviting outside
  // agents comes with Slatebox Pro or (owner, 2026-11-24) Slatebox Business, said only while the agents-invite switch is on.
  assert.match(pricing, /`enterprise\/` folder[^.]*Slatebox Enterprise License/, 'pricing.md: enterprise/ is under the Slatebox Enterprise License')
  assert.match(pricing, /<!-- feature:agents-invite -->The one exception is inviting outside agents onto your slates, which comes with Slatebox Pro or Slatebox Business\.[\s\S]*?<!-- \/feature:agents-invite --><!-- feature:!agents-invite -->No feature is ever sold separately\.<!-- \/feature:!agents-invite -->/, 'pricing.md: the Slatebox Pro exception is held by the agents-invite switch')
  // The subscription page: price, credits, canceling, failed payments, refunds as the terms say, deleting the account.
  assert.doesNotMatch(pricing + pro, /in any mix/i, 'Pro credits are separate allowances, not one pool')
  for (const words of ['plus tax where applicable', 'monthly or yearly', SEE_PRICING, 'counted in participant-minutes', 'the share of that month\'s Pro credits', 'Cancel any time', 'Monthly to yearly', 'Yearly to monthly', 'end of the year', 'do not carry over', 'no cash value', 'Pro credits pause', 'pro rata', '30 days of your notice', 'Deleting your account ends Pro at once', 'Your unused top-up balance is refunded first; then Pro ends', 'Pro stays on and nothing is removed', 'Credits', 'confirm', '30 days\' notice'])
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
  // The central pricing page holds the amounts the docs leave out: Pro, its credits, Business and the top-up margin.
  const text = read(join(site, 'plans/index.html')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase()
  for (const words of [...HEADLINE, ...PRO, ...BUSINESS]) assert.ok(text.includes(words.toLowerCase()), 'the site pricing page at ' + site + ' does not say ' + words)
  // the site keeps its own copy of the figures: it must be the same file
  const siteFigures = join(site, 'site/pro-figures.json')
  assert.ok(existsSync(siteFigures), 'the site has no site/pro-figures.json')
  assert.deepEqual(JSON.parse(read(siteFigures)), FIGURES, 'the site\'s pro-figures.json differs from the docs\'')
  assert.ok(text.includes('plus 5%'), 'the site pricing page states the top-up margin ("plus 5%")')
  assert.ok(existsSync(join(site, '_redirects')) && /^\/pricing\/? \/plans\/ 301$/m.test(read(join(site, '_redirects'))), 'the site sends /pricing to /plans/, the page the docs link')
})

// No docs page states a price (owner, 2026-11-24): the amounts live on the central pricing page only, and the pages about
// money link it. A money amount, a percentage or a numbered allowance of Pro credits on any page fails. Money in a worked
// example (the $600 pilot budget a team splits) is the example's, not a price, and may stay where it says nothing of Slatebox.
const EXAMPLE_MONEY = new Set(['Examples/startup-experiments.md', 'Using-Slatebox/readme.md'])
// A worked example's money says nothing of Slatebox: a line that also names Pro (bare or not), credits, top-ups, Business,
// a balance, a price, a subscription, or a period (a month, a year, monthly, per person, /mo) is a price, example file or not.
const MONEY_WORDS = /\bPro\b|credits|top.?up|Business|balance|price|subscri|\b(a|per|each|every) (month|year|person|member|user|seat)\b|\bmonthly\b|\byearly\b|\bannual|\/\s?(mo|month|yr|year)\b/i
const NUMBER_WORDS = '(?:\\d[\\d,.]*|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|hundred|thousand|half a)'
const priceFigures = [
  [/[$€£¥]\s?\d/, 'a money amount', (file, line) => !(EXAMPLE_MONEY.has(file) && /\$\s?\d/.test(line) && !/[€£¥]\s?\d/.test(line) && !MONEY_WORDS.test(line))],
  [/\b(USD|EUR|GBP|CAD|AUD|NZD|CHF|JPY|INR)\s?\d|\d\s?(USD|EUR|GBP|CAD|AUD|NZD|CHF|JPY|INR)\b/, 'a money amount in a currency code'],
  [new RegExp('\\b' + NUMBER_WORDS + '\\s+(US |American |Canadian |Australian )?(dollars?|bucks|euros?|pounds?( sterling)?|cents?|pence)\\b', 'i'), 'a money amount in words'],
  [/\b\d+(\.\d+)?\s?%/, 'a percentage', (file, line) => !/zoom/i.test(line)],
  [new RegExp('\\b' + NUMBER_WORDS + '[\\s-]*(percent|per cent|pct)\\b', 'i'), 'a percentage in words'],
  [/\b\d[\d,]*\s+(AI\s+)?drafts\b|\bup to \d+ a day|\b\d+ a day for each/i, 'a number of drafts'],
  [/\b[\d,½]+\s+(participant-)?minutes of (voice|video)|[\d,]+ participant-minutes|\b[\d½]+ hours? of four-person/i, 'call hours or minutes'],
  [/two months free|\b(a|per|each) (person|member|user|seat|head),? (a|per|each) (month|year)\b|a member a (month|year)/i, 'a price'],
]
const prose = line => line.replace(/\]\([^)]*\)/g, '] ').replace(/https?:\/\/\S+/g, ' ') // a link's address is not prose (%20)
const priceHits = (file, text) => text.split('\n').map(prose).flatMap((line, index) => priceFigures
  .filter(([pattern, , allowed]) => pattern.test(line) && (!allowed || allowed(file, line)))
  .map(([, what]) => file + ':' + (index + 1) + ' ' + what + ': ' + line.trim().slice(0, 100)))
test('no docs page hardcodes a price, a margin or an allowance; the pages about money link the pricing page', () => {
  const found = [...docs, 'STYLE.md', 'readme.md'].flatMap(file => priceHits(file, read(file)))
  assert.deepEqual(found, [], 'state prices only on ' + PRICING_URL + ' and link it: "' + SEE_PRICING + '"')
  // the built pages, the search index and the agent index carry none either
  const built = ['dist/using-slatebox/pricing/index.html', 'dist/using-slatebox/slatebox-pro/index.html', 'dist/using-slatebox/top-ups/index.html', 'dist/using-slatebox/slatebox-business/index.html', 'dist/llms.txt'].map(read).join('\n')
  for (const words of [...PRO.slice(0, 2), ...BUSINESS, 'plus 5%', money(CREDITS.costDollars)]) assert.ok(!built.includes(words), 'a built page or the agent index states ' + words)
  for (const file of Object.keys(pages).filter(file => file.startsWith('Using-Slatebox/'))) if (file !== 'Using-Slatebox/own-keys.md') assert.ok(read(file).includes(SEE_PRICING), file + ' does not link ' + SEE_PRICING)
  // the guard itself catches the old words
  for (const old of ['Slatebox Pro is $5 a month or $50 a year (two months free).', '| AI drafting | About 180 drafts a month, up to 30 a day |', 'Pro credits hold 1,380 participant-minutes of voice.', 'at what the provider charges us plus 5%.', 'It costs $6 a person a month.', 'From $10, with or without Pro, a top-up.', '| Voice calls you start | About 5½ hours of four-person calls a month |', '5 a day for each person.',
    // round-1 review: words, currency codes, other currencies, percent words, per-user prices, /mo, a bare "Pro is $5"
    '5 dollars a month.', 'Five dollars a month.', 'USD 5 a month.', '10 USD a month.', '€6 per person per month.', '£6 a member a month.', 'plus five percent.', 'plus 5 percent.',
    'It costs $6 per user per month.', '$5/mo.', '$5/month.', '$5 monthly.', 'Slatebox Business is priced per member per month.'])
    assert.notDeepEqual(priceHits('Using-Slatebox/pricing.md', old), [], 'the guard misses: ' + old)
  // the worked-example files are no shelter for a price: a line that names Pro, a period or a price fails there too
  for (const old of ['Pro is $5 a month.', 'Slatebox Pro is $5.', 'The pilot costs $5/mo.', 'A team pays €6.'])
    assert.notDeepEqual(priceHits('Using-Slatebox/readme.md', old), [], 'the guard misses, in a worked-example file: ' + old)
  assert.deepEqual(priceHits('Examples/startup-experiments.md', 'Drag **Second $200** to **Concierge onboarding**.'), [], 'a worked example\'s budget is not a price')
  assert.deepEqual(priceHits('Using-Slatebox/readme.md', 'For a budget, try moving $200 of the $600 pilot from a newsletter placement to concierge onboarding.'), [], 'a worked example\'s budget is not a price')
  assert.deepEqual(priceHits('Using-Slatebox/pricing.md', 'Each member adds the same amount as Pro credits to the pool each month.'), [], 'plain words about Pro credits are not a price')
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
// inside the shared Cloud, priced per member (owner, 2026-11-24), bought in the app once its checkout is on, by talking to us until then.
test('Slatebox Business replaces Slatebox Private, and is sold in the app or by talking to us', () => {
  const biz = read('Using-Slatebox/slatebox-business.md')
  for (const words of ['priced per member', 'plus tax where applicable', 'shared, fully managed', 'shared pool of AI and calls', 'same amount as Pro credits', 'Single sign-on and the audit log', 'not on Slatebox Cloud yet', 'Hands-on help for large teams', 'is coming', 'No own keys on Cloud', BUSINESS_LINK, SEE_PRICING])
    assert.ok(biz.includes(words), 'slatebox-business.md does not say ' + words)
  // How to start (owner, 2026-11-24: Business is sold in the app). The steps to buy in the app are held by the
  // business-checkout switch, which may be on only once the app reports businessCheckout (its Business price IDs are set);
  // until then, and after, talking to us is a way in, with no "not on sale" and a link to the pricing page.
  const start = section(biz, 'How to start')
  const checkoutOn = JSON.parse(read('scripts/features.json'))['business-checkout']
  assert.equal(typeof checkoutOn, 'boolean', 'scripts/features.json switches business-checkout')
  assert.ok(!checkoutOn || FIGURES.business.businessCheckout === true, 'business-checkout is on, but the app does not report businessCheckout: its Business price IDs are not set')
  assert.match(start, /^How to start\n\n<!-- feature:business-checkout -->\nA team's owner or an admin buys Slatebox Business in the app[\s\S]*?\(https:\/\/app\.slatebox\.com\/business\?plan=monthly\)[\s\S]*?<!-- \/feature:business-checkout -->/, 'slatebox-business.md, How to start: the steps to buy in the app are held by the business-checkout switch')
  assert.match(start, /<!-- feature:!business-checkout -->\nTalk to us to choose Slatebox Business for your team/, 'slatebox-business.md, How to start: while the switch is off, talking to us is the action')
  assert.ok(start.includes(BUSINESS_LINK) && start.includes(SEE_PRICING), 'slatebox-business.md, How to start: links Talk to us about Business and See pricing')
  const builtBiz = read('dist/using-slatebox/slatebox-business/index.html')
  assert.equal(builtBiz.includes('app.slatebox.com/business?plan='), checkoutOn, 'the built Business page links the app\'s Business sheet only while business-checkout is on')
  for (const file of docs) assert.doesNotMatch(read(file), /not on sale in the app|Until it is, write to us|sold by talking to us for now/i, file + ': Business is for sale: say "Talk to us", not that it is not on sale')
  // single sign-on and the audit log are not on Cloud: promised for when they come, never stated as there today
  for (const file of docs) assert.doesNotMatch(read(file), /Enterprise features, free for every team on Cloud anyway|audit log are not sold separately/i, file + ' says single sign-on and the audit log are on Cloud today')
  // the Business link is the app's (an email while the site's contact form is off), never a page that does not exist yet
  for (const file of docs) if (FIGURES.business.contactUrl.startsWith('mailto:')) assert.doesNotMatch(read(file), /slatebox\.com\/contact\//, file + ' links the contact form, which is not live')
  // Restated (owner, 2026-11-24: Business is sold in the app): the one buying link is the app's Business sheet, inside the
  // business-checkout switch; no page links Stripe or any other payment page.
  const outsideSwitch = biz.replace(/<!-- feature:business-checkout -->[\s\S]*?<!-- \/feature:business-checkout -->/g, '').replace(/<!--[\s\S]*?-->/g, '')
  assert.doesNotMatch(outsideSwitch, /app\.slatebox\.com\/(buy|business)|checkout/i, 'slatebox-business.md: the app\'s Business sheet is linked only inside the business-checkout switch')
  assert.doesNotMatch(biz, /stripe|app\.slatebox\.com\/buy/i, 'slatebox-business.md: no Stripe or other payment link')
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
  const top = read('Using-Slatebox/top-ups.md'), keys = read('Using-Slatebox/own-keys.md'), host = read('Installation/self-host-costs.md')
  for (const words of ['card fee', 'a small margin', SEE_PRICING, 'smallest top-up', 'never expires', 'Refund my balance', '**Credits**', 'You do not need Pro to top up', 'Your Pro credits are used first if you have Slatebox Pro, then your balance']) assert.ok(top.includes(words), 'top-ups.md does not say ' + words)
  // own-keys.md is the self-hosted page: on Cloud, nothing is saved or used, and a key saved before stays, unused, removable.
  assert.match(keys, /^# Use your own keys on a self-hosted Slatebox$/m, 'own-keys.md: the title says self-hosted')
  assert.match(keys.split('\n## ')[0], /Own AI and call keys are for self-hosted Slatebox\.[\s\S]*On Slatebox Cloud, AI and calls come with Slatebox Pro credits and top-ups\./, 'own-keys.md: the intro says own keys are self-hosted and Cloud has Pro and top-ups')
  for (const words of [OWN_KEYS_CLOUD, 'before 22 November 2026 stays stored, unused', 'Slatebox never sends a request with it', 'can still remove it', 'remove: [']) assert.ok(section(keys, 'On Slatebox Cloud').includes(words), 'own-keys.md, On Slatebox Cloud, does not say ' + words)
  // A person's or team's own Daily key needs the meter (the Credits tab and team keys show only where metered), and a
  // self-hosted Slatebox has none: its calls use the server's Daily account (owner, 2026-11-24).
  for (const words of ['**Credits**', 'DeepInfra', 'OpenAI-compatible', 'Daily', 'Remove', 'encrypted']) assert.ok(keys.includes(words), 'own-keys.md does not say ' + words)
  // Restated (feat/any-ai-selfhost): the image writes the operator's AI to settings.ai (ai-config.mjs).
  // Slatebox Pro and balances are Slatebox Cloud's only (owner, 2026-11-24): the self-host page says who pays, never how to meter.
  // Restated (owner, 2026-11-24, prices in one place): Daily's free allowance is Daily's figure and drifts, so the page links
  // Daily's pricing instead of stating "10,000" participant-minutes.
  for (const words of ['settings.ai', "[Daily's pricing](https://www.daily.co/pricing/)", 'Slatebox Pro and balances exist only on Slatebox Cloud', 'needs Slatebox Pro']) assert.ok(host.includes(words), 'self-host-costs.md does not say ' + words)
  assert.match(read('Installation/install-with-docker.md'), /\(self-host-costs\.md\)/, 'the Docker guide links the who-pays page')
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
  const keys = read('Using-Slatebox/own-keys.md'), host = read('Installation/self-host-costs.md')
  // Restated (feat/any-ai, connections.mjs): image search is always the built-in service, so it uses Pro credits,
  // then the balance. Image generation does too, unless the person chose for Generating images an own connection that
  // makes images (capabilities.images true); an own key saved before choices existed never makes images (fromLegacy).
  const ai = keys.split('\n').find(line => line.startsWith('| Your own AI')) || ''
  assert.doesNotMatch(ai, /image search/i, 'own-keys.md: own AI does not pay for image search')
  assert.doesNotMatch(keys, /Your (free amount|Pro credits) and your balance are left untouched\./, 'own-keys.md: images still use Pro credits and the balance')
  assert.match(keys, /Image search always uses the server's own image service/, 'own-keys.md: say image search always uses the server\'s own service, never an own AI key')
  assert.match(keys, /Image generation[^.]*unless you choose[^.]*makes images[^.]*\*\*Generating images\*\*/, 'own-keys.md: image generation is yours only with a connection that makes images, chosen for Generating images')
  // Images are not drafts (holds.mjs: a draft is kind ai): they use the month's AI of Pro credits.
  assert.doesNotMatch(pricing, /each image search and each image generation is one draft/i, 'pricing.md: images are not drafts')
  assert.doesNotMatch(pricing, /\| AI drafting and image search \|/, 'pricing.md: image search is not in the 30 drafts a day')
  assert.match(pricing, /Image search and image generation use the month's AI from your Pro credits, not the daily count/, 'pricing.md: images use the month\'s AI of Pro credits')
  // The dialog shows the card fee on its own line (ledger.mjs cardFeeCents); the docs give no example amounts.
  assert.match(top, /the dialog shows the whole amount: the balance you add, and the card fee on its own line/, 'top-ups.md: the dialog shows the card fee on its own line')
  // A refund waits while the balance is in use. The docs carry no former-subscriber notice (greenfield).
  assert.doesNotMatch(top, /refunded to your card at any time/, 'top-ups.md: the refundable part is not fixed')
  assert.doesNotMatch(top, /former subscriber|1\.5 times/i, 'top-ups.md: no former-subscriber notice')
  assert.match(top, /while a call or a request is being paid from it/, 'top-ups.md: a refund waits while the balance is in use')
  // Call limits apply to calls we pay for; an own Daily key has Daily's limits (calls.mjs, own-keys.md).
  assert.doesNotMatch(pricing, /## Limits on every call/, 'pricing.md: the limits are not on every call: own Daily keys have none of ours')
  assert.doesNotMatch(pricing, /Everyone sees a notice 2 minutes before a call ends\./, 'pricing.md: the 3-hour end has no notice')
  // Self-host: no meter to turn on, no budget page, no payments (owner, 2026-11-24); own keys need the encryption key.
  assert.doesNotMatch(host, /metering|Budget and Pro|top-?ups?|Stripe/i, 'self-host-costs.md: a self-hosted Slatebox has no meter, budget or payments to set up')
  assert.match(host, /SLATEBOX_KEY_ENCRYPTION_KEY/, 'self-host-costs.md: own keys need the encryption key')
})

// Every subscription was canceled with no conversion and no balance, so there is nothing for a
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
