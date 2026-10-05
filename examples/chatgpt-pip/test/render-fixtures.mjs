/** Original local UI fixtures with presentation annotations omitted. Offline SVG rendering. */
import {createRequire} from 'node:module';import fs from 'node:fs/promises';import path from 'node:path';
const require=createRequire(import.meta.url),sharp=require('sharp'),root=path.resolve(import.meta.dirname,'..');
await fs.mkdir(path.join(root,'public/fixtures'),{recursive:true});
const xml=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,s,size=14,fill='#25352c',extra='')=>`<text x="${x}" y="${y}" font-family="Arial,DejaVu Sans,sans-serif" font-size="${size}" fill="${fill}" ${extra}>${xml(s)}</text>`;
const svg=(body,w=960,h=600)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
function fixture(step=1,second=false){let b='<rect width="960" height="600" fill="#f1f1f1"/>';
 for(let i=0;i<2;i++){const x=12+i*286,dark=i===1,fg=dark?'#d8d8db':'#83858a',card=dark?'#77787b':'white';b+=`<rect x="${x}" y="12" width="268" height="448" fill="${dark?'#656669':'#f7f7f9'}"/>`;
 b+=`<rect x="${x+39}" y="211" width="186" height="96" rx="9" fill="${card}" stroke="${dark?'#848587':'#eeeff1'}"/><circle cx="${x+52}" cy="229" r="4" fill="#aaa"/>`+text(x+60,233,'Wuu / openai-codex ⌄',10,dark?'#ddd':'#999')+text(x+53,261,'GPT-6-Astra ›',11,dark?'#eee':'#666')+text(x+164,261,step===2?'High':'Medium',9,dark?'#ddd':'#888');
 b+=`<rect x="${x+50}" y="277" width="163" height="17" rx="8.5" fill="${dark?'#eee':'#626466'}"/>`;for(let j=0;j<7;j++)b+=`<circle cx="${x+59+j*24}" cy="285.5" r="1.5" fill="#a5a5a8"/>`;
 b+=`<circle cx="${x+(step===2?194:163)}" cy="285.5" r="7.5" fill="${dark?'#aaa':'white'}"/>`;

 }

 return svg(b,960,600)
}
const urls={};for(const [name,step,second] of [['initial',1,false],['updated',2,false],['second',2,true]]){const out=await sharp(Buffer.from(fixture(step,second))).png().toBuffer();await fs.writeFile(path.join(root,`public/fixtures/${name}.png`),out);urls[name]=`data:image/png;base64,${out.toString('base64')}`;}
const mascotBuffer=await sharp(path.join(root,'public/mascot.svg')).png().toBuffer();await fs.writeFile(path.join(root,'public/mascot.png'),mascotBuffer);const mascot=`data:image/png;base64,${mascotBuffer.toString('base64')}`;
console.log('Clean local UI fixtures rendered.');
