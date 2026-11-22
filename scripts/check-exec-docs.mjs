// Agents work with Slatebox through one tool, exec, plus describe. These checks keep every
// guide on that path, keep the exec page honest about where code runs, and stop publishing
// until the package the guides tell people to install exists here with its checksum.
import test from 'node:test'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {execFile} from 'node:child_process'
import {createServer} from 'node:http'
import {mkdtemp, readFile, readdir, rm, stat} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {marked} from 'marked'

const PACKAGE = 'slatebox-mcp-0.3.0.tgz'
const EXEC_PAGE = 'Developers/SlateboxAPI/exec.md'
const AsyncFunction = (async () => {}).constructor

async function walk(dir) {
  const entries = await readdir(dir, {withFileTypes: true})
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name)))).flat()
}
const guides = (await Promise.all(['Using-Slatebox', 'Examples', 'Developers', 'Installation'].map(walk))).flat().filter(f => f.endsWith('.md'))
const text = Object.fromEntries(await Promise.all(guides.map(async f => [f, await readFile(f, 'utf8')])))
const exec = text[EXEC_PAGE] ?? ''
// A fence's info string is "lang Label" (```js JavaScript). lang is the first word; the label names
// the picker tab. A js block labelled Node.js is a program that calls the API, not an exec script.
const codeBlocks = source => marked.lexer(source).filter(t => t.type === 'code').map(t => {
  const [lang = '', ...label] = (t.lang ?? '').trim().split(/\s+/)
  return {...t, lang, label: label.join(' ')}
})
const isScript = block => block.lang === 'js' && block.label !== 'Node.js'

test('the exec page exists and every developer entry point leads to it', async () => {
  assert.ok(exec.startsWith('---') || exec.startsWith('# '), EXEC_PAGE + ' is missing')
  assert.match(exec, /^# Exec: how agents work with Slatebox$/m)
  assert.match(text['Developers/readme.md'], /\]\(SlateboxAPI\/exec\.md\)/)
  assert.match(text['Developers/SlateboxAPI/readme.md'], /\]\(exec\.md(#[^)]*)?\)/)
  assert.match(text['Developers/SlateboxAPI/terminal-and-agents.md'], /\]\(exec\.md(#[^)]*)?\)/)
  const home = await readFile('dist/index.html', 'utf8')
  assert.match(home, /href="\/developers\/slateboxapi\/exec\/"/, 'the docs home needs an exec card')
  const index = await readFile('dist/llms.txt', 'utf8')
  assert.match(index, /\(https:\/\/docs\.slatebox\.com\/Developers\/SlateboxAPI\/exec\.md\)/)
})

test('no guide sends an agent or a person down a per-action tool or command', () => {
  const retiredTools = /\b(create_slate|get_slate|apply_slate_operations|create_slate_invite|revoke_slate_invite|dry_run|share_id|idempotency_key|expected_revision|include_full)\b/
  const retiredCommands = /slatebox (create|read|share|unshare|branch|outcome|order|move|preview|apply)\b/
  for (const [file, source] of Object.entries(text)) {
    assert.doesNotMatch(source, retiredTools, file + ' names a retired per-action MCP tool or argument')
    assert.doesNotMatch(source, retiredCommands, file + ' names a retired per-action CLI command')
    assert.doesNotMatch(source, /\b17 tools\b|MCP tools\b/i, file + ' describes a per-action tool list')
  }
})

test('every guide installs the exec package and no older one', () => {
  for (const [file, source] of Object.entries(text)) {
    for (const [name] of source.matchAll(/slatebox-mcp-\d+\.\d+\.\d+\.tgz/g)) assert.equal(name, PACKAGE, file + ' names ' + name)
  }
  assert.match(text['Developers/SlateboxAPI/terminal-and-agents.md'], new RegExp(PACKAGE.replaceAll('.', '\\.')))
  assert.match(text['Developers/SlateboxAPI/terminal-and-agents.md'], /Node\.js 22\.13 or later/)
})

test('the exec page says where code runs on every surface and what the sealed runner does not stop', () => {
  for (const claim of [
    /no (external|outside) sandbox service/i,
    /in your own process, with no sandbox/i,
    /QuickJS/, /WebAssembly/, /child process/i,
    /QuickJS is not audited/i,
    /Node\.js 24/,
    /never runs inside the (Slatebox )?app process/i,
    /can also confirm/i,
    /token management/i,
  ]) assert.match(exec, claim)
  for (const surface of ['POST /api/v1/exec', '/mcp', 'conversation', 'CLI', 'stdio', '--http', '--remote']) {
    assert.ok(exec.includes(surface), 'the exec page must place ' + surface)
  }
})

test('the exec page makes no vendor comparison (STYLE.md: no vendor comparisons, quotes or logos)', () => {
  for (const host of ['openai.com', 'anthropic.com', 'claude.com', 'cloudflare.com', 'ai-sdk.dev', 'vercel.com']) {
    assert.ok(!exec.includes(host), 'the exec page links ' + host)
  }
})

test('the limits table carries every published number', () => {
  for (const value of ['30 seconds', '10 seconds', '32 MiB', '64 KiB', '| 64 |', '256 KiB', '512 KiB', '| 200 |', '| 10 |', '40,000', '16 KiB', '30 days']) {
    assert.ok(exec.includes(value), 'the limits are missing ' + value)
  }
})

test('every script, JSON and TypeScript example on the agent pages parses', () => {
  const pages = [EXEC_PAGE, 'Developers/SlateboxAPI/terminal-and-agents.md', 'Examples/agent-spend-cap.md', 'Examples/refund-approval.md', 'Examples/review-a-backfill.md']
  let scripts = 0
  for (const file of pages) {
    for (const block of codeBlocks(text[file])) {
      if (block.lang === 'json') assert.doesNotThrow(() => JSON.parse(block.text), file + ' has invalid JSON')
      if (isScript(block)) {
        // A script for exec is a function body with top-level await and return.
        assert.doesNotThrow(() => new AsyncFunction('slatebox', 'SlateboxError', block.text), file + ' has a script that does not parse:\n' + block.text)
        scripts++
      }
    }
  }
  assert.ok(scripts >= 6, 'the agent pages should show working exec scripts')
})

test('a script never passes a second argument or an idempotency key to a client method', () => {
  for (const file of [EXEC_PAGE, 'Developers/SlateboxAPI/terminal-and-agents.md', 'Examples/refund-approval.md', 'Examples/review-a-backfill.md', 'Examples/agent-spend-cap.md']) {
    for (const block of codeBlocks(text[file]).filter(isScript)) {
      assert.doesNotMatch(block.text, /idempotencyKey/, file + ': keys inside scripts are derived by Slatebox')
      for (const m of block.text.matchAll(/slatebox\.\w+\.\w+\(\{/g)) {
        let depth = 0, i = m.index + m[0].length - 1
        for (; i < block.text.length; i++) {
          const c = block.text[i]
          if (c === '{' || c === '(' || c === '[') depth++
          if (c === '}' || c === ')' || c === ']') depth--
          if (depth === 0) break
        }
        assert.equal(block.text[i + 1], ')', file + ': a client method takes exactly one object')
      }
    }
  }
})

// What the exec page and the terminal guide say must be what the package and the app do.
// Each check below names the behaviour it pins, read from the code at exec/app and exec/mcp.
const terminal = () => text['Developers/SlateboxAPI/terminal-and-agents.md']
const section = (source, heading) => source.split(/^## /m).find(s => s.startsWith(heading)) ?? ''

test('every request and every MCP config points at the app origin, never the embed host', async () => {
  // api.slatebox.com is the embed Worker: it answers GET /embed/{id} only, and 410 for /v1/.
  // The HTTP API is /api/v1 on the app origin (https://app.slatebox.com on Cloud).
  const build = await readFile('scripts/build.mjs', 'utf8')
  for (const [file, source] of Object.entries({...text, 'scripts/build.mjs': build})) {
    assert.doesNotMatch(source, /https:\/\/api\.slatebox\.com(?!\/embed\/)/, file + ' sends API requests to the embed host')
    // A /v1 path may be named only to say it was retired.
    for (const line of source.split('\n').filter(l => !/retired/.test(l))) {
      assert.doesNotMatch(line, /`(GET|POST|DELETE) \/v1\/|relative to `\/v1`/, file + ' names a /v1 path the app does not serve')
    }
  }
  for (const [file, source] of Object.entries(text)) {
    for (const block of codeBlocks(source).filter(b => b.lang === 'json')) {
      const servers = Object.values(JSON.parse(block.text).mcpServers ?? {})
      for (const server of servers.filter(s => /slatebox-mcp$/.test(s.command ?? ''))) {
        assert.ok(server.env?.SLATEBOX_BASE_URL, file + ': a slatebox-mcp config must set SLATEBOX_BASE_URL, so no one inherits a default origin')
      }
    }
  }
})

test('no HTTP example sends dryRun: the operations request takes mode', () => {
  for (const [file, source] of Object.entries(text)) assert.doesNotMatch(source, /dryRun/, file + ' sends dryRun, which answers 400 invalid_request')
  assert.match(text['Developers/SlateboxAPI/slates.md'], /"mode":"preview"/)
})

test('describe is described as what it is: the client list with each method\'s scope', () => {
  for (const file of [EXEC_PAGE, 'Developers/SlateboxAPI/terminal-and-agents.md']) {
    for (const claim of [/methods your token can use/i, /available on that release/i, /lists no invitation methods/i, /appears as a client method on its own/i]) {
      assert.doesNotMatch(text[file], claim, file + ' says describe depends on the token or the instance; it returns the package\'s own list')
    }
  }
  assert.match(exec, /the scope (it|each method) needs/i)
  assert.match(exec, /403 `insufficient_scope`/)
  assert.match(exec, /`unknown_method`/)
})

test('the exit codes say which ones come from a refused run and which from a refused call', () => {
  const rows = Object.fromEntries([...terminal().matchAll(/^\| (\d) \| (.+) \|$/gm)].map(m => [m[1], m[2]]))
  for (const code of ['3', '4', '5']) assert.match(rows[code] ?? '', /before the script ran|--remote/, 'exit ' + code + ' applies to a refused run, not to a call inside the script')
  assert.match(rows['7'] ?? '', /call/i, 'exit 7 covers a call the instance refused, such as 401 or 404 inside the script')
})

test('the confirmation rules say exactly what the gate counts', () => {
  const rules = section(exec, 'Saves that wait for confirmation')
  // Restated (release/agentic): the owner's rule counts per script, over every slate it writes.
  assert.match(rules, /more than 10 existing notes in all \(the count is kept for the whole script/, 'the text rule counts per script')
  assert.match(rules, /slate someone else owns/, 'the others-notes rule is about the slate owner')
  assert.match(rules, /does not yet record who wrote each note/, 'say what happens to teammates\' notes on your own slate')
  assert.match(exec, /\| Note text rewrites in one script before confirmation \| 10 \|/)
})

// Review F3 (release/agentic): the owner's rule is about scripts. Say that a direct API call is
// not held, so nobody reads the rule as covering every write.
test('the confirmation rules say they hold scripts, not a direct API call', () => {
  const rules = section(exec, 'Saves that wait for confirmation')
  assert.match(rules, /hold exec runs only/, 'the rules name what they hold')
  assert.match(rules, /`POST \/api\/v1\/slates\/\{shareId\}\/operations` call made outside exec is not held/, 'a direct API call is not held')
})

// Restated (release/agentic): every edit names its revision; a canvas edit without one is
// refused, and with one it conflicts only on what it changes.
test('the exec page says when a save in between is caught and when it is not', () => {
  assert.doesNotMatch(exec, /If someone saved in between, the write fails with `slate_changed`/)
  assert.doesNotMatch(exec, /A canvas plan carries no revision/)
  assert.match(exec, /every edit carries an `expectedRevision`/)
  assert.match(exec, /A canvas edit without one is refused with `invalid_request`/)
  assert.match(exec, /only if a note or setting it changes was changed after your revision/)
})

test('every canvas edit in the guides names the revision it was made on', async () => {
  const { readFile } = await import('node:fs/promises')
  const pages = ['Developers/SlateboxAPI/exec.md', 'Developers/SlateboxAPI/terminal-and-agents.md', 'Developers/SlateboxAPI/slates.md', 'Examples/preview-api-edit.md', 'Examples/refund-approval.md']
  for (const page of pages) {
    const text = await readFile(new URL('../' + page, import.meta.url), 'utf8')
    assert.doesNotMatch(text, /\bsummary\.(workshop|nodes)|\{ summary \}|\)\.summary'/, page + ' reads the flat slate read, not summary')
    for (const block of text.matchAll(/```(?:js|ts|sh|python)(?: [^\n]*)?\n([\s\S]*?)```/g)) {
      const code = block[1]
      const canvas = /applyOperations|\/operations"/.test(code) && /"?kind"?: ?"(add_nodes|update_nodes|delete_nodes|connect_nodes)"/.test(code)
      if (canvas) assert.match(code, /expectedRevision/, page + ': a canvas edit names expectedRevision')
    }
  }
})

test('the sealed runner sentence does not promise a network-free child process on Node.js 24', () => {
  assert.doesNotMatch(exec, /child process with no environment, no credentials and no network/)
  assert.match(exec, /QuickJS, which has no network or file API/)
})

test('one setting holds each exec number', () => {
  for (const [file, source] of Object.entries(text)) assert.doesNotMatch(source, /settings\.exec\.auditDays/, file + ' names a second key for the audit days')
  assert.match(exec, /`settings\.selfHosted\.exec`/)
})

test('the exec page says what happens against an instance that does not run exec', () => {
  assert.match(exec, /instance that does not run exec/)
  assert.match(exec, /stops before the script's first call and saves nothing/)
})

// Self-hosting is one image, ghcr.io/slatebox/slatebox, and that image runs exec. There are no
// numbered self-host releases to name: the install page says so, and the exec page agrees.
test('the one-container page documents exec, and no page names a self-host release', () => {
  const install = text['Installation/install-with-docker.md']
  const part = section(install, 'Agents and exec')
  assert.ok(part, 'Installation/install-with-docker.md needs an "Agents and exec" section')
  assert.match(part, /\]\(\.\.\/Developers\/SlateboxAPI\/exec\.md(#[^)]*)?\)/, 'the section links the exec page')
  assert.match(part, /runs exec/, 'the section says the image runs exec')
  for (const surface of ['POST /api/v1/exec', '/mcp']) assert.ok(part.includes(surface), 'the section names ' + surface)
  assert.match(part, /`SLATEBOX_SETTINGS`/, 'the section says where the exec limits are set')
  assert.match(part, /selfHosted.+exec/, 'the section names settings.selfHosted.exec')
  assert.match(exec, /ghcr\.io\/slatebox\/slatebox/, 'the exec page names the self-host image')
  assert.match(exec, /the self-host image run exec/, 'the exec page says the self-host image runs exec')
  for (const [file, source] of Object.entries(text)) {
    assert.doesNotMatch(source, /self-host(ed)? release|release with exec|\b20\d{6}T\d{6}Z\b/i, file + ' names a self-host release; there is one image')
  }
})

// The release gate. The guides install slatebox-mcp 0.3.0, so they are not published before the
// archive and its checksum exist here. Every check below runs the archive itself.

function run(file, args, env) {
  return new Promise(resolve => execFile(process.execPath, [file, ...args], {env: {PATH: process.env.PATH, ...env}, timeout: 60000}, (error, stdout, stderr) =>
    resolve({code: error ? (typeof error.code === 'number' ? error.code : 1) : 0, stdout, stderr})))
}

// An instance from before exec: it ignores Slatebox-Exec-* headers and saves what it is sent.
async function olderInstance(t) {
  const saves = []
  const server = createServer(async (req, res) => {
    let body = ''
    for await (const chunk of req) body += chunk
    const send = (status, value) => { res.writeHead(status, {'content-type': 'application/json'}); res.end(JSON.stringify(value)) }
    if (req.headers.authorization !== 'Bearer release-check') return send(401, {error: {code: 'unauthorized', message: 'A valid Slatebox API token is required.'}})
    if (req.method === 'GET' && req.url === '/api/v1/slates/canvas') return send(200, {shareId: 'canvas', summary: {nodes: [{id: 'a', text: 'Alpha'}]}})
    if (req.method === 'POST' && req.url === '/api/v1/slates/canvas/operations') {
      const input = JSON.parse(body || '{}')
      const result = {ok: true, shareId: 'canvas', message: input.plan?.message ?? '', operations: input.plan?.operations ?? [], report: {}}
      if (input.mode === 'preview') return send(200, {...result, mode: 'preview'})
      saves.push(input)
      return send(201, {...result, mode: 'save'})
    }
    send(404, {error: {code: 'unknown_route', message: 'There is no such API route.'}})
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.after(() => server.close())
  return {saves, origin: 'http://127.0.0.1:' + server.address().port}
}

test('the guides are not published before the exec package exists', async t => {
  const archive = path.join('assets/downloads', PACKAGE)
  const exists = await stat(archive).then(() => true, () => false)
  assert.ok(exists, 'Release step: build ' + PACKAGE + ' and its .sha256 into assets/downloads before publishing these guides')
  const expected = (await readFile(archive + '.sha256', 'utf8')).trim().split(/\s+/)[0]
  assert.equal(createHash('sha256').update(await readFile(archive)).digest('hex'), expected)

  const project = await mkdtemp(path.join(tmpdir(), 'slatebox-exec-docs-'))
  t.after(() => rm(project, {recursive: true, force: true}))
  const pkg = path.join(project, 'node_modules', 'slatebox-mcp')
  await new Promise((resolve, reject) => execFile('tar', ['xzf', path.resolve(archive), '-C', project], error => error ? reject(error) : resolve()))
  await new Promise((resolve, reject) => execFile('mkdir', ['-p', path.join(project, 'node_modules')], e => e ? reject(e) : resolve()))
  await new Promise((resolve, reject) => execFile('mv', [path.join(project, 'package'), pkg], e => e ? reject(e) : resolve()))
  const manifest = JSON.parse(await readFile(path.join(pkg, 'package.json'), 'utf8'))
  const cli = path.join(pkg, manifest.bin?.slatebox ?? 'missing')

  await t.test('the archive is the 0.3.0 package the guides describe', async () => {
    assert.equal(manifest.version, '0.3.0')
    assert.equal(manifest.engines?.node, '>=22.13.0')
    assert.ok(manifest.exports?.['./client'], 'slatebox-mcp/client must resolve')
    for (const file of ['generated/client.json', 'generated/exec-tool.json']) await stat(path.join(pkg, file))
    const imported = await new Promise(resolve => execFile(process.execPath, ['--input-type=module', '-e', 'const m = await import("slatebox-mcp/client"); console.log(typeof m.createClient)'], {cwd: project}, (e, out) => resolve(out.trim())))
    assert.equal(imported, 'function')
    const described = await run(cli, ['describe'], {SLATEBOX_API_TOKEN: 'release-check', SLATEBOX_BASE_URL: 'http://127.0.0.1:9'})
    assert.equal(described.code, 0, 'slatebox describe must run from the archive: ' + described.stderr)
  })

  await t.test('both executables default to the app origin', async () => {
    for (const file of (await walk(path.join(pkg, 'src'))).filter(f => f.endsWith('.js'))) {
      for (const [origin] of (await readFile(file, 'utf8')).matchAll(/https:\/\/(?:api|app)\.slatebox\.com/g)) {
        assert.equal(origin, 'https://app.slatebox.com', path.relative(pkg, file) + ' defaults to ' + origin)
      }
    }
  })

  await t.test('against an instance that does not run exec, the package saves nothing', async st => {
    const instance = await olderInstance(st)
    const env = {SLATEBOX_API_TOKEN: 'release-check', SLATEBOX_BASE_URL: instance.origin}
    const add = 'return await slatebox.slates.applyOperations({ shareId: "canvas", plan: { message: "Add", operations: [{ kind: "add_nodes", count: 1, shape: "rectangle", text: "Q" }] } })'
    const previewed = await run(cli, ['exec', '-e', add, '--preview'], env)
    assert.deepEqual(instance.saves, [], '--preview saved on an instance that ignores the exec headers:\n' + previewed.stdout + previewed.stderr)
    const remove = 'return await slatebox.slates.applyOperations({ shareId: "canvas", plan: { message: "Remove", operations: [{ kind: "delete_nodes", target: { ids: ["a"] } }] } })'
    const removed = await run(cli, ['exec', '-e', remove], env)
    assert.deepEqual(instance.saves, [], 'a delete saved without confirmation on an instance that ignores the exec headers')
    assert.notEqual(removed.code, 0, 'a run that could not apply the exec rules must not report success')
  })

  await t.test('the limits table is the one the app generated into the package', async () => {
    const {limits} = JSON.parse(await readFile(path.join(pkg, 'generated/client.json'), 'utf8'))
    const row = label => (exec.match(new RegExp('^\\| ' + label + ' \\| (.+) \\|$', 'm')) ?? [])[1]
    assert.equal(row('Run time'), limits.wallSeconds + ' seconds')
    assert.equal(row('CPU time in the sealed runner'), limits.cpuSeconds + ' seconds')
    assert.match(row('Memory and stack in the sealed runner') ?? '', new RegExp('^' + limits.memoryMiB + ' MiB'))
    assert.equal(row('Code size'), limits.codeKiB + ' KiB')
    assert.equal(row('Calls per script'), String(limits.callsPerScript))
    assert.equal(row('Calls in flight at once'), String(limits.callsInFlight))
    assert.equal(row('Operations per script, summed over its plans'), String(limits.operationsPerScript))
    assert.equal(row('Notes created per script'), String(limits.notesCreatedPerScript))
    // The rule counts per script, over every slate it writes (the confirmation-rules test above; the package's exec rules).
    assert.equal(row('Note text rewrites in one script before confirmation'), String(limits.textRewritesBeforeConfirm))
    assert.match(row('Returned result') ?? '', new RegExp('^' + limits.resultChars.toLocaleString('en-US') + ' characters'))
    assert.equal(row('Logs'), limits.logKiB + ' KiB')
    assert.equal(row('Audit retention'), limits.auditDays + ' days')
    assert.match(exec, new RegExp('for ' + limits.confirmationMinutes + ' minutes'))
  })

})
