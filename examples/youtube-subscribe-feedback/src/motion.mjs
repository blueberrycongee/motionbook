/** 2025 official red–magenta component study. Not a claim of universal 2026 rollout.
 * Shared browser/offline model. Seconds; deterministic event/particle state. */
export const TIMING=Object.freeze({cue:8/30,hint:17/30,hintEnd:73/30,click:71/30,sourceClick:24/30,labelDelay:8/30,settle:2.25,duration:5.4});
export const BUTTON=Object.freeze({x:474,y:410,width:126,height:48,finalWidth:79});
export const clamp=(v,lo=0,hi=1)=>Math.min(hi,Math.max(lo,v));
export const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
export const lerp=(a,b,t)=>a+(b-a)*t;
export const mix=(a,b,t)=>a.map((v,i)=>Math.round(lerp(v,b[i],clamp(t))));
function random(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const COLOR_KEYS=[{t:0,l:[255,255,255],r:[255,255,255]},{t:.067,l:[255,204,227],r:[255,255,255]},{t:.133,l:[255,72,148],r:[255,224,235]},{t:.2,l:[255,0,55],r:[248,66,148]},{t:.3,l:[255,0,55],r:[252,20,135]},{t:.4,l:[126,40,54],r:[224,35,111]},{t:.5,l:[42,30,30],r:[112,46,73]},{t:.6,l:[26,26,26],r:[26,26,26]}];
export function rewardColor(age,side='l'){for(let i=1;i<COLOR_KEYS.length;i++){const n=COLOR_KEYS[i],p=COLOR_KEYS[i-1];if(age<=n.t)return mix(p[side],n[side],(age-p.t)/(n.t-p.t));}return[26,26,26];}
const HINT_GRAY=[[0,243],[.033333,203],[.066667,162],[.1,130],[.133333,103],[.166667,83],[.2,68],[.233333,57],[.266667,48],[.3,39],[.333333,34],[.366667,30],[.433333,26],[1.333333,26],[1.433333,31],[1.5,36],[1.533333,43],[1.566667,48],[1.6,59],[1.633333,69],[1.666667,85],[1.7,100],[1.733333,118],[1.766667,143],[1.8,171],[1.833333,206],[1.866667,255]];
const BELL_ANGLES=[[1.36,21.6],[1.4,21.6],[1.433333,13.6],[1.466667,9.8],[1.5,4.9],[1.533333,-3.8],[1.566667,-17.5],[1.6,-21.3],[1.633333,-23.2],[1.666667,-20.4],[1.7,-10.8],[1.733333,-.1],[1.766667,9.4],[1.8,21.4],[1.833333,30.3],[1.866667,30.2],[1.9,19.9],[1.933333,7.3],[1.966667,-9],[2,-15.5],[2.033333,-12],[2.066667,-3.6],[2.1,6.3],[2.133333,12.6],[2.166667,8.4],[2.2,5.8],[2.233333,0]];
function keyValue(keys,t){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const a=keys[i-1],b=keys[i];return lerp(a[1],b[1],clamp((t-a[0])/(b[0]-a[0])));}return keys.at(-1)[1];}
export function particles(seed=20250211){const rand=random(seed);const points=[[-.43,-.08,.267,'#ff174c',true],[-.365,-.5,.28,'#ff0644',true],[-.2,-.46,.29,'#ff0350',false],[.18,-.5,.30,'#ff0064',true],[.41,-.49,.31,'#ff1a62',false],[-.33,.55,.29,'#ff1551',false],[0,.52,.34,'#ff0554',true],[.33,.52,.37,'#ed1376',true],[.45,.27,.38,'#ff2082',true]];
return points.map(([u,v,delay,color,star],i)=>({u,v,delay,life:.66+(i%3)*.05,color,star,size:star?(i===8?6.7:5.6):3.4,rotation:rand()*Math.PI}));}
export class SubscribeMotion{
 constructor({reduced=false,seed=20250211,autoplay=true}={}){this.reduced=reduced;this.seed=seed;this.reset(0,{autoplay});}
 reset(now=0,{autoplay=false}={}){this.epoch=now;this.lastNow=now;this.autoplay=autoplay;this.clickedAt=null;this.activationCount=0;this.hintAt=autoplay?TIMING.hint:null;this.cueAt=autoplay?TIMING.cue:null;return this;}
 replay(now=0){return this.reset(now,{autoplay:true});}
 cue(now){if(this.clickedAt!==null)return false;this.cueAt=Math.max(0,now-this.epoch);this.hintAt=this.cueAt+.3;return true;}
 subscribe(now){if(this.clickedAt!==null)return false;this.clickedAt=Math.max(0,now-this.epoch);this.activationCount++;return true;}
 setReduced(value){this.reduced=!!value;}
 snapshot(now){
  if(!Number.isFinite(now))throw new TypeError('time must be finite');now=Math.max(this.lastNow,now);this.lastNow=now;const t=Math.max(0,now-this.epoch);
  if(this.autoplay&&this.clickedAt===null&&t>=TIMING.click)this.subscribe(this.epoch+TIMING.click);
  const subscribed=this.clickedAt!==null,age=subscribed?t-this.clickedAt:-1;
  const hintAge=this.hintAt===null?-1:t-this.hintAt,hd=TIMING.hintEnd-TIMING.hint;
  const hint=!subscribed&&hintAge>=0&&hintAge<hd;
  const hp=hint?(this.reduced?1:clamp((255-keyValue(HINT_GRAY,hintAge))/229)):0;
  const rim=hint?(this.reduced?1:smooth(hintAge/.13)*(1-smooth((hintAge-(hd-.1))/.1))):0;
  const collapse=subscribed?(this.reduced?1:smooth((age-1.15)/.24)):0;
  const labelAlpha=subscribed?(this.reduced?0:1-smooth((age-1.1)/.2)):1;
  const iconAlpha=subscribed?(this.reduced?1:smooth((age-1.36)/.13)):0;
  const shakeAge=age-1.42;
  const bellAngle=subscribed&&!this.reduced&&age>=1.36&&age<2.24?keyValue(BELL_ANGLES,age)*Math.PI/180:0;
  const color=subscribed?(this.reduced?[26,26,26]:rewardColor(age)):mix([255,255,255],[26,26,26],hp);
  const colorRight=subscribed?(this.reduced?[26,26,26]:rewardColor(age,'r')):color;
  const labelColor=subscribed?(this.reduced?[241,241,241]:mix([15,15,15],[255,255,255],smooth((age-.1)/.1))):mix([15,15,15],[241,241,241],hp);
  const reward=subscribed&&!this.reduced&&age<TIMING.settle;
  return{t,subscribed,age,phase:subscribed?(reward?'reward':'subscribed'):(hint?'hint':'idle'),hint,hintAge,hintMix:hp,glow:rim,collapse,labelAlpha,iconAlpha,bellAngle,color,colorRight,labelColor,label:subscribed&&age>=TIMING.labelDelay?'Subscribed':'Subscribe',width:lerp(BUTTON.width,BUTTON.finalWidth,collapse),scale:1,particles:reward?particles(this.seed).map(p=>({...p,progress:(age-p.delay)/p.life})).filter(p=>p.progress>=0&&p.progress<=1):[],cue:this.cueAt!==null&&t>=this.cueAt&&t<this.cueAt+1.2,reduced:this.reduced,activationCount:this.activationCount};
 }
}
export function demoFrame(t,{reduced=false}={}){return new SubscribeMotion({reduced}).snapshot(t);}
/** Isolated reference tracks. Official asset demonstrates cue and reward side by side. */
export function referenceHintFrame(t){const m=new SubscribeMotion({autoplay:false});m.hintAt=TIMING.hint;return m.snapshot(t);}
export function referenceRewardFrame(t){const m=new SubscribeMotion({autoplay:false});if(t>=TIMING.sourceClick)m.subscribe(TIMING.sourceClick);return m.snapshot(t);}
export function shortcut(e){if(e.ctrlKey||e.metaKey||e.altKey||e.repeat||e.isComposing||e.keyCode===229)return null;if(e.key==='Escape')return 'reset';const tag=e.target?.tagName?.toLowerCase();if(['input','textarea','select','button'].includes(tag)||e.target?.isContentEditable)return null;return e.key==='Escape'?'reset':e.key?.toLowerCase()==='r'?'replay':null;}
