import {cp, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {Marked} from 'marked'
import {museumExample} from './museum-example.mjs'
import {gzipSync} from 'node:zlib'
import {execFileSync} from 'node:child_process'
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
const pages = []
for (const file of files) {
  const raw = await readFile(file, 'utf8')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  const meta = match ? yaml(match[1]) : {}
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
  {url:'/using-slatebox/', title:'Use the app',desc:'Create a private slate, invite a teammate and present your work.'},
  {url:'/developers/javascriptlibrary/', title:'Build with SlateboxJS',desc:'Draw a node, connect two ideas and save the canvas as JSON.'},
  {url:'/developers/slateboxapi/', title:'Connect your application',desc:'Read a slate and preview a change with a scoped API token.'},
  {url:'/developers/slateboxapi/exec/', title:'Give your agent exec',desc:'One tool runs a short script against a typed client. Every call is checked as if you made it.'},
  {url:'/installation/install-with-docker/', title:'Host Slatebox',desc:'Bring up the app and collaboration services with Docker.'}
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
  if (p.section === 'Self-hosting') return [
    'Help me install the current self-hosted Slatebox on my Docker host. Read the official installation guide at '+source+'.',
    'Check the target host, Docker server architecture, Engine and Compose versions, and whether an existing Slatebox instance or data volume is present. If an instance exists, identify its version and use the documented upgrade or recovery path before changing it.',
    'For a new install, read the current kit record at '+base+'/assets/self-host/release.json or its mirror at '+publishedFiles+'/assets/self-host/release.json. Match my Linux architecture under platforms, and tell me the release ID, filename and SHA-256. Keep that release ID so we can verify the same kit even if a newer one appears. If I need the kit, give me the request link from the guide. Keep the initial trial on loopback unless I ask for team hostnames and HTTPS.',
    'Once I have the kit, verify its byte count and SHA-256 against the record, start the matched app, collaboration relay and database using the guide, and check readiness. Give me the working URL and show me how to confirm a private board survives reopening and an invited teammate can edit it. Report which checks actually ran and what still needs my input.'
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
function layout(title,desc,url,main,hasCanvas = false, source) {
  const engineStyle = hasCanvas ? '<link rel="stylesheet" href="https://slatebox.com/assets/engine/slateboxjs.css">' : ''
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html(title)+' · Slatebox Docs</title><meta name="description" content="'+html(desc)+'"><link rel="canonical" href="'+base+url+'"><link rel="icon" href="/assets/slatebox.svg">'+(source?'<link rel="alternate" type="text/markdown" href="'+html(base+source)+'">':'')+engineStyle+'<link rel="stylesheet" href="/assets/docs.css"><script defer src="/assets/docs.js"></script></head><body><a class="skip" href="#content">Skip to content</a><header class="mast"><a class="brand" href="/"><img src="/assets/slatebox.svg" alt="" width="31" height="31">Slatebox <small>Docs</small></a><nav aria-label="Main"><a href="/examples/">Examples</a><button data-search>Search <kbd>/</kbd></button><a class="app" href="https://app.slatebox.com/new">Open app ↗</a></nav></header><main id="content">'+main+'</main><footer class="foot"><a href="https://slatebox.com">Slatebox</a><a href="/examples/">Examples</a><a href="https://slatebox.com/developers/">Developer tools ↗</a><a href="/llms.txt">Agent index</a></footer><dialog id="search"><div><label for="query">Search the documentation</label><button data-close>Close</button></div><input type="search" id="query" placeholder="Try canvas, sound or API"><ul id="results"></ul></dialog></body></html>'
}
async function write(url, content) {
  const dir=path.join(out,url); await mkdir(dir,{recursive:true}); await writeFile(path.join(dir,'index.html'),content)
}
function render(p) {
  const headings=[], slugger=new GithubSlugger()
  const parser=new Marked({renderer:{
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
const kitRecords = path.join(out, 'assets/self-host/releases')
const latestKit = (await readdir(kitRecords)).filter(name => /^\d{8}T\d{6}Z\.json$/.test(name)).sort().at(-1)
if (!latestKit) throw new Error('The install guide needs a verified kit record.')
await cp(path.join(kitRecords, latestKit), path.join(out, 'assets/self-host/release.json'))
execFileSync('python3',['scripts/bundle-release-tools.py',path.join(out,'assets/self-host')])
for (const p of pages) {
  await write(p.url,layout(p.title,p.desc,p.url,render(p),p.demo === 'canvas','/'+p.file))
  const markdown = path.join(out,p.file)
  await mkdir(path.dirname(markdown),{recursive:true})
  const prompt = copyablePrompt(promptFor(p), '/'+p.file)
  await writeFile(markdown, ['# '+p.title, '## Agent prompt', '```text\n'+prompt+'\n```', p.body.trimStart()].join('\n\n'))
}
const agentIndex = ['# Slatebox documentation', '', 'Official guides for using the app, building with SlateboxJS, calling the HTTP API, and self-hosting.', '', 'Each guide has a GitHub mirror for command-line clients. You can also read [this index on GitHub]('+publishedFiles+'/llms.txt).', '']
agentIndex.push('[Hosted OpenAPI schema](https://api.slatebox.com/v1/openapi.json)', '',
  'For a self-hosted instance, read /api/v1/openapi.json on that instance to discover the operations it supports.', '',
  '[Current self-host release record]('+base+'/assets/self-host/release.json) · [GitHub mirror]('+publishedFiles+'/assets/self-host/release.json)', '')
for (const section of sections) {
  agentIndex.push('## '+section,'',...pages.filter(p=>p.section===section).sort((a,b)=>a.title.localeCompare(b.title)).map(p=>'- ['+p.title+']('+base+'/'+p.file+') · [GitHub mirror]('+publishedFiles+'/'+p.file+')'),'')
}
await writeFile(path.join(out,'llms.txt'),agentIndex.join('\n'))
const browsePrompt = 'Read the official Slatebox documentation index at '+base+'/llms.txt. Ask me what I want to build or operate, pick the matching guide, and use its documented steps to verify the result.'

const outagePreview = '<figure class="outage-preview"><figcaption><h2>What still works when sign-in goes down?</h2></figcaption><div class="outage-map" role="img" aria-label="New customers are blocked at sign-in. Existing sessions can open saved work. Support sends a status link."><div data-outage-preview inert></div><p data-outage-fallback>New customers need the status link. Customers who are already signed in can open their saved work.</p></div>'+link('/examples/sign-in-outage/','Open the outage whiteboard example →')+'<script type="module" src="/assets/outage-preview.mjs"></script></figure>'
const teamExamples = ['refund-approval','sign-in-outage','startup-experiments','incident-handoff'].map(name => examples.find(p => p.url === '/examples/'+name+'/'))
const home='<section class="hero"><div><p class="eyebrow">Slatebox documentation</p><h1 id="slatebox-documentation">Build with<br> the canvas.</h1><p class="intro">Bring an idea to a slate. Add a note, wire up an interaction, or build the canvas into your own app.</p><div class="actions">'+link('/examples/','Explore examples','class="primary"')+link('/using-slatebox/','Start your first slate →')+'</div>'+agentTools(browsePrompt,'/llms.txt','Read agent index')+'</div>'+outagePreview+'</section><section class="directory"><h2>Find your guide</h2>'+list(entries)+'</section><section class="directory tinted"><div><h2>Canvas examples</h2>'+link('/examples/','Browse all examples →')+'</div>'+list(teamExamples)+'</section>'
await write('/',layout('Slatebox documentation','Guides and runnable examples for the Slatebox canvas, API and self-hosted app.','/',home,true))
await write('/examples/',layout('Canvas examples','Hands-on guides for using Slatebox and building with SlateboxJS.','/examples/','<section class="examples"><div class="crumb">'+link('/','Docs')+' / Examples</div><h1>Canvas examples.</h1><p class="intro">Try a working example, then follow the steps in the app or build it with SlateboxJS.</p>'+agentTools('Read '+base+'/llms.txt. Ask what my team wants to do, choose a runnable example and help me try it on my own slate.','/llms.txt','Read agent index')+['Interactions','Canvas','Integrations'].map(group=>'<section class="recipe-group"><h2>'+group+'</h2>'+list(examples.filter(p=>p.group===group))+'</section>').join('')+'</section>'))
await writeFile(path.join(out,'search.json'),JSON.stringify([...pages.map(({url,title,desc,section,terms})=>({url,title,desc,section,terms})),{title:'Canvas examples',url:'/examples/',section:'Examples',desc:'Browse runnable examples.'}]))
await writeFile(path.join(out,'404.html'),layout('Page not found','','/404.html','<section class="examples"><h1>Page not found.</h1><p>'+link('/','Browse the documentation')+' or '+link('/examples/','try an example')+'.</p></section>'))
await writeFile(path.join(out,'CNAME'),'docs.slatebox.com\n')
await writeFile(path.join(out,'.nojekyll'),'')
const urls=['/','/examples/',...pages.map(p=>p.url)]
await writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(u=>'<url><loc>'+base+u+'</loc></url>').join('')+'</urlset>')
await writeFile(path.join(out,'sitemap.xml.gz'),gzipSync(await readFile(path.join(out,'sitemap.xml'))))
await writeFile(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+base+'/sitemap.xml\n')
console.log('Built '+urls.length+' documentation pages and '+examples.length+' examples.')
