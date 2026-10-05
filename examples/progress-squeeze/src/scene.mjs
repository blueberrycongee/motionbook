/** Independently reconstructed from public footage, not original source code. */
export const WIDTH=956, HEIGHT=716, DURATION=6.6;
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const mix=(a,b,p)=>a+(b-a)*p;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
export function spring(t){t*=.75;return t<=0?0:1-Math.exp(-15*t)*(Math.cos(25*t)+.6*Math.sin(25*t));}
function colorEase(t){t=clamp(t/.32);let lo=0,hi=1;for(let i=0;i<15;i++){let u=(lo+hi)/2,x=3*(1-u)*(1-u)*u*.25+3*(1-u)*u*u*.25+u*u*u;if(x<t)lo=u;else hi=u;}let u=(lo+hi)/2;return 3*(1-u)*(1-u)*u*.1+3*(1-u)*u*u+u*u*u;}
export function color(a,b,p){return `rgb(${a.map((v,i)=>Math.round(mix(v,b[i],clamp(p)))).join(',')})`;}
const EVENTS=[{time:.925,paused:true,progress:.318},{time:1.883,paused:false,progress:.318},{time:3.442,paused:true,progress:.818},{time:4.758,paused:false,progress:.818}];
export function demoState(time){
 const t=((time%DURATION)+DURATION)%DURATION;
 let progress=clamp(t*.347),paused=false,changeAt=-10;
 for(const e of EVENTS){if(t>=e.time){paused=e.paused;changeAt=e.time;const dt=t-e.time;progress=paused?e.progress:clamp(e.progress+.347*(dt-.09*(1-Math.exp(-dt/.09))));}}
 let opacity=1;
 if(t>5.62){const r=smooth((t-5.62)/.7);progress=1-r;opacity=1-.7*Math.sin(r*Math.PI);paused=false;changeAt=-10;}
 if(t>=6.32)progress=0;
 return {progress,paused,elapsed:t-changeAt,opacity};
}
export function createState(){return {progress:0,paused:false,elapsed:10,opacity:1};}
export function reduce(state,action){
 if(action.type==='tick')return {...state,progress:clamp(state.progress+(state.paused?0:Math.max(0,action.dt)*.347)),elapsed:state.elapsed+Math.max(0,action.dt)};
 if(action.type==='toggle')return {...state,paused:!state.paused,elapsed:0};
 if(action.type==='reset')return createState();
 return state;
}
const n=x=>Number(x.toFixed(3));
function knot(end,q){
 if(q<0){const center=end-165;let d='M0 359';for(let x=0;x<end;x+=3){const u=(x-center)/75;d+=` L${n(x)} ${n(359+q*42*Math.sin(u*2.4)*Math.exp(-u*u/2))}`;}return d+` L${n(end)} 359`;} 
 // Width collapses into a tight elastic fold. A small overshoot deliberately crosses the fold.
 const w=mix(292,76,q),a=end-86-w/2,A=39*q,B=18*q;
 const x=f=>n(a+w*f),y=v=>n(359+v);
 return `M 0 359 H ${x(0)} C ${x(.11)} 359 ${x(.14)} ${y(-A*.16)} ${x(.14)} ${y(-A*.76)} C ${x(.14)} ${y(-A)} ${x(.18)} ${y(-A)} ${x(.26)} ${y(-A)} C ${x(.34)} ${y(-A)} ${x(.36)} ${y(-A*.9)} ${x(.36)} ${y(-A*.72)} L ${x(.36)} ${y(A*.8)} C ${x(.36)} ${y(A)} ${x(.41)} ${y(A)} ${x(.49)} ${y(A)} C ${x(.57)} ${y(A)} ${x(.61)} ${y(A*.9)} ${x(.61)} ${y(A*.72)} L ${x(.61)} ${y(-B*.7)} C ${x(.61)} ${y(-B)} ${x(.65)} ${y(-B)} ${x(.73)} ${y(-B)} C ${x(.8)} ${y(-B)} ${x(.82)} ${y(-B*.8)} ${x(.82)} ${y(-B*.4)} C ${x(.85)} 359 ${x(.91)} 359 ${x(1)} 359 H ${n(end)}`;
}
export function scene(s){
 const e=s.elapsed,q=s.paused?spring(e):1-spring(e),c=s.paused?colorEase(e):1-colorEase(e);
 const fg=color([250,251,255],[46,31,5],c),bg=color([45,72,247],[244,158,46],c),fill=color([56,83,245],[228,147,42],c);
 const end=clamp(s.progress)*956,display=Math.floor(clamp(s.progress)*100),icon=smooth(e/.12),po=s.paused?1-icon:icon,ro=1-po;
 const d=end<205||Math.abs(q)<.005?`M0 359 H${n(end)}`:knot(end,q);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 956 716" width="956" height="716"><rect width="956" height="716" fill="${bg}"/><g opacity="${s.opacity??1}"><rect width="${n(end)}" height="716" fill="${fill}"/><text x="478" y="239" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="66" letter-spacing="1.4" font-weight="400" fill="${fg}">${display}<tspan fill="${color([151,165,249],[147,95,25],c)}">%</tspan></text><path d="${d}" fill="none" stroke="${fg}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity="${end>0?1:0}"/><g stroke="${fg}" stroke-width="6.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><g opacity="${n(po)}" transform="rotate(${n(-75*ro)} 478 509)"><circle cx="478" cy="509" r="33"/><path d="M470 499v20 M486 499v20"/></g><g opacity="${n(ro)}" transform="rotate(${n(90*po)} 478 509)"><path d="M446 501a33 33 0 0 1 61 0 M444 482v20h20 M510 518a33 33 0 0 1-62 0 M511 537v-20h-20"/></g></g></g></svg>`;
}
