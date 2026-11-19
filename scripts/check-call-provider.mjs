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
