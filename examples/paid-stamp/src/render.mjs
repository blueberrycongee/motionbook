import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {scene,demoState,DURATION} from './scene.mjs';
const sharp=createRequire(import.meta.url)('sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'preview'),tmp=await fs.mkdtemp(path.join(os.tmpdir(),'paid-stamp-'));
await fs.mkdir(out,{recursive:true});
const fps=60,frames=Math.round(DURATION*fps);
function ff(args){const r=spawnSync('ffmpeg',['-y','-v','error','-threads','1',...args],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);}
try{
 for(let i=0;i<frames;i++)await sharp(Buffer.from(scene(demoState(i/fps)))).png().toFile(path.join(tmp,`${String(i).padStart(5,'0')}.png`));
 ff(['-framerate','60','-i',path.join(tmp,'%05d.png'),'-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'paid-stamp.mp4')]);
 ff(['-framerate','60','-i',path.join(tmp,'%05d.png'),'-filter_complex','[0:v]fps=30,scale=810:540:flags=lanczos,split[a][b];[a]palettegen=max_colors=192:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a','-loop','0',path.join(out,'paid-stamp.gif')]);
 for(const [name,t] of [['picker',0],['stamp',165/60],['contact',209/60],['printed',280/60],['invoice',450/60]])await sharp(Buffer.from(scene(demoState(t)))).png().toFile(path.join(out,name+'.png'));
 await fs.writeFile(path.join(out,'render-info.json'),JSON.stringify({renderer:'sharp/librsvg from the same independently drawn SVG scene used by the browser demo',browser_capture:false,source_media_embedded:false,mp4_size:[1080,720],gif_size:[810,540],fps,frames,duration_seconds:DURATION,source_encoded_frames:523,source_video_duration_seconds:8.716667,source_container_audio_duration_seconds:8.768,audio:'Silent visual reconstruction; original audio is not copied.',tail:'Original visual sequence and final hold, followed by an authored 9–9.6 second crossfade to the initial picker and a short neutral hold.',fonts:'Inter outlines under the SIL OFL, a licensed substitute rather than a recovered original font',versions:sharp.versions},null,2));
 console.log(`Rendered ${frames} full-resolution shared-scene frames, MP4 and infinite-loop GIF.`);
}finally{await fs.rm(tmp,{recursive:true,force:true});}
