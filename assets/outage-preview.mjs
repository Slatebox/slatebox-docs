const host = document.querySelector('[data-outage-preview]')
const fallback = document.querySelector('[data-outage-fallback]')
try {
  const [{ Slate }, response] = await Promise.all([
    import('https://slatebox.com/assets/engine/slateboxjs.mjs'),
    fetch('https://slatebox.com/assets/product/sign-in-outage-slate.json'),
  ])
  if (!response.ok) throw Error('Drawing unavailable')
  const drawing = await response.json()
  const slate = new Slate(host, {
    enabled: false, allowDrag: false, showZoom: false, showBirdsEye: false, showMultiSelect: false,
  })
  await slate.loadJSON(drawing)
  const notes = slate.nodes.allNodes.map(node => node.options)
  const left = Math.min(...notes.map(n => n.x)) - 16
  const top = Math.min(...notes.map(n => n.y)) - 16
  const right = Math.max(...notes.map(n => n.x + n.width)) + 16
  const bottom = Math.max(...notes.map(n => n.y + n.height)) + 16
  function fit() {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    const scale = Math.min(width / (right - left), height / (bottom - top))
    const w = width / scale, h = height / scale
    slate.canvas.viewbox((left + right - w) / 2, (top + bottom - h) / 2, w, h)
  }
  fit()
  new ResizeObserver(fit).observe(host)
  fallback.hidden = true
} catch {
  host.hidden = true
}
