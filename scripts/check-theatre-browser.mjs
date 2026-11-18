// Run with the public playwright package installed, or point PLAYWRIGHT_MODULE at an existing install.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { decodeWorkshopFragment } from '../assets/vendor/workshop-model.mjs'

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright')
const html = await readFile(new URL('../assets/examples/entrance-rehearsal.html', import.meta.url), 'utf8')
const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  let source = html
  if (req.url === '/edited') source = html.replace('The doorway glows amber.', 'The doorway signals the entrance.')
  if (req.url === '/restricted') source = html.replace("id: 'light', label:", "id: 'light', allowedLaneIds: ['bench'], label:")
  res.end(source)
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const browser = await chromium.launch()
try {
  const local = 'http://127.0.0.1:' + server.address().port
  const page = await browser.newPage({ viewport:{ width:390, height:844 } })
  await page.goto(local)
  const cue = page.getByRole('button', {name:'Warm sidelight up'})
  await page.waitForFunction(() => !document.querySelector('#cue').disabled)
  const committed = async () => {
    const url = new URL(await page.locator('#open').getAttribute('href'))
    assert.equal(url.origin + url.pathname, 'https://app.slatebox.com/new/workshop')
    return decodeWorkshopFragment(url.hash).cards.find(card=>card.id === 'light').laneId
  }
  const monitor = page.getByRole('status')
  const box = await page.locator('#rail').boundingBox()
  async function dragOverDoor() {
    await page.mouse.move(box.x + box.width / 4, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * .75, box.y + box.height / 2, {steps:10})
    assert.equal(await monitor.innerText(), 'Preview · The doorway glows amber.')
    assert.equal(await committed(), 'bench')
    assert.ok(await page.locator('#stage').evaluate(el=>el.classList.contains('lit')))
  }
  await dragOverDoor()
  await page.keyboard.press('Escape')
  await page.mouse.up()
  assert.equal(await monitor.innerText(), 'The doorway stays dark.')
  await dragOverDoor()
  await page.mouse.up()
  assert.equal(await committed(),'door')
  await page.getByRole('button', {name:'Undo last move'}).click()
  assert.equal(await committed(),'bench')
  await cue.focus()
  await page.keyboard.press('ArrowRight')
  assert.equal(await committed(),'bench')
  await page.keyboard.press('Enter')
  assert.equal(await committed(),'door')
  await page.getByRole('button', {name:'Actor sits'}).click()
  assert.equal(await committed(),'bench')

  await page.goto(local+'/edited')
  await page.getByRole('button',{name:'Door opens'}).click()
  assert.equal(await monitor.innerText(),'The doorway signals the entrance.')
  const url = new URL(await page.locator('#open').getAttribute('href'))
  assert.equal(decodeWorkshopFragment(url.hash).signals[0].whenPresent, 'The doorway signals the entrance.')
  await page.goto(local+'/restricted')
  await page.waitForFunction(() => !document.querySelector('#cue').disabled)
  assert.ok(await page.getByRole('button',{name:'Door opens'}).isDisabled())
  await cue.focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  assert.equal(await monitor.innerText(),'The doorway stays dark.')
  assert.equal(await committed(),'bench')
  console.log('Local standalone HTML loaded the public engine and passed pointer preview, Escape, keyboard, undo, author edits and native app handoff.')
} finally {
  await browser.close()
  await new Promise(resolve => server.close(resolve))
}
