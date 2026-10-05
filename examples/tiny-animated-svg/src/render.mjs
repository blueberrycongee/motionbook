import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { svgAt, PERIOD } from './build.mjs';
const require=createRequire(import.meta.url);
const sharp=require('sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const frames=path.join(root,'preview','frames');
fs.mkdirSync(frames,{recursive:true});
const fps=30, count=Math.round(PERIOD*fps);
for(let n=0;n<count;n++){
 await sharp(Buffer.from(svgAt(n/fps))).resize(1080,540).png().toFile(path.join(frames,`${String(n).padStart(4,'0')}.png`));
}
await sharp(Buffer.from(svgAt(3.2))).resize(1080,540).png().toFile(path.join(root,'preview','poster.png'));
function ffmpeg(args){ const r=spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error',...args],{stdio:'inherit'});if(r.status)process.exit(r.status); }
const input=['-framerate',String(fps),'-i',path.join(frames,'%04d.png')];
ffmpeg([...input,'-c:v','libx264','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',path.join(root,'preview','pro.mp4')]);
ffmpeg([...input,'-filter_complex','[0:v]fps=20,scale=900:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a','-loop','0',path.join(root,'preview','pro.gif')]);
fs.writeFileSync(path.join(root,'preview','render-info.json'),JSON.stringify({renderer:`sharp ${sharp.versions.sharp} / librsvg ${sharp.versions.rsvg}`,method:'Offline rendering of the same SVG filter graph, with the SMIL gradient transform sampled at 30 fps. This is not a browser recording.',duration_seconds:PERIOD,frames:count,video_fps:fps,gif_fps:20,video_dimensions:[1080,540],browser_runtime_tested:false,reference_media_in_deliverable:false},null,2)+'\n');
console.log(`Rendered ${count} SVG frames, ${PERIOD}s.`);
