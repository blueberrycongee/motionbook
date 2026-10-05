import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import fs from 'node:fs';
import {drawScene,PERIOD,SIZE} from '../src/scene.mjs';
const {createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas');
function frame(t){const c=createCanvas(SIZE,SIZE);drawScene(c.getContext('2d'),t,createCanvas);return c.getContext('2d').getImageData(0,0,SIZE,SIZE).data;}
test('renderer is deterministic and closes the 2.1 second loop',()=>{assert.deepEqual(frame(0),frame(PERIOD));assert.deepEqual(frame(.8),frame(.8));});
test('each desktop chapter renders a distinct frame',()=>{const frames=[.1,.8,1.4,1.9].map(frame);for(let n=1;n<frames.length;n++)assert.notDeepEqual(frames[n-1],frames[n]);});
test('all 42 preview frames are fully opaque and valid',()=>{for(let f=0;f<42;f++){const b=frame(f/20);assert.equal(b.length,128*128*4);for(let p=3;p<b.length;p+=4)assert.equal(b[p],255);}});
test('runtime is local, effect-only, and respects reduced motion',()=>{const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');const js=fs.readFileSync(new URL('../src/main.mjs',import.meta.url),'utf8');assert.ok(!/<h[1-6]|<p>|<button|https?:/i.test(html));assert.ok(js.includes('prefers-reduced-motion: reduce'));assert.ok(js.includes("e.code==='Space'"));});
