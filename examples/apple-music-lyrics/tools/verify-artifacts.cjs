#!/usr/bin/env node
'use strict';
/** Recheck hash bindings and decode every delivered video/GIF frame. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const R=require('./render.cjs');
function checkFiles(dir,manifest){for(const [file,hash]of Object.entries(manifest.outputs))assert.equal(R.sha256(path.join(dir,file)),hash,`Artifact hash mismatch: ${file}`);}
function checkHarness(manifest){for(const [file,hash]of Object.entries(manifest.harness))assert.equal(R.sha256(path.join(R.ROOT,file)),hash,`Harness changed after rendering: ${file}`);}
async function main(){
  const flags=R.args(process.argv.slice(2)),preview=path.resolve(flags.preview||path.join(R.ROOT,'preview')),comparison=flags.comparison?path.resolve(flags.comparison):null;
  const manifest=JSON.parse(fs.readFileSync(path.join(preview,'render-manifest.json'),'utf8')),core=R.loadCore();
  assert.deepEqual(R.coreHashes(),manifest.core,'Shared core changed after preview rendering');checkHarness(manifest);checkFiles(preview,manifest);
  const svgVerification=[],pixelVerification=[];
  for(const frame of manifest.frames){const svg=core.scene.render(core.motion.referenceAt(frame.time),{device:false});assert.equal(R.bufferHash(svg),frame.svgSha256,`Shared-scene SVG mismatch at PTS ${frame.pts}`);svgVerification.push(frame.pts);}
  for(const index of [...new Set([0,Math.floor(manifest.frames.length/2),manifest.frames.length-1])]){const frame=manifest.frames[index],svg=core.scene.render(core.motion.referenceAt(frame.time),{device:false}),png=await R.sharp(Buffer.from(svg)).png().toBuffer();assert.equal(R.bufferHash(png),frame.rasterSha256,`Repeated raster mismatch at PTS ${frame.pts}`);pixelVerification.push({pts:frame.pts,sha256:R.bufferHash(png)});}
  const mediaChecks=[];
  for(const suffix of ['mp4','gif']){const decoded=R.decodeCheck(path.join(preview,'loop.'+suffix));assert.equal(decoded.decodedFrameCount,manifest.timing.frameCount);assert.equal(decoded.width,core.width);assert.equal(decoded.height,core.height);assert.equal(decoded.completeDecodeSha256,manifest.timing[suffix].completeDecodeSha256);mediaChecks.push({file:'preview/loop.'+suffix,decodedFrameCount:decoded.decodedFrameCount,audioStreams:decoded.audioStreams,durationSeconds:decoded.durationSeconds});}
  let comparisonBinding=null;
  if(comparison){const cm=JSON.parse(fs.readFileSync(path.join(comparison,'comparison-manifest.json'),'utf8'));assert.deepEqual(cm.core,manifest.core,'Comparison and preview use different shared cores');assert.equal(cm.source.sha256,manifest.source.sha256,'Comparison and preview use different source media');assert.deepEqual(cm.frames.map(f=>f.pts),manifest.frames.map(f=>f.pts),'Comparison and preview use different source PTS');checkHarness(cm);checkFiles(comparison,cm);for(const suffix of ['mp4','gif']){const decoded=R.decodeCheck(path.join(comparison,'source-vs-replica-geometry.'+suffix));assert.equal(decoded.decodedFrameCount,cm.timing.frameCount);assert.equal(decoded.completeDecodeSha256,cm.timing[suffix].completeDecodeSha256);mediaChecks.push({file:'source-vs-replica-geometry.'+suffix,decodedFrameCount:decoded.decodedFrameCount,audioStreams:decoded.audioStreams,durationSeconds:decoded.durationSeconds});}comparisonBinding={comparisonManifestSha256:R.sha256(path.join(comparison,'comparison-manifest.json')),sourceSha256:cm.source.sha256,coverage:cm.coverage.framesWithMeasurements};}
  // Source media belongs outside the example; reject exact source bytes or obvious private assets.
  const sourceHash=manifest.source?.sha256;const repositoryFiles=R.walk(R.ROOT);const forbidden=repositoryFiles.filter(f=>/(^|\/)(private-|source-frames|source-\d+\.png|reference\/)/.test(path.relative(R.ROOT,f))||sourceHash&&R.sha256(f)===sourceHash);assert.equal(forbidden.length,0,`Private source material in example: ${forbidden.join(', ')}`);
  const report={passed:true,previewManifestSha256:R.sha256(path.join(preview,'render-manifest.json')),comparisonBinding,core:manifest.core,sharedSceneSvgFramesVerified:svgVerification.length,deterministicRasterChecks:pixelVerification,mediaChecks,sourceMediaBytesPresent:false,scope:'Offline deterministic SVG/PNG checks and complete MP4/GIF media decode. This does not verify browser events or claim pixel identity with Apple source.',verifierSha256:R.sha256(__filename)};
  const output=path.resolve(flags.out||path.join(R.ROOT,'validation/artifact-verification.json'));fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
