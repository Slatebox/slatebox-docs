import {readFile, readdir, stat} from 'node:fs/promises'
import {join, dirname} from 'node:path'
import {marked} from 'marked'
import './check-museum.mjs'
import './check-theatre.mjs'
import './check-recording-workshop.mjs'
const root='dist'
async function walk(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(entry=>entry.isDirectory()?walk(join(dir,entry.name)):join(dir,entry.name)))).flat()}
const files=(await walk(root)).filter(f=>f.endsWith('.html')), errors=[]
const guideIndex=await readFile(join(root,'llms.txt'),'utf8')
const guideLinks=new Set([...guideIndex.matchAll(/\]\((https:\/\/docs\.slatebox\.com\/[^)]+\.md)\)/g)].map(match=>match[1]))
const publishedGuides = new Set(guideLinks)
for(const file of files){
  const doc=await readFile(file,'utf8')
  const source=new URL(file.slice(root.length).replace(/index\.html$/,''),'https://docs.slatebox.com')
  const markdown=doc.match(/<link rel="alternate" type="text\/markdown" href="([^"]+)">/)?.[1]
  if(markdown) {
    if(!guideLinks.delete(markdown)) errors.push(file+' missing or duplicate agent index entry')
    const prompt=doc.match(/<pre[^>]*data-agent-prompt[^>]*>([\s\S]*?)<\/pre>/)?.[1]
    const mirror='https://raw.githubusercontent.com/Slatebox/slatebox-docs/retype'+new URL(markdown).pathname
    if(!guideIndex.includes(']('+mirror+')')) errors.push(file+' missing direct Markdown mirror in agent index')
    if(!prompt?.includes(markdown) || !prompt.includes(mirror) || !doc.includes('data-copy-agent')) errors.push(file+' missing copyable guide prompt')
    const raw=await readFile(join(root,new URL(markdown).pathname),'utf8')
    marked.walkTokens(marked.lexer(raw), token => {
      if (token.type !== 'link') return
      const url = new URL(token.href, markdown)
      if (url.origin === source.origin && url.pathname.endsWith('.md') && !publishedGuides.has(url.origin + url.pathname)) {
        errors.push(markdown + ' links to an unpublished Markdown path ' + url.pathname)
      }
    })
    if(!raw.startsWith('# ')) errors.push(file+' missing Markdown title')
    const rawPrompt=raw.match(/^## Agent prompt\n\n```text\n([\s\S]*?)\n```/m)?.[1]
    const escaped=rawPrompt?.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;")
    if(!rawPrompt || escaped!==prompt) errors.push(file+' HTML and Markdown agent prompts differ')
  }
  if(!doc.includes('<h1'))errors.push(file+' missing title')
  for(const match of doc.matchAll(/(?:href|src)="([^"]+)"/g)){
    const link=new URL(match[1].replaceAll('&amp;','&'),source)
    if(link.origin!==source.origin)continue
    let target=join(root,link.pathname)
    try{if((await stat(target)).isDirectory())target=join(target,'index.html');await stat(target)}
    catch{errors.push(file+' links to missing '+link.pathname);continue}
    if(link.hash&&target.endsWith('.html')){
      const id=decodeURIComponent(link.hash.slice(1))
      if(!(await readFile(target,'utf8')).includes('id="'+id+'"'))errors.push(file+' missing target '+link.pathname+link.hash)
    }
  }
}
if(guideLinks.size) errors.push('Agent index points to missing pages: '+[...guideLinks].join(', '))
const legacy=JSON.parse(await readFile('scripts/legacy-routes.json','utf8'))
for (const [url, ids] of Object.entries(legacy)){
  const doc=await readFile(join(root,url,'index.html'),'utf8')
  for(const id of ids) if(!doc.includes('id="'+id+'"')) errors.push('Lost legacy anchor '+url+'#'+id)
}
if(errors.length)throw Error([...new Set(errors)].join('\n'))
console.log(files.length+' HTML files passed internal link and anchor checks.')
