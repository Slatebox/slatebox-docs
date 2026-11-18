import {cp, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {Marked} from 'marked'
import {gzipSync} from 'node:zlib'
import GithubSlugger from 'github-slugger'
import {parse as yaml} from 'yaml'
const root = process.cwd()
const out = path.join(root, 'dist')
const base = 'https://docs.slatebox.com'
const html = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const urlFor = file => '/' + file.replace(/(?:^|\/)readme\.md$/i, '/').replace(/\.md$/i,'/').toLowerCase().replace(/^\/+/, '')
async function walk(dir) {
  const entries = await readdir(dir, {withFileTypes:true})
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir,entry.name)) : path.join(dir,entry.name)))).flat()
}
const files = (await Promise.all(['Using-Slatebox','Examples','Developers','Installation'].map(walk))).flat().filter(f=>f.endsWith('.md'))
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
  pages.push({file, url:urlFor(file), title, section, body, desc:meta.description || summary, terms, group:meta.group || section, demo:meta.demo})
}
const examples = pages.filter(p => p.section === 'Examples').sort((a,b)=>a.title.localeCompare(b.title))
const sections = ['Using Slatebox','SlateboxJS','HTTP API','Self-hosting','Examples']
function link(href,label,attrs='') { return '<a href="'+html(href)+'" '+attrs+'>'+html(label)+'</a>' }
const entries = [
  {url:'/using-slatebox/', title:'Use the app',desc:'Create a private slate, invite a teammate and present your work.'},
  {url:'/developers/javascriptlibrary/', title:'Build with SlateboxJS',desc:'Draw a node, connect two ideas and save the canvas as JSON.'},
  {url:'/developers/slateboxapi/', title:'Connect your application',desc:'Read a slate and preview a change with a scoped API token.'},
  {url:'/installation/install-with-docker/', title:'Host Slatebox',desc:'Bring up the app and collaboration services with Docker.'}
]
const demos = {
  listening:['Move the listening horn','workshop-demo?mode=listening'], gallery:['Hang the night sky','workshop-demo?mode=gallery'],
  focus:['Wire a return path','workshop-demo?mode=map&story=access'], handoff:['Review a field note','workshop-demo?mode=map&story=offline'],
  map:['Try a branching route','workshop-demo?mode=map'],presentation:['Present a slate','canvas?mode=present'],
}
function nativeCanvas() {
  return '<section class="canvas-demo" aria-label="Playable sound map"><header><span>Sound map</span><span>SlateboxJS</span></header><div class="drawing" data-drawing></div><div class="canvas-actions"><button type="button" data-add disabled>Add glass chimes</button><button type="button" data-reset disabled>Reset</button><output role="status" data-canvas-status>Loading canvas…</output></div><script type="module" src="/assets/canvas.mjs"></script></section>'
}
function embed(key) {
  if (key==='canvas') return nativeCanvas()
  if (!demos[key]) return ''
  const [label,route]=demos[key], src='https://slatebox.com/assets/product/'+route
  return '<figure class="live-demo"><iframe loading="lazy" src="'+html(src)+'" title="'+html(label)+'" allow="autoplay"></iframe><figcaption>'+link(src,'Open the example in its own window ↗')+'</figcaption></figure>'
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
function layout(title,desc,url,main) {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html(title)+' · Slatebox Docs</title><meta name="description" content="'+html(desc)+'"><link rel="canonical" href="'+base+url+'"><link rel="icon" href="/assets/slatebox.svg"><link rel="stylesheet" href="/assets/docs.css"><script defer src="/assets/docs.js"></script></head><body><a class="skip" href="#content">Skip to content</a><header class="mast"><a class="brand" href="/"><img src="/assets/slatebox.svg" alt="" width="31" height="31">Slatebox <small>Docs</small></a><nav aria-label="Main"><a href="/examples/">Examples</a><button data-search>Search <kbd>/</kbd></button><a class="app" href="https://app.slatebox.com/new">Open app ↗</a></nav></header><main id="content">'+main+'</main><footer class="foot"><a href="https://slatebox.com">Slatebox</a><a href="/examples/">Examples</a><a href="https://slatebox.com/developers/">Developer tools ↗</a></footer><dialog id="search"><div><label for="query">Search the documentation</label><button data-close>Close</button></div><input type="search" id="query" placeholder="Try canvas, sound or API"><ul id="results"></ul></dialog></body></html>'
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
  const body=parser.parse(p.body)
  return '<div class="manual">'+sidebar(p)+'<article><div class="crumb">'+link('/','Docs')+' / '+(p.section==='Examples'?link('/examples/','Examples'):html(p.section))+'</div><h1>'+html(p.title)+'</h1>'+(p.section==='Examples' && p.desc?'<p class="intro">'+html(p.desc)+'</p>':'')+embed(p.demo)+'<div class="prose">'+body+'</div></article><nav class="on-page" aria-label="On this page">'+(headings.length?'<strong>On this page</strong>':'')+headings.map(h=>link('#'+h.id,h.text)).join('')+'</nav></div>'
}
await rm(out,{recursive:true,force:true}); await mkdir(out,{recursive:true}); await cp('assets',path.join(out,'assets'),{recursive:true})
for (const p of pages) await write(p.url,layout(p.title,p.desc,p.url,render(p)))
const home='<section class="hero"><div><p class="eyebrow">Slatebox documentation</p><h1>Build with<br> the canvas.</h1><p class="intro">Bring an idea to a slate. Add a note, wire up an interaction, or build the canvas into your own app.</p><div class="actions">'+link('/examples/','Explore examples','class="primary"')+link('/using-slatebox/','Start your first slate →')+'</div></div>'+nativeCanvas()+'</section><section class="directory"><h2>Find your guide</h2>'+list(entries)+'</section><section class="directory tinted"><div><h2>Canvas examples</h2>'+link('/examples/','Browse all examples →')+'</div>'+list(examples.filter(p=>['listening','focus','gallery','handoff'].includes(p.demo)))+'</section>'
await write('/',layout('Slatebox documentation','Guides and runnable examples for the Slatebox canvas, API and self-hosted app.','/',home))
await write('/examples/',layout('Canvas examples','Work through a canvas interaction and see the code behind it.','/examples/','<section class="examples"><div class="crumb">'+link('/','Docs')+' / Examples</div><h1>Canvas examples.</h1><p class="intro">Try a gesture, see what changes, then use the code in your own project.</p>'+['Interactions','Canvas','Integrations'].map(group=>'<section class="recipe-group"><h2>'+group+'</h2>'+list(examples.filter(p=>p.group===group))+'</section>').join('')+'</section>'))
await writeFile(path.join(out,'search.json'),JSON.stringify([...pages.map(({url,title,desc,section,terms})=>({url,title,desc,section,terms})),{title:'Canvas examples',url:'/examples/',section:'Examples',desc:'Browse runnable examples.'}]))
await writeFile(path.join(out,'404.html'),layout('Page not found','','/404.html','<section class="examples"><h1>Page not found.</h1><p>'+link('/','Browse the documentation')+' or '+link('/examples/','try an example')+'.</p></section>'))
await writeFile(path.join(out,'CNAME'),'docs.slatebox.com\n')
await writeFile(path.join(out,'.nojekyll'),'')
const urls=['/','/examples/',...pages.map(p=>p.url)]
await writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(u=>'<url><loc>'+base+u+'</loc></url>').join('')+'</urlset>')
await writeFile(path.join(out,'sitemap.xml.gz'),gzipSync(await readFile(path.join(out,'sitemap.xml'))))
await writeFile(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+base+'/sitemap.xml\n')
console.log('Built '+urls.length+' documentation pages and '+examples.length+' examples.')
