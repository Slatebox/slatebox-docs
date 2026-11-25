// Search: the box in the header of every page, and /search/ for every result. Both read /search.json (one entry per
// page: title, section, description, headings and code names, and the page's text). A page matches when every word is
// in it; a word in the title counts most. Press / anywhere to jump to the box.
let index
const loadIndex = () => index ||= fetch('/search.json').then(r => { if (!r.ok) throw Error(); return r.json() }).catch(e => { index = null; throw e })
const weights = [['title',8],['terms',4],['desc',3],['section',1],['text',1]]
function find(entries, q, limit = 8) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const scored = []
  for (const entry of entries) {
    let score = 0, every = true
    for (const word of words) {
      let hit = 0
      for (const [field, weight] of weights) if (String(entry[field] ?? '').toLowerCase().includes(word)) hit += weight
      if (!hit) { every = false; break }
      score += hit
    }
    if (every) scored.push([score, entry])
  }
  return scored.sort((a, b) => b[0] - a[0] || a[1].title.localeCompare(b[1].title)).slice(0, limit).map(([, entry]) => entry)
}
function snippet(entry, q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean), text = entry.text || ''
  if (entry.desc && words.some(w => entry.desc.toLowerCase().includes(w))) return entry.desc
  const at = Math.min(...words.map(w => text.toLowerCase().indexOf(w)).filter(i => i >= 0))
  if (!Number.isFinite(at)) return entry.desc || ''
  const from = Math.max(0, at - 60)
  return (from ? '…' : '') + text.slice(from, from + 170).trim() + '…'
}
const make = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n }

const finder = document.querySelector('[data-find]')
if (finder) {
  const input = finder.querySelector('input'), list = finder.querySelector('.find-results')
  let active = -1, items = []
  const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1 }
  const mark = i => {
    active = i
    items.forEach((li, n) => li.setAttribute('aria-selected', String(n === i)))
    if (items[i]) input.setAttribute('aria-activedescendant', items[i].id); else input.removeAttribute('aria-activedescendant')
  }
  async function show() {
    const q = input.value.trim()
    if (!q) return close()
    let entries
    try { entries = await loadIndex() } catch { list.replaceChildren(make('li', {className: 'find-note', textContent: 'Search is unavailable. Browse the sections instead.'})); list.hidden = false; return }
    if (q !== input.value.trim()) return
    const hits = find(entries, q, 7)
    items = hits.map((entry, n) => make('li', {id: 'find-' + n, role: 'option'}, make('a', {href: entry.url, tabIndex: -1}, make('b', {textContent: entry.title}), make('span', {textContent: entry.section + ' · ' + snippet(entry, q)}))))
    const all = make('li', {className: 'find-all'}, make('a', {href: '/search/?q=' + encodeURIComponent(q), tabIndex: -1, textContent: hits.length ? 'See every result for “' + q + '” →' : 'No page matches every word. Ask the community →'}))
    if (!hits.length) all.firstChild.href = 'https://support.slatebox.com/?q=' + encodeURIComponent(q)
    list.replaceChildren(...items, all)
    list.hidden = false
    input.setAttribute('aria-expanded', 'true')
    mark(-1)
  }
  input.addEventListener('input', show)
  input.addEventListener('focus', () => { loadIndex().catch(() => {}); if (input.value.trim()) show() })
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); mark((active + 1) % items.length) }
    else if (e.key === 'ArrowUp' && items.length) { e.preventDefault(); mark(active <= 0 ? items.length - 1 : active - 1) }
    else if (e.key === 'Escape') { if (!list.hidden) close(); else { input.value = ''; input.blur() } }
    else if (e.key === 'Enter' && active >= 0 && items[active]) { e.preventDefault(); location.href = items[active].querySelector('a').href }
  })
  document.addEventListener('click', e => { if (!finder.contains(e.target)) close() })
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest('input,textarea,select,[contenteditable]')) { e.preventDefault(); const target = document.querySelector('[data-search-page] input') || input; target.focus(); target.select() }
  })
}

const searchPage = document.querySelector('[data-search-page]')
if (searchPage) {
  const input = searchPage.querySelector('input'), status = document.querySelector('[data-search-status]'), out = document.querySelector('[data-search-list]')
  async function run() {
    const q = input.value.trim()
    const url = new URL(location.href); if (q) url.searchParams.set('q', q); else url.searchParams.delete('q'); history.replaceState(null, '', url)
    if (!q) { out.replaceChildren(); status.textContent = 'Type a word or two to search every guide and example.'; return }
    let entries
    try { entries = await loadIndex() } catch { status.textContent = 'Search is unavailable. Browse the sections instead.'; return }
    const hits = find(entries, q, 50)
    out.replaceChildren(...hits.map(entry => make('li', {}, make('a', {href: entry.url}, make('b', {textContent: entry.title}), make('span', {textContent: entry.section})), make('p', {textContent: snippet(entry, q)}))))
    status.replaceChildren(hits.length ? hits.length + (hits.length === 1 ? ' page matches' : ' pages match') + ' “' + q + '”.' : 'No page matches every word of “' + q + '”. ', ...(hits.length ? [] : [make('a', {href: 'https://support.slatebox.com/?q=' + encodeURIComponent(q), textContent: 'Ask the community'})]))
  }
  input.value = new URL(location.href).searchParams.get('q') || ''
  searchPage.addEventListener('submit', e => { e.preventDefault(); run() })
  input.addEventListener('input', () => { clearTimeout(run.t); run.t = setTimeout(run, 200) })
  run()
}
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
