import assert from 'node:assert/strict';
import {renderFrame,stateAt} from './scene.mjs';
let checks=0;
const close=(a,b)=>{assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);checks++;};
for(const [t,v] of [[0,40],[.5,40],[1.1,51.25],[2.1,70],[3.399,70],[3.4,70],[4.5,25],[6,25]])close(stateAt(t).value,v);
for(const [t,v] of [[0,40],[.5,40],[1.1,51.25],[1.45,40.625],[1.8,40],[2.599,40],[2.6,40],[3.3,47.5],[4,55],[6,55]])close(stateAt(t,'interrupted').value,v);
close(stateAt(1.8-1e-8,'interrupted').value,30);
for (const [scenario,a,b,dir] of [['normal',.5,2.1,1],['normal',3.4,4.5,-1],['interrupted',.5,1.1,1],['interrupted',1.1,1.79999,-1],['interrupted',2.6,4,1]]) {
  let prev=stateAt(a,scenario).value;
  for(let j=1;j<=100;j++){const next=stateAt(a+(b-a)*j/100,scenario).value;assert.ok((next-prev)*dir>=0);prev=next;checks++;}
}
for(const scenario of ['normal','interrupted'])for(const reducedMotion of [false,true])for(let i=0;i<=600;i++) {
  const t=i/100, svg=renderFrame(t,{scenario,reducedMotion});
  assert.equal(svg,renderFrame(t,{scenario,reducedMotion}));
  assert.ok(svg.includes('Sound check')&&svg.includes('Tune the room to your mood.')&&svg.includes('Range 0–100'));
  assert.ok(!/NaN|Infinity|undefined|<(?:script|image|foreignObject)\b|\b(?:href|onload)=/.test(svg));
  assert.ok(svg.includes('viewBox="0 0 800 600"'));
  assert.equal(Number(svg.match(/data-value="([^"]+)"/)[1]),Number(stateAt(t,scenario).value.toFixed(4)));
  if(reducedMotion) assert.ok(!svg.includes('cy="438"')&&!svg.includes('M400 378'));
  checks+=6;
}
assert.ok(renderFrame().startsWith('<svg'));checks++;
assert.ok(renderFrame(2,{width:1600,height:1200}).includes('width="1600" height="1200"'));checks++;
assert.equal(renderFrame(5),renderFrame(6));checks++;
assert.equal(renderFrame(5,{scenario:'interrupted'}),renderFrame(6,{scenario:'interrupted'}));checks++;
// Static reduced-motion geometry: after stripping text, semantic metadata, and ink,
// all line positions and transforms are identical even at different values.
const geometry=svg=>[...svg.matchAll(/(?: d| cx| cy| r| transform| x| y| width| height)="([^"]*)"/g)].map(m=>m[0]).join('\n');
assert.equal(geometry(renderFrame(0,{reducedMotion:true})),geometry(renderFrame(2.1,{reducedMotion:true})));checks++;
console.log(JSON.stringify({status:'PASS',checks,coverage:['exact event boundaries','monotonic continuous gestures','cancellation reset','retained releases','601 samples per scenario and motion mode','determinism','finite SVG','required visible text','no external assets or executable markup','custom output size','reduced-motion fixed geometry']}));
