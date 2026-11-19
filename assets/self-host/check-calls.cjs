// Run inside the self-hosted Slatebox app container, where its settings are mounted.
const {readFileSync} = require('node:fs')

async function checkCalls(settings, request = fetch) {
  if (settings.public?.daily?.apiKey) return [1, 'A Daily key is in public settings. Remove it, rotate it with Daily, and recreate the app.']
  const key = settings.daily?.apiKey
  if (typeof key !== 'string' || !key.trim()) return [2, 'Daily key missing. Set daily.apiKey in the private settings file, then recreate the app.']
  try {
    const response = await request('https://api.daily.co/v1/', {
      method: 'GET', redirect: 'error', signal: AbortSignal.timeout(10000),
      headers: {Authorization: 'Bearer ' + key.trim()},
    })
    await response.body?.cancel()
    if (response.status === 200) return [0, 'Daily accepted the key and the app container can reach its API. Next, join a huddle from two browsers.']
    if ([401,403].includes(response.status)) return [3, 'Daily rejected the configured credential. Check the private key and account permissions, then recreate the app.']
    return [4, 'Daily returned HTTP ' + response.status + '. Check provider availability and retry.']
  } catch {
    return [4, 'The app container could not reach the Daily API within ten seconds. Check DNS, TLS and outbound HTTPS.']
  }
}

module.exports = {checkCalls}
if (require.main === module || process.argv[1] === '-') (async () => {
  let settings
  try {settings = JSON.parse(readFileSync('/opt/slatebox/settings.json', 'utf8'))}
  catch {console.error('Cannot read the mounted settings. Run this check inside the kit app container.'); process.exitCode=1; return}
  const [code,message] = await checkCalls(settings)
  console.log(message)
  process.exitCode = code
})()
