import{createRequire}from'node:module';import fs from'node:fs/promises';import path from'node:path';import{draw}from'../src/render.mjs';
const require=createRequire(import.meta.url),{createCanvas}=require('@napi-rs/canvas');const root=path.resolve(import.meta.dirname,'..'),dir=root+'/artifacts/right-revision';await fs.mkdir(dir+'/frames',{recursive:true});
const times=[0,.7,2,3,6,9,12,16.7];for(const t of times){const c=createCanvas(1920,1440);draw(c.getContext('2d'),t);await fs.writeFile(`${dir}/new-${t}.png`,c.toBuffer('image/png'))}
let c=createCanvas(960,720),ctx=c.getContext('2d');const count=Math.round(17.7*24);for(let i=0;i<count;i++){draw(ctx,i/24,960,720);await fs.writeFile(`${dir}/frames/${String(i).padStart(4,'0')}.png`,c.toBuffer('image/png'))}
console.log(`Rendered ${count} full-timeline frames from the revised shared renderer. Offline canvas render.`);
