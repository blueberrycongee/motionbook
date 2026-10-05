import {createRequire} from 'node:module';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';import {scene,demoState,DURATION,WIDTH,HEIGHT} from './scene.mjs';
const require=createRequire(import.meta.url),sharp=require('sharp');const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'preview'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'invite-code-reveal-'));fs.mkdirSync(out,{recursive:true});
const FPS=60,N=Math.round(DURATION*FPS);
for(const [name,t] of [['poster',0],['lift',.602411],['edge',.619144],['open',1.3889],['recoil',.870278],['repeat',5.055567]])await sharp(Buffer.from(scene(demoState(t)))).png().toFile(path.join(out,`${name}.png`));
if(process.argv.includes('--stills')){fs.rmSync(tmp,{recursive:true,force:true});process.exit(0);}
for(let f=0;f<N;f++)await sharp(Buffer.from(scene(demoState(f/FPS)))).png().toFile(path.join(tmp,`${String(f).padStart(4,'0')}.png`));

function ff(args){const p=spawnSync('ffmpeg',['-y','-v','error',...args],{stdio:'inherit'});if(p.status!==0)throw Error('ffmpeg failed');}
ff(['-framerate',String(FPS),'-i',path.join(tmp,'%04d.png'),'-c:v','libx264','-crf','17','-preset','fast','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'invite-code-reveal.mp4')]);
ff(['-i',path.join(out,'invite-code-reveal.mp4'),'-filter_complex','fps=30,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=192[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',path.join(out,'invite-code-reveal.gif')]);
fs.writeFileSync(path.join(out,'render-info.json'),JSON.stringify({renderer:'sharp/librsvg offline rasterization of the same scene.mjs SVG used by browser demo',browser_capture:false,versions:sharp.versions,width:WIDTH,height:HEIGHT,fps:FPS,frames:N,duration_seconds:DURATION,loop:'All three original flip/recoil/close cycles at their VFR timing, displayed at 60fps, plus a neutral tail. Pointer and UI geometry are independently drawn; typography uses licensed Nunito outlines.'},null,2));
fs.rmSync(tmp,{recursive:true,force:true});console.log(`Rendered ${N} frames and looping GIF.`);
