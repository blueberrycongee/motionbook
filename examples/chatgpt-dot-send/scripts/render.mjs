import fs from 'node:fs/promises';import path from 'node:path';import{createRequire}from'node:module';import{spawnSync}from'node:child_process';import{render,SIZE,TIMES}from'./scene.mjs';
const require=createRequire(import.meta.url);let sharp;try{sharp=require('sharp');}catch{sharp=require(process.env.NODE_PATH+'/sharp');}
const root=new URL('..',import.meta.url).pathname,out=path.join(root,'artifacts'),frames=path.join(out,'frames');await fs.mkdir(frames,{recursive:true});
const fps=60,count=Math.ceil(TIMES.end/1000*fps),selected=[0,74,75,78,81,86,95,112,236,237,242,252,305,306,307,309,312,317,320,330,342,390];
for(let i=0;i<count;i++){const svg=render(i/fps*1000),target=path.join(frames,String(i).padStart(5,'0')+'.png');await sharp(Buffer.from(svg)).png().toFile(target);if(selected.includes(i))await fs.copyFile(target,path.join(out,`frame-${i}.png`));}
function ff(args){const p=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{stdio:'inherit'});if(p.status!==0)throw Error('ffmpeg failed');}
ff(['-framerate',String(fps),'-i',path.join(frames,'%05d.png'),'-c:v','libx264','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'dot-send-study.mp4')]);
ff(['-framerate',String(fps),'-i',path.join(frames,'%05d.png'),'-filter_complex','split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a','-loop','0',path.join(out,'dot-send-study.gif')]);
await fs.writeFile(path.join(out,'preview-metadata.json'),JSON.stringify({type:'independent-offline-render',browserCapture:false,fps,durationSeconds:TIMES.end/1000,...SIZE,technicalOverlayText:false,source:'scripts/scene.mjs',scenes:['single-line send','multiline send'],verifiedOriginalApp:false},null,2)+'\n');console.log('Source-pipeline r3 rendered.');
