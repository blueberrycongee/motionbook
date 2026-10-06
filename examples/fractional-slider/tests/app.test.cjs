const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
test('page wiring supports replay, signed drag, capture cancellation, keyboard and reset',()=>{
 const elements=new Map(),windowEvents=new Map();let queued,time=0,captured=null;
 function element(name){return {value:'',innerHTML:'',events:new Map(),addEventListener(k,f){this.events.set(k,f);},focus(){},getBoundingClientRect(){return {left:20,top:10,width:672,height:230};},setPointerCapture(id){captured=id;},hasPointerCapture(id){return captured===id;},releasePointerCapture(){captured=null;}};}
 for(const id of ['stage','scrub','status','live','reset','replay'])elements.set('#'+id,element(id));
 const context={console,performance:{now:()=>time},document:{querySelector:s=>elements.get(s)},requestAnimationFrame:f=>{queued=f;},addEventListener:(k,f)=>windowEvents.set(k,f)};context.window=context;vm.createContext(context);const root=path.resolve(__dirname,'..');
 for(const file of ['src/model.js','src/type.js','src/label-metrics.js','src/scene.js','src/trace.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 const stage=elements.get('#stage'),ev=(x,y,extra={})=>({clientX:20+x/2,clientY:10+y/2,button:0,pointerId:7,preventDefault(){},...extra}),tick=dt=>{time+=dt;const fn=queued;queued=null;fn(time);assert.equal(typeof queued,'function');};
 tick(0);assert.match(stage.innerHTML,/<svg/);context.rulerStudy.setTime(2.8);assert.ok(context.rulerStudy.getState().offset>1349);
 stage.events.get('pointerdown')(ev(200,380,{button:2}));assert.equal(captured,null);
 stage.events.get('pointerdown')(ev(200,380));assert.equal(captured,7);stage.events.get('pointermove')(ev(800,380));for(let i=0;i<90;i++)tick(1000/60);assert.equal(context.rulerStudy.model.target,-20);
 windowEvents.get('blur')();assert.equal(context.rulerStudy.model.down,false);stage.events.get('pointerleave')();assert.equal(context.rulerStudy.model.cursor,null);
 stage.events.get('wheel')(ev(400,380,{deltaY:12,shiftKey:true}));assert.ok(Math.abs(context.rulerStudy.model.target+19.9)<1e-8);
 stage.events.get('pointerdown')(ev(400,380));stage.events.get('lostpointercapture')();assert.equal(context.rulerStudy.model.down,false);
 stage.events.get('keydown')({key:'Home',preventDefault(){}});assert.equal(context.rulerStudy.model.target,0);
 elements.get('#replay').onclick();tick(0);assert.equal(context.rulerStudy.getState().offset,0);
 elements.get('#scrub').value='2.8';elements.get('#scrub').oninput();tick(0);assert.ok(context.rulerStudy.getState().offset>1349);
 elements.get('#live').onclick();elements.get('#reset').onclick();assert.equal(context.rulerStudy.model.target,0);
});
