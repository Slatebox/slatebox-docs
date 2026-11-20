// Agents work with Slatebox through one tool, exec, plus describe. These checks keep every
// guide on that path, keep the exec page honest about where code runs, and stop publishing
// until the package the guides tell people to install exists here with its checksum.
import test from 'node:test'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFile, readdir, stat} from 'node:fs/promises'
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
const codeBlocks = source => marked.lexer(source).filter(t => t.type === 'code')

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

test('every vendor comparison links its primary source with the date it was read', () => {
  const sources = [
    'https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling',
    'https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling',
    'https://www.anthropic.com/engineering/code-execution-with-mcp',
    'https://blog.cloudflare.com/code-mode-mcp/',
    'https://ai-sdk.dev/docs/ai-sdk-core/code-mode',
  ]
  const why = exec.split(/^## /m).find(s => s.startsWith('Why Slatebox')) ?? ''
  for (const url of sources) {
    const line = why.split('\n').find(l => l.includes('](' + url + ')'))
    assert.ok(line, 'the comparison must link ' + url)
    assert.match(line, /read 2026-11-19/, url + ' needs the date it was read')
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
      if (block.lang === 'js') {
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
    for (const block of codeBlocks(text[file]).filter(b => b.lang === 'js')) {
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

test('the guides are not published before the exec package they install exists here', async () => {
  const archive = path.join('assets/downloads', PACKAGE)
  const exists = await stat(archive).then(() => true, () => false)
  assert.ok(exists, 'Release step: build ' + PACKAGE + ' and its .sha256 into assets/downloads before publishing these guides')
  const expected = (await readFile(archive + '.sha256', 'utf8')).trim().split(/\s+/)[0]
  assert.equal(createHash('sha256').update(await readFile(archive)).digest('hex'), expected)
})
