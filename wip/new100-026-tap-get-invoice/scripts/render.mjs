import{createRequire}from'node:module';import{mkdir,writeFile}from'node:fs/promises';import{resolve}from'node:path';import{createHash}from'node:crypto';
import{scene,demoState}from'../src/scene.mjs';import{CONTROLS}from'../src/controls.mjs';const require=createRequire(import.meta.url),sharp=require('sharp');
const dest=resolve(process.argv[2]||'rendered');await mkdir(dest,{recursive:true});sharp.concurrency(1);const records=[];
for(let i=0;i<936;i++){
 const state=i<831?CONTROLS[i]:demoState(i/60);const svg=Buffer.from(scene(state));const raw=await sharp(svg).ensureAlpha().raw().toBuffer();const name=String(i).padStart(4,'0')+'.png';await sharp(raw,{raw:{width:824,height:720,channels:4}}).png().toFile(resolve(dest,name));records.push({i,t:i<831?CONTROLS[i].t:i/60,rgba_sha256:createHash('sha256').update(raw).digest('hex')});if(i%100===0)console.log('Rendered',i);
}
await writeFile(resolve(dest,'rendered-rgba.json'),JSON.stringify(records,null,2));console.log('Rendered all 831 native poses and 105 authored tail frames.');
