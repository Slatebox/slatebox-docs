// A page that leaves the site keeps its address: scripts/build.mjs writes a small page there with a
// canonical link (the new page, without its #anchor) and a meta refresh to the page that now
// answers. Run after `npm run build`.
import test from 'node:test'
import assert from 'node:assert/strict'
import {execFile} from 'node:child_process'
import {readFile, readdir, stat} from 'node:fs/promises'
import path from 'node:path'

const base = 'https://docs.slatebox.com'
const redirects = JSON.parse(await readFile('scripts/redirects.json', 'utf8'))
const exists = file => stat(file).then(() => true, () => false)
const pageAt = url => path.join('dist', url, 'index.html')

async function walk(dir) {
  const entries = await readdir(dir, {withFileTypes: true})
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name)))).flat()
}

test('the removed pages have redirects', () => {
  assert.equal(redirects['/developers/slateboxjs-api/'], '/developers/javascriptlibrary/')
  assert.equal(redirects['/developers/slateboxapi/organizations/'], '/using-slatebox/#work-with-a-team')
})

test('every redirect is a small page with a canonical link and a meta refresh to a built page', async () => {
  const sitemap = await readFile('dist/sitemap.xml', 'utf8')
  const search = JSON.parse(await readFile('dist/search.json', 'utf8'))
  for (const [from, to] of Object.entries(redirects)) {
    assert.match(from, /^\/[a-z0-9/-]*\/$/, from + ' is a page address ending in /')
    const doc = await readFile(pageAt(from), 'utf8').catch(() => '')
    assert.ok(doc, 'no redirect page at ' + from)
    assert.ok(doc.length < 2000, from + ' should be a small page')
    assert.ok(doc.includes('<link rel="canonical" href="' + base + to.split('#')[0] + '">'), from + ' needs a canonical link to ' + to.split('#')[0])
    assert.ok(doc.includes('<meta http-equiv="refresh" content="0; url=' + to + '">'), from + ' needs a meta refresh to ' + to)
    assert.ok(doc.includes('<meta name="robots" content="noindex">'), from + ' is not indexed')
    assert.ok(doc.includes('<a href="' + to + '">'), from + ' links to ' + to + ' for readers without refresh')
    const [target, anchor] = to.split('#')
    const page = await readFile(pageAt(target), 'utf8').catch(() => '')
    assert.ok(page && !page.includes('http-equiv="refresh"'), to + ' must be a built page, not another redirect')
    if (anchor) assert.ok(page.includes('id="' + anchor + '"'), to + ' needs the anchor #' + anchor)
    assert.ok(!sitemap.includes('<loc>' + base + from + '</loc>'), from + ' must not be in the sitemap')
    assert.ok(!search.some(entry => entry.url === from), from + ' must not be in search')
  }
})

// The published site lives on the retype branch. Any page there that this build no longer makes
// must redirect, so a removed page never turns into a 404.
test('every page on the published branch is built or redirected', async t => {
  const listing = await new Promise(resolve => execFile('git', ['ls-tree', '-r', '--name-only', 'origin/retype'], (error, out) => resolve(error ? null : out)))
  if (listing === null) return t.skip('origin/retype is not fetched here')
  const built = new Set((await walk('dist')).filter(f => f.endsWith('index.html')).map(f => '/' + path.relative('dist', path.dirname(f)).split(path.sep).join('/') + '/').map(u => u.replace(/^\/\.?\/$/, '/').replace(/\/\/$/, '/')))
  const published = listing.split('\n').filter(f => f.endsWith('index.html')).map(f => ('/' + f.replace(/index\.html$/, '')).replace(/\/+$/, '/'))
  const missing = published.filter(url => !built.has(url) && !(url in redirects))
  assert.deepEqual(missing, [], 'published pages with no page and no redirect')
  for (const from of Object.keys(redirects)) assert.ok(await exists(pageAt(from)))
})
