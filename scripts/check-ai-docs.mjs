// AI in the docs: Slatebox uses whatever AI a person, their team and the operator connect, local or
// cloud, mixed per feature. Each check names the code it is read from: the app's feat/any-ai
// (web/app/server/methods/ai/connections.mjs, endpoint-policy.mjs, actions/ai-*.mjs,
// imports/ui/components/profile/AISettings.jsx) and the self-host image's feat/any-ai-selfhost
// (self-host/rootfs/opt/slatebox/lib/ai-config.mjs, ai-cli.mjs).
//   node --test scripts/check-ai-docs.mjs        (after npm run build, so dist/ holds the built pages)
import test from 'node:test'
import assert from 'node:assert/strict'
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs'
import {join} from 'node:path'
import {marked} from 'marked'

const read = file => readFileSync(file, 'utf8')
const walk = dir => readdirSync(dir).flatMap(name => statSync(join(dir, name)).isDirectory() ? walk(join(dir, name)) : [join(dir, name)])
const docs = ['Using-Slatebox', 'Examples', 'Developers', 'Installation'].flatMap(walk).filter(file => file.endsWith('.md'))
const PAGE = 'Using-Slatebox/choose-your-ai.md'
const page = () => (existsSync(PAGE) ? read(PAGE) : '')
const install = () => read('Installation/install-with-docker.md')
const blocks = source => marked.lexer(source).filter(t => t.type === 'code').map(t => {
  const [lang = '', ...label] = (t.lang ?? '').trim().split(/\s+/)
  return {...t, lang, label: label.join(' ')}
})
const AsyncFunction = (async () => {}).constructor

test('one "Choose your AI" page exists, is built and is in the navigation', () => {
  assert.ok(existsSync(PAGE), PAGE + ' is missing')
  assert.match(page(), /^# Choose your AI$/m)
  assert.match(page(), /^description: .+/m, 'the page has a description for search and the agent index')
  assert.ok(existsSync('dist/using-slatebox/choose-your-ai/index.html'), 'the page was not built')
  assert.ok(read('dist/using-slatebox/index.html').includes('href="/using-slatebox/choose-your-ai/" '), 'the page is not in the navigation')
})

test('the page names every feature and choice the app offers, by the app\'s own labels', () => {
  const text = page()
  // AI_FEATURES titles, and the default menu label in AISettings.jsx
  for (const title of ['Default for every feature', 'Conversation and edits', 'Drafts and layouts', 'Presentation planning', 'Reading images and diagrams', 'Generating images']) {
    assert.ok(text.includes(title), 'the page does not name ' + title)
  }
  // USE_KEYS, the choice references and the connection types (ai-schemas.mjs)
  for (const key of ['`default`', '`chat`', '`generation`', '`presentation`', '`vision`', '`images`', '`builtin`', 'me:', 'team:', 'server:']) {
    assert.ok(text.includes(key), 'the page does not name ' + key)
  }
  for (const type of ['openai-compatible', 'OpenAI-compatible endpoint', 'OpenAI', 'Anthropic', 'DeepInfra']) assert.ok(text.includes(type), 'the page does not name the type ' + type)
  for (const label of ['**Profile → AI**', '**Connect a model**', '**Test connection**', '**Calls tools**', '**Reads images**', '**Makes images**', '**The AI this server provides**']) {
    assert.ok(text.includes(label), 'the page does not name ' + label)
  }
})

test('the page says who decides: person, then team, then the server, and the one switch', () => {
  const text = page()
  assert.match(text, /Your choice[^.]*wins/i, 'say the person\'s choice wins')
  assert.match(text, /team admin/i)
  assert.match(text, /administrator/i)
  for (const name of ['SLATEBOX_AI_OWN_PROVIDERS', 'SLATEBOX_AI_PRIVATE_ENDPOINTS', 'SLATEBOX_AI_CONFIG', 'SLATEBOX_AI_URL', 'SLATEBOX_AI_MODEL']) assert.ok(text.includes(name), 'the page does not name ' + name)
  // ownProviders is on unless the operator turns it off (operatorConfig: ownProviders !== 'off')
  assert.match(text, /SLATEBOX_AI_OWN_PROVIDERS=off/)
})

test('a model that cannot do something is named, never swapped for another', () => {
  const text = page()
  // capabilityGap: "<label> cannot <verb>. Choose another model for <feature> in your AI settings."
  assert.match(text, /never sends? (the|a) request (to another model|somewhere else)/i)
  assert.match(text, /cannot make images\. Choose another model for generating images in your AI settings\./)
})

test('personal and team connections are self-hosted only; on Cloud the AI tab shows what each feature uses', () => {
  const text = page()
  const intro = text.split(/^## /m)[0]
  assert.match(intro, /On a self-hosted Slatebox/, 'the intro says own AI is for a self-hosted Slatebox')
  assert.match(intro, /On Slatebox Cloud, AI comes with Slatebox Pro credits and top-ups\. Personal and team connections are for self-hosted Slatebox only\. \*\*Profile → AI\*\* shows which AI each feature uses\./)
  assert.doesNotMatch(text, /^description: .*Your own AI costs nothing on Slatebox/m, 'the description does not promise own AI on Cloud')
  // ai-settings-core.mjs: levels me and team refused on Cloud (403, OWN_KEYS_CLOUD); a remove-only change still works
  const agent = text.split(/^## /m).find(s => s.startsWith('Set it up with an agent')) ?? ''
  assert.match(agent, /Levels `me` and `team` are for self-hosted Slatebox\. Slatebox Cloud answers `403`/)
  assert.ok(agent.includes('Own AI and call keys are for self-hosted Slatebox. On Slatebox Cloud, AI and calls come with Slatebox Pro credits and top-ups.'), 'quote the refusal')
  assert.match(agent, /only `remove` still works/)
  const metered = text.split(/^## /m).find(s => s.startsWith('What is metered')) ?? ''
  assert.match(metered, /^\| Your connections and your team's \| Not offered: own AI is for self-hosted Slatebox \| Free/m, 'what is metered: own AI is not on Cloud, free on your own server')
})

test('the page says what is metered: only the AI Slatebox pays for', () => {
  const text = page()
  assert.match(text, /\(pricing\.md\)/, 'link the pricing page')
  assert.match(text, /\(\.\.\/Installation\/self-host-meters\.md\)/, 'link the no-meters page')
  assert.match(text, /Image search[^.]*Pro credits, then your balance/, 'image search is always the built-in service (BUILTIN_ONLY_FEATURES)')
  assert.doesNotMatch(text, /your own (AI|model|connection)[^.|]*(is|are) metered/i)
})

test('the address rules match endpoint-policy.mjs', () => {
  const text = page()
  // Own connections are self-hosted only (own-keys.mjs): Slatebox Cloud takes no person's or team's endpoint at all.
  assert.match(text, /^\| Your endpoints and your team's \| — \(self-hosted only\) \|/m, 'Slatebox Cloud: no personal or team endpoints')
  assert.doesNotMatch(text, /Slatebox Cloud reaches public/i, 'Slatebox Cloud reaches no personal or team endpoint')
  assert.match(text, /metadata/i, 'metadata addresses are refused for everyone')
  assert.match(text, /host\.docker\.internal/)
  assert.match(text, /--add-host=host\.docker\.internal:host-gateway/, 'Linux needs the host-gateway mapping')
  assert.match(text, /Mac[^.]*GPU/, 'the Docker-on-Mac note says why the model runs on the Mac')
  assert.match(text, /redirect/i, 'no redirects are followed')
})

test('agents set and test AI through exec and the API, with the right permissions', () => {
  const text = page()
  for (const route of ['GET /api/v1/ai', 'PUT /api/v1/ai', 'POST /api/v1/ai/check', 'slatebox.ai.update', 'slatebox.ai.check', 'slatebox.ai.get', '`ai:settings`', '`ai:admin`']) {
    assert.ok(text.includes(route), 'the page does not name ' + route)
  }
  // The CLI is slatebox exec: the contract's command names ai-set and ai-check are not CLI commands. The installer in the
  // same package does have `slatebox ai add|use|test|list|remove|off` (packages/slatebox/src/cli.mjs), for the install it
  // made; any other `slatebox ai` is not a command.
  for (const file of docs) assert.doesNotMatch(read(file), /slatebox (ai-set|ai-check)\b|npx[^\n]*slatebox ai\b(?! (add|use|test|list|remove|off)\b)/, file + ' names a CLI command the slatebox CLI does not have')
  let scripts = 0
  for (const block of blocks(text)) {
    if (block.lang === 'json') assert.doesNotThrow(() => JSON.parse(block.text), PAGE + ' has invalid JSON')
    if ((block.lang === 'js' || block.lang === 'ts') && block.label !== 'Node.js') {
      // exec keeps a run's code: a key never goes into a script (ai.update description)
      assert.doesNotMatch(block.text, /apiKey/, PAGE + ': keys go through PUT /api/v1/ai or the app, not into an exec script')
      if (block.lang === 'js') {
        assert.doesNotThrow(() => new AsyncFunction('slatebox', 'SlateboxError', block.text), PAGE + ' has a script that does not parse:\n' + block.text)
        scripts++
      }
    }
  }
  assert.ok(scripts >= 1, 'show an exec script that wires a model')
  assert.match(text, /holds `ai\.update` for (your )?confirmation/i, 'ai.update is confirm: true in exec')
})

test('no page names a model, favours a runner or ties AI to a bundled local model', () => {
  const models = /\b(gpt-?\d|gpt-4o|claude-\d|claude-(3|sonnet|opus|haiku)|llama ?\d|llama3|qwen|deepseek|mistral|mixtral|gemma|phi-\d|inkling)\b/i
  const runners = /\b(ollama|lm ?studio|llama\.cpp|vllm)\b/i
  // The installer's provider kinds are its interface (packages/slatebox/src/answers.mjs PROVIDER_KINDS): the self-host
  // page lists them as `kind` values, which names no model and favours no runner. Prose and model names stay banned.
  const installerKinds = /`(ollama|lmstudio|mistral)`|\bkind[=:] ?(ollama|lmstudio|mistral)\b/g
  for (const file of [PAGE, 'Installation/install-with-docker.md', 'Installation/self-host-meters.md', 'Using-Slatebox/own-keys.md', 'Using-Slatebox/pricing.md']) {
    const text = existsSync(file) ? read(file).replace(file === 'Installation/install-with-docker.md' ? installerKinds : /$^/, '') : ''
    assert.doesNotMatch(text, models, file + ' names a model; use a placeholder such as your-model-name')
    assert.doesNotMatch(text, runners, file + ' names a model runner; any OpenAI-compatible endpoint works')
  }
  for (const file of docs) assert.doesNotMatch(read(file), /SLATEBOX_AI=local|local[- ]only AI|bundled model|model is bundled/i, file + ' ties AI to a bundled local model')
})

test('the self-host guide says AI is whatever is connected, local or cloud, and lists every AI option', () => {
  const text = install()
  assert.match(text, /\(\.\.\/Using-Slatebox\/choose-your-ai\.md(#[^)]*)?\)/, 'the Docker guide links Choose your AI')
  assert.match(text, /local or cloud/i, 'say plainly that AI is local or cloud, as connected')
  assert.match(text, /host\.docker\.internal/)
  assert.match(text, /Mac[^.]*GPU/, 'the Docker-on-Mac note')
  // configure.mjs stops on an unknown option, so every option the image reads is listed.
  for (const name of ['SLATEBOX_AI_URL', 'SLATEBOX_AI_MODEL', 'SLATEBOX_AI_KEY', 'SLATEBOX_AI_CONFIG', 'SLATEBOX_AI_OWN_PROVIDERS', 'SLATEBOX_AI_PRIVATE_ENDPOINTS']) {
    assert.match(text, new RegExp('^\\| [^|]*`' + name + '`', 'm'), 'the Options table lists ' + name)
  }
  assert.match(text, /docker exec slatebox slatebox ai check/, 'name the container\'s test command')
  assert.doesNotMatch(text, /AI and calls use your own keys/, 'AI is not only keys: any endpoint works')
})

test('own keys and the no-meters page point to Choose your AI', () => {
  assert.match(read('Using-Slatebox/own-keys.md'), /\(choose-your-ai\.md(#[^)]*)?\)/)
  assert.match(read('Installation/self-host-meters.md'), /\(\.\.\/Using-Slatebox\/choose-your-ai\.md(#[^)]*)?\)/)
  assert.match(read('Using-Slatebox/pricing.md'), /\(choose-your-ai\.md(#[^)]*)?\)/)
  assert.match(read('Using-Slatebox/own-keys.md'), /\*\*Profile → AI\*\*/, 'own AI is connected in Profile → AI')
})
