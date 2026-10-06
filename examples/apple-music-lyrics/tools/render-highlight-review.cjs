#!/usr/bin/env node
'use strict';
/** Diagnostic comparison only. Authored text is rendered by the unmodified shared
 * scene in each core. Source video is probed for PTS only; its pixels, glyphs and
 * words are never embedded. The source column visualizes a numeric fitted field.
 */
const fs = require('node:fs');
const path = require('node:path');
const R = require('./render.cjs');
const RATE = .25;
const W = 1468, H = 478, PW = 468, MARGIN = 16, GAP = 16;
const CROP = {left:28, top:230, width:348, height:100};
const SCALE = 1.25, CROP_W = 435, CROP_H = 125, CROP_Y = 145;
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const clamp = x => Math.max(0,Math.min(1,x));
const fmt = (n,d=1) => Number.isFinite(n) ? n.toFixed(d) : 'n/a';
function baselineCore(root) {
  const motion = require(path.join(root,'src/motion.js'));
  const scene = require(path.join(root,'src/scene.js'));
  return {motion,scene};
}
function baselineHashes(root) {
  return Object.fromEntries(['motion.js','scene.js','calibration-data.js'].map(f=>['src/'+f,R.sha256(path.join(root,'src',f))]));
}
function numericSamples(doc) {
  if(!Array.isArray(doc.samples)) throw new Error('Expected numeric field samples');
  const map = new Map();
  for(const sample of doc.samples) {
    if(!Number.isInteger(sample.pts)) throw new Error('Every numeric source field needs original integer PTS');
    const key = `${sample.pts}:${sample.line}`;
    if(map.has(key)) throw new Error('Duplicate numeric source field '+key);
    map.set(key,sample);
  }
  return map;
}
function recordedSourceTimeline(doc,first,last) {
  const clock=R.rational(doc.coverage?.timeBase||'1/30000');
  const samples=new Map();
  for(const sample of doc.samples) {
    if(sample.frame<first||sample.frame>last)continue;
    if(!Number.isInteger(sample.frame)||!Number.isInteger(sample.pts))throw new Error('Recorded source frame/PTS must be integers');
    if(samples.has(sample.frame)&&samples.get(sample.frame)!==sample.pts)throw new Error('Conflicting recorded source PTS');
    samples.set(sample.frame,sample.pts);
  }
  const items=[...samples].sort((a,b)=>a[0]-b[0]);
  if(items.length!==last-first+1||items[0]?.[0]!==first||items.at(-1)?.[0]!==last)throw new Error('Recorded source frame coverage is incomplete');
  const step=1001/30000,frames=items.map(([frame,pts],index)=>({index,pts,time:pts*clock.numerator/clock.denominator,duration:step,timeBase:doc.coverage?.timeBase||'1/30000',file:`${String(index).padStart(6,'0')}.png`}));
  R.validateFrames(frames);
  return frames;
}
function sourceField(sample,x) {
  if(sample.state==='complete') return 1;
  if(sample.state==='unlit'||sample.state==='below_detection') return 0;
  if(Number.isFinite(sample.front50)&&Number.isFinite(sample.feather)&&sample.feather>0) {
    return clamp((sample.gain??1)*clamp((sample.front50-x)/sample.feather+.5));
  }
  return null;
}
function text(x,y,value,size=16,color='#b4bdc9',weight=400) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(value)}</text>`;
}
function sourceRibbon(sample,geometry,x,y,width,height) {
  let body='';
  for(let j=0;j<Math.ceil(width);j++) {
    const value=sourceField(sample,(j+.5)/width*geometry.width);
    const gray=value===null?68:Math.round(72+176*value);
    body+=`<rect x="${(x+j).toFixed(3)}" y="${y.toFixed(3)}" width="1.1" height="${height}" fill="rgb(${gray},${gray},${gray})"/>`;
  }
  body+=`<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="#6c7480" stroke-width=".6"/>`;
  if(Array.isArray(sample.frontDataInterval)) {
    const a=x+sample.frontDataInterval[0]/geometry.width*width;
    const b=x+sample.frontDataInterval[1]/geometry.width*width;
    body+=`<path d="M${a} ${y+height+6}h${b-a} M${a} ${y+height+3}v6 M${b} ${y+height+3}v6" stroke="#89baff" stroke-width="1.5"/>`;
  }
  return body;
}
function previewSvg({frame,index,count,oldState,newState,fields,doc}) {
  const panels=[MARGIN,MARGIN+PW+GAP,MARGIN+2*(PW+GAP)];
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="font-family:Inter,Arial,sans-serif"><rect width="${W}" height="${H}" fill="#10141b"/>`;
  svg+=text(24,36,'Highlight edge review',26,'#f6f8fc',700);
  svg+=text(24,64,'0.25× playback · original source frames · B1 / B2 close-up',16,'#bcc8d8');
  svg+=text(W-480,34,`Source ${frame.time.toFixed(6)} s  /  frame ${frame.pts/1001}`,16,'#e0e7f2');
  svg+=text(W-480,60,`Presentation ${((frame.time-(frame.firstTime??frame.time))/RATE).toFixed(3)} s`,14);
  for(const x of panels) svg+=`<rect x="${x}" y="86" width="${PW}" height="310" rx="10" fill="#191f29" stroke="#303a49"/>`;
  svg+=text(panels[0]+16,116,'Source: numeric field fit',21,'#dbeaff',700);
  svg+=text(panels[1]+16,116,'Before: hard clip',21,'#ffd7bf',700);
  svg+=text(panels[2]+16,116,'After: shared runtime',21,'#c8f4df',700);
  svg+=text(panels[0]+16,137,'Geometric ribbons; source glyphs omitted',13);
  svg+=text(panels[1]+16,137,'Original authored text · exact archived scene',13);
  svg+=text(panels[2]+16,137,'Original authored text · exact updated scene',13);
  const ids=['B1','B2'];
  for(let i=0;i<ids.length;i++) {
    const id=ids[i],sample=fields.get(`${frame.pts}:${id}`),geometry=doc.lines[id];
    if(!sample||!geometry) throw new Error(`Missing source field ${frame.pts}:${id}`);
    const line=newState.lines.find(l=>l.id===id);
    const x=panels[0]+16+(geometry.x_origin_crop-CROP.left)*SCALE;
    const y=CROP_Y+(line.y-CROP.top+2)*SCALE;
    svg+=sourceRibbon(sample,geometry,x,y,geometry.width*SCALE,31*SCALE);
    const sourceStatus=sample.state==='below_detection'?'below detection, shown dark':sample.state==='complete'?'complete; edge unidentifiable':sample.state.replaceAll('_',' ');
    svg+=text(panels[0]+16,319+i*23,`${id}: ${sourceStatus}${Number.isFinite(sample.feather)?' · feather '+fmt(sample.feather)+' px':''}`,14);
    const before=oldState.lines.find(l=>l.id===id);
    svg+=text(panels[1]+16,319+i*23,`${id}: hard edge ${(before.w*before.highlight).toFixed(1)} px`,14);
    const after=newState.lines.find(l=>l.id===id);
    const feather=Number.isFinite(after.highlightStart)&&Number.isFinite(after.highlightEnd)?(after.highlightEnd-after.highlightStart)*after.w:Number.isFinite(after.highlightFeather)?after.highlightFeather*(after.w-8):null;
    const afterStatus=after.highlightGain===0?'highlight off':after.highlight>=1?'fully lit':Number.isFinite(feather)?'feather '+fmt(feather)+' px · gain '+fmt(after.highlightGain,2):'continuous field from shared core';
    svg+=text(panels[2]+16,319+i*23,`${id}: ${afterStatus}`,14);
  }
  svg+=text(panels[0]+16,378,'Blue brackets: measured 0.6–0.4 field interval',12,'#89baff');
  svg+=text(panels[1]+16,378,'Frozen pre-fix core; no export-side easing',12);
  svg+=text(panels[2]+16,378,'Same function used by the interactive page',12);
  svg+=text(24,423,'Source fit is an estimate between glyph samples. It is not Apple’s implementation or a source-screen replay.',14);
  svg+=text(24,446,'Every source frame is shown once for 4× its native duration. GIF repetition adds an explicit end-to-start reset.',14);
  svg+=`<rect x="24" y="462" width="${W-48}" height="4" rx="2" fill="#344053"/><rect x="24" y="462" width="${(W-48)*(index+1)/count}" height="4" rx="2" fill="#8fbbef"/>`;
  return svg+'</svg>';
}
function outputTiming(frames,media) {
  const interval=frames[0].duration/RATE;
  const expected=frames.map((_,i)=>Math.round((i+1)*interval*100)-Math.round(i*interval*100));
  const actual=media.gif.packets.map(p=>Math.round(Number(p.duration_time)*100));
  if(JSON.stringify(expected)!==JSON.stringify(actual)) throw new Error('Slow GIF delays do not match exact cumulative 0.25× timing');
  const idealDuration=frames.length*interval;
  if(media.mp4.decodedFrameCount!==frames.length||media.gif.decodedFrameCount!==frames.length) throw new Error('Review frame correspondence changed');
  if(Math.abs(media.mp4.durationSeconds-idealDuration)>.0011) throw new Error('Review MP4 is not 0.25×');
  let sum=0,maxBoundaryError=0;
  actual.forEach((delay,i)=>{maxBoundaryError=Math.max(maxBoundaryError,Math.abs(sum-i*interval));sum+=delay/100;});
  return {playbackRate:RATE,nativeSourceFrameDuration:frames[0].duration,reviewFrameDuration:interval,sourceDurationSeconds:frames.length*frames[0].duration,idealReviewDurationSeconds:idealDuration,sourceFrameCount:frames.length,sourcePtsUnchanged:true,syntheticFrames:0,duplicatedFrames:0,gifDelayCentiseconds:actual,gifMaximumBoundaryErrorSeconds:maxBoundaryError,gifDurationErrorSeconds:media.gif.durationSeconds-idealDuration,mp4:media.mp4,gif:media.gif};
}
async function main() {
  const flags=R.args(process.argv.slice(2));
  const baseline=path.resolve(flags['baseline-root']||flags['old-root']||path.join(R.ROOT,'validation/highlight-v0')),old=baselineCore(baseline),current=R.loadCore();
  const fitPath=path.resolve(flags.measurements||path.join(R.ROOT,'validation/highlight-field-fit.json')),fitHash=R.sha256(fitPath);
  const doc=JSON.parse(fs.readFileSync(fitPath,'utf8')),fields=numericSamples(doc);
  const first=Number(flags['start-frame']??548),last=Number(flags['end-frame']??614);
  const recordedFrames=recordedSourceTimeline(doc,first,last);
  const source=flags.source?R.sourceTimeline(path.resolve(flags.source),first*1001/30000,(last+1)*1001/30000):{frames:recordedFrames,source:{sha256:current.spec.sourceSha256,stream:{time_base:recordedFrames[0].timeBase}},fps:'30000/1001'};
  if(source.source.sha256!==current.spec.sourceSha256) throw new Error('Review source does not match current core provenance');
  if(JSON.stringify(source.frames.map(f=>f.pts))!==JSON.stringify(recordedFrames.map(f=>f.pts)))throw new Error('Direct source PTS differ from numeric fit records');
  const frames=source.frames,out=path.resolve(flags.out||path.join(R.ROOT,'preview/highlight-review')),frameDir=path.join(out,'frames');
  fs.mkdirSync(frameDir,{recursive:true});
  for(const name of fs.readdirSync(frameDir)) if(/^\d{6}\.png$/.test(name)) fs.unlinkSync(path.join(frameDir,name));
  const before=R.coreHashes(),oldBefore=baselineHashes(baseline),hashes=[];
  for(const frame of frames) {
    const oldState=old.motion.referenceAt(frame.time),newState=current.motion.referenceAt(frame.time);
    const oldSvg=old.scene.render(oldState),newSvg=current.scene.render(newState);
    const raster=async svg=>R.sharp(Buffer.from(svg)).extract(CROP).resize(CROP_W,CROP_H,{fit:'fill'}).png().toBuffer();
    const oldCrop=await raster(oldSvg),newCrop=await raster(newSvg);
    const card=previewSvg({frame:{...frame,firstTime:frames[0].time},index:frame.index,count:frames.length,oldState,newState,fields,doc});
    const file=path.join(frameDir,frame.file);
    await R.sharp(Buffer.from(card)).composite([{input:oldCrop,left:MARGIN+PW+GAP+16,top:CROP_Y},{input:newCrop,left:MARGIN+2*(PW+GAP)+16,top:CROP_Y}]).png().toFile(file);
    hashes.push({sourcePts:frame.pts,sourceTime:frame.time,oldSceneSha256:R.bufferHash(oldSvg),newSceneSha256:R.bufferHash(newSvg),reviewRasterSha256:R.sha256(file)});
  }
  if(JSON.stringify(before)!==JSON.stringify(R.coreHashes())||JSON.stringify(oldBefore)!==JSON.stringify(baselineHashes(baseline))||fitHash!==R.sha256(fitPath)) throw new Error('A shared core or source fit changed during review rendering; freeze and rerun');
  const stem=path.join(out,'highlight-review-0.25x');
  const media=R.encodeSequence(frameDir,stem,{fps:'7500/1001',timeBase:'1/30000',width:W,height:H,frameCount:frames.length});
  // GIF muxers otherwise reuse the penultimate delay. Correct only the last hold
  // to the exact cumulatively rounded quarter-speed presentation boundary.
  const finalCs=Math.round(frames.length*frames[0].duration/RATE*100)-Math.round((frames.length-1)*frames[0].duration/RATE*100);
  const bytes=fs.readFileSync(stem+'.gif');
  // Find the final graphic-control extension structurally, never by a byte search
  // inside compressed image data.
  let p=13+(bytes[10]&128?3*(1<<((bytes[10]&7)+1)):0),lastGce=null;
  const subblocks=()=>{while(p<bytes.length){const n=bytes[p++];if(!n)break;p+=n;}};
  while(p<bytes.length){const marker=bytes[p++];if(marker===0x3b)break;if(marker===0x21){const label=bytes[p++];if(label===0xf9){if(bytes[p]!==4)throw new Error('Unexpected GIF GCE');lastGce=p+2;}subblocks();}else if(marker===0x2c){const packed=bytes[p+8];p+=9;if(packed&128)p+=3*(1<<((packed&7)+1));p++;subblocks();}else throw new Error('Malformed GIF block');}
  if(lastGce===null)throw new Error('GIF has no frame delay');bytes.writeUInt16LE(finalCs,lastGce);fs.writeFileSync(stem+'.gif',bytes);
  media.gif=R.decodeCheck(stem+'.gif');
  const timing=outputTiming(frames,media);
  const posterIndex=Math.min(frames.length-1,Math.max(0,558-first));
  fs.copyFileSync(path.join(frameDir,frames[posterIndex].file),path.join(out,'poster.png'));
  const manifest={schemaVersion:1,purpose:'0.25× diagnostic highlight close-up; not native-speed preview',renderMethod:'Exact old and new scene.render(motion.referenceAt(sourcePTS)) raster crops. Numeric source field ribbons omit all source glyphs, lyrics and source pixels.',source:{sha256:source.source.sha256,timeBase:source.source.stream.time_base,firstFrame:first,lastFrameInclusive:last,sourceBytesVerified:!!flags.source,ptsVerification:flags.source?'Direct source probing agrees with every stored fit PTS':'Original integer PTS retained in numeric fit; original video bytes not required'},sourceFit:{sha256:fitHash,field:doc.field,uncertainty:doc.uncertainty,diagramConventions:'Below-detection fields are shown dark for clarity; this does not establish exactly zero source brightness. Complete fields are shown fully lit without claiming a terminal edge or width.'},core:before,baselineCore:oldBefore,harness:{'tools/render-highlight-review.cjs':R.sha256(__filename),'tools/render.cjs':R.sha256(path.join(__dirname,'render.cjs'))},crop:{...CROP,outputWidth:CROP_W,outputHeight:CROP_H},timing,frames:frames.map((f,i)=>({...f,...hashes[i],reviewPts:i*4004,reviewTime:i*4004/30000})),outputs:Object.fromEntries(['highlight-review-0.25x.gif','highlight-review-0.25x.mp4','poster.png'].map(f=>[f,R.sha256(path.join(out,f))]))};
  fs.writeFileSync(path.join(out,'review-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  if(!flags['keep-frames'])fs.rmSync(frameDir,{recursive:true});
  console.log(JSON.stringify({out,frames:frames.length,playbackRate:RATE,sourceDuration:timing.sourceDurationSeconds,reviewDuration:timing.idealReviewDurationSeconds,gifDuration:media.gif.durationSeconds,dimensions:[W,H]},null,2));
}
module.exports={numericSamples,recordedSourceTimeline,sourceField,outputTiming,previewSvg,baselineHashes};
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
