import assert from 'node:assert/strict'
import test from 'node:test'
import {checkCalls} from '../assets/self-host/check-calls.cjs'

test('missing and publicly misplaced credentials stop before opening a network connection',async()=>{
  const offline=()=>assert.fail('Unexpected network request')
  assert.equal((await checkCalls({},offline))[0],2)
  assert.equal((await checkCalls({public:{daily:{apiKey:'example'}}},offline))[0],1)
})
test('only read-only domain configuration is requested; neither credential nor response body appears in diagnostics',async()=>{
  const testKey='local-test-only'
  for(const [status,expected] of [[200,0],[401,3],[403,3],[429,4],[503,4]]) {
    const [code,message]=await checkCalls({daily:{apiKey:testKey}},async(url,init)=>{
      assert.equal(url,'https://api.daily.co/v1/')
      assert.equal(init.method,'GET')
      assert.equal(init.redirect,'error')
      assert.equal(init.headers.Authorization,'Bearer '+testKey)
      return new Response('private domain data',{status})
    })
    assert.equal(code,expected)
    assert.ok(!message.includes(testKey)&&!message.includes('private domain data'))
  }
  assert.equal((await checkCalls({daily:{apiKey:testKey}},async()=>{throw Error(testKey)}))[0],4)
})

test('the install guide pins the exact helper bytes before invoking the container', async()=>{
  const {readFile}=await import('node:fs/promises')
  const {createHash}=await import('node:crypto')
  const doc=await readFile(new URL('../Installation/install-with-docker.md',import.meta.url),'utf8')
  const script=await readFile(new URL('../assets/self-host/check-calls.cjs',import.meta.url))
  const digest=createHash('sha256').update(script).digest('hex')
  const snippet=doc.split('## Configure audio and video calls')[1].split('```sh')[1].split('```')[0]
  assert.match(snippet,/githubusercontent\.com\/Slatebox\/slatebox-docs\/[a-f0-9]{40}\/assets\/self-host\/check-calls\.cjs/)
  assert.ok(snippet.includes(digest))
  assert.ok(snippet.includes('fi && ./run exec -T app node - < check-calls.cjs'))
})
