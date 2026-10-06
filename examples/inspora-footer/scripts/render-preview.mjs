/** Deterministic offline SVG/Sharp render. Not a browser recording.
 * Uses the actual independently authored landscape and unchanged v6 horse pose.
 * Typesetting maps the desktop HTML/CSS to SVG for this offline renderer only.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require('sharp'),{pose}=require('../horse-motion.js');
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'preview/public-cleanup-frames');await fs.mkdir(dir,{recursive:true});
const BLUE='#0c3e83',CREAM='#fff0cc',W=1671,H=941;
const html=await fs.readFile(path.join(root,'index.html'),'utf8');
let horse=await fs.readFile(path.join(root,'assets/horse-scene.svg'),'utf8');horse=horse.replace(/<image[^>]*\/>/g,'');
const landscape=await fs.readFile(path.join(root,'assets/original-desert.svg'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
const text=(x,y,str,size=22,extra='')=>`<text x="${x}" y="${y}" fill="${CREAM}" font-family="Liberation Serif,Times New Roman,serif" font-size="${size}" ${extra}>${esc(str)}</text>`;
const icon=(svg,x,y,w,h)=>svg.replace('<svg ',`<svg x="${x}" y="${y}" width="${w}" height="${h}" `).replaceAll('currentColor',CREAM).replaceAll('var(--blue)',BLUE);
const getIcons=section=>[...section.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map(x=>x[0]);
const compass=getIcons(html.slice(html.indexOf('<a class="brand"')))[0];
let ui=icon(compass,108,116,64,70)+text(190,160,'sequel',56,'letter-spacing="-1.4"');
['Building digital experiences','that inspire, connect, and','create lasting value.'].forEach((s,i)=>ui+=text(118,225+i*28,s,22,'font-style="italic"'));
const ci=getIcons(html.slice(html.indexOf('<ul class="contact-list"'),html.indexOf('<nav class="socials"')));
['hello@sequel.com','+91 00000 00000','India'].forEach((s,i)=>{ui+=icon(ci[i],118,322+i*36.9,25,27.6)+text(164,339+i*36.9,s);});
const si=getIcons(html.slice(html.indexOf('<nav class="socials"'),html.indexOf('aria-labelledby="shop-heading"')));
si.forEach((s,i)=>ui+=icon(s,118+i*60.3,465,24,26));
const cols=[{x:506,title:'SHOP',items:['All Collections','Vases','Tableware','Decor','Limited Editions','Gift Sets']},{x:746,title:'ABOUT US',items:['Our Story','Craftsmanship','Sustainability','Careers','Press & Media']},{x:990,title:'HELP & SUPPORT',items:['FAQs','Shipping & Delivery','Track Your Order','Contact Us']},{x:1283,title:'NEWSLETTER',items:[]}];
for(const c of cols){ui+=text(c.x,154,c.title,20,'letter-spacing="2"');ui+=`<path d="M${c.x} 181h43" stroke="${CREAM}" stroke-width="1" opacity=".72"/>`;c.items.forEach((s,i)=>ui+=text(c.x,220+i*36.6,s));}
ui+=text(1283,220,'Subscribe to get updates on new',22,'font-style="italic"')+text(1283,249,'collections, stories & exclusive offers.',22,'font-style="italic"');
ui+=`<rect x="1283" y="276" width="302" height="52" fill="none" stroke="${CREAM}"/><rect x="1536" y="276" width="49" height="52" fill="${CREAM}"/>`+text(1306,307,'Enter your email',20,'font-style="italic"')+`<path d="M1550 302h20m-8-8 8 8-8 8" fill="none" stroke="${BLUE}" stroke-width="1.6"/>`;
ui+=text(1148,505,'Privacy Policy',19,'font-style="italic"')+text(1285,505,'|',19)+text(1313,505,'Terms of Service',19,'font-style="italic"')+text(1465,505,'|',19)+text(1490,505,'Cookie Policy',19,'font-style="italic"');
const svg=body=>`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
const bg=await sharp(landscape).png().toBuffer();const bgUri='data:image/png;base64,'+bg.toString('base64');
const base=await sharp(Buffer.from(svg(`<image href="${bgUri}" width="${W}" height="${H}"/>${ui}`))).resize(1004,566).png().toBuffer();
const detailBase=await sharp(bg).extract({left:650,top:684,width:615,height:158}).resize(1230,316).png().toBuffer();
for(let i=0;i<140;i++){
 const state=pose(i/20);let s=horse;
 for(const [id,v] of Object.entries(state.transforms)){s=s.replace(new RegExp(`(<[^>]+id="${id}")([^>]*>)`),(_,a,b)=>a+b.replace(/ transform="[^"]*"/,'').replace('>',` transform="${v}">`));}
 for(const [id,v] of Object.entries(state.paths)){s=s.replace(new RegExp(`(<path[^>]*id="${id}")([^>]*>)`),(_,a,b)=>a+b.replace(/ d="[^"]*"/,'').replace(/\/?\s*>$/,` d="${v}"/>`));}
 const horseLayer=await sharp(Buffer.from(s)).png().toBuffer();
 const small=await sharp(horseLayer).resize(1004,566).png().toBuffer();
 const full=await sharp(base).composite([{input:small}]).png().toBuffer();
 await fs.writeFile(path.join(dir,`footer-${String(i).padStart(4,'0')}.png`),full);
 const crop=await sharp(horseLayer).extract({left:650,top:684,width:615,height:158}).resize(1230,316).png().toBuffer();
 await sharp(detailBase).composite([{input:crop}]).png().toFile(path.join(dir,`detail-${String(i).padStart(4,'0')}.png`));
 if(i===0)await fs.writeFile(path.join(root,'delivery/footer-preview.png'),full);
 if(i%20===0)console.log(`Rendered ${i+1}/140 frames`);
}
await fs.writeFile(path.join(root,'preview/render-note.json'),JSON.stringify({revision:7,motion_revision:6,motion_origin:'Newly authored motion retained byte-identically from accepted v6',preview_seconds:7,fps:20,frames:140,camera:'fixed',forward_travel_pixels:252,visual_auxiliary_labels:false,browser_runtime_tested:false,renderer:'Deterministic offline SVG/Sharp render; HTML/CSS desktop typesetting translated to SVG',artwork:'Original procedurally authored blue paper, engraved desert, hills, grass, stones, and retained authored horse/rider. No reference image inputs.',artwork_generator:'scripts/draw-desert.mjs'},null,2)+'\n');
console.log('140 full-footer frames and 140 horse-detail frames rendered.');
