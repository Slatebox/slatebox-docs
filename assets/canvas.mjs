const el = document.querySelector('[data-drawing]')
const add = document.querySelector('[data-add]')
const reset = document.querySelector('[data-reset]')
const status = document.querySelector('[data-canvas-status]')
try {
  const {Slate} = await import('https://slatebox.com/assets/engine/slateboxjs.mjs')
  // Fixed drawing coordinates keep the whole example visible on a phone.
  const stage=document.createElement('div')
  stage.style.cssText='position:absolute;width:560px;height:252px;left:50%;top:50%;transform-origin:center'
  el.append(stage)
  const fit=()=>{stage.style.transform='translate(-50%, -50%) scale('+Math.min(el.clientWidth/560,el.clientHeight/252)+')'}
  new ResizeObserver(fit).observe(el);fit()
  const slate=new Slate(stage,{name:'Field recording',viewPort:{originalWidth:560,originalHeight:252},containerStyle:{backgroundColor:'#f3f0e3'},showBirdsEye:false,showZoom:false,showMultiSelect:false})
  function note(id,x,y,text,color){return slate.addNode({id,x,y,width:146,height:64,shape:'rectangle',text,backgroundColor:color,foregroundColor:'#24392f',fontSize:17})}
  const rain=note('rain',48,34,'Rain on copper','#e9cc85'), recording=note('recording',314,96,'Field recording','#b5cdbd')
  await Promise.all([rain.ready,recording.ready])
  rain.relationships.addAssociation(recording)
  let glass
  add.disabled=false;status.textContent='2 notes · 1 connection'
  add.onclick=async()=>{
    if(glass)return
    add.disabled=true
    glass=note('glass',48,157,'Glass chimes','#c9c1db')
    await glass.ready
    glass.relationships.addAssociation(recording)
    status.textContent='3 notes · 2 connections';reset.disabled=false
  }
  reset.onclick=()=>{if(glass){slate.removeNode(glass.id);glass=null}reset.disabled=true;add.disabled=false;status.textContent='2 notes · 1 connection'}
} catch {status.textContent='Canvas unavailable. Open the SlateboxJS guide below to run it locally.'}
