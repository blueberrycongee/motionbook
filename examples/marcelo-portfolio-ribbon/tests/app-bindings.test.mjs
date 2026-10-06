import test from 'node:test';import assert from 'node:assert/strict';
test('application event wiring loads local assets and handles interrupted / repeated gestures',async()=>{
 const handlers=new Map(),winHandlers=new Map(),buttonHandlers=new Map();let raf;
 const context=new Proxy({canvas:{width:1512,height:982}}, {get:(t,k)=>k in t?t[k]:(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
 const canvas={width:1512,height:982,getContext:()=>context,addEventListener:(n,f)=>handlers.set(n,f),setPointerCapture:()=>{}};
 const status={textContent:''};let fullRequested=0;
 const doc={hidden:false,fonts:{load:async()=>{}},querySelector:s=>s==='#ribbon'?canvas:s==='#status'?status:{addEventListener:(n,f)=>buttonHandlers.set(n,f)},createElement:()=>({width:0,height:0,getContext:()=>context}),documentElement:{requestFullscreen:async()=>{fullRequested++;}},exitFullscreen:async()=>{}};
 Object.assign(globalThis,{document:doc,innerWidth:1512,innerHeight:982,devicePixelRatio:1,matchMedia:()=>({matches:false,addEventListener:()=>{}}),addEventListener:(n,f)=>winHandlers.set(n,f),requestAnimationFrame:f=>{raf=f;},Image:class{width=1024;height=1024;set src(s){assert(s.includes('/assets/'));queueMicrotask(()=>this.onload());}}});
 await import('../src/app.mjs');assert(status.textContent.includes('Ten original'));assert.equal(typeof raf,'function');
 const e=(over={})=>({clientX:800,pointerId:1,deltaY:0,deltaX:0,preventDefault(){},...over});
 raf(performance.now()+16);handlers.get('pointerdown')(e());handlers.get('pointermove')(e({clientX:320}));handlers.get('pointercancel')(e());handlers.get('lostpointercapture')(e());raf(performance.now()+32);
 handlers.get('pointerdown')(e({pointerId:2}));handlers.get('pointerup')(e({pointerId:2}));handlers.get('wheel')(e({deltaY:150}));handlers.get('wheel')(e({deltaX:-250}));
 for(const key of['ArrowLeft','ArrowRight',' ',' ','Escape','Home'])handlers.get('keydown')(e({key}));
 winHandlers.get('resize')();raf(performance.now()+64);await buttonHandlers.get('click')();assert.equal(fullRequested,1);assert.equal(canvas.width,1512);assert.equal(canvas.height,982);
 });
