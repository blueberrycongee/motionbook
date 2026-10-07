import assert from 'node:assert/strict';
import { renderFrame, motionState } from './scene.mjs';
const results=[];
function test(name, fn) { fn(); results.push({name,passed:true}); }
test('default renderer is valid self-contained SVG',()=>{
 const svg=renderFrame();
 assert(svg.startsWith('<svg ')); assert(svg.endsWith('</svg>'));
 assert.match(svg,/viewBox="0 0 800 600"/);
 assert(!/<(?:script|image|foreignObject)\b/i.test(svg));
 assert(!/\b(?:href|src)\s*=/i.test(svg));
 assert(!/NaN|Infinity|undefined/.test(svg));
 assert(svg.includes('P-204') && svg.includes('Arriving today'));
});
test('all modes are deterministic and finite at 240 Hz',()=>{
 for(const scenario of ['normal','interrupted']) for(const reducedMotion of [false,true])
 for(let i=0;i<=1440;i++) {
  const t=i/240, options={scenario,reducedMotion};
  const svg=renderFrame(t,options); assert.equal(svg,renderFrame(t,options));
  assert(!/NaN|Infinity|undefined/.test(svg));
  const s=motionState(t,options); assert(s.p>=0 && s.p<=1); assert(s.w>=264 && s.w<=424); assert(s.h>=56 && s.h<=336);
 }
});
test('normal and interrupted event targets match the schedule',()=>{
 for(const scenario of ['normal','interrupted']) {
  const events=scenario==='normal'?[[.5,1],[3.5,0]]:[[.5,1],[.85,0],[1.4,1],[3.5,0]];
  let target=0;
  for(const [at,next] of events) {
   assert.equal(motionState(at-1e-8,{scenario}).target,target);
   assert.equal(motionState(at,{scenario}).target,next); target=next;
  }
 }
});
test('surface position and velocity are continuous at every reversal',()=>{
 const eps=1e-5;
 for(const at of [.5,.85,1.4,3.5]) {
  const state=t=>motionState(t,{scenario:'interrupted'});
  const a=state(at-eps), b=state(at), c=state(at+eps);
  for(const key of ['x','y','w','h','r']) {
   assert(Math.abs(c[key]-a[key])<.02,`${at} ${key} position`);
   const left=(b[key]-a[key])/eps,right=(c[key]-b[key])/eps;
   assert(Math.abs(left-right)<.5,`${at} ${key} velocity ${left} ${right}`);
  }
 }
});
test('exact compact endpoints and held open detail state',()=>{
 for(const scenario of ['normal','interrupted']) {
  for(const t of [0,.25,.49999,4.44,5,6]) assert.equal(motionState(t,{scenario}).p,0);
  for(const t of [2.4,3,3.49]) assert.equal(motionState(t,{scenario}).p,1);
  assert.equal(renderFrame(0,{scenario}),renderFrame(6,{scenario}));
 }
});
test('reduced motion switches directly between meaningful states',()=>{
 for(const scenario of ['normal','interrupted']) for(let i=0;i<=600;i++) {
  const s=motionState(i/100,{scenario,reducedMotion:true}); assert.equal(s.p,s.target);
 }
 assert.equal(renderFrame(.6,{reducedMotion:true}),renderFrame(3,{reducedMotion:true}));
 assert.equal(renderFrame(.9,{scenario:'interrupted',reducedMotion:true}),renderFrame(0,{scenario:'interrupted',reducedMotion:true}));
});
test('custom output dimensions retain the authored viewBox',()=>{
 assert.match(renderFrame(2,{width:1200,height:900}),/width="1200" height="900" viewBox="0 0 800 600"/);
});
console.log(JSON.stringify({passed:results.length,results},null,2));
