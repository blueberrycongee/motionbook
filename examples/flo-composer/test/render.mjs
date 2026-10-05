// Deterministic offline SVG rasterization, not a browser or application recording.
import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
await fs.mkdir(path.join(root,'artifacts/frames'),{recursive:true});
// Local font configuration affects only this render process; no system font install.
const cfg=`<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${root}/public/assets</dir><dir>/usr/share/fonts/truetype/liberation</dir><cachedir>/tmp/flo-font-cache</cachedir></fontconfig>`;
await fs.writeFile(path.join(root,'artifacts/fontconfig.xml'),cfg);process.env.FONTCONFIG_FILE=path.join(root,'artifacts/fontconfig.xml');
const require=createRequire(import.meta.url),sharp=require('sharp');const {renderScene}=await import('../src/scene.mjs');
const fps=30,frames=201;for(let i=0;i<frames;i++){const s=renderScene(i/fps,{});await sharp(Buffer.from(s)).resize(654,743).png().toFile(path.join(root,`artifacts/frames/${String(i).padStart(4,'0')}.png`));}
for(const [name,t]of[['01-app-footer',0],['02-project-header',3],['03-unrestricted',6]]){await fs.writeFile(path.join(root,`artifacts/${name}.svg`),renderScene(t,{}));await sharp(Buffer.from(renderScene(t,{}))).png().toFile(path.join(root,`artifacts/${name}.png`));}
function run(args){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{cwd:root,stdio:'inherit'});if(r.status!==0)throw Error('ffmpeg failed');}
run(['-framerate',String(fps),'-i','artifacts/frames/%04d.png','-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','artifacts/flo-composer-reconstruction.mp4']);
run(['-framerate',String(fps),'-i','artifacts/frames/%04d.png','-filter_complex','[0:v]split[a][b];[a]palettegen=max_colors=160:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a','-loop','0','artifacts/flo-composer-reconstruction.gif']);
console.log(`Rendered ${frames} frames / 6.7 seconds at 30 fps, plus 3 stills. Offline SVG render, NOT a browser recording.`);
