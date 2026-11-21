const dialog = document.querySelector('#search')
const query = document.querySelector('#query')
const results = document.querySelector('#results')
let index
function showResults() {
  const words = query.value.toLowerCase().trim().split(/\s+/)
  const items = index.filter(item => words.every(word => [item.title,item.section,item.desc,item.terms].join(' ').toLowerCase().includes(word)))
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
for (const panel of document.querySelectorAll('.agent-tools')) {
  const button = panel.querySelector('[data-copy-agent]')
  const prompt = panel.querySelector('[data-agent-prompt]')
  const status = panel.querySelector('[role="status"]')
  button.hidden = false
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(prompt.textContent)
      status.textContent = 'Prompt copied.'
    } catch {
      panel.querySelector('details').open = true
      prompt.focus()
      const range = document.createRange()
      range.selectNodeContents(prompt)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      status.textContent = 'Prompt selected. Use your device’s Copy command.'
    }
  })
}

// Language picker: one choice for every example on every page. The first tab (Node.js) is the
// default until a reader picks another; the pick is kept in this browser and synced across tabs.
const LANG_KEY = 'slatebox-docs-lang'
function storedLang() { try { return localStorage.getItem(LANG_KEY) } catch { return null } }
function showLang(group, label) {
  const panels = [...group.querySelectorAll(':scope > .code')]
  const pick = panels.find(p => p.dataset.label === label) || panels[0]
  for (const panel of panels) panel.hidden = panel !== pick
  for (const tab of group.querySelectorAll(':scope > [role=tablist] > button')) {
    const on = tab.dataset.label === pick.dataset.label
    tab.setAttribute('aria-selected', String(on))
    tab.tabIndex = on ? 0 : -1
  }
}
function pickLang(label) {
  try { localStorage.setItem(LANG_KEY, label) } catch {}
  for (const group of document.querySelectorAll('[data-tabs]')) showLang(group, label)
}
for (const group of document.querySelectorAll('[data-tabs]')) {
  const panels = [...group.querySelectorAll(':scope > .code')]
  if (panels.length < 2) continue
  const list = document.createElement('div')
  list.setAttribute('role', 'tablist')
  list.setAttribute('aria-label', 'Language')
  for (const panel of panels) {
    const tab = document.createElement('button')
    tab.type = 'button'
    tab.setAttribute('role', 'tab')
    tab.dataset.label = panel.dataset.label
    tab.textContent = panel.dataset.label
    tab.onclick = () => pickLang(panel.dataset.label)
    tab.onkeydown = e => {
      const tabs = [...list.children], i = tabs.indexOf(tab)
      const next = e.key === 'ArrowRight' ? tabs[(i+1) % tabs.length] : e.key === 'ArrowLeft' ? tabs[(i-1+tabs.length) % tabs.length] : null
      if (next) { e.preventDefault(); pickLang(next.dataset.label); next.focus() }
    }
    list.append(tab)
  }
  group.prepend(list)
  group.classList.add('ready')
  showLang(group, storedLang())
}
addEventListener('storage', e => { if (e.key === LANG_KEY && e.newValue) for (const group of document.querySelectorAll('[data-tabs].ready')) showLang(group, e.newValue) })
