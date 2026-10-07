import assert from 'node:assert/strict';
import {renderFrame,stateAt} from './scene.mjs';
const transitions={normal:[[0,'idle'],[.499,'idle'],[.5,'saving'],[2.999,'saving'],[3,'success'],[6,'success']],interrupted:[[.499,'idle'],[.5,'saving'],[1.399,'saving'],[1.4,'canceled'],[2.099,'canceled'],[2.1,'saving'],[3.799,'saving'],[3.8,'success'],[6,'success']]};
let checked=0;
for(const [scenario,pairs] of Object.entries(transitions))for(const [t,state] of pairs){assert.equal(stateAt(t,scenario).state,state);for(const reducedMotion of [false,true]){const svg=renderFrame(t,{scenario,reducedMotion});assert(svg.includes(`data-state="${state}"`));assert.equal(svg,renderFrame(t,{scenario,reducedMotion}));assert(!/(?:NaN|Infinity|<script|<image|foreignObject|https?:\/\/(?!www.w3.org))/.test(svg));checked++;}}
for(const scenario of ['normal','interrupted'])for(const reducedMotion of [false,true])for(let i=0;i<=600;i++){const svg=renderFrame(i/100,{scenario,reducedMotion});assert(!/NaN|Infinity/.test(svg));checked++;}
assert.equal(stateAt(2.1,'interrupted').progress,0);
assert.equal(stateAt(2.099,'interrupted').state,'canceled');
assert.equal(renderFrame(.7,{reducedMotion:true}),renderFrame(2.8,{reducedMotion:true}));
assert.equal(renderFrame(3.1,{reducedMotion:true}),renderFrame(6,{reducedMotion:true}));
assert.equal(renderFrame(1.41,{scenario:'interrupted',reducedMotion:true}),renderFrame(2.09,{scenario:'interrupted',reducedMotion:true}));
assert.match(renderFrame(0,{width:1600,height:1200}),/width="1600" height="1200" viewBox="0 0 800 600"/);
console.log(`PASS: ${checked} frame/state checks; exact event boundaries; deterministic rendering; restart progress reset; static reduced motion; dimensions and prohibited SVG elements.`);
