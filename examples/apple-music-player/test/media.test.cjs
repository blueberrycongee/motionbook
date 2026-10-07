'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const R=require('../tools/render.cjs');
const C=require('../tools/build-comparison.cjs');
const assertRuntimeBinding=require('./runtime-binding.cjs');

test('native source timeline uses original rational PTS, never rounded 30 fps',()=>{
  const frames=R.timeline(539,549);
  assert.equal(frames.length,300);
  assert.equal(frames[0].pts,16170154);
  assert.equal(frames[0].time,16170154/30000);
  for(let i=1;i<frames.length;i++)assert.equal(frames[i].pts-frames[i-1].pts,1001);
  assert.ok(frames[0].time>=539&&frames.at(-1).time<549);
  assert.throws(()=>R.timeline(1,1));
});
test('GIF centisecond quantization preserves real source duration within 5 ms',()=>{
  for(const count of [1,2,150,300,1000]){
    const delays=R.gifDelays(count);
    assert.ok(delays.every(x=>x===3||x===4));
    assert.ok(Math.abs(delays.reduce((a,b)=>a+b,0)/100-count*1001/30000)<=.005+1e-9);
  }
});
test('residuals retain holdouts and missing measurements do not become zeros',()=>{
  const motion={referenceAt:()=>({cover:{x:10,y:20,size:30},card:{x:0,y:40,w:432,h:894}})};
  const report=C.geometryReport([
    {pts:1001,time:1001/30000,split:'fit',album:{x:9,y:22,width:28,height:29},sheetTop:43},
    {pts:2002,time:2002/30000,split:'holdout',album:{x:12,y:18,width:33,height:30}},
  ],motion);
  assert.equal(report.rows.length,2);
  assert.equal(report.rows[0].residual.coverX,1);
  assert.equal(report.rows[1].residual.coverX,-2);
  assert.equal(report.rows[1].residual.cardY,null);
  assert.equal(report.statistics.fit.fields.cardY.count,1);
  assert.equal(report.statistics.holdout.fields.cardY.count,0);
  assert.equal(report.statistics.holdout.fields.cardY.mae,null);
  assert.equal(report.statistics.all.fields.coverX.mae,1.5);
  assert.equal(report.statistics.all.fields.backgroundScale.count,0);
});
test('raw pixel diagnostic reports RGB levels rather than a misleading similarity percent',()=>{
  assert.equal(C.pixelDifference(Buffer.from([0,0,0]),Buffer.from([255,255,255])).meanAbsoluteRGB,255);
  assert.equal(C.pixelDifference(Buffer.from([12,34,56]),Buffer.from([12,34,56])).meanAbsoluteRGB,0);
  assert.throws(()=>C.pixelDifference(Buffer.from([1]),Buffer.from([1,2])));
});
test('shared SVG produces deterministic 432×934 raster at identical real source time',async t=>{
  if(!fs.existsSync(path.join(R.ROOT,'src/scene.js'))) { t.skip('Shared scene not yet present'); return; }
  const {motion,scene}=R.loadCore();
  const state=motion.referenceAt((motion.referenceSpec.start+motion.referenceSpec.end)/2);
  const svg=scene.render(state,{device:false});
  const one=await R.sharp(Buffer.from(svg)).png().toBuffer();
  const two=await R.sharp(Buffer.from(scene.render(motion.referenceAt((motion.referenceSpec.start+motion.referenceSpec.end)/2),{device:false}))).png().toBuffer();
  assert.deepEqual(one,two);
  const info=await R.sharp(one).metadata();assert.equal(info.width,432);assert.equal(info.height,934);
});
test('media encoding preserves frame cadence and complete duration',async t=>{
  if(!process.env.TEST_MEDIA_ENCODER) { t.skip('Set TEST_MEDIA_ENCODER=1 to run ffmpeg encoding QA'); return; }
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'apple-music-media-test-'));
  try{
    const frames=R.timeline(542,542.5);
    const frameDir=path.join(dir,'frames');fs.mkdirSync(frameDir);
    for(const frame of frames)await R.sharp({create:{width:432,height:934,channels:3,background:{r:frame.index*13,g:70,b:90}}}).png().toFile(path.join(frameDir,frame.file));
    const media=R.encodeSequence(frameDir,path.join(dir,'test'));
    assert.equal(media.mp4.streams[0].nb_frames,String(frames.length));
    assert.equal(media.mp4.streams[0].r_frame_rate,'30000/1001');
    assert.ok(Math.abs(Number(media.mp4.streams[0].duration)-frames.length*1001/30000)<.001);
    assert.ok(Math.abs(Number(media.gif.format.duration)-frames.length*1001/30000)<=.011);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('preview preserves render provenance and binds the current equivalent runtime and media',t=>{
  const file=path.join(R.ROOT,'preview/render-manifest.json');
  if(!fs.existsSync(file)){ t.skip('No preview manifest has been rendered yet'); return; }
  const manifest=JSON.parse(fs.readFileSync(file));
  const {motion,scene}=R.loadCore();assertRuntimeBinding(R,manifest,motion,scene);
  for(const [name,hash] of Object.entries(manifest.outputs))assert.equal(R.sha256(path.join(R.ROOT,'preview',name)),hash);
  assert.equal(manifest.timing.frameRate,'30000/1001');
  assert.equal(manifest.timing.playbackRate,1);
  assert.ok(Math.abs(manifest.timing.gifQuantization.durationErrorSeconds)<=.011);
});
