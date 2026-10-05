import test from 'node:test';
import assert from 'node:assert/strict';
import {BrowserPIPController,fixtureNotification as note,presentationID,parseBrowserNotification} from '../src/browser-pip.mjs';
const imageDataURL='data:image/png;base64,fixture';
const sample = options => note({imageDataURL,...options});

test('first frame activates thread and preserves browser/tab identity',()=>{
 const activity=[];const c=new BrowserPIPController({onActivity:(...x)=>activity.push(x)});
 c.handle(sample());const s=c.snapshot(); assert.equal(s.frames.length,1);assert.equal(s.sessionCount,1);
 assert.equal(s.frames[0].presentationID,presentationID('fixture-thread','fixture-browser','fixture-tab'));
 assert.deepEqual(activity,[['fixture-thread',true]]);
});
test('updates same tab in place instead of producing duplicate cards',()=>{
 const c=new BrowserPIPController();c.handle(sample());c.handle(sample({imageDataURL:'data:image/png;base64,next'}));
 assert.equal(c.snapshot().frames.length,1);assert.equal(c.snapshot().frames[0].imageDataURL,'data:image/png;base64,next');
});
test('multiple tabs retain only openTabIds and delete stale focus targets',async()=>{
 const c=new BrowserPIPController({onFocus:()=>true});c.handle(sample({tabID:'a'}));c.handle(sample({tabID:'b',openTabIds:['a','b']}));
 assert.equal(c.snapshot().frames.length,2);c.handle(note({openTabIds:['b']}));
 assert.equal(c.snapshot().frames.length,1);assert.equal(await c.click(presentationID('fixture-thread','fixture-browser','a')),false);
});
test('reference-counted thread activity across browser sessions',()=>{
 const events=[];const c=new BrowserPIPController({onActivity:(...x)=>events.push(x)});
 c.handle(sample({browserID:'a'}));c.handle(sample({browserID:'b'}));
 c.handle(note({browserID:'a',openTabIds:[]}));assert.deepEqual(events,[['fixture-thread',true]]);
 c.handle(note({browserID:'b',openTabIds:[]}));assert.deepEqual(events,[['fixture-thread',true],['fixture-thread',false]]);
});
for (const method of ['turn/completed','thread/archived','thread/closed','thread/deleted']) test(`${method} tears down matching thread only`,()=>{
 const c=new BrowserPIPController();c.handle(sample());c.handle(sample({threadID:'other'}));
 c.handle({method,params:{threadId:'fixture-thread'}});assert.deepEqual(c.snapshot().activeThreads,['other']);
});
test('explicit sessionEnded removes state, even with a screenshot',()=>{
 const c=new BrowserPIPController();c.handle(sample());const e=sample();e.params.item.result._meta['codex/toolSurface'].sessionEnded=true;
 c.handle(e);assert.equal(c.snapshot().frames.length,0);
});
test('iab click routes exact original target instead of forwarding coordinates into thumbnail',async()=>{
 let target;const c=new BrowserPIPController({onFocus:x=>{target=x;return true;}});c.handle(sample());
 assert.equal(await c.click(presentationID('fixture-thread','fixture-browser','fixture-tab')),true);
 assert.deepEqual(target,{backend:'iab',sessionID:'fixture-thread',tabID:'fixture-tab'});
});
test('chrome click requires extensionInstanceId',async()=>{
 const c=new BrowserPIPController({onFocus:()=>true});c.handle(sample({backend:'chrome'}));
 assert.equal(await c.click(presentationID('fixture-thread','fixture-browser','fixture-tab')),false);
 c.handle(sample({backend:'chrome',extensionInstanceId:'local-extension'}));
 assert.equal(await c.click(presentationID('fixture-thread','fixture-browser','fixture-tab')),true);
});
test('malformed, wrong-server and non-completed events are ignored',()=>{
 const values=[{},null,{method:'item/started'},sample({imageDataURL:'https://remote/image.png'}),sample({backend:'unknown'})];
 for(const e of values)assert.equal(parseBrowserNotification(e),null);
 assert.equal(parseBrowserNotification(sample(),()=>false),null);
});
test('dispose is terminal and clears frames, sessions and targets',()=>{
 const c=new BrowserPIPController();c.handle(sample());c.dispose();assert.deepEqual(c.snapshot(),{frames:[],activeThreads:[],sessionCount:0});
 assert.equal(c.handle(sample()),false);
});
test('open tabs without screenshot activate session but do not invent a frame',()=>{
 const c=new BrowserPIPController();c.handle(note({openTabIds:['a']}));assert.equal(c.snapshot().frames.length,0);assert.equal(c.snapshot().sessionCount,1);
});
test('cdp and mcpapps metadata display images but have no native focus mapping',async()=>{
 for(const backend of ['cdp','mcpapps']){const c=new BrowserPIPController({onFocus:()=>true});c.handle(sample({backend}));assert.equal(c.snapshot().frames.length,1);assert.equal(await c.click(presentationID('fixture-thread','fixture-browser','fixture-tab')),false)}
});
