import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {scene,demoState,stateAt,WIDTH,HEIGHT,DURATION} from '../src/scene.mjs';
const require=createRequire(import.meta.url),sharp=require('sharp');sharp.concurrency(1);
const root=fileURLToPath(new URL('..',import.meta.url)),out=path.resolve(process.argv[2]||'/tmp/life-in-weeks-frames'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
await fs.mkdir(out,{recursive:true});
const code={};for(const name of await fs.readdir(path.join(root,'src')))if(name.endsWith('.mjs'))code['src/'+name]=sha(await fs.readFile(path.join(root,'src',name)));
const rows=[];
for(let i=0;i<Math.round(DURATION*30);i++){
 const svg=scene(i<445?stateAt(i):demoState(i/30));const png=await sharp(Buffer.from(svg)).png().toBuffer();const rgba=await sharp(png).ensureAlpha().raw().toBuffer();
 await fs.writeFile(path.join(out,String(i).padStart(4,'0')+'.png'),png);rows.push({i,t:i/30,kind:i<445?'original-native-PTS':'authored-loop-tail',svg_sha256:sha(svg),png_sha256:sha(png),rgba_sha256:sha(rgba)});
 if(i%25===0){console.log(i+'/504');await fs.writeFile(path.join(out,'progress.json'),JSON.stringify({done:i+1,total:504,code_sha256:code}));}
}
for(const [name,h] of Object.entries(code))if(sha(await fs.readFile(path.join(root,name)))!==h)throw Error('Source changed during render: '+name);
await fs.writeFile(path.join(out,'rendered-rgba.json'),JSON.stringify({renderer:'Sharp '+sharp.versions.sharp+' / librsvg '+sharp.versions.rsvg,width:WIDTH,height:HEIGHT,fps:30,code_sha256:code,frames:rows},null,2));console.log('Complete:504 independent SVG renders');
