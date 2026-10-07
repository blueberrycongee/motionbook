/** Little Wins: original non-bird celebration rig built from Kenney CC0 parts.
 * Character artwork: assets/manifest.json. Source PNG bytes remain unmodified.
 * Browser and offline renderer both consume this exact SVG function.
 */
import {ASSETS} from './assets.js';
export const DURATION=7.5,FPS=20,SIZE={width:204,height:400};
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const ramp=(t,a,b)=>smooth(clamp((t-a)/(b-a)));
const n=v=>Number(v.toFixed(4));
export function track(t,keys){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++)if(t<=keys[i][0])return lerp(keys[i-1][1],keys[i][1],smooth((t-keys[i-1][0])/(keys[i][0]-keys[i-1][0])));return keys.at(-1)[1];}
export function stateAt(input=0,{reducedMotion=false}={}){
 const t=reducedMotion?DURATION:clamp(Number.isFinite(input)?input:0,0,DURATION);
 const charge=track(t,[[0,0],[3.6,0],[3.65,.06],[3.7,.42],[3.75,.94],[3.8,1]]);
 const yaw=t<1.95?0:track(t,[[1.95,0],[2.05,Math.PI],[2.2,2*Math.PI],[2.4,4*Math.PI],[2.6,6*Math.PI],[2.8,8*Math.PI],[3.0,10*Math.PI],[3.2,12*Math.PI],[3.4,14*Math.PI],[3.65,16*Math.PI]]);
 const y=track(t,[[0,137],[1.5,137],[1.75,145],[1.9,145],[1.95,139],[2.05,116],[2.3,104],[3.0,104],[3.4,111],[3.65,115],[3.8,106],[4.1,101],[4.8,101],[5.05,104],[5.15,111],[5.25,137],[5.4,147],[5.75,147],[5.95,134],[6.15,137],[7.5,137]]);
 return {t,charge,yaw,y,phase:t<.7?'count':t<1.55?'hello':t<1.95?'anticipation':t<3.65?'spin':t<3.85?'supercharge':t<5.1?'celebrate':t<5.8?'landing':'complete',
  countY:track(t,[[0,139],[.15,139],[.2,164],[.25,189],[.3,207],[.4,222],[.55,224],[7.5,224]]),
  alpha:track(t,[[0,0],[.65,0],[.7,.25],[.75,.55],[.8,.8],[.85,1]]),
  sx:track(t,[[0,1],[1.5,1],[1.75,1.16],[1.9,1.13],[2.05,.93],[3.4,.96],[3.65,.9],[3.8,1.08],[4.1,1],[5.25,1],[5.4,1.16],[5.75,1.16],[5.95,.96],[6.15,1]]),
  sy:track(t,[[0,1],[1.5,1],[1.75,.78],[1.9,.8],[2.05,1.05],[3.4,.82],[3.65,.72],[3.8,1.04],[4.1,1],[5.25,.94],[5.4,.72],[5.75,.72],[5.95,1.07],[6.15,1]]),
  arm:track(t,[[0,10],[1.5,10],[1.75,50],[1.9,40],[2.1,8],[3.55,8],[3.75,146],[4.2,133],[4.65,142],[5.05,130],[5.25,80],[5.4,35],[5.75,30],[5.95,18],[6.15,12]]),
  leg:track(t,[[0,0],[1.6,0],[1.8,12],[2.0,0],[2.3,12],[3.3,9],[3.75,19],[5.1,16],[5.4,0],[7.5,0]]),
  blink:Math.max(track(t,[[0,0],[.85,0],[.9,1],[.95,1],[1.05,0]]),ramp(t,1.55,1.7)*(1-ramp(t,3.65,3.8))),
  burst:ramp(t,3.65,3.82)*(1-ramp(t,4.0,4.75)),
  stars:ramp(t,3.7,3.9)*(1-ramp(t,5.15,5.65)),
  controls:track(t,[[0,0],[5.65,0],[5.7,.28],[5.75,.55],[5.8,.8],[5.85,.88],[5.9,.97],[5.95,1]])};
}
const g=(content,transform='',attrs='')=>`<g${transform?` transform="${transform}"`:''} ${attrs}>${content}</g>`;
const path=(d,fill,attrs='')=>`<path d="${d}" fill="${fill}" ${attrs}/>`;
const circle=(x,y,r,fill,attrs='')=>`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fill}" ${attrs}/>`;
function sprite(name,x,y,w,h,attrs=''){return `<image href="${ASSETS[name].url}" x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" ${attrs}/>`;}
const star='M 0 -9 L 2.9 -2.9 L 9 0 L 2.9 2.9 L 0 9 L -2.9 2.9 L -9 0 L -2.9 -2.9 Z';
function monster(s){
 const facing=Math.cos(s.yaw), front=s.charge>.5?1:clamp((facing+.1)/.65),side=Math.sin(s.yaw);
 const width=.62+.38*Math.abs(facing);
 const bodyFilter=s.charge>.5?'charged':'lavender';
 let parts='';
 for(const sign of [-1,1]){
  parts+=g(sprite('leg_whiteD.png',-6,0,16,28,'filter="url(#lavender)"'),`translate(${sign*12} 14) rotate(${sign*-s.leg}) scale(${sign} 1)`);
  parts+=g(sprite('arm_whiteB.png',-4,-3,11,35,`filter="url(#${bodyFilter})"`),`translate(${sign*22} -14) rotate(${sign*-s.arm}) scale(${sign} 1)`);
 }
 // A rounded-square body, a single eye, arms/legs and small white horns.
 // No owl silhouette, beak, wings, flame body or sunglasses are used.
 parts+=g(sprite('detail_white_horn_large.png',-23,-44,14,15),`rotate(-25 -15 -28)`);
 parts+=g(sprite('detail_white_horn_large.png',-23,-44,14,15),`scale(-1 1) rotate(-25 -15 -28)`);
 parts+=sprite('body_whiteA.png',-24,-29,48,51,`filter="url(#${bodyFilter})"`);
 if(front>.001){
  let face=sprite('eye_cute_light.png',-12,-19,24,25.9,`opacity="${n(1-s.blink)}"`);
  if(s.blink>.001)face+=sprite('eye_closed_happy.png',-9,-10,18,7.7,`opacity="${n(s.blink)}"`);
  face+=s.charge>.5?sprite('mouthB.png',-9,8,18,8.8):sprite('mouth_closed_happy.png',-9,10,18,5.4);
  parts+=g(face,`translate(${n(side*10*(1-s.charge))} 0) scale(${n(Math.max(.25,Math.abs(facing))*(1-s.charge)+s.charge)} 1)`,`opacity="${n(front)}"`);
 }
 if(s.charge>.5){
  parts+=g(path(star,'#d9fff9'),`translate(-25 -23) rotate(${n((s.t-3.7)*16)}) scale(.38)`,`opacity="${n(.7+.3*Math.cos(s.t*4))}"`);
  parts+=g(path(star,'#85f2e1'),`translate(28 -2) rotate(${n(-(s.t-3.7)*22)}) scale(.26)`);
 }
 const roll=s.charge>.5?Math.sin((s.t-3.8)*5)*2*(1-ramp(s.t,5,5.4)):0;
 return g(parts,`translate(102 ${n(s.y)}) rotate(${n(roll)}) scale(${n(s.sx*(s.charge>.5?1:width))} ${n(s.sy)})`,`opacity="${n(s.alpha)}"`);
}
function celebration(s){
 let out='';
 if(s.burst>.001){
  const spread=track(s.t,[[3.65,10],[3.8,67],[4.1,75],[4.75,92]]);
  for(let i=0;i<12;i++){
   const a=i*30+(s.t-3.8)*8;
   out+=g(path('M -3 -35 L 0 -80 L 4 -35 Z',i%2?'#88f2e2':'#cbc3ff'),`translate(102 ${n(s.y)}) rotate(${n(a)}) scale(${n(spread/80)} ${n(spread/80*.72)})`,`opacity="${n(s.burst*.7)}"`);
  }
  out+=`<circle cx="102" cy="${n(s.y)}" r="${n(spread*.7)}" fill="none" stroke="#8bf3e2" stroke-width="1.5" opacity="${n(s.burst*.6)}"/>`;
 }
 if(s.stars>.001){
  for(let i=0;i<10;i++){
   const a=(i*36+12)*Math.PI/180,r=track(s.t,[[3.7,25],[3.9,67],[5,78],[5.65,86]]);
   const x=102+Math.cos(a)*r,y=112+Math.sin(a)*r*.68+(s.t-4)*7;
   out+=g(path(star,['#8af2e2','#f4b7e3','#e8e3ff'][i%3]),`translate(${n(x)} ${n(y)}) rotate(${n(i*25+s.t*30)}) scale(${n(.2+(i%3)*.08)})`,`opacity="${n(s.stars)}"`);
  }
 }
 return out;
}
export function renderSVG(input=0,options={}){
 const s=stateAt(input,options),c=s.charge;
 const bg=`rgb(${Math.round(lerp(250,45,c))},${Math.round(lerp(247,40,c))},${Math.round(lerp(242,82,c))})`;
 const fg=c>.5?'#f5f1ff':'#514572',muted=c>.5?'#b9b1d7':'#978ca7';
 const defs=`<defs><filter id="lavender" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope=".6" intercept=".1"/><feFuncG type="linear" slope=".5" intercept=".04"/><feFuncB type="linear" slope=".7" intercept=".25"/></feComponentTransfer></filter><filter id="charged" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope=".64" intercept=".17"/><feFuncG type="linear" slope=".58" intercept=".15"/><feFuncB type="linear" slope=".65" intercept=".35"/></feComponentTransfer></filter></defs>`;
 let out=`<rect width="204" height="400" fill="${bg}"/><text x="102" y="38" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.8" font-weight="700" letter-spacing="2.4" fill="${muted}">LITTLE WINS</text>`;
 out+=`<ellipse cx="102" cy="183" rx="${n(24-8*ramp(s.t,1.95,2.3))}" ry="2.4" fill="${c>.5?'#201d3e':'#d9d1e0'}" opacity="${n(s.alpha*.6)}"/>`;
 out+=celebration(s)+monster(s);
 out+=`<text x="102" y="${n(s.countY+15)}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="54" font-weight="700" fill="${fg}">3</text><text x="102" y="${n(s.countY+43)}" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.2" font-weight="700" letter-spacing="1.2" fill="${muted}">DAYS OF SHOWING UP</text>`;
 if(s.controls>.001)out+=g(`<rect x="22" y="330" width="160" height="30" rx="15" fill="#a7f1e2"/><text x="102" y="349" text-anchor="middle" font-family="Arial,sans-serif" font-size="8.5" font-weight="700" letter-spacing="1.3" fill="#353256">KEEP GOING</text><text x="102" y="378" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.7" letter-spacing=".3" fill="#b9b1d7">A little progress is still progress</text>`,'',`opacity="${n(s.controls)}"`);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="204" height="400" viewBox="0 0 204 400" role="img" aria-label="Little Wins celebration with a CC0-part monster" data-time="${n(s.t)}" data-phase="${s.phase}">${defs}${out}</svg>`;
}
