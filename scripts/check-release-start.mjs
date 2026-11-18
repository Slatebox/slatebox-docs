import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, chmodSync, copyFileSync, existsSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const packer = new URL('../assets/self-host/release-kit.sh',import.meta.url)
function fixture(t) {
  const root=mkdtempSync(join(tmpdir(),'slatebox-start-'))
  t.after(()=>rmSync(root,{recursive:true,force:true}))
  const bin=join(root,'bin'), resources=join(root,'docker.json')
  mkdirSync(bin)
  const empty={daemon:'first',volumes:{},networks:[],containers:[],calls:[]}
  const read=()=>JSON.parse(readFileSync(resources))
  const put=v=>writeFileSync(resources,JSON.stringify(v))
  put(empty)
  const tool=(file,body)=>{writeFileSync(file,body);chmodSync(file,0o700)}
  tool(join(bin,'docker'),'#!/usr/bin/env node\n'+`
const fs=require('node:fs'),p=process.env.RESOURCES, d=JSON.parse(fs.readFileSync(p)),args=process.argv.slice(2)
const print=items=>items.forEach(item=>console.log(item))
if(args[0]==='info')console.log(d.daemon)
else if(args[0]==='ps')print(d.containers.map(c=>c.name))
else if(args[0]==='inspect'){const c=d.containers.find(c=>c.name===args.at(-1));const field=args[2]
 console.log(field.includes('config_files')?c.file:field.includes('.Mounts')?c.settings:field.includes('.Networks')?c.networkCount:c.service)}
else if(args[0]==='network')print(d.networks)
else if(args[0]==='volume' && args[1]==='ls')print(Object.keys(d.volumes))
else if(args[0]==='volume' && args[1]==='create'){
 const name=args.at(-1), label=args.find(value=>value.startsWith('com.slatebox.installation=')).split('=')[1]
 if(!(name in d.volumes))d.volumes[name]=label
 fs.writeFileSync(p,JSON.stringify(d))
} else if(args[0]==='volume' && args[1]==='inspect')console.log(d.volumes[args.at(-1)])
else throw Error('Unexpected Docker operation: '+args[0])
`)
  const kit=name=>{
    const dir=join(root,name),host=join(dir,'self-host')
    mkdirSync(host,{recursive:true})
    writeFileSync(join(host,'compose.yaml'),'services: {}\n')
    copyFileSync(packer,join(dir,'start'));chmodSync(join(dir,'start'),0o700)
    tool(join(dir,'initialize'),`#!/bin/sh
set -eu
mkdir -m 700 "$SLATEBOX_STATE"
printf '%s' "\${ROOT_URL:-http://localhost:\${APP_PORT:-7070}}" >"$SLATEBOX_STATE/instance.env"
printf '%s' "\${1:-http}" >"$SLATEBOX_STATE/settings.json"
`)
    tool(join(host,'run'),'#!/usr/bin/env node\n'+`
const fs=require('node:fs'),s=process.env.SLATEBOX_STATE, args=process.argv.slice(2),p=process.env.RESOURCES,d=JSON.parse(fs.readFileSync(p))
if(args.join(' ')==='config --services')console.log(fs.readFileSync(s+'/settings.json','utf8')==='--https'?'proxy\\napp':'app')
else if(args.join(' ')==='up --no-start --no-deps --force-recreate --pull never app'){
 const app=d.containers.find(c=>c.service==='app');if(!app||app.networkCount!==0)throw Error('Recreating a connected app')
 app.networkCount=1;d.calls.push(args);fs.writeFileSync(p,JSON.stringify(d))
}else if(args.join(' ')==='up -d --wait --pull never'){
 d.calls.push(args);fs.writeFileSync(p,JSON.stringify(d));if(process.env.FAIL==='1')process.exit(8)
}else if(args[0]==='exec')console.log(fs.readFileSync(s+'/instance.env','utf8')+'/start')
else throw Error('Unexpected Compose command')
`)
    return {state:join(host,'.state'), start:(options={},args=[])=>execFileSync(join(dir,'start'),args,{
      env:{...process.env,PATH:bin+':'+process.env.PATH,RESOURCES:resources,COMPOSE_PROJECT_NAME:'fixture',...options},
      encoding:'utf8',stdio:['ignore','pipe','pipe'],
    })}
  }
  return {kit,read,put,root}
}

test('partial startup retries with the original configuration; an absent database or a different daemon stops before Compose',t=>{
  const f=fixture(t), a=f.kit('one')
  assert.throws(()=>a.start({APP_PORT:'19871',FAIL:'1'}))
  const first=readFileSync(join(a.state,'start-instance'),'utf8')
  assert.match(a.start({APP_PORT:'9999'}),/http:\/\/localhost:19871\/start/)
  assert.equal(first,readFileSync(join(a.state,'start-instance'),'utf8'))
  assert.equal(f.read().calls.length,2)
  assert.throws(()=>a.start({COMPOSE_PROJECT_NAME:'different'}),/daemon and Compose project/)
  const d=f.read();d.daemon='different';f.put(d)
  assert.throws(()=>a.start(),/daemon and Compose project/)
  d.daemon='first';d.volumes={};f.put(d)
  assert.throws(()=>a.start(),/database volume is missing/)
  assert.equal(f.read().calls.length,2)
})

test('a different extracted kit, occupied project, and unmarked state are rejected before initialization',t=>{
  const f=fixture(t),a=f.kit('one'),b=f.kit('two')
  const d=f.read();d.containers.push({name:'existing',file:'/other/compose.yaml'});f.put(d)
  assert.throws(()=>a.start(),/another installation/);assert.equal(existsSync(a.state),false)
  d.containers=[];f.put(d)
  a.start()
  assert.throws(()=>b.start(),/Existing volume/);assert.equal(existsSync(b.state),false)
  d.volumes={};f.put(d);mkdirSync(b.state)
  assert.throws(()=>b.start(),/prepared separately/)
})

test('managed HTTPS initializes its profile and claims proxy storage; retry prints the configured hostname',t=>{
  const f=fixture(t),a=f.kit('one')
  assert.match(a.start({ROOT_URL:'https://boards.example.invalid'},['--https']),/https:\/\/boards.example.invalid\/start/)
  assert.deepEqual(Object.keys(f.read().volumes).sort(),['fixture_caddy-data','fixture_mongo-data'])
  assert.match(a.start(),/https:\/\/boards.example.invalid\/start/)
})


test('retry accepts a directory alias to the same Compose file and refuses a distinct file with identical bytes',t=>{
  const f=fixture(t), a=f.kit('operator')
  a.start()
  const alias=join(f.root,'alias')
  symlinkSync(join(f.root,'operator'),alias,'dir')
  const d=f.read()
  d.containers=[{name:'existing-mongo',service:'mongo',file:join(alias,'self-host','compose.yaml')}]
  f.put(d)
  assert.match(a.start(),/localhost:7070\/start/)
  const other=f.kit('distinct')
  const distinct=join(other.state,'..','compose.yaml')
  assert.deepEqual(readFileSync(distinct),readFileSync(d.containers[0].file))
  const now=f.read();now.containers[0].file=distinct;f.put(now)
  assert.throws(()=>a.start(),/another installation/)
  assert.equal(f.read().calls.length,2)
})


test('resume recreates only the verified app that lost its network after a failed port bind',t=>{
  const f=fixture(t),a=f.kit('operator')
  a.start()
  const d=f.read(),file=join(a.state,'..','compose.yaml')
  const app={name:'app-id',service:'app',settings:join(a.state,'settings.json'),file,networkCount:1}
  const mongo={name:'mongo-id',service:'mongo',file,networkCount:1}
  const relay={name:'relay-id',service:'collab',file,networkCount:1}
  d.containers=[app,mongo,relay];d.networks=['fixture_default'];f.put(d)
  a.start()
  assert.equal(f.read().calls.some(args=>args.includes('--force-recreate')),false)
  const lost=f.read();lost.containers[0].networkCount=0;f.put(lost)
  a.start()
  const recovered=f.read()
  assert.deepEqual(recovered.calls.slice(-2),[
    ['up','--no-start','--no-deps','--force-recreate','--pull','never','app'],
    ['up','-d','--wait','--pull','never'],
  ])
  assert.deepEqual(recovered.containers,[app,mongo,relay])
  assert.deepEqual(recovered.volumes,d.volumes)
})
