import {createRequire} from 'node:module';import fs from 'node:fs/promises';import path from 'node:path';import {draw}from '../src/render.mjs';
const require=createRequire(import.meta.url),{createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(import.meta.dirname,'..');await fs.mkdir(root+'/artifacts/frames',{recursive:true});
let canvas=createCanvas(960,720),ctx=canvas.getContext('2d');
const fps=24,duration=6;
for(let i=0;i<fps*duration;i++){draw(ctx,i/fps,960,720);await fs.writeFile(`${root}/artifacts/frames/${String(i).padStart(4,'0')}.png`,canvas.toBuffer('image/png'));}
let full=createCanvas(1920,1440);draw(full.getContext('2d'),.67);await fs.writeFile(root+'/artifacts/replica-still.png',full.toBuffer('image/png'));
console.log('Rendered 144 frames at 24 fps. Offline canvas render; not a browser screen recording.');
