import {readFile, readdir, stat} from 'node:fs/promises'
import {join, dirname} from 'node:path'
import './check-museum.mjs'
import './check-theatre.mjs'
const root='dist'
async function walk(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(entry=>entry.isDirectory()?walk(join(dir,entry.name)):join(dir,entry.name)))).flat()}
const files=(await walk(root)).filter(f=>f.endsWith('.html')), errors=[]
for(const file of files){
  const doc=await readFile(file,'utf8')
  const source=new URL(file.slice(root.length).replace(/index\.html$/,''),'https://docs.slatebox.com')
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
const legacy=JSON.parse(await readFile('scripts/legacy-routes.json','utf8'))
for (const [url, ids] of Object.entries(legacy)){
  const doc=await readFile(join(root,url,'index.html'),'utf8')
  for(const id of ids) if(!doc.includes('id="'+id+'"')) errors.push('Lost legacy anchor '+url+'#'+id)
}
if(errors.length)throw Error([...new Set(errors)].join('\n'))
console.log(files.length+' HTML files passed internal link and anchor checks.')
