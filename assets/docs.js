const dialog = document.querySelector('#search')
const query = document.querySelector('#query')
const results = document.querySelector('#results')
let index
function showResults() {
  const words = query.value.toLowerCase().trim().split(/\s+/)
  const items = index.filter(item => words.every(word => [item.title,item.section,item.desc].join(' ').toLowerCase().includes(word)))
  results.replaceChildren(...items.slice(0,18).map(item => {
    const row = document.createElement('li'), a = document.createElement('a')
    a.href = item.url
    a.textContent = item.title+' · '+item.section
    row.append(a)
    return row
  }))
  if (!items.length) results.textContent = 'No matching pages.'
}
async function search() {
  dialog.showModal()
  query.focus()
  try {
    index ||= await fetch('/search.json').then(r=>r.json())
    showResults()
  } catch { results.textContent = 'Search is unavailable. Browse the documentation sections.' }
}
document.querySelector('[data-search]').onclick=search
document.querySelector('[data-close]').onclick=()=>dialog.close()
query.oninput=()=>{if(index)showResults()}
document.addEventListener('keydown',e=>{
  if (e.key==='/' && !dialog.open && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest('input,textarea,[contenteditable]')) {e.preventDefault();search()}
})
const toc=document.querySelector('.toc')
if(toc){const media=matchMedia('(min-width:901px)');const set=()=>{toc.open=media.matches};set();media.addEventListener('change',set)}
for (const pre of document.querySelectorAll('.prose pre')) {
  const button=document.createElement('button')
  button.textContent='Copy'
  button.onclick=async()=>{try{await navigator.clipboard.writeText(pre.querySelector('code').textContent);button.textContent='Copied'}catch{button.textContent='Select code to copy'}}
  pre.append(button)
}
