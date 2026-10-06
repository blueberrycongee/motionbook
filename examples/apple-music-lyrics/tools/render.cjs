#!/usr/bin/env node
'use strict';
/** Deterministic offline rasterization of the exact scene used by the runtime.
 * No browser interaction/rendering claim is made by this harness.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
if (!process.env.FONTCONFIG_FILE && fs.existsSync(path.join(ROOT, 'assets/fonts.conf'))) process.env.FONTCONFIG_FILE = path.join(ROOT, 'assets/fonts.conf');
let sharpModule;
function sharp(...args) { sharpModule ||= require('sharp'); return sharpModule(...args); }
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function bufferHash(data) { return crypto.createHash('sha256').update(data).digest('hex'); }
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
}
function coreHashes() { return Object.fromEntries(['src','assets'].flatMap(d=>walk(path.join(ROOT,d))).map(p=>[path.relative(ROOT,p).replaceAll(path.sep,'/'),sha256(p)])); }
function run(command,args,options={}) {
  const r=spawnSync(command,args,{encoding:'utf8',maxBuffer:128*1024*1024,...options});
  if(r.error||r.status!==0)throw new Error(`${command} failed: ${r.error||r.stderr||r.stdout}`);
  return r.stdout;
}
function args(argv) {
  const result={};
  for(let i=0;i<argv.length;i++) { if(!argv[i].startsWith('--'))throw new Error(`Unexpected argument: ${argv[i]}`); result[argv[i].slice(2)]=argv[i+1]&&!argv[i+1].startsWith('--')?argv[++i]:true; }
  return result;
}
function rational(value,fallback) {
  if(value===undefined||value===null)return rational(fallback);
  if(typeof value==='object')return {numerator:Number(value.numerator),denominator:Number(value.denominator)};
  const p=String(value).split('/').map(Number);
  if(p.some(x=>!Number.isFinite(x))||p[0]<=0||p[1]===0)throw new Error(`Invalid rational: ${value}`);
  return {numerator:p[0],denominator:p[1]??1};
}
function ratioString(r){return `${r.numerator}/${r.denominator}`;}
function loadCore() {
  const motion=require(path.join(ROOT,'src/motion.js')), scene=require(path.join(ROOT,'src/scene.js'));
  if(typeof motion.referenceAt!=='function'||typeof scene.render!=='function')throw new Error('Expected motion.referenceAt and shared scene.render');
  const spec=motion.referenceSpec||{};
  return {motion,scene,width:Number(motion.W||scene.W||spec.width),height:Number(motion.H||scene.H||spec.height),spec};
}
function probe(file) {return JSON.parse(run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',file]));}
function timeline(start,end,{fps='30000/1001',timeBase}={}) {
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)throw new Error('Invalid source-time range');
  const rate=rational(fps),clock=rational(timeBase||`1/${rate.numerator}`),step=rate.denominator/rate.numerator;
  const ticksPerFrame=step*clock.denominator/clock.numerator;
  if(Math.abs(ticksPerFrame-Math.round(ticksPerFrame))>1e-6)throw new Error('Source frame step is not integral in selected clock');
  const first=Math.ceil(start/step-1e-7),last=Math.ceil(end/step-1e-7);
  return Array.from({length:last-first},(_,i)=>({index:i,pts:Math.round((first+i)*ticksPerFrame),time:(first+i)*step,duration:step,timeBase:ratioString(clock),file:`${String(i).padStart(6,'0')}.png`}));
}
function sourceTimeline(source,start,end) {
  const p=probe(source),stream=p.streams.find(s=>s.codec_type==='video');
  if(!stream)throw new Error('Source has no video stream');
  const clock=rational(stream.time_base),fps=rational(stream.r_frame_rate),step=fps.denominator/fps.numerator;
  const readStart=Math.max(0,start-2),duration=end-readStart+2;
  const data=JSON.parse(run('ffprobe',['-v','error','-select_streams','v:0','-read_intervals',`${readStart}%+${duration}`,'-show_frames','-show_entries','frame=pts,best_effort_timestamp,pkt_duration,duration','-of','json',source]));
  const frames=data.frames.map(f=>{const pts=Number(f.pts??f.best_effort_timestamp);return {pts,time:pts*clock.numerator/clock.denominator};}).filter(f=>f.time>=start-1e-8&&f.time<end-1e-8).map((f,index)=>({...f,index,duration:step,timeBase:stream.time_base,file:`${String(index).padStart(6,'0')}.png`}));
  if(!frames.length)throw new Error('No source frames in selected interval');
  const expectedStep=step*clock.denominator/clock.numerator;
  if(frames.some((f,i)=>i&&Math.abs(f.pts-frames[i-1].pts-expectedStep)>.01))throw new Error('Source is not constant cadence in selected range; do not replace real PTS with an assumed frame rate');
  return {frames,source:{sha256:sha256(source),stream},fps:ratioString(fps)};
}
function validateFrames(frames) {
  if(!frames.length)throw new Error('Empty frame list');
  const first=frames[0],step=first.duration;
  if(!Number.isFinite(step)||step<=0)throw new Error('Each frame needs a positive duration');
  for(let i=0;i<frames.length;i++) {
    const f=frames[i],clock=rational(f.timeBase);
    if(!Number.isInteger(f.pts)||Math.abs(f.time-f.pts*clock.numerator/clock.denominator)>1e-6)throw new Error(`PTS/time mismatch at frame ${i}`);
    if(i&&Math.abs(f.time-frames[i-1].time-step)>1e-6)throw new Error('Nonuniform frames are not supported by CFR encoder');
    if(Math.abs(f.duration-step)>1e-6)throw new Error('Nonuniform frame durations are not supported');
  }
}
async function renderSequence({frames,out,motion,scene,width,height,sceneOptions={}}) {
  validateFrames(frames);fs.mkdirSync(out,{recursive:true});
  for(const name of fs.readdirSync(out))if(/^\d{6}\.png$/.test(name))fs.unlinkSync(path.join(out,name));
  const hashes=[];
  for(const frame of frames) {
    const state=motion.referenceAt(frame.time),svg=scene.render(state,{device:false,...sceneOptions});
    if(typeof svg!=='string'||!svg.includes('<svg'))throw new Error('Shared scene did not return SVG');
    const result=await sharp(Buffer.from(svg)).png().toFile(path.join(out,frame.file));
    if(width&&result.width!==width||height&&result.height!==height)throw new Error(`Wrong scene bounds: ${result.width}×${result.height}`);
    width=result.width;height=result.height;
    hashes.push({pts:frame.pts,time:frame.time,svgSha256:bufferHash(svg),rasterSha256:sha256(path.join(out,frame.file))});
  }
  return {width,height,hashes};
}
function decodeCheck(file) {
  const info=probe(file),v=info.streams.find(s=>s.codec_type==='video');
  const audio=info.streams.filter(s=>s.codec_type==='audio');
  if(audio.length)throw new Error(`Unexpected audio in ${file}`);
  const md5=run('ffmpeg',['-v','error','-threads','1','-i',file,'-map','0:v:0','-f','framemd5','-']);
  const lines=md5.split('\n').filter(l=>l&&!l.startsWith('#'));
  const packets=JSON.parse(run('ffprobe',['-v','error','-select_streams','v:0','-show_packets','-show_entries','packet=pts_time,duration_time','-of','json',file])).packets;
  return {width:v.width,height:v.height,timeBase:v.time_base,frameRate:v.r_frame_rate,durationSeconds:Number(info.format.duration),decodedFrameCount:lines.length,audioStreams:0,completeDecodeSha256:bufferHash(md5),packets};
}
function encodeSequence(framesDir,outputStem,{fps='30000/1001',timeBase='1/30000',width,height,frameCount}={}) {
  fs.mkdirSync(path.dirname(outputStem),{recursive:true});
  const base=['-hide_banner','-loglevel','error','-y','-threads','1','-filter_threads','1','-framerate',String(fps),'-start_number','0','-i',path.join(framesDir,'%06d.png')];
  const clock=rational(timeBase);
  run('ffmpeg',[...base,'-an','-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-video_track_timescale',String(clock.denominator),'-movflags','+faststart',`${outputStem}.mp4`]);
  const palette=`${outputStem}.palette.png`;
  run('ffmpeg',[...base,'-vf','palettegen=stats_mode=full','-frames:v','1',palette]);
  run('ffmpeg',[...base,'-i',palette,'-filter_complex_threads','1','-lavfi','[0:v][1:v]paletteuse=dither=sierra2_4a:diff_mode=rectangle','-an','-fps_mode','passthrough','-loop','0',`${outputStem}.gif`]);
  fs.unlinkSync(palette);
  const media={mp4:decodeCheck(`${outputStem}.mp4`),gif:decodeCheck(`${outputStem}.gif`)};
  for(const [name,m]of Object.entries(media)) {
    if(width&&m.width!==width||height&&m.height!==height)throw new Error(`${name} dimensions changed`);
    if(frameCount&&m.decodedFrameCount!==frameCount)throw new Error(`${name} decoded ${m.decodedFrameCount} frames; expected ${frameCount}`);
  }
  return media;
}
function timingManifest(frames,media) {
  const idealDuration=frames.reduce((n,f)=>n+f.duration,0),start=frames[0].time;
  const expectedDelays=frames.map((f,i)=>Math.round((f.time-start+f.duration)*100)-Math.round((f.time-start)*100));
  const actualDelays=media.gif.packets.map(p=>Math.round(Number(p.duration_time)*100));
  const gifError=media.gif.durationSeconds-idealDuration;
  if(Math.abs(gifError)>.020001)throw new Error(`GIF duration differs from native playback by ${gifError} s`);
  const actualDuration=actualDelays.reduce((s,n)=>s+n,0)/100;
  if(Math.abs(actualDuration-idealDuration)>.020001)throw new Error('GIF packet duration sum is wrong');
  const nativeFrameDuration=frames[0].duration;
  if(Math.abs(media.mp4.durationSeconds-idealDuration)>.0011)throw new Error('MP4 duration is not native-speed');
  let elapsed=0,maximumBoundaryError=0;
  actualDelays.forEach((d,i)=>{maximumBoundaryError=Math.max(maximumBoundaryError,Math.abs(elapsed-(frames[i].time-start)));elapsed+=d/100;});
  if(maximumBoundaryError>.015001)throw new Error('GIF boundary drift exceeds centisecond quantization');
  return {playbackRate:1,sourceTimeBase:frames[0].timeBase,frameCount:frames.length,nativeFrameDuration,firstPts:frames[0].pts,lastPts:frames.at(-1).pts,firstTime:frames[0].time,lastTime:frames.at(-1).time,durationSeconds:idealDuration,
    mp4:media.mp4,gif:media.gif,gifQuantization:{unitSeconds:.01,policy:'Native source 1× playback; only mandatory integer-centisecond GIF timing quantization is applied',expectedRoundedDelaysCentiseconds:expectedDelays,actualDelaysCentiseconds:actualDelays,durationErrorSeconds:gifError,maximumFrameBoundaryErrorSeconds:maximumBoundaryError}};
}
async function main() {
  const flags=args(process.argv.slice(2)),core=loadCore(),out=path.resolve(flags.out||path.join(ROOT,'preview'));
  const start=Number(flags.start??core.spec.start),end=Number(flags.end??core.spec.end);
  const source=flags.source?sourceTimeline(path.resolve(flags.source),start,end):null;
  const fps=source?.fps||core.spec.fps||'30000/1001';
  const frames=source?.frames||timeline(start,end,{fps,timeBase:core.spec.timeBase});
  const before=coreHashes(),frameDir=path.join(out,'frames');
  const rendered=await renderSequence({frames,out:frameDir,...core});
  const media=encodeSequence(frameDir,path.join(out,'loop'),{fps,timeBase:frames[0].timeBase,...rendered,frameCount:frames.length});
  const posterIndex=Math.floor(frames.length/2);fs.copyFileSync(path.join(frameDir,frames[posterIndex].file),path.join(out,'poster.png'));
  const after=coreHashes();if(JSON.stringify(before)!==JSON.stringify(after))throw new Error('Shared core changed during render; rerun');
  const manifest={schemaVersion:1,renderMethod:'Offline sharp/librsvg rasterization of the exact shared scene.render(motion.referenceAt(sourceTime)); not browser QA',core:after,harness:{'tools/render.cjs':sha256(__filename)},source:source?.source??null,referenceSpec:core.spec,tooling:{node:process.version,sharp:require('sharp').versions,ffmpeg:run('ffmpeg',['-version']).split('\n')[0]},timing:timingManifest(frames,media),frames:frames.map((f,i)=>({...f,...rendered.hashes[i]})),outputs:Object.fromEntries(['loop.mp4','loop.gif','poster.png'].map(f=>[f,sha256(path.join(out,f))]))};
  fs.writeFileSync(path.join(out,'render-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  if(!flags['keep-frames'])fs.rmSync(frameDir,{recursive:true});
  console.log(JSON.stringify({out,width:rendered.width,height:rendered.height,frames:frames.length,duration:manifest.timing.durationSeconds,sourcePTSVerified:!!source},null,2));
}
module.exports={ROOT,sharp,sha256,bufferHash,walk,coreHashes,run,args,rational,ratioString,loadCore,probe,timeline,sourceTimeline,validateFrames,renderSequence,decodeCheck,encodeSequence,timingManifest};
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
