// Shared renderer. Uses the same SVG output as app.js; this is NOT a browser capture.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)('sharp');
import {renderSVG,FPS,DURATION} from '../motion.js';
const out=process.argv[2]||'validation/frames';
const scale=Number(process.argv[3]||2);
await fs.mkdir(out,{recursive:true});
for(let i=0;i<FPS*DURATION;i++){
 const svg=renderSVG(i/FPS);
 await sharp(Buffer.from(svg),{density:72*scale}).png().toFile(path.join(out,`${String(i).padStart(3,'0')}.png`));
}
await fs.writeFile(path.join(out,'render.json'),JSON.stringify({method:'Shared SVG through Sharp/librsvg; not browser screenshot',width:204*scale,height:400*scale,fps:FPS,frames:FPS*DURATION,duration:DURATION},null,2));
console.log(`Rendered ${FPS*DURATION} shared-runtime SVG frames into ${out}`);
