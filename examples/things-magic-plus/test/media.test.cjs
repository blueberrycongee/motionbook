'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),M=require('../src/motion.js'),S=require('../src/scene.js'),R=require('../tools/render.cjs');
const assertRuntimeBinding=require('./runtime-binding.cjs');
test('native PTS stays integer at 30 fps and 1/30000 time base',()=>{const f=R.timeline(0,7.5,{fps:'30/1',timeBase:'1/30000'});assert.equal(f.length,225);assert.equal(f.at(-1).pts,224000);f.forEach((r,i)=>assert.equal(r.pts,i*1000));R.validateFrames(f);});
test('source-backed channels are wired into the actual scene',()=>{const s=M.referenceAt(25/30),svg=S.render(s);assert(svg.includes(`y="${Number(s.gapY.toFixed(3))}"`));assert(svg.includes(`height="${Number(s.gapHeight.toFixed(3))}"`));assert(svg.includes(`y="${Number((617+s.addRowOffset-9.5).toFixed(3))}"`));const opening=M.referenceAt(58/30);assert(S.render(opening).includes(`width="${opening.editorW}"`));});
test('offline shared scene raster is deterministic and 500 by 888',async()=>{const scene=Buffer.from(S.render(M.referenceAt(1.5)));const a=await R.sharp(scene).png().toBuffer(),b=await R.sharp(scene).png().toBuffer();assert.deepEqual(a,b);const p=await R.sharp(a).metadata();assert.equal(p.width,500);assert.equal(p.height,888);});
test('measured press contraction, overshoot, hold and list scroll remain present',()=>{assert(M.referenceAt(7/30).plusR<M.referenceAt(0).plusR);assert(M.referenceAt(11/30).plusR>52);assert(M.referenceAt(45/30).plusX<274);assert(M.referenceAt(45/30).plusX>272);assert.equal(M.referenceAt(63/30).scroll,174);assert.equal(M.referenceAt(7).scroll,121);});
test('first-slot row stagger and final slot are retained',()=>{const a=M.referenceAt(23/30),b=M.referenceAt(25/30),c=M.referenceAt(30/30);assert.equal(a.addRowOffset,0);assert(a.readRowOffset>0);assert(b.addRowOffset>0);assert.equal(b.planningOffset,0);assert(c.planningOffset>0);assert.equal(M.referenceAt(37/30).gapY,485);});
test('reference editor opens from a narrow white seed into full width',()=>{const a=M.referenceAt(57/30),b=M.referenceAt(58/30),c=M.referenceAt(2.4);assert(a.editorW<b.editorW);assert(b.editorW<c.editorW);assert.equal(c.editorW,500);assert.equal(c.editorTop,352);assert.equal(c.editorH,208);assert.equal(c.keyboardY,600);});
test('normal preview preserves render provenance and binds the current equivalent runtime and media',()=>{const p=path.join(R.ROOT,'preview/render-manifest.json');assert(fs.existsSync(p),'Render is required, not silently skipped');const x=JSON.parse(fs.readFileSync(p));assertRuntimeBinding(R,x,M,S);assert.equal(x.harness['tools/render.cjs'],R.sha256(path.join(R.ROOT,'tools/render.cjs')));assert.equal(x.source.sha256,M.referenceSpec.sourceSha256);for(const[f,h]of Object.entries(x.outputs))assert.equal(R.sha256(path.join(R.ROOT,'preview',f)),h);assert.equal(x.timing.playbackRate,1);assert.equal(x.timing.frameCount,225);assert.equal(x.timing.gif.decodedFrameCount,225);assert.equal(x.timing.mp4.decodedFrameCount,225);assert(x.timing.gifQuantization.maximumFrameBoundaryErrorSeconds<=.015001);R.validateFrames(x.frames);});
test('public bundle retains source PTS, fully decodes normal media, and excludes reference pixels',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(R.ROOT,'preview/render-manifest.json')));
  const source=JSON.parse(fs.readFileSync(path.join(R.ROOT,'validation/source_manifest.json')));
  const retained=JSON.parse(fs.readFileSync(path.join(R.ROOT,'validation/frame_pts_0-7.5s.json'))).frames;
  assert.equal(source.sha256,M.referenceSpec.sourceSha256);
  assert.equal(source.sha256,manifest.source.sha256);
  assert.equal(source.fps,'30/1');assert.equal(source.time_base,'1/30000');
  assert.equal(retained.length,226);assert.equal(retained.at(-1).pts,225000);
  assert.equal(manifest.frames.length,225);
  retained.forEach((f,i)=>{assert.equal(f.pts,i*1000);assert.equal(f.duration,1000);});
  manifest.frames.forEach((f,i)=>{assert.equal(f.pts,retained[i].pts);assert.equal(f.timeBase,source.time_base);assert(Math.abs(f.time-f.pts/30000)<1e-10);});
  const decoded={};
  for(const format of ['gif','mp4']){
    const actual=decoded[format]=R.decodeCheck(path.join(R.ROOT,'preview',`loop.${format}`));
    assert.equal(actual.width,500);assert.equal(actual.height,888);
    assert.equal(actual.decodedFrameCount,225);assert.equal(actual.audioStreams,0);
    assert.equal(actual.durationSeconds,7.5);
    assert.equal(actual.timeBase,format==='gif'?'1/100':'1/30000');
    for(const key of ['width','height','decodedFrameCount','audioStreams','durationSeconds','timeBase'])assert.equal(actual[key],manifest.timing[format][key]);
  }
  const timing=R.timingManifest(manifest.frames,decoded);
  assert.equal(timing.playbackRate,1);
  assert(Math.abs(timing.gifQuantization.durationErrorSeconds)<1e-10);
  assert(timing.gifQuantization.maximumFrameBoundaryErrorSeconds<=.003334);
  for(const excluded of ['preview/comparison.gif','preview/comparison.mp4','preview/comparison-poster.png','preview/comparison-manifest.json','validation/comparison-contact-review.png'])assert(!fs.existsSync(path.join(R.ROOT,excluded)),`Excluded reference-pixel review artifact: ${excluded}`);
});
test('keyboard paints above returned plus and keeps its native occlusion',()=>{const svg=S.render(M.referenceAt(191/30));assert(svg.indexOf('id="magic-plus"')<svg.indexOf('id="keyboard"'));});
test('editor content scales with the white seed and navbar returns before shadow disappears',()=>{const s=M.referenceAt(58/30),svg=S.render(s);assert(svg.includes(`scale(${Number((s.editorW/500).toFixed(3))})`));const c=M.referenceAt(188/30);assert.equal(c.navigationAlpha,1);assert.equal(c.dismissAlpha,0);assert(c.editorAlpha>.9);});
