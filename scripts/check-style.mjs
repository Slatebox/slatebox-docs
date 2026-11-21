// Docs style gate (see STYLE.md).
//   node scripts/check-style.mjs           hard rules only (tab order, registry, banned names)
//   node scripts/check-style.mjs --strict  also: every example in a picker, no old-version wording
import {readFile, readdir} from 'node:fs/promises'
import {join} from 'node:path'
const strict = process.argv.includes('--strict')
async function walk(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(join(dir,e.name)):join(dir,e.name)))).flat()}
const files=(await Promise.all(['Using-Slatebox','Examples','Developers','Installation'].map(walk))).flat().filter(f=>f.endsWith('.md'))
const errors=[], warnings=[]
const ORDER=['Node.js','JavaScript','TypeScript','React','React + TypeScript','Python','curl','CLI','Docker','Docker Compose']
const banned=[[/timheckel\//i,'Docker Hub image name: use ghcr.io/slatebox/*'],[/docker ?hub|hub\.docker\.com|docker\.io\//i,'Docker Hub: images live at ghcr.io/slatebox/*']]
const oldWords=/\b(older|legacy|deprecated|previously|no longer|formerly|used to|retired|historical|predates|earlier (release|kit|version)s?|[0-9]\.x\b|migrat(e|ion) from|backward|compatibility)\b/i
for (const file of files) {
  const text=await readFile(file,'utf8')
  for (const [re,why] of banned) if (re.test(text)) errors.push(file+': '+why)
  const lines=text.split('\n'); let inTabs=false, inFence=false, fenceIndent='', group=[], startLine=0
  lines.forEach((line,i)=>{
    const fence=line.match(/^(\s*)(`{3,}|~{3,})(.*)$/)
    if (inFence) { if (fence && fence[1]===fenceIndent && !fence[3].trim()) inFence=false; return }
    if (fence) {
      inFence=true; fenceIndent=fence[1]
      const [lang='',...rest]=fence[3].trim().split(/\s+/), label=rest.join(' ')
      if (inTabs) { if(!label) errors.push(file+':'+(i+1)+': a fence inside a picker needs a label, e.g. ```js Node.js'); group.push(label) }
      else if (strict && lang!=='text' && !(fence[1])) warnings.push(file+':'+(i+1)+': example outside a language picker ('+(lang||'no language')+')')
      return
    }
    if (line.trim()==='<!-- tabs -->') { inTabs=true; group=[]; startLine=i+1 }
    if (line.trim()==='<!-- /tabs -->') {
      inTabs=false
      const known=group.filter(l=>ORDER.includes(l)), sorted=[...known].sort((a,b)=>ORDER.indexOf(a)-ORDER.indexOf(b))
      if (group.includes('Node.js') && group[0]!=='Node.js') errors.push(file+':'+startLine+': Node.js must be the first tab (the default)')
      if (known.join()!==sorted.join()) errors.push(file+':'+startLine+': tab order must be '+ORDER.join(' > ')+'; got '+group.join(' > '))
      if (new Set(group).size!==group.length) errors.push(file+':'+startLine+': duplicate tab label')
    }
    if (strict && oldWords.test(line)) warnings.push(file+':'+(i+1)+': old-version wording: '+line.trim().slice(0,100))
  })
  if (inTabs) errors.push(file+': <!-- tabs --> without <!-- /tabs -->')
}
if (strict && warnings.length) errors.push(...warnings)
if (errors.length) { console.error(errors.join('\n')); process.exit(1) }
console.log(files.length+' Markdown pages passed the style gate'+(strict?' (strict).':'.'))
