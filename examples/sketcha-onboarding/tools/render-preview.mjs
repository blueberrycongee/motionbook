import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {createCanvas,Path2D,GlobalFonts}=require('@napi-rs/canvas');
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {configureRenderer,drawScene} from '../src/scene.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
GlobalFonts.registerFromPath(path.join(root,'assets/fonts/OnboardingSans-Regular.ttf'),'Study Sans');
GlobalFonts.registerFromPath(path.join(root,'assets/fonts/OnboardingSans-Bold.ttf'),'Study Sans');
GlobalFonts.registerFromPath(path.join(root,'assets/fonts/OnboardingChinese-Regular.otf'),'Study CJK');
configureRenderer(Path2D);
const out=path.join(root,'preview');fs.mkdirSync(out,{recursive:true});
const scale=2, canvas=createCanvas(390*scale,844*scale),c=canvas.getContext('2d');c.scale(scale,scale);
const times=[-1,.90,2.00,2.32,2.75,3.30,3.57,3.66,3.82];
for(let i=0;i<times.length;i++){drawScene(c,times[i]);fs.writeFileSync(path.join(out,`state-${i}.png`),canvas.toBuffer('image/png'));}
if(process.argv.includes('--stills'))process.exit(0);
const frames=path.join(out,'frames');fs.mkdirSync(frames,{recursive:true});
const fps=60,duration=6.6;
for(let n=0;n<fps*duration;n++){let t=n/fps-1;drawScene(c,t<0?-1:t,{idleTime:n/fps});fs.writeFileSync(path.join(frames,`${String(n).padStart(4,'0')}.png`),canvas.toBuffer('image/png'));}
console.log(`${fps*duration} clean 780×1688 frames rendered with the application's own Canvas scene.`);
