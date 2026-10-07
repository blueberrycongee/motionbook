import assert from 'node:assert/strict';
import {renderFrame, stateAt} from './scene.mjs';
const expected = {
 normal: [[0,'idle'],[.499,'idle'],[.5,'saving'],[2.999,'saving'],[3,'success'],[6,'success']],
 interrupted: [[0,'idle'],[.5,'saving'],[1.399,'saving'],[1.4,'canceled'],[2.099,'canceled'],[2.1,'saving'],[3.799,'saving'],[3.8,'success'],[6,'success']]
};
let checks=0;
for(const [scenario,samples] of Object.entries(expected)) for(const [t,want] of samples) for(const reducedMotion of [false,true]) {
 assert.equal(stateAt(t,scenario,reducedMotion).state,want);
 const svg=renderFrame(t,{scenario,reducedMotion});
 assert(svg.includes(`data-state="${want}"`)); checks++;
}
for(const scenario of ['normal','interrupted']) for(const reducedMotion of [false,true]) for(let k=0;k<=600;k++) {
 const t=k/100, svg=renderFrame(t,{scenario,reducedMotion});
 assert.equal(svg,renderFrame(t,{scenario,reducedMotion}));
 assert(!/NaN|Infinity|<script|<image|foreignObject|https?:\/\//.test(svg.replace('http://www.w3.org/2000/svg','')));
 assert(svg.includes('viewBox="0 0 800 600"')); checks++;
}
for(const [scenario,a,b] of [['normal',.5,2.9],['normal',3,6],['interrupted',1.4,2.09],['interrupted',2.1,3.79]]) {
 assert.equal(renderFrame(a,{scenario,reducedMotion:true}), renderFrame(b,{scenario,reducedMotion:true})); checks++;
}
for(const [scenario,event] of [['normal',.5],['normal',3],['interrupted',1.4],['interrupted',2.1],['interrupted',3.8]]) {
 assert(Math.abs(stateAt(event-1e-6,scenario).q-stateAt(event+1e-6,scenario).q)<.0001); checks++;
}
assert(renderFrame().includes('Save draft'));
assert(renderFrame(1,{width:400,height:300}).includes('width="400" height="300"'));
console.log(`PASS: ${checks+2} assertions covering schedule boundaries, deterministic SVG, no external assets, finite samples, spring continuity, dimensions, and static reduced-motion states.`);
