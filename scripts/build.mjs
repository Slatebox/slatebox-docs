import {cp, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {Marked} from 'marked'
import {museumExample} from './museum-example.mjs'
import {gzipSync} from 'node:zlib'
import GithubSlugger from 'github-slugger'
import {parse as yaml} from 'yaml'
const root = process.cwd()
const out = path.join(root, 'dist')
const base = 'https://docs.slatebox.com'
const publishedFiles = 'https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype'
const html = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const urlFor = file => '/' + file.replace(/(?:^|\/)readme\.md$/i, '/').replace(/\.md$/i,'/').toLowerCase().replace(/^\/+/, '')
async function walk(dir) {
  const entries = await readdir(dir, {withFileTypes:true})
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir,entry.name)) : path.join(dir,entry.name)))).flat()
}
const files = (await Promise.all(['Using-Slatebox','Examples','Developers','Installation'].map(walk))).flat().filter(f=>f.endsWith('.md'))
const legacy = JSON.parse(await readFile('scripts/legacy-routes.json','utf8'))
// Features that are written but not yet published (scripts/features.json, one true or false each). A page whose front
// matter says `feature: <name>` is built only while that switch is on: when it is off the page has no address, and is
// in no navigation, search, sitemap, agent index or Markdown mirror. `feature: "!<name>"` is the reverse: the page is
// built only while the switch is off (a stand-in such as "being published"). Inside any page, text between
// <!-- feature:<name> --> and <!-- /feature:<name> --> is kept only while the switch is on, and text between
// <!-- feature:!<name> --> and <!-- /feature:!<name> --> only while it is off. A held page whose front matter has
// `whileHeld: /address/` keeps its own address as a redirect to that page while it is held. See readme.md.
const features = JSON.parse(await readFile('scripts/features.json','utf8'))
const switched = (spec, file) => {
  const name = String(spec).replace(/^!/,'')
  if (typeof features[name] !== 'boolean') throw Error(file+': feature "'+name+'" is not switched in scripts/features.json')
  return String(spec).startsWith('!') ? !features[name] : features[name]
}
const gate = (text, file) => text.replace(/<!-- feature:(!?[a-z][a-z0-9-]*) -->([\s\S]*?)<!-- \/feature:\1 -->/g, (whole, spec, inner) => switched(spec, file) ? inner : '')
const held = []
const pages = []
for (const file of files) {
  const raw = gate(await readFile(file, 'utf8'), file)
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  const meta = match ? yaml(match[1]) : {}
  if (meta.feature !== undefined && !switched(meta.feature, file)) {
    if (meta.whileHeld) held.push([urlFor(file), meta.whileHeld])
    continue
  }
  const text = raw.slice(match?.[0].length || 0)
  const title = meta.title || text.match(/^# (.+)$/m)?.[1] || meta.label || path.basename(file,'.md')
  const section = file.startsWith('Examples/') ? 'Examples' : file.startsWith('Installation/') ? 'Self-hosting' : file.startsWith('Using-Slatebox/') ? 'Using Slatebox' : file.includes('SlateboxAPI/') ? 'HTTP API' : 'SlateboxJS'
  const body = text.replace(/^# [^\n]+\n/m,'')
  const prose = body.replace(/```[\s\S]*?```/g,'').split('\n').filter(line=>line && !line.startsWith('#'))
  const summary = (prose[0] || '').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replaceAll('`','')
  const terms = [...new Set([...body.matchAll(/^#{2,4} (.*)|`([\w.]+)`/gm)].map(m => m[1] || m[2]))].join(' ')
  pages.push({file, text, url:urlFor(file), title, section, body, desc:meta.description || summary, terms, group:meta.group || section, demo:meta.demo, agentPrompt:meta.agentPrompt})
}
const examples = pages.filter(p => p.section === 'Examples').sort((a,b)=>a.title.localeCompare(b.title))
const sections = ['Using Slatebox','SlateboxJS','HTTP API','Self-hosting','Examples']
function link(href,label,attrs='') { return '<a href="'+html(href)+'" '+attrs+'>'+html(label)+'</a>' }
const entries = [
  {url:'/using-slatebox/use-from-your-agent/', title:'Use Slatebox from your agent',desc:'Add https://app.slatebox.com/mcp to Claude, ChatGPT or Cursor, sign in, and ask for a mind map. Free.'},
  {url:'/using-slatebox/', title:'Use the app',desc:'Create a private slate, invite a teammate and present your work.'},
  {url:'/developers/javascriptlibrary/', title:'Build with SlateboxJS',desc:'Draw a node, connect two ideas and save the canvas as JSON.'},
  {url:'/developers/slateboxapi/', title:'Connect your application',desc:'Read a slate and preview a change with a scoped API token.'},
  {url:'/developers/slateboxapi/mcp/', title:'Connect an assistant',desc:'Add https://app.slatebox.com/mcp to Claude, ChatGPT or any MCP client, sign in, and it draws on your slates.'},
  {url:'/developers/slateboxapi/exec/', title:'Give your agent exec',desc:'One tool runs a short script against a typed client. Every call is checked as if you made it.'},
  features['self-host']
    ? {url:'/installation/self-hosting/', title:'Host Slatebox',desc:'Run your own Slatebox with one command, npx slatebox install, at https://<name>.slatebox.team or your own domain.'}
    : {url:'/installation/self-hosting/', title:'Host Slatebox',desc:'Run your own Slatebox on your own server. The installer is being published; until then, use Slatebox Cloud.'}
]
const demos = {
  river:['Play the three-room river exhibition','canvas?mode=present&story=river'],
  telescope:['Try the original telescope test','workshop-demo?mode=planet-map'],
  outage:['Trace both customer paths on a whiteboard','sign-in-outage.html'],
  incident:['Move an incident note and open your timeline','multiplayer.html?story=incident'],
  listening:['Move the listening horn','workshop-demo?mode=listening'], gallery:['Hang the night sky','workshop-demo?mode=gallery'],
  focus:['Wire a return path','workshop-demo?mode=map&story=access'], handoff:['Review a field note','workshop-demo?mode=map&story=offline'],
  map:['Try a branching route','workshop-demo?mode=map'],presentation:['Present a slate','canvas?mode=present'],
}
function nativeCanvas() {
  return '<section class="canvas-demo" aria-label="Playable sound map"><header><span>Sound map</span><span>SlateboxJS</span></header><div class="drawing" data-drawing></div><div class="canvas-actions"><button type="button" data-add disabled>Add glass chimes</button><button type="button" data-reset disabled>Reset</button><output role="status" data-canvas-status>Loading canvas…</output></div><script type="module" src="/assets/canvas.mjs"></script></section>'
}
function embed(key) {
  if (key==='museum') return museumExample()
  if (key==='canvas') return nativeCanvas()
  if (!demos[key]) return ''
  const [label,route]=demos[key], src='https://slatebox.com/assets/product/'+route
  const frameClass = key === 'presentation' || key === 'river' ? 'live-demo deck-demo' : 'live-demo'
  return '<figure class="'+frameClass+'"><iframe loading="lazy" src="'+html(src)+'" title="'+html(label)+'" allow="autoplay"></iframe><figcaption>'+link(src,'Open the example in its own window ↗')+'</figcaption></figure>'
}
function sidebar(active) {
  return '<details class="toc"><summary>Browse documentation</summary><nav aria-label="Documentation sections">'+sections.map(section=>{
    const list = pages.filter(p=>p.section===section).sort((a,b)=>a.url.split('/').length-b.url.split('/').length || a.title.localeCompare(b.title))
    return '<details '+(active?.section===section?'open':'')+'><summary>'+section+'</summary>'+list.map(p=>link(p.url,p.title,p.url===active?.url?'aria-current="page"':'')).join('')+'</details>'
  }).join('')+'</nav></details>'
}
function list(rows) {
  return '<div class="rows">'+rows.map(p=>'<a class="row" href="'+p.url+'"><div><h3>'+html(p.title)+'</h3><p>'+html(p.desc)+'</p></div><span aria-hidden="true">↗</span></a>').join('')+'</div>'
}
function promptFor(p) {
  const source = base+'/'+p.file
  if (p.section === 'Self-hosting' && p.agentPrompt) return p.agentPrompt+'\n\nRead the official guide at '+source+' first. Tell me what you verified and which steps I still need to do.'
  if (p.section === 'Self-hosting') return [
    'Help me run my own Slatebox with Docker. Read the official installation guide at '+source+'.',
    'Check that Docker is running on the target host, which address people will use to reach Slatebox, and whether a container named slatebox or a volume named slatebox-data already exists. If one exists, keep the volume and follow the upgrade steps in the guide instead of starting over.',
    'Ask whether people should sign in with their company account (Microsoft Entra ID, Okta, Google Workspace, SAML, LDAP or Active Directory). Single sign-on comes with the image: Keycloak is bundled in it and is off by default. If they should, add -e SLATEBOX_SSO=keycloak, and -e SLATEBOX_SSO_ONLY=true only if passwords and guests must be switched off, then follow the single sign-on guide at '+base+'/Installation/single-sign-on.md, including its advice on Trust Email and on closing the admin console with -e SLATEBOX_SSO_ADMIN=closed once sign-in works. Never print the Keycloak admin password or the SCIM secret; tell me the docker exec slatebox slatebox sso command that shows it.',
    'For a new installation, ask whether I use plain Docker or Docker Compose, run the guide\'s docker run command or write its compose.yaml, wait until docker ps reports the container as healthy, and give me the address to open. Add only the settings from the guide that my answers call for.',
    'Then show me how to confirm that a slate survives a reload and that a second browser sees my edits as I make them. With single sign-on on, also give me the admin console address from docker exec slatebox slatebox sso. Report which checks actually ran and what still needs my input.'
  ].join('\n\n')
  const task = {
    Examples: 'Help me try the Slatebox example “'+p.title+'”. Use the linked example and guide to reproduce its main interaction. Show me the resulting slate or observable behavior.',
    'HTTP API': 'Help me use the documented Slatebox HTTP API for “'+p.title+'”. Use the documented method, path and permissions. Show the request with credential placeholders and verify the response on my chosen slate.',
    SlateboxJS: 'Help me implement “'+p.title+'” with SlateboxJS in my project. Use the documented library interfaces and provide a runnable example that verifies the result.',
    'Using Slatebox': 'Help me complete my task in Slatebox using the official app guide. Ask which outcome I want, then walk me through the relevant steps and verify it on my slate.'
  }
  return (p.agentPrompt || task[p.section])+'\n\nRead '+source+' first. Ask for the inputs you need. Tell me what you verified and which steps I still need to do.'
}
function copyablePrompt(prompt, source) {
  return prompt+'\n\nIf your client cannot fetch the documentation, read the same published file at '+publishedFiles+source+'.'
}
function agentTools(prompt, source, sourceLabel='Read Markdown') {
  const copyText = copyablePrompt(prompt, source)
  return '<section class="agent-tools" id="agent-prompt" aria-label="Use this guide with an agent"><div><button type="button" data-copy-agent hidden>Copy agent prompt</button>'+link(source,sourceLabel)+'</div><details><summary>View agent prompt</summary><pre tabindex="0" data-agent-prompt>'+html(copyText)+'</pre></details><span class="agent-status" role="status"></span></section>'
}
// schema.org JSON-LD: every page names its place (BreadcrumbList) and is a TechArticle of the docs site; a page with a
// "## Questions" section of "### Question?" headings is also a FAQPage of exactly those questions and answers.
const ld = value => '<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@graph':value}).replace(/</g,'\\u003c')+'</script>'
const docsSite = {'@type':'WebSite','@id':base+'/#website',name:'Slatebox documentation',url:base+'/',publisher:{'@type':'Organization','@id':'https://slatebox.com/#organization',name:'Slatebox',url:'https://slatebox.com/'}}
const plainText = s => String(s).replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/[`*]/g,'').replace(/\s+/g,' ').trim()
export function faqOf(body) {
  const block = body.split(/^## /m).find(part => /^Questions\s*\n/.test(part))
  if (!block) return []
  return block.split(/^### /m).slice(1).map(part => { const [q, ...rest] = part.split('\n'); return [plainText(q), plainText(rest.join(' '))] }).filter(([q, a]) => q.endsWith('?') && a)
}
function structured(p, title, desc, url) {
  if (!p) return ld([docsSite, {'@type':'SoftwareApplication','@id':'https://slatebox.com/#app',name:'Slatebox',url:'https://slatebox.com/',applicationCategory:'BusinessApplication',operatingSystem:'Web',isAccessibleForFree:true,license:'https://opensource.org/licenses/MIT',offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}}])
  const trail = [['Docs','/'], ...(p.section==='Examples' ? [['Examples','/examples/']] : []), [title, url]]
  const items = [docsSite, {'@type':'BreadcrumbList',itemListElement:trail.map(([name,u],i)=>({'@type':'ListItem',position:i+1,name,item:base+u}))},
    {'@type':'TechArticle',headline:title,description:desc,url:base+url,inLanguage:'en',isPartOf:{'@id':base+'/#website'},publisher:{'@id':'https://slatebox.com/#organization'}}]
  const faq = faqOf(p.body)
  if (faq.length >= 2) items.push({'@type':'FAQPage',mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))})
  return ld(items)
}
function layout(title,desc,url,main,hasCanvas = false, source, page) {
  const engineStyle = hasCanvas ? '<link rel="stylesheet" href="https://slatebox.com/assets/engine/slateboxjs.css">' : ''
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html(title)+' · Slatebox Docs</title><meta name="description" content="'+html(desc)+'"><link rel="canonical" href="'+base+url+'"><link rel="icon" href="/assets/slatebox.svg">'+(source?'<link rel="alternate" type="text/markdown" href="'+html(base+source)+'">':'')+engineStyle+'<link rel="stylesheet" href="/assets/docs.css"><script defer src="/assets/docs.js"></script>'+(url==='/404.html'?'':structured(page,title,desc,url))+'</head><body><a class="skip" href="#content">Skip to content</a><header class="mast"><a class="brand" href="/"><img src="/assets/slatebox.svg" alt="" width="31" height="31">Slatebox <small>Docs</small></a><nav aria-label="Main"><a href="/examples/">Examples</a><button data-search>Search <kbd>/</kbd></button><a class="app" href="https://app.slatebox.com/new">Open app ↗</a></nav></header><main id="content">'+main+'</main><footer class="foot"><a href="https://slatebox.com">Slatebox</a><a href="/examples/">Examples</a><a href="https://slatebox.com/developers/">Developer tools ↗</a><a href="/llms.txt">Agent index</a></footer><dialog id="search"><div><label for="query">Search the documentation</label><button data-close>Close</button></div><input type="search" id="query" placeholder="Try canvas, sound or API"><ul id="results"></ul></dialog></body></html>'
}
async function write(url, content) {
  const dir=path.join(out,url); await mkdir(dir,{recursive:true}); await writeFile(path.join(dir,'index.html'),content)
}
// A fenced block's info string is "language Label words". The label names the tab in a
// language picker; without one, the language picks a default name.
const codeLabels = {js:'JavaScript', mjs:'JavaScript', javascript:'JavaScript', ts:'TypeScript', typescript:'TypeScript', jsx:'JSX', tsx:'TSX', sh:'Shell', bash:'Shell', shell:'Shell', python:'Python', py:'Python', json:'JSON', html:'HTML', css:'CSS', text:'Text', yaml:'YAML', yml:'YAML'}
function codeLabel(language, label) { return label || codeLabels[language.toLowerCase()] || language || 'Text' }
function render(p) {
  const headings=[], slugger=new GithubSlugger()
  const parser=new Marked({renderer:{
    code({text,lang}) {
      const [language='', ...rest] = String(lang ?? '').trim().split(/\s+/)
      const label = codeLabel(language, rest.join(' '))
      return '<div class="code" data-label="'+html(label)+'"><div class="code-label">'+html(label)+'</div><pre><code'+(language?' class="language-'+html(language)+'"':'')+'>'+html(text)+'</code></pre></div>'
    },
    html({text}) {
      const t = text.trim()
      if (t === '<!-- tabs -->') return '<div class="code-tabs" data-tabs>'
      if (t === '<!-- /tabs -->') return '</div>'
      return text
    },
    heading({tokens,depth,text}) { const id=slugger.slug(text.replace(/<[^>]+>/g,'')); if(depth===2)headings.push({id,text}); return '<h'+depth+' id="'+html(id)+'">'+this.parser.parseInline(tokens)+'</h'+depth+'>' },
    link({href,tokens}) {
      let target=href
      if (!/^[a-z]+:|^#/i.test(href)) {
        const [pathname,anchor]=href.split('#')
        if (pathname.endsWith('.md')) target=urlFor(path.posix.normalize(path.posix.join(path.dirname(p.file),pathname)))+(anchor?'#'+anchor:'')
      }
      return '<a href="'+html(target)+'">'+this.parser.parseInline(tokens)+'</a>'
    }
  }})
  let body=parser.parse(p.body)
  const oldTitle = legacy[p.url]?.[0]
  const titleId = oldTitle && !body.includes('id="'+html(oldTitle)+'"') ? ' id="'+html(oldTitle)+'"' : ''
  const aliases = (legacy[p.url] || []).filter(id=>id !== oldTitle && !body.includes('id="'+html(id)+'"'))
  if (aliases.length) {
    const section = p.url === '/developers/javascriptlibrary/' ? 'quick-slate' : 'v1organization-endpoint'
    const anchors = aliases.map(id=>'<span id="'+html(id)+'" aria-hidden="true"></span>').join('')
    const marker = '<h2 id="'+section+'"'
    body = body.includes(marker) ? body.replace(marker, anchors+marker) : anchors+body
  }
  return '<div class="manual">'+sidebar(p)+'<article><div class="crumb">'+link('/','Docs')+' / '+(p.section==='Examples'?link('/examples/','Examples'):html(p.section))+'</div><h1'+titleId+'>'+html(p.title)+'</h1>'+agentTools(promptFor(p),'/'+p.file)+(p.section==='Examples' && p.desc?'<p class="intro">'+html(p.desc)+'</p>':'')+embed(p.demo)+'<div class="prose">'+body+'</div></article><nav class="on-page" aria-label="On this page">'+'<strong>On this page</strong>'+link('#agent-prompt','Agent prompt')+headings.map(h=>link('#'+h.id,h.text)).join('')+'</nav></div>'
}
await rm(out,{recursive:true,force:true}); await mkdir(out,{recursive:true}); await cp('assets',path.join(out,'assets'),{recursive:true})
for (const p of pages) {
  await write(p.url,layout(p.title,p.desc,p.url,render(p),p.demo === 'canvas','/'+p.file,p))
  const markdown = path.join(out,p.file)
  await mkdir(path.dirname(markdown),{recursive:true})
  const prompt = copyablePrompt(promptFor(p), '/'+p.file)
  await writeFile(markdown, ['# '+p.title, '## Agent prompt', '```text\n'+prompt+'\n```', p.body.trimStart()].join('\n\n'))
}
const positioning = 'Slatebox is the free, open-source (MIT) visual intelligence platform for your team and agents. Invite any agent through MCP to work with you and your team on one live canvas: mind maps, flowcharts, diagrams, Gantt project plans, smart boards that keep rules, and presentations that compose themselves, edited live together. Run it on Slatebox Cloud or on your own server.'
const agentIndex = ['# Slatebox documentation', '', '> '+positioning, '', 'Official guides for using the app, building with SlateboxJS, calling the HTTP API, and self-hosting.', '',
  'Start here: [Use Slatebox from your agent]('+base+'/Using-Slatebox/use-from-your-agent.md) · [GitHub mirror]('+publishedFiles+'/Using-Slatebox/use-from-your-agent.md)', '', 'Each guide has a GitHub mirror for command-line clients. You can also read [this index on GitHub]('+publishedFiles+'/llms.txt).', '']
agentIndex.push('[OpenAPI schema](https://app.slatebox.com/api/v1/openapi.json)', '',
  'For a self-hosted instance, read /api/v1/openapi.json on that instance to discover the operations it supports.', '')
// Agents read this first: the hosted MCP address, then how exec and the typed tools relate.
agentIndex.push('## Agents / MCP', '',
  '- Hosted MCP server: https://app.slatebox.com/mcp (Streamable HTTP). Sign in with OAuth when the client connects, or send a personal token as a bearer token. A self-hosted Slatebox serves the same endpoint at /mcp on its origin.',
  '- Tools: exec, always listed, runs a short JavaScript or TypeScript script against the typed Slatebox client; describe returns its methods and types. Beside them, one typed tool per client method (create_slate, import_mermaid, get_slate, edit_slate, export_mermaid and more), generated from the same contract; each is an exec script of one call, with the same checks.',
  '- [Connect an assistant: Agents and MCP]('+base+'/Developers/SlateboxAPI/mcp.md) · [GitHub mirror]('+publishedFiles+'/Developers/SlateboxAPI/mcp.md)',
  '- [Exec: how agents work with Slatebox]('+base+'/Developers/SlateboxAPI/exec.md) · [GitHub mirror]('+publishedFiles+'/Developers/SlateboxAPI/exec.md)',
  '- Local server and CLI: the slatebox-mcp package. [Install it]('+base+'/Developers/SlateboxAPI/terminal-and-agents.md) · [GitHub mirror]('+publishedFiles+'/Developers/SlateboxAPI/terminal-and-agents.md)', '')
// Slatebox is free: what Slatebox Cloud sells (Slatebox Pro, Slatebox Business, top-ups) is listed last, under its own
// heading, so "Using Slatebox" reads as what everyone gets.
const paid = new Set(['Using-Slatebox/pricing.md','Using-Slatebox/slatebox-pro.md','Using-Slatebox/slatebox-business.md','Using-Slatebox/top-ups.md'])
const entry = p => '- ['+p.title+']('+base+'/'+p.file+') · [GitHub mirror]('+publishedFiles+'/'+p.file+')'
for (const section of sections) {
  agentIndex.push('## '+section,'',...pages.filter(p=>p.section===section && !paid.has(p.file)).sort((a,b)=>a.title.localeCompare(b.title)).map(entry),'')
}
agentIndex.push('## Paying for AI and calls on Slatebox Cloud', '', 'Everything above is free. On Slatebox Cloud, AI drafts and calls you start come with Slatebox Pro, or from a balance; a team can choose Slatebox Business. Current prices are on https://slatebox.com/plans/ only.', '',
  ...pages.filter(p=>paid.has(p.file)).sort((a,b)=>a.title.localeCompare(b.title)).map(entry), '')
agentIndex.push('## Optional', '', '- [Every guide in full, in one file]('+base+'/llms-full.txt)', '- [slatebox.com for agents](https://slatebox.com/llms.txt)', '')
await writeFile(path.join(out,'llms.txt'),agentIndex.join('\n'))
// llms-full.txt: every published guide's Markdown, in the order of the index, after the same introduction.
const ordered = [...sections.flatMap(section => pages.filter(p=>p.section===section && !paid.has(p.file)).sort((a,b)=>a.title.localeCompare(b.title))), ...pages.filter(p=>paid.has(p.file)).sort((a,b)=>a.title.localeCompare(b.title))]
await writeFile(path.join(out,'llms-full.txt'),['# Slatebox documentation, in full','','> '+positioning,'','Every published guide of '+base+', one section per guide. The index is '+base+'/llms.txt.',''].concat(ordered.flatMap(p=>['---','','# '+p.title,'','Source: '+base+'/'+p.file+' · Page: '+base+p.url,'',p.body.trim(),''])).join('\n'))
const browsePrompt = 'Read the official Slatebox documentation index at '+base+'/llms.txt. Ask me what I want to build or operate, pick the matching guide, and use its documented steps to verify the result.'

const outagePreview = '<figure class="outage-preview"><figcaption><h2>What still works when sign-in goes down?</h2></figcaption><div class="outage-map" role="img" aria-label="New customers are blocked at sign-in. Existing sessions can open saved work. Support sends a status link."><div data-outage-preview inert></div><p data-outage-fallback>New customers need the status link. Customers who are already signed in can open their saved work.</p></div>'+link('/examples/sign-in-outage/','Open the outage whiteboard example →')+'<script type="module" src="/assets/outage-preview.mjs"></script></figure>'
const teamExamples = ['refund-approval','sign-in-outage','startup-experiments','incident-handoff'].map(name => examples.find(p => p.url === '/examples/'+name+'/'))
const home='<section class="hero"><div><p class="eyebrow">Slatebox documentation</p><h1 id="slatebox-documentation">Build with<br> the canvas.</h1><p class="intro">Slatebox is the free, open-source visual intelligence platform for your team and agents. Bring an idea to a slate, connect your agent, or build the canvas into your own app.</p><div class="actions">'+link('/examples/','Explore examples','class="primary"')+link('/using-slatebox/','Start your first slate →')+'</div>'+agentTools(browsePrompt,'/llms.txt','Read agent index')+'</div>'+outagePreview+'</section><section class="directory"><h2>Find your guide</h2>'+list(entries)+'</section><section class="directory tinted"><div><h2>Canvas examples</h2>'+link('/examples/','Browse all examples →')+'</div>'+list(teamExamples)+'</section>'
await write('/',layout('Slatebox documentation','Guides and runnable examples for Slatebox, the free, open-source canvas for your team and agents: the app, MCP for agents, the API and the self-hosted app.','/',home,true))
await write('/examples/',layout('Canvas examples','Hands-on guides for using Slatebox and building with SlateboxJS.','/examples/','<section class="examples"><div class="crumb">'+link('/','Docs')+' / Examples</div><h1>Canvas examples.</h1><p class="intro">Try a working example, then follow the steps in the app or build it with SlateboxJS.</p>'+agentTools('Read '+base+'/llms.txt. Ask what my team wants to do, choose a runnable example and help me try it on my own slate.','/llms.txt','Read agent index')+['Interactions','Canvas','Integrations'].map(group=>'<section class="recipe-group"><h2>'+group+'</h2>'+list(examples.filter(p=>p.group===group))+'</section>').join('')+'</section>'))
await writeFile(path.join(out,'search.json'),JSON.stringify([...pages.map(({url,title,desc,section,terms})=>({url,title,desc,section,terms})),{title:'Canvas examples',url:'/examples/',section:'Examples',desc:'Browse runnable examples.'}]))
// A removed page keeps its address: a small page with a canonical link and a meta refresh to the
// page that now answers (scripts/redirects.json). Not in the sitemap or search.
// A page held by a switch (whileHeld in its front matter) redirects the same way while it is held.
const redirects = JSON.parse(await readFile('scripts/redirects.json','utf8'))
for (const [from,to] of held) {
  if (redirects[from]) throw Error('scripts/redirects.json: '+from+' is a held page with its own whileHeld')
  redirects[from] = to
}
for (const [from,to] of Object.entries(redirects)) {
  if (pages.some(p=>p.url===from)) throw Error('scripts/redirects.json: '+from+' is still a page')
  const target = pages.find(p=>p.url===to.split('#')[0])
  if (!target) throw Error('scripts/redirects.json: '+to+' is not a page')
  await write(from,'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>'+html(target.title)+' · Slatebox Docs</title><link rel="canonical" href="'+html(base+target.url)+'"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url='+html(to)+'"></head><body><h1>'+html(target.title)+'</h1><p><a href="'+html(to)+'">Open '+html(target.title)+'</a></p></body></html>')
}
await writeFile(path.join(out,'404.html'),layout('Page not found','','/404.html','<section class="examples"><h1>Page not found.</h1><p>'+link('/','Browse the documentation')+' or '+link('/examples/','try an example')+'.</p></section>'))
await writeFile(path.join(out,'CNAME'),'docs.slatebox.com\n')
await writeFile(path.join(out,'.nojekyll'),'')
const urls=['/','/examples/',...pages.map(p=>p.url)]
await writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(u=>'<url><loc>'+base+u+'</loc></url>').join('')+'</urlset>')
await writeFile(path.join(out,'sitemap.xml.gz'),gzipSync(await readFile(path.join(out,'sitemap.xml'))))
// Every page is public; answer engines and AI crawlers are welcome by name (owner, 2026-11-24).
const crawlers = ['GPTBot','OAI-SearchBot','ChatGPT-User','ClaudeBot','Claude-User','Claude-SearchBot','anthropic-ai','PerplexityBot','Perplexity-User','Google-Extended','Googlebot','Bingbot','Applebot','Applebot-Extended','CCBot','meta-externalagent','meta-externalfetcher','FacebookBot','Amazonbot','DuckAssistBot','MistralAI-User','cohere-ai','YouBot','Bytespider']
await writeFile(path.join(out,'robots.txt'),['# docs.slatebox.com: every page is public; agents and AI crawlers are welcome. Agent index: '+base+'/llms.txt','','User-agent: *','Content-Signal: search=yes, ai-input=yes, ai-train=yes','Allow: /','',...crawlers.map(c=>'User-agent: '+c),'Allow: /','','Sitemap: '+base+'/sitemap.xml',''].join('\n'))
console.log('Built '+urls.length+' documentation pages and '+examples.length+' examples.')
