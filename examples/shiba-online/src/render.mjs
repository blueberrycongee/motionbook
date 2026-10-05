import {createRequire} from 'node:module';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
import {drawScene,PERIOD} from './scene.mjs';
const require=createRequire(import.meta.url),{createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
fs.mkdirSync(path.join(root,'preview/frames'),{recursive:true});
const c=createCanvas(128,128),out=createCanvas(896,896);out.getContext('2d').imageSmoothingEnabled=false;
for(let f=0;f<42;f++){drawScene(c.getContext('2d'),f/20,createCanvas);out.getContext('2d').drawImage(c,0,0,896,896);fs.writeFileSync(path.join(root,`preview/frames/${String(f).padStart(3,'0')}.png`),out.toBuffer('image/png'));}
fs.copyFileSync(path.join(root,'preview/frames/004.png'),path.join(root,'preview/poster.png'));
function ff(args){const r=spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error',...args],{stdio:'inherit'});if(r.status)process.exit(r.status);}
const input=['-framerate','20','-i',path.join(root,'preview/frames/%03d.png')];
ff([...input,'-c:v','libx264','-crf','15','-pix_fmt','yuv420p','-movflags','+faststart',path.join(root,'preview/shiba-online.mp4')]);
ff([...input,'-filter_complex','[0:v]split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=none','-loop','0',path.join(root,'preview/shiba-online.gif')]);
console.log(`Rendered 42 frames: ${PERIOD}s / 896×896 / 20 fps.`);
