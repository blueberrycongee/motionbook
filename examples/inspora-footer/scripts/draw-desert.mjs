/** Original procedural engraving, authored 2026-10-06.
 * Reads NO images or reference data. Coordinates, contours, hatch strokes,
 * stipple, rocks, and desert brush are generated here from a fixed seed.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
const W=1671,H=941,BLUE='#0c3e83',INK='#164b86',CREAM='#fff0cc';
let seed=19760417;
const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const n=x=>Number(x.toFixed(2));
const horizon=x=>683-62*Math.exp(-(((x-130)/115)**2))-39*Math.exp(-(((x-470)/158)**2))-104*Math.exp(-(((x-1140)/160)**2))-42*Math.exp(-(((x-1578)/92)**2))+6*Math.sin(x*.028)+3*Math.sin(x*.071)+1.3*Math.sin(x*.18);
const terrain=[];for(let x=-8;x<=W+8;x+=4)terrain.push(`${n(x)} ${n(horizon(x))}`);
const shape=`M${terrain.join('L')}L${W+8} ${H}H-8Z`;
const line=(d,color=INK,width=.8,opacity=.75)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
// Original tiled paper grain, made from vector stipple (not filtered image pixels).
let paperSeed=61361;
const paperRnd=()=>{paperSeed=(Math.imul(paperSeed,1664525)+1013904223)>>>0;return paperSeed/4294967296;};
let paperMarkup=`<rect width="512" height="512" fill="${BLUE}"/>`;
for(const [color,opacity,width,count] of [[CREAM,.16,.55,6500],[CREAM,.10,1.1,2100],['#021c43',.14,.8,5000]]){
 let dots='';for(let i=0;i<count;i++)dots+=`M${n(paperRnd()*512)} ${n(paperRnd()*512)}h.01`;
 paperMarkup+=`<path d="${dots}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}"/>`;
}
let art=`<defs><clipPath id="desert-silhouette"><path d="${shape}"/></clipPath><pattern id="original-paper-tile" width="512" height="512" patternUnits="userSpaceOnUse">${paperMarkup}</pattern></defs><rect width="${W}" height="${H}" fill="url(#original-paper-tile)"/><path d="${shape}" fill="${CREAM}"/><g clip-path="url(#desert-silhouette)">`;
// Long stratum lines with naturally broken cuts. Independent, analytic contours.
for(let row=0;row<63;row++){
 let x=-5-rnd()*30;
 while(x<W){const length=5+rnd()*43,gap=2+rnd()*9;const d=[];for(let xx=x;xx<=x+length;xx+=2){const y=horizon(xx)+(739-horizon(xx))*(row/63)+1.3*Math.sin(xx*.105+row*.85);d.push(`${n(xx)} ${n(y)}`);}art+=line('M'+d.join('L'),INK,row%5===0?1.15:.58,.55+rnd()*.3);x+=length+gap;}
}
// Short oblique cuts model the slopes. Their spacing changes with depth.
for(let i=0;i<1600;i++){
 const x=rnd()*W,y=horizon(x)+rnd()*(740-horizon(x)),slope=(horizon(x+2)-horizon(x-2))/4;
 const len=2+rnd()*7;art+=line(`M${n(x)} ${n(y)}l${n(Math.max(-3,Math.min(3,slope*2)))} ${n(len)}`,INK,.55,.45+rnd()*.4);
}
// Steeper east-facing slopes receive dense hand-cut diagonal shading.
for(let i=0;i<3600;i++){
 const x=rnd()*W,slope=(horizon(x+3)-horizon(x-3))/6;
 if(slope<.12||rnd()>.75)continue;
 const depth=rnd(),y=horizon(x)+depth*(734-horizon(x));
 const len=2+rnd()*9;art+=line(`M${n(x)} ${n(y)}q${n(len*.15)} ${n(len*.4)} ${n(len*.7)} ${n(len)}`,INK,.65,Math.min(.95,.3+slope*.3));
}
// Foreground sand lines and tiny scattered stones; deliberately denser near camera.
for(let i=0;i<3200;i++){
 const y=725+Math.pow(rnd(),.75)*216,x=rnd()*W,depth=(y-715)/226;
 const len=1.2+rnd()*(3+depth*13),rise=(rnd()-.5)*1.5;
 art+=line(`M${n(x)} ${n(y)}q${n(len*.45)} ${n(rise-1)} ${n(len)} ${n(rise)}`,INK,.45+depth*.35,.25+rnd()*.6);
}
// Forked sage and grass tufts. Each has asymmetric, curved blades and fine hatch.
for(let i=0;i<285;i++){
 const y=747+Math.pow(rnd(),.7)*207,x=rnd()*W,depth=(y-735)/219;
 const size=(2+rnd()*12)*(.4+depth*1.3),blades=5+Math.floor(rnd()*9);
 for(let k=0;k<blades;k++){
  const a=(k/(blades-1)-.5)*2.6+(rnd()-.5)*.25,len=size*(.5+rnd()*.7),tx=Math.sin(a)*len,ty=-Math.cos(a)*len;
  art+=line(`M${n(x)} ${n(y)}Q${n(x+tx*.2)} ${n(y+ty*.62)} ${n(x+tx)} ${n(y+ty)}`,INK,.65+depth*.72,.6+rnd()*.35);
  if(k%3===0)art+=line(`M${n(x+tx*.45)} ${n(y+ty*.56)}l${n(tx*.4+1)} ${n(ty*.1-1.8)}`,INK,.5+depth*.4,.75);
 }
 art+=line(`M${n(x-size*.9)} ${n(y+1)}q${n(size)} -2 ${n(size*1.9)} .3`,INK,.5,.5);
}
// Novel weathered rock groups and desert stems near both foreground margins.
for(const [x,y,s] of [[65,878,1.4],[259,916,1.7],[1377,862,1.1],[1535,923,2],[963,947,1.5]]){
 art+=`<g transform="translate(${x} ${y}) scale(${s})">`;
 art+=line('M-16 0-12-7-5-10 5-9 13-4 15 0Z',INK,1,.9);
 art+=line('M-12-6 1-5 5-9M1-5 5 0M-6-8-4-1M8-6 10-1',INK,.6,.7);
 for(let k=0;k<11;k++){const xx=-24+rnd()*52;art+=line(`M${n(xx)} 1q${n((rnd()-.5)*12)} -12 ${n((rnd()-.5)*20)} ${n(-8-rnd()*22)}`,INK,.8,.9);}
 art+='</g>';
}
art+='</g>';
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><title>Original desert engraving</title><desc>Seeded original vector landscape: stratified ridges, sand, stone and sage. No source artwork pixels.</desc>${art}</svg>`;
const sky=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>Original blue paper</title>${paperMarkup}</svg>`;
const dir=path.resolve(import.meta.dirname,'../assets');await fs.writeFile(path.join(dir,'original-desert.svg'),svg+'\n');await fs.writeFile(path.join(dir,'original-blue-paper.svg'),sky+'\n');console.log('Original seeded desert and paper SVG assets written; zero image inputs.');
