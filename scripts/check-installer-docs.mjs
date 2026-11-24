// The self-host page leads with the one-command installer, for people and agents, and keeps
// Slatebox untethered from any AI provider. node --test scripts/check-installer-docs.mjs
import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

const page = readFileSync(new URL('../Installation/install-with-docker.md', import.meta.url), 'utf8')
const body = page.replace(/^---\n[\s\S]*?\n---\n/, '')
const front = page.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? ''
const section = heading => body.split(/^## /m).find(s => s.startsWith(heading + '\n')) ?? ''
const headings = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1])

test('the first command on the page is the installer', () => {
  const first = body.match(/```[^\n]*\n([\s\S]*?)```/)?.[1].trim()
  assert.equal(first, 'npx slatebox')
  assert.equal(headings[0], 'Install with one command')
  assert.equal(headings[1], 'Let an agent install it')
})

test('the install section has a tab for each target', () => {
  const part = section('Install with one command')
  for (const label of ['Docker', 'Remote server', 'Kubernetes', 'Files only']) assert.match(part, new RegExp('^```sh ' + label + '$', 'm'), 'tab ' + label)
  assert.match(part, /install ssh /)
  assert.match(part, /install k8s /)
  assert.match(part, /install export --format/)
})

test('agents get the brief, a plan before a yes, and the exit codes', () => {
  const part = section('Let an agent install it')
  assert.match(part, /agent-prompt/)
  assert.match(part, /plan --answers slatebox\.yaml --json/)
  assert.match(part, /install --answers slatebox\.yaml --yes --json/)
  for (const code of [0, 2, 3, 4, 5, 6, 7]) assert.match(part, new RegExp('^\\| ' + code + ' \\|', 'm'), 'exit ' + code)
  assert.match(front, /^agentPrompt:/m, 'the page has its own agent prompt')
  assert.match(front, /agent-prompt/)
  assert.match(front, /no default AI provider/)
})

test('the AI step names no default and keeps keys out of flags and files', () => {
  const part = section('Choose the AI when you install')
  assert.match(part, /never picks one/)
  assert.match(part, /--ai none/)
  for (const kind of ['openai', 'anthropic', 'deepinfra', 'ollama', 'lmstudio', 'openai-compatible']) assert.ok(part.includes('`' + kind + '`'), kind)
  for (const spec of part.matchAll(/--ai-provider "([^"]+)"|ai add "([^"]+)"/g)) {
    const key = (spec[1] || spec[2]).match(/key=([^,]+)/)?.[1]
    if (key) assert.match(key, /^(env:[A-Z_]+|file:.+|prompt)$/, 'a key is a reference: ' + key)
  }
})

test('the page says where the key encryption key lives on each target', () => {
  const part = section('Where the encryption key lives')
  for (const where of ['~/.slatebox/installs/<name>/secrets.env', '/opt/slatebox/secrets.env', '<name>-env']) assert.ok(part.includes(where), where)
  assert.match(part, /Backups do not contain it/)
  assert.match(part, /--new-encryption-key/)
})

test('upgrade, back up and move each start with the installer', () => {
  assert.match(section('Upgrade'), /^```sh Shell\nnpx slatebox upgrade/m)
  assert.match(section('Back up and restore'), /npx slatebox backup/)
  const move = section('Move to another server')
  assert.match(move, /secrets\.env/)
  assert.match(move, /npx slatebox restore/)
})

// The guide is held until the installer and the image are published (scripts/features.json "self-host"). While it is
// held, it and the single sign-on guide have no page of their own: their addresses redirect to the coming-soon page,
// and no built page, search entry, sitemap or agent index names them. Switching it on reverses all of that.
//   (after npm run build)
test('the install guide is built only while the self-host switch is on', () => {
  const on = JSON.parse(readFileSync(new URL('./features.json', import.meta.url), 'utf8'))['self-host'] === true
  const dist = file => new URL('../dist/' + file, import.meta.url)
  const built = file => { try { return readFileSync(dist(file), 'utf8') } catch { return '' } }
  for (const file of ['Installation/install-with-docker.md', 'Installation/single-sign-on.md']) {
    assert.match(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), /^feature: self-host$/m, file + ' is held by the self-host switch')
  }
  const index = ['llms.txt', 'search.json', 'sitemap.xml'].map(built).join('\n')
  for (const url of ['installation/install-with-docker/', 'installation/single-sign-on/']) {
    const page = built(url + 'index.html')
    if (on) { assert.ok(page && !page.includes('http-equiv="refresh"'), url + ' is built'); continue }
    assert.ok(page.includes('<meta http-equiv="refresh" content="0; url=/installation/self-hosting/">'), url + ' redirects to the coming-soon page while held')
    assert.ok(!index.includes(url) && !index.includes(url.replace('installation/', 'Installation/').replace(/\/$/, '')), url + ' is in an index while held')
  }
  // The same address carries the coming-soon text while held, and the short install page once published.
  const soon = built('installation/self-hosting/index.html')
  if (on) {
    assert.doesNotMatch(soon, /coming soon/i, 'no coming-soon text once the guide is published')
    assert.match(soon, />npx slatebox</, 'the short page leads with npx slatebox')
  } else assert.match(soon, /Self-hosting is coming soon/)
})

// "Run your own Slatebox" (Installation/self-hosting.md) is the short page: what you get, `npx slatebox` on the
// machine of your choice, or ask your agent through the Slatebox MCP, what you need, and a link to troubleshooting.
// Its published text sits between <!-- feature:self-host --> markers; the coming-soon text only while the switch is off.
const shortPage = readFileSync(new URL('../Installation/self-hosting.md', import.meta.url), 'utf8')
const kept = (text, on) => text.replace(/<!-- feature:(!?[a-z][a-z0-9-]*) -->([\s\S]*?)<!-- \/feature:\1 -->/g, (whole, spec, inner) => (spec.startsWith('!') ? !on : on) ? inner : '')

test('Run your own Slatebox, published: short, npx slatebox first, the MCP route, requirements, troubleshooting', () => {
  assert.doesNotMatch(shortPage.match(/^---\n([\s\S]*?)\n---\n/)[1], /^feature:/m, 'the page has an address whichever way the switch is set')
  const on = kept(shortPage, true)
  const body = on.replace(/^---\n[\s\S]*?\n---\n/, '')
  assert.doesNotMatch(on, /coming soon|not published yet/i)
  assert.equal(body.match(/```[^\n]*\n([\s\S]*?)```/)?.[1].trim(), 'npx slatebox')
  assert.deepEqual([...body.matchAll(/^## (.+)$/gm)].map(m => m[1]), ['What you get', 'Install', 'Or ask your agent', 'What you need'])
  assert.ok(body.split(/\s+/).filter(Boolean).length < 450, 'short: under 450 words')
  assert.match(body, /--dry-run/)
  assert.match(body, /Connect an assistant\]\(\.\.\/Developers\/SlateboxAPI\/mcp\.md\)/)
  assert.match(body, /\(install-with-docker\.md#troubleshooting\)/)
  assert.match(body, /Single sign-on, free/)
  assert.match(body, /on-prem license/)
  assert.doesNotMatch(body, /\$\d/, 'no prices: the pricing page holds them')
  assert.match(on, /^agentPrompt:/m)
})

test('Run your own Slatebox, held: the coming-soon text, and no npx slatebox command', () => {
  const off = kept(shortPage, false)
  assert.match(off, /coming soon/)
  assert.doesNotMatch(off, /npx slatebox/)
})
