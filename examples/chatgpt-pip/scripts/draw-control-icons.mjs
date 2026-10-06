/** Independently authored controls. All geometry below is original vector artwork.
 * No reference image is read, transformed, traced, or embedded. Coordinates are
 * a 34 CSS-pixel square; PNG exports are exactly 102 × 102 with alpha.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url), sharp=require('sharp');
const dir=path.resolve(import.meta.dirname,'../public/assets');
const frame='<path d="M16.8 6.5H7.5A4 4 0 0 0 3.5 10.5v15a4 4 0 0 0 4 4H17" fill="none" stroke="black" stroke-width="2.4" stroke-linecap="round"/>';
const buddy='<path d="M20 22.2c0-3.8 2.3-6.7 5.8-6.7s5.8 2.9 5.8 6.7v4.1c0 2.8-1.6 4.2-3.6 4.2-1.1 0-1.5-.7-2.2-.7s-1.2.7-2.2.7c-2.1 0-3.6-1.4-3.6-4.2Z" fill="black"/><path d="M23.3 22.3v1.5m5-1.5v1.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>';
for(const [name,arrow] of [
 ['window-to-companion','<path d="m18.5 13.5 10-10m-7 0h7v7"/>'],
 ['companion-to-window','<path d="m28.5 3.5-10 10m0-7v7h7"/>']
]){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34"><title>${name.replaceAll('-',' ')}</title>${frame}<g fill="none" stroke="black" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${arrow}</g>${buddy}</svg>`;
 await fs.writeFile(path.join(dir,`${name}.svg`),svg+'\n');
 // White eye marks become transparent, so the result is monochrome for tinting.
 const raw=await sharp(Buffer.from(svg),{density:216}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<raw.data.length;i+=4){raw.data[i+3]=Math.round(raw.data[i+3]*(1-raw.data[i]/255));raw.data[i]=raw.data[i+1]=raw.data[i+2]=0;}
 await sharp(raw.data,{raw:{width:raw.info.width,height:raw.info.height,channels:4}}).png().toFile(path.join(dir,`${name}@3x.png`));
}
console.log('Created 2 original SVG controls and 2 transparent 102 × 102 PNG exports.');
