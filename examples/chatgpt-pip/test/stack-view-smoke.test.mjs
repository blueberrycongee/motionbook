// Node smoke test with minimal DOM doubles. This is NOT browser rendering or UI QA.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
let source=fs.readFileSync(new URL('../public/stack-view.js',import.meta.url),'utf8');
for(const name of ['stack-behavior.mjs','native-spec.mjs','hover-behavior.mjs'])source=source.replaceAll(`/src/${name}`,new URL(`../src/${name}`,import.meta.url).href);
const {StackView}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
test('portable adapter constructs and schedules an empty frame without out-of-scope identifiers',()=>{
 const original={document:globalThis.document,ResizeObserver:globalThis.ResizeObserver,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};let scheduled=0,observed=false;
 const context={font:'',measureText:()=>({width:25}),getImageData:()=>({data:new Uint8ClampedArray(24*12*4)})};
 globalThis.document={createElement:name=>{assert.equal(name,'canvas');return {width:0,height:0,getContext:()=>context}},addEventListener(){},removeEventListener(){}};
 globalThis.ResizeObserver=class{observe(){observed=true}disconnect(){}};
 globalThis.requestAnimationFrame=()=>++scheduled;globalThis.cancelAnimationFrame=()=>{};
 const workspace={clientWidth:1188,clientHeight:478,addEventListener(){},removeEventListener(){},dataset:{}};
 try{const view=new StackView({container:{innerHTML:''},workspace,onFocus:()=>false});assert.equal(scheduled,1);assert.equal(observed,true);assert.equal(view.model.currentAnchor().alignment,2);view.loop(performance.now()+16.667);assert.equal(scheduled,2);assert.equal(view.model.items.size,0);view.dispose();}finally{for(const [key,value]of Object.entries(original)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
