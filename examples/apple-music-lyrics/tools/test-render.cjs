#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const R=require('./render.cjs');
async function main(){
  const results=[],temp=fs.mkdtempSync(path.join(os.tmpdir(),'lyrics-render-test-'));
  try{
    const frames=R.timeline(1001/30000*10,1001/30000*40,{fps:'30000/1001',timeBase:'1/30000'});
    assert.equal(frames.length,30);assert.equal(frames[0].pts,10010);assert.equal(frames.at(-1).pts,39039);R.validateFrames(frames);
    assert.throws(()=>R.validateFrames([{...frames[0],time:42}]),/PTS\/time mismatch/);
    assert.throws(()=>R.validateFrames([frames[0],{...frames[1],time:frames[1].time+.001,pts:frames[1].pts+30}]),/Nonuniform/);
    results.push({name:'Rational source PTS preserved; malformed timeline rejected',passed:true});
    for(const fps of ['30000/1001','25/1','24/1']){
      const rate=R.rational(fps),timeline=R.timeline(0,1,{fps,timeBase:`1/${rate.numerator}`});
      const core={motion:{referenceAt:t=>({t})},scene:{render:s=>`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#171723"/><circle cx="${3+s.t*25}" cy="16" r="3" fill="#ffdd88"/></svg>`}};
      const folder=path.join(temp,fps.replace('/','-'));const rendered=await R.renderSequence({frames:timeline,out:folder,...core,width:32,height:32});
      const repeated=path.join(temp,'repeated');await R.renderSequence({frames:timeline.slice(0,1),out:repeated,...core,width:32,height:32});
      assert.equal(rendered.hashes[0].rasterSha256,R.sha256(path.join(repeated,'000000.png')));
      const media=R.encodeSequence(folder,path.join(temp,'out-'+fps.replace('/','-')),{fps,timeBase:timeline[0].timeBase,width:32,height:32,frameCount:timeline.length});
      const timing=R.timingManifest(timeline,media);
      results.push({name:`Native ${fps} fps rendering, deterministic pixels, silent full-media decode and GIF timing`,passed:true,frames:timeline.length,durationSeconds:timing.durationSeconds,gifDurationErrorSeconds:timing.gifQuantization.durationErrorSeconds,maxGifBoundaryErrorSeconds:timing.gifQuantization.maximumFrameBoundaryErrorSeconds});
    }
    const report={harnessSha256:R.sha256(path.join(__dirname,'render.cjs')),testSha256:R.sha256(__filename),results,allPassed:results.every(r=>r.passed)};
    fs.mkdirSync(path.join(R.ROOT,'validation'),{recursive:true});fs.writeFileSync(path.join(R.ROOT,'validation','render-harness-tests.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
