import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
test('snap preview emits only its effect surface, cards and pointer',()=>{
 const s=read('artifacts/snapping/render-snapping.mjs');
 const render=s.slice(s.indexOf('function render('),s.indexOf('const renderFps='));
 assert.doesNotMatch(render,/<text|text\(|stroke-dasharray|projected anchor|same release point|PLAYBACK/);
 assert.match(render,/for\(const item of \[\.\.\.f\.items\]\.reverse\(\)\)/);
 assert.match(render,/viewBox="0 178 1280 560"/);
 assert.match(s,/renderFps=30,totalSeconds=16/);
});
test('hover preview retains real Hide menu UI without editorial render labels',()=>{
 const s=read('test/render-hover-v3.mjs');const render=s.slice(s.indexOf('function render('));
 assert.match(render,/Hide for this task/);assert.match(render,/Hide for all active tasks/);
 assert.doesNotMatch(render,/OFFLINE RENDER|STATE |SOURCE LAYER|Native AppKit execution|Control opacity|Content scale/);
 assert.match(s,/viewBox="0 100 1280 660"/);
});
test('local fixture retains model labels but omits fixture captions and code',()=>{
 const html=read('public/fixture.html');
 assert.match(html,/GPT-6-Astra/);assert.match(html,/class="effort">Medium/);assert.match(html,/fixtureStep/);
 assert.doesNotMatch(html,/>Actual RuntimeModelMenu|class="code">|>Local fixture only|>Independent presentation/);
});
test('README embeds an existing relative GIF and links run instructions and source',()=>{
 const s=read('README.md');
 for(const relative of ['artifacts/snapping/pip-snapping-physics.gif','docs/RUN.md','src/stack-behavior.mjs']){
  assert.ok(s.includes(`](${relative})`));assert.ok(fs.existsSync(new URL(`../${relative}`,import.meta.url)));
 }
 assert.match(s,/!\[PiP snap preview\]\(artifacts\/snapping\/pip-snapping-physics\.gif\)/);
});
