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
  assert.equal(first, 'npx slatebox@latest install')
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
