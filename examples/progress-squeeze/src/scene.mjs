import {STYLE_KEYS,LABEL_KEYS} from './measured-styles.mjs';
/** Independently reconstructed from public footage, not original source code. */
export const WIDTH=956, HEIGHT=716, DURATION=6.6;
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const mix=(a,b,p)=>a+(b-a)*p;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
export function spring(t,release=false){const omega=release?15.944:16.669,z=release?.386:.423,wd=omega*Math.sqrt(1-z*z);t=Math.max(0,t);return 1-Math.exp(-z*omega*t)*(Math.cos(wd*t)+z*omega/wd*Math.sin(wd*t));}
export function measuredStyle(t){let i=1;while(i<STYLE_KEYS.length-1&&STYLE_KEYS[i][0]<t)i++;const a=STYLE_KEYS[i-1],b=STYLE_KEYS[i],p=clamp((t-a[0])/(b[0]-a[0]));return a.slice(1).map((v,j)=>mix(v,b[j+1],p));}
function colorEase(t){t=clamp(t/.32);let lo=0,hi=1;for(let i=0;i<15;i++){let u=(lo+hi)/2,x=3*(1-u)*(1-u)*u*.25+3*(1-u)*u*u*.25+u*u*u;if(x<t)lo=u;else hi=u;}let u=(lo+hi)/2;return 3*(1-u)*(1-u)*u*.1+3*(1-u)*u*u+u*u*u;}
export function color(a,b,p){return `rgb(${a.map((v,i)=>Math.round(mix(v,b[i],clamp(p)))).join(',')})`;}
const EVENTS=[{time:.901669,paused:true,progress:.318},{time:1.865651,paused:false,progress:.318},{time:3.4353,paused:true,progress:.818},{time:4.730329,paused:false,progress:.818}];
export function demoState(time){
 const t=((time%DURATION)+DURATION)%DURATION;
 let progress=clamp(t*.347),paused=false,changeAt=-10;
 for(const e of EVENTS){if(t>=e.time){paused=e.paused;changeAt=e.time;const dt=t-e.time;progress=paused?e.progress:clamp(e.progress+.347*(dt-.09*(1-Math.exp(-dt/.09))));}}
 let opacity=1;
 if(t>5.62){const r=smooth((t-5.62)/.7);progress=1-r;opacity=1-.7*Math.sin(r*Math.PI);paused=false;changeAt=-10;}
 if(t>=6.32)progress=0;
 const measured=t<=5.441667?measuredStyle(t):null;if(measured)progress=measured[0]/956;let label=null;if(measured){label=0;for(const [at,value] of LABEL_KEYS){if(t+1e-6>=at)label=value;else break;}}return {progress,paused,elapsed:t-changeAt,opacity,measured,label};
}
export function createState(){return {progress:0,paused:false,elapsed:10,opacity:1};}
export function reduce(state,action){
 const {measured,label,...clean}=state;state=clean;
 if(action.type==='tick')return {...state,progress:clamp(state.progress+(state.paused?0:Math.max(0,action.dt)*.347)),elapsed:state.elapsed+Math.max(0,action.dt)};
 if(action.type==='toggle')return {...state,paused:!state.paused,elapsed:0};
 if(action.type==='reset')return createState();
 return state;
}
const n=x=>Number(x.toFixed(3));
const point=(x,y)=>[x,y];
function quadratic(a,c,b){return [a,a.map((v,i)=>v+(c[i]-v)*2/3),b.map((v,i)=>v+(c[i]-v)*2/3),b];}
function at(seg,t){const u=1-t;return [0,1].map(k=>u*u*u*seg[0][k]+3*u*u*t*seg[1][k]+3*u*t*t*seg[2][k]+t*t*t*seg[3][k]);}
function derivative(seg,t){const u=1-t;return [0,1].map(k=>3*u*u*(seg[1][k]-seg[0][k])+6*u*t*(seg[2][k]-seg[1][k])+3*t*t*(seg[3][k]-seg[2][k]));}
function pieces(seg,count){return Array.from({length:count},(_,i)=>{const a=i/count,b=(i+1)/count,p=at(seg,a),q=at(seg,b),v=derivative(seg,a),w=derivative(seg,b);return [p,p.map((x,j)=>x+v[j]/count/3),q.map((x,j)=>x-w[j]/count/3),q];});}
export function knot(end,q){
 if(Math.abs(q)<.005)return `M0 359 H${n(end)}`;
 const u=end-225+119*q,b=end-150+63*q,c=end-78+11*q,A=40*q,B=20*q,Y=359,wr=40;
 const W0=point(u-2*wr,Y),U=point(u,Y-A),V=point(b,Y+A),S=point(c,Y-B),W1=point(Math.min(end,c+2*wr),Y);
 const wave=[...pieces([W0,point(u-wr,Y),point(u-wr,Y-A),U],2),...pieces([U,point(u+wr,Y-A),point(b-wr,Y+A),V],3),...pieces([V,point(b+wr,Y+A),point(c-wr,Y-B),S],3),...pieces([S,point(c+wr,Y-B),point(c+wr,Y),W1],2)];
 const r=9,entryShift=90*Math.max(0,q-1),ry=9,sy=Math.min(9,Math.abs(B)),C0=point(u-2*r+entryShift,Y),L1=point(u-r,Y-A+ry),R1=point(u+r,Y-A+ry),L2=point(b-r,Y+A-ry),R2=point(b+r,Y+A-ry),L3=point(c-r,Y-B+sy),R3=point(c+r,Y-B+sy),C1=point(Math.min(end,c+2*r),Y);
 const sharp=[[C0,point(u-r+entryShift,Y),L1,L1],quadratic(L1,point(u-r,Y-A),U),quadratic(U,point(u+r,Y-A),R1),[R1,R1,L2,L2],quadratic(L2,point(b-r,Y+A),V),quadratic(V,point(b+r,Y+A),R2),[R2,R2,L3,L3],quadratic(L3,point(c-r,Y-B),S),quadratic(S,point(c+r,Y-B),R3),[R3,point(c+r,Y),C1,C1]];
 const blend=smooth((q-.35)/.5),curves=wave.map((seg,i)=>seg.map((p,j)=>p.map((v,k)=>mix(v,sharp[i][j][k],blend))));
 return `M0 359 H${n(curves[0][0][0])}`+curves.map(seg=>' C'+seg.slice(1).map(p=>p.map(n).join(' ')).join(' ')).join('')+` H${n(end)}`;
}
export function scene(s){
 const e=s.elapsed,q=s.paused?spring(e):1-spring(e,true),c=s.paused?colorEase(e):1-colorEase(e);
 let fg=color([250,251,255],[46,31,5],c),bg=color([45,72,247],[244,158,46],c),fill=color([56,83,245],[228,147,42],c);
 if(s.measured){const m=s.measured;bg=`rgb(${m.slice(1,4).map(Math.round)})`;fill=`rgb(${m.slice(4,7).map(Math.round)})`;fg=`rgb(${m.slice(7,10).map(Math.round)})`;}
 const pct=s.measured?color(s.measured.slice(7,10),s.measured.slice(1,4),.5):color([151,165,249],[147,95,25],c);
 const end=clamp(s.progress)*956,display=s.label??Math.min(100,Math.floor(clamp(s.progress)*100+.1)),icon=smooth(e/.12),po=s.paused?1-icon:icon,ro=1-po;
 const d=end<205||Math.abs(q)<.005?`M0 359 H${n(end)}`:knot(end,q);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 956 716" width="956" height="716"><defs><clipPath id="lineClip"><rect x="0" y="260" width="${n(end+4.5)}" height="200"/></clipPath></defs><rect width="956" height="716" fill="${bg}"/><g opacity="${s.opacity??1}"><rect width="${n(end)}" height="716" fill="${fill}"/><text x="478" y="239" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="66" letter-spacing="1.4" font-weight="400" fill="${fg}">${display}<tspan fill="${pct}">%</tspan></text><path clip-path="url(#lineClip)" d="${d}" fill="none" stroke="${fg}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity="${end>0?1:0}"/><g stroke="${fg}" stroke-width="6.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><g opacity="${n(po)}" transform="translate(478 509) scale(${n(1-.4*ro)}) translate(-478 -509)"><circle cx="478" cy="509" r="33"/><path d="M470 499v20 M486 499v20"/></g><g opacity="${n(ro)}" transform="translate(478 509) scale(${n(1-.4*po)}) translate(-478 -509)"><path d="M446 501a33 33 0 0 1 61 0 M444 482v20h20 M510 518a33 33 0 0 1-62 0 M511 537v-20h-20"/></g></g></g></svg>`;
}
