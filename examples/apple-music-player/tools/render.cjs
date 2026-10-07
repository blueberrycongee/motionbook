#!/usr/bin/env node
'use strict';
/** Offline media renderer. Uses the very same SVG scene as the browser; this is not browser QA. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const FPS = { numerator: 30000, denominator: 1001 };
const WIDTH = 432, HEIGHT = 934;
if (!process.env.FONTCONFIG_FILE && fs.existsSync(path.join(ROOT, 'assets/fonts.conf'))) {
  process.env.FONTCONFIG_FILE = path.join(ROOT, 'assets/fonts.conf');
}
let _sharp;
function sharp(...args) { _sharp ||= require('sharp'); return _sharp(...args); }
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))
    .flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
function coreHashes() {
  return Object.fromEntries(['src', 'assets'].flatMap(d => walk(path.join(ROOT, d)))
    .map(p => [path.relative(ROOT, p).replaceAll(path.sep, '/'), sha256(p)]));
}
function run(command, args, options={}) {
  const result = spawnSync(command, args, { encoding:'utf8', maxBuffer: 64*1024*1024, ...options });
  if (result.error || result.status !== 0) throw new Error(`${command} failed: ${result.error || result.stderr || result.stdout}`);
  return result.stdout;
}
function args(argv) {
  const result = {};
  for(let i=0;i<argv.length;i++) {
    const key=argv[i];
    if(!key.startsWith('--')) throw new Error(`Unexpected argument: ${key}`);
    result[key.slice(2)] = argv[i+1] && !argv[i+1].startsWith('--') ? argv[++i] : true;
  }
  return result;
}
function loadCore() {
  const motion = require(path.join(ROOT, 'src/motion.js'));
  const scene = require(path.join(ROOT, 'src/scene.js'));
  if(typeof motion.referenceAt !== 'function' || typeof scene.render !== 'function') throw new Error('Missing shared motion.referenceAt or scene.render');
  return { motion, scene };
}
/** Presentation timestamps live in the original 1/30000 clock, never frameIndex/30. */
function timeline(start, end) {
  if(!Number.isFinite(start) || !Number.isFinite(end) || end<=start) throw new Error('Invalid source-time range');
  const first = Math.ceil(start * FPS.numerator/FPS.denominator - 1e-7);
  const last = Math.ceil(end * FPS.numerator/FPS.denominator - 1e-7);
  return Array.from({ length: last-first }, (_, i) => {
    const pts=(first+i)*FPS.denominator;
    return { index:i, pts, time:pts/FPS.numerator, timeBase:'1/30000', file:`${String(i).padStart(6,'0')}.png` };
  });
}
function gifDelays(frameCount) {
  return Array.from({length:frameCount}, (_,i) =>
    Math.round((i+1)*100*FPS.denominator/FPS.numerator)-Math.round(i*100*FPS.denominator/FPS.numerator));
}
async function renderSequence({ frames, out, motion, scene }) {
  fs.mkdirSync(out,{recursive:true});
  for(const name of fs.readdirSync(out)) if(/^\d{6}\.png$/.test(name)) fs.unlinkSync(path.join(out,name));
  for(const frame of frames) {
    const state=motion.referenceAt(frame.time);
    const svg=scene.render(state,{device:false});
    if(typeof svg !== 'string' || !svg.includes('<svg')) throw new Error('Scene did not return an SVG string');
    const result=await sharp(Buffer.from(svg)).png().toFile(path.join(out,frame.file));
    if(result.width!==WIDTH || result.height!==HEIGHT) throw new Error('Wrong raster bounds');
  }
}
function probe(file) {
  return JSON.parse(run('ffprobe',['-v','error','-select_streams','v:0','-show_entries',
    'stream=width,height,avg_frame_rate,r_frame_rate,time_base,nb_frames,duration:format=duration','-of','json',file]));
}
function encodeSequence(framesDir, outputStem, {width=WIDTH,height=HEIGHT}={}) {
  fs.mkdirSync(path.dirname(outputStem), {recursive:true});
  const input=path.join(framesDir,'%06d.png');
  const base=['-hide_banner','-loglevel','error','-y','-threads','1','-filter_threads','1',
    '-framerate','30000/1001','-start_number','0','-i',input];
  run('ffmpeg',[...base,'-an','-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p',
    '-video_track_timescale','30000','-movflags','+faststart',`${outputStem}.mp4`]);
  const palette=`${outputStem}.palette.png`;
  run('ffmpeg',[...base,'-vf','palettegen=stats_mode=diff','-frames:v','1',palette]);
  run('ffmpeg',[...base,'-i',palette,'-filter_complex_threads','1','-lavfi',
    '[0:v][1:v]paletteuse=dither=sierra2_4a:diff_mode=rectangle','-fps_mode','passthrough','-loop','0',`${outputStem}.gif`]);
  fs.unlinkSync(palette);
  const mp4=probe(`${outputStem}.mp4`), gif=probe(`${outputStem}.gif`);
  gif.packets=JSON.parse(run('ffprobe',['-v','error','-select_streams','v:0','-show_entries','packet=pts_time,duration_time','-of','json',`${outputStem}.gif`])).packets;
  for(const [label,result] of Object.entries({mp4,gif})) {
    if(result.streams[0].width!==width || result.streams[0].height!==height) throw new Error(`${label} dimensions changed`);
  }
  return {mp4,gif};
}
function timingManifest(frames, media) {
  const actual = frames.length*FPS.denominator/FPS.numerator;
  return {
    sourceTimeBase:'1/30000', frameRate:'30000/1001', playbackRate:1, frameCount:frames.length,
    firstPts:frames[0].pts, lastPts:frames.at(-1).pts, firstTime:frames[0].time, lastTime:frames.at(-1).time,
    durationSeconds:actual, mp4:media.mp4, gif:media.gif,
    gifQuantization:{unitSeconds:0.01, policy:'GIF stores integer centiseconds; native 29.97002997 fps is rounded to alternating 3/4 cs delays. No intentional slowdown.',
      idealRoundedDelaysCentiseconds:gifDelays(frames.length),
      actualDelaysCentiseconds:media.gif.packets.map(p=>Math.round(Number(p.duration_time)*100)),
      durationErrorSeconds:Number(media.gif.format.duration)-actual},
  };
}
async function main() {
  const flags=args(process.argv.slice(2));
  const {motion,scene}=loadCore();
  const out=path.resolve(flags.out || path.join(ROOT,'preview'));
  const frames=timeline(Number(flags.start ?? motion.referenceSpec.start),Number(flags.end ?? motion.referenceSpec.end));
  const frameDir=path.join(out,'frames');
  await renderSequence({frames,out:frameDir,motion,scene});
  const media=encodeSequence(frameDir,path.join(out,'loop'));
  const manifest={schemaVersion:1,renderMethod:'Offline librsvg/sharp rasterization of shared scene; not browser or interaction QA',
    core:coreHashes(), reference:{sourceSha256:flags.source?sha256(path.resolve(flags.source)):null,spec:motion.referenceSpec},
    harness:{'tools/render.cjs':sha256(__filename)}, tooling:{node:process.version,sharp:require('sharp').versions},
    timing:timingManifest(frames,media), frames,outputs:{'loop.mp4':sha256(path.join(out,'loop.mp4')),'loop.gif':sha256(path.join(out,'loop.gif'))}};
  fs.writeFileSync(path.join(out,'render-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  if(!flags['keep-frames']) fs.rmSync(frameDir,{recursive:true});
  console.log(JSON.stringify({out,frameCount:frames.length,duration:manifest.timing.durationSeconds},null,2));
}
module.exports={ROOT,FPS,WIDTH,HEIGHT,sha256,walk,coreHashes,run,args,loadCore,timeline,gifDelays,renderSequence,encodeSequence,timingManifest,sharp,probe};
if(require.main===module) main().catch(e=>{console.error(e);process.exitCode=1;});
