// The "Agents and MCP" page: connecting an assistant to Slatebox. exec stays first-class on every
// surface; beside it the server lists one typed tool per client method, generated from the same
// contract. These checks hold the page to what the released package (the archive in
// assets/downloads) and the app actually serve, and keep the hosted address first.
//   node --test scripts/check-mcp-docs.mjs     (after npm run build, so dist/ holds the built pages)
import test from 'node:test'
import assert from 'node:assert/strict'
import {execFile} from 'node:child_process'
import {mkdtemp, readFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'

const PACKAGE = 'slatebox-mcp-0.3.5.tgz'
const PAGE = 'Developers/SlateboxAPI/mcp.md'
const HOSTED = 'https://app.slatebox.com/mcp'
const read = file => readFile(file, 'utf8')
const page = await read(PAGE).catch(() => '')
const section = (source, heading) => source.split(/^## /m).find(s => s.startsWith(heading)) ?? ''

// The tool list, prompts and resources the released package serves (generated from the app's contract).
const project = await mkdtemp(path.join(tmpdir(), 'slatebox-mcp-docs-'))
await new Promise((resolve, reject) => execFile('tar', ['xzf', path.resolve('assets/downloads', PACKAGE), '-C', project], e => e ? reject(e) : resolve()))
const surface = JSON.parse(await read(path.join(project, 'package/generated/exec-tool.json')))
const manifest = JSON.parse(await read(path.join(project, 'package/package.json')))
await rm(project, {recursive: true, force: true})

test('the page exists and leads with the hosted address, before any install', () => {
  assert.match(page, /^# Connect an assistant: Agents and MCP$/m)
  const first = page.indexOf(HOSTED)
  assert.ok(first > 0, 'the page names ' + HOSTED)
  assert.ok(first < page.indexOf('slatebox-mcp-'), 'the hosted address comes before the package')
  assert.ok(first < page.indexOf('## Run it on your machine'), 'the hosted address comes before the local server')
})

test('exec is first-class: always listed, beside the typed tools, never behind a switch', () => {
  const tools = section(page, 'What your assistant gets')
  assert.match(tools, /`exec`/)
  assert.match(tools, /`describe`/)
  assert.match(tools, /always listed/i)
  assert.match(tools, /generated from the same (contract|client)/i)
  assert.match(tools, /one (exec )?script of exactly one call|an exec script of one call/i, 'a typed tool runs as exec, so it meets the same checks')
  assert.match(tools, /\]\(exec\.md(#[^)]*)?\)/, 'links the exec page')
  assert.doesNotMatch(page, /exec_read|exec_write/, 'there is no split exec')
  assert.match(page, /--typed-tools off/)
  assert.match(page, /SLATEBOX_MCP_TYPED_TOOLS=off/)
  assert.match(page, /`exec` and `describe` stay/i, 'turning typed tools off keeps exec and describe')
})

test('the tools table names exactly the typed tools the package serves, with read or write', () => {
  const rows = [...section(page, 'What your assistant gets').matchAll(/^\| `([a-z_]+)` \| (Reads|Writes) \| .+ \|$/gm)]
  const documented = Object.fromEntries(rows.map(m => [m[1], m[2]]))
  const served = Object.fromEntries(surface.typed.map(t => [t.name, t.annotations.readOnlyHint ? 'Reads' : 'Writes']))
  assert.deepEqual(documented, served)
})

test('the prompts and resources are the ones the package serves', () => {
  const part = section(page, 'What your assistant gets')
  for (const prompt of surface.prompts) assert.ok(part.includes('`' + prompt.name + '`'), 'prompt ' + prompt.name)
  for (const resource of [...surface.resources.map(r => r.uri), ...surface.resourceTemplates.map(r => r.uriTemplate)]) {
    assert.ok(part.includes('`' + resource + '`'), 'resource ' + resource)
  }
})

test('connecting with sign-in: Claude, Claude Code, ChatGPT and other clients, then what the person sees', () => {
  const claude = section(page, 'Connect Claude')
  assert.match(claude, /\*\*Add custom connector\*\*/)
  assert.ok(claude.includes(HOSTED))
  assert.match(claude, /claude mcp add --transport http slatebox https:\/\/app\.slatebox\.com\/mcp/)
  assert.match(claude, /`\/mcp`/, 'Claude Code signs in from its /mcp menu')
  const chatgpt = section(page, 'Connect ChatGPT')
  assert.ok(chatgpt.includes(HOSTED))
  assert.match(chatgpt, /OAuth/)
  assert.match(chatgpt, /developer mode/i)
  const other = section(page, 'Connect another client')
  assert.match(other, /\/\.well-known\/oauth-protected-resource/)
  const consent = section(page, 'What happens when you connect')
  for (const step of [/sign in/i, /has not checked this app/i, /\*\*Allow\*\*/, /\*\*Deny\*\*/, /untick/i]) assert.match(consent, step)
  // The permission words on the consent page and the token form (app: imports/api/common/token-permissions.mjs).
  for (const [scope, label] of [
    ['slates:read', 'Read slates'],
    ['slates:write', 'Create and edit slates'],
    ['slates:share', 'Manage invitation links on slates I own'],
    ['ai:settings', 'Read, change and test my own AI connections'],
    ['ai:admin', 'Change and test my team\'s or this server\'s AI (team admins and administrators only)'],
    ['team:export', 'Export everything my team owns (team admins only)'],
    ['team:import', 'Import a team export as a new team, and confirm or discard it (administrators only)'],
  ]) assert.ok(consent.includes('| **' + label + '** | `' + scope + '` |'), 'the permission row for ' + scope)
  assert.match(consent, /1 hour/)
  assert.match(consent, /30 days/)
  assert.match(consent, /never open `\/api\/v1`|cannot call `\/api\/v1`/i, 'sign-in tokens work on /mcp only')
  const disconnect = section(page, 'Disconnect an app')
  assert.match(disconnect, /\*\*Profile → Developer access\*\*/)
  assert.match(disconnect, /\*\*Connected apps\*\*/)
  assert.match(disconnect, /\*\*Disconnect\*\*/)
  assert.match(disconnect, /25/, 'the connected-app limit')
})

test('a personal token still works on /mcp, and the local package is the released one', () => {
  const token = section(page, 'Connect with a personal token')
  assert.match(token, /"Authorization": "Bearer \$\{SLATEBOX_API_TOKEN\}"/)
  const local = section(page, 'Run it on your machine')
  assert.ok(local.includes(PACKAGE), 'the local section installs ' + PACKAGE)
  assert.match(local, /no sandbox/i)
  assert.equal(manifest.version, '0.3.5')
  assert.equal(manifest.mcpName, 'com.slatebox/slatebox')
})

test('the page names no vendor comparison and no capability the server lacks', () => {
  assert.doesNotMatch(page, /\bMiro\b|alternative to|better than/i)
  // Restated (parity): the server now serves list_slates and add_comment, and since 0.3.4 create_presentation (the
  // tools table test holds them to the package); these it still does not.
  assert.doesNotMatch(page, /search_slates|export_image/)
  for (const tool of ['list_slates', 'add_comment', 'create_presentation']) assert.ok(surface.typed.some(t => t.name === tool), tool + ' is served')
})

test('every way into the agent docs leads to this page, and the agent index leads with the hosted address', async () => {
  for (const file of ['Developers/readme.md', 'Developers/SlateboxAPI/readme.md', 'Developers/SlateboxAPI/exec.md', 'Developers/SlateboxAPI/terminal-and-agents.md']) {
    assert.match(await read(file), /\]\((SlateboxAPI\/)?mcp\.md(#[^)]*)?\)/, file + ' links the Agents and MCP page')
  }
  const index = await read('dist/llms.txt')
  // Restated 2026-11-24 (owner positioning, and the copy rule "agent" over "AI"): free, open source (MIT), the visual
  // intelligence platform for your team and agents, agents invited through MCP.
  assert.match(index, /^> Slatebox is the free, open-source \(MIT\) visual intelligence platform for your team and agents\. Invite any agent through MCP to work with you and your team on one live canvas/m, 'the positioning line')
  const agents = index.split(/^## /m).find(s => s.startsWith('Agents / MCP')) ?? ''
  assert.ok(agents, 'the agent index has an "Agents / MCP" section')
  assert.ok(index.indexOf('## Agents / MCP') < index.indexOf('## Using Slatebox'), 'the section comes before the guide lists')
  const lines = agents.split('\n').filter(l => l.startsWith('- '))
  assert.ok(lines[0].includes(HOSTED), 'the first entry is the hosted address')
  assert.ok(agents.includes('(https://docs.slatebox.com/' + PAGE + ')'), 'the section links the page')
  assert.match(agents, /exec/)
  assert.doesNotMatch(index, /\bMiro\b/)
  const home = await read('dist/index.html')
  assert.match(home, /href="\/developers\/slateboxapi\/mcp\/"/, 'the docs home has a card for connecting an assistant')
})
