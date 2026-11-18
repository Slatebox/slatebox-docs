// Exercise the files a visitor receives, including any transformations at the CDN.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { decodeWorkshopFragment } from '../assets/vendor/workshop-model.mjs'

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright')
const source = process.argv[2] || 'https://docs.slatebox.com'
const browser = await chromium.launch()
const files = new Map()
const server = createServer((req, res) => {
  const bytes = files.get(req.url)
  if (!bytes) {
    res.writeHead(404).end()
    return
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(bytes)
})
try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const local = 'http://127.0.0.1:' + server.address().port
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  async function openDownload(guide, label, filename) {
    await page.goto(new URL(guide, source).href)
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('link', { name: label, exact: true }).click()
    ])
    assert.equal(download.suggestedFilename(), filename)
    files.set('/' + filename, await readFile(await download.path()))
    await page.goto(local + '/' + filename)
  }

  await openDownload('/developers/javascriptlibrary/', 'Download the HTML', 'quick-slate.html')
  const note = page.getByRole('button', { name: 'Visitors stop to listen' })
  await note.focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('F2')
  await page.locator('.sb-inline-editor').fill('Listen to the whole interview')
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Listen to the whole interview' }).waitFor()
  assert.equal(await page.locator('#status').innerText(), 'Reopened your saved board.')

  await openDownload('/examples/theatre-cues/', 'download the rehearsal HTML', 'entrance-rehearsal.html')
  await page.getByRole('button', { name: 'Door opens' }).click()
  assert.equal(await page.locator('#monitor').innerText(), 'The doorway glows amber.')
  const href = new URL(await page.locator('#open').getAttribute('href'))
  assert.equal(href.origin + href.pathname, 'https://app.slatebox.com/new/workshop')
  assert.equal(decodeWorkshopFragment(href.hash).cards.find(card => card.id === 'light').laneId, 'door')
  console.log('Downloaded canvas and rehearsal ran on a separate origin. Saved note and workshop placement verified.')
} finally {
  await browser.close()
  if (server.listening) await new Promise(resolve => server.close(resolve))
}
