import {wheelTreatment} from '../src/art.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTROLS} from '../src/controls.mjs';
import {scene,nativeState,demoState,DURATION} from '../src/scene.mjs';
import {initialState,reduce,drawState} from '../src/model.mjs';
import {invoicePdf} from '../src/pdf.mjs';
const tick=(s,n)=>{for(let i=0;i<n;i++)s=reduce(s,{type:'tick',dt:.1});return s;};
test('every original native frame has finite, independent drawable geometry',()=>{
 assert.equal(CONTROLS.length,523);
 for(const c of CONTROLS){const text=scene(nativeState(c.t));assert(!/NaN|Infinity|<image|data:image|<video/.test(text));assert(text.startsWith('<svg'));for(const q of [c.stamp,c.paper])if(q){assert(q.every(Number.isFinite));assert(q[2]>0&&q[5]>0);}}
});
test('observed phases and authored neutral loop have exact reset states',()=>{
 assert.equal(nativeState(0).day,13);assert.equal(nativeState(90/60).day,15);assert(nativeState(209/60).base);assert(nativeState(256/60).confirm>.99);assert(nativeState(450/60).finalButtons>.99);
 assert.equal(scene(demoState(0)),scene(demoState(DURATION)));const reset=demoState(9.3);assert(reset.crossfade>.49&&reset.crossfade<.51);assert(scene(reset).includes('id="reset-bg"'));
});
test('mark, confirmation, undo, done and next-invoice transitions',()=>{
 let s=initialState(true);s=reduce(s,{type:'mark'});assert.equal(s.phase,'confirm');s=reduce(s,{type:'undo'});assert.equal(s.phase,'editor');s=reduce(s,{type:'motion',reduced:false});s=reduce(s,{type:'mark'});assert.equal(s.phase,'stamping');s=tick(s,23);assert.equal(s.phase,'confirm');s=reduce(s,{type:'done'});assert.equal(s.phase,'finishing');s=tick(s,17);assert.equal(s.phase,'final');s=reduce(s,{type:'next'});assert.equal(s.phase,'editor');
});
test('date bounds, leap years, statuses, colors and reduced motion',()=>{
 let s=initialState(true);s=reduce(s,{type:'date',field:'year',value:2024});s=reduce(s,{type:'date',field:'month',value:2});s=reduce(s,{type:'date',field:'day',value:31});assert.equal(s.day,29);s=reduce(s,{type:'date',field:'year',value:2025});assert.equal(s.day,28);s=reduce(s,{type:'date',field:'year',value:9999});assert.equal(s.year,2100);s=reduce(s,{type:'status',index:2});s=reduce(s,{type:'color',index:3});const v=drawState(s);assert.equal(v.status,'Approved');assert.equal(v.ink,'#7846d5');assert.equal(v.cursor,null);assert(!scene(v).includes('NaN'));
});
test('local PDF bytes have valid object offsets and no embedded network action',()=>{
 const data=invoicePdf(),pdf=new TextDecoder().decode(data);assert(pdf.startsWith('%PDF-1.4'));assert(pdf.includes('Illustrative UI recreation'));assert(!/\/JavaScript|\/OpenAction|\/URI/.test(pdf));const at=Number(pdf.match(/startxref\n(\d+)/)[1]);assert.equal(pdf.slice(at,at+4),'xref');for(const [n,off]of [...pdf.matchAll(/(\d{10}) 00000 n/g)].map((m,i)=>[i+1,Number(m[1])]))assert(pdf.slice(off).startsWith(`${n} 0 obj`));
});

test('tap ring compresses, confirmation layers stagger, and final controls rise',()=>{
 const rest=nativeState(110/60),press=nativeState(117/60);assert(press.cursor[2]<rest.cursor[2]);assert(press.cursor[3]>.9);const c=nativeState(244/60);assert(c.confirm>c.confirmLabel&&c.confirmLabel>c.confirmUndo&&c.confirmUndo>c.confirmDone);const final=nativeState(392/60);assert(final.finalButtonsY>2);assert(final.finalButtons<.6);assert(nativeState(125/60).form<.5);assert(nativeState(292/60).cursor[2]<nativeState(290/60).cursor[2]);assert.equal(nativeState(307/60).cursor[3],0);assert(nativeState(239/60).confirmPaper>0);assert(nativeState(240/60).confirmShellY<nativeState(239/60).confirmShellY);const live=drawState(reduce(initialState(true),{type:'mark'}));assert.equal(live.confirmDone,1);
});

test('wheel optical treatment is continuous through the adjacent-row boundary',()=>{const a=wheelTreatment(1-1e-5),b=wheelTreatment(1+1e-5);assert(Math.abs(a.blur-b.blur)<.001);assert(Math.abs(a.opacity-b.opacity)<.001);assert(wheelTreatment(2).blur>wheelTreatment(1.2).blur);assert(wheelTreatment(2).opacity<wheelTreatment(1.2).opacity);});
