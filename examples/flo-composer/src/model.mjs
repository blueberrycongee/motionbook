// Original reconstruction from visual measurements of the public reference video.
// No upstream component source is included or used.
export const spec = Object.freeze({ width:1090, height:1238, duration:6.7, cardX:241, cardY:416, cardHeight:305, travel:105, shellHeight:411, radius:55, connectAt:2.10, approvalAt:4.76 });
export const clamp = x => Math.max(0,Math.min(1,x));
export const ease = x => { x=clamp(x); return 1-(1-x)**3; };
const smooth = x => {x=clamp(x);return x*x*(3-2*x);};
// Measured from 60 fps reference frames: two left-to-right waves, about 8 px high.
// A short rounded apex and a slower landing fit the observed colored-pixel centers.
export const hopSpec=Object.freeze({start:.817,repeat:.650,stagger:.090,height:8,up:.180,hold:.040,down:.200,waves:2});
export const sweepSpec=Object.freeze({apps:{start:.817,period:.65,waves:2,center:333.621,speed:759.287,halfWidth:92.975,base:128,peak:25.485,textX:444,textWidth:246},approval:{start:3.483333,period:.65,waves:2,center:267.563,speed:1054.608,halfWidth:127.912,base:138,peak:26.369,textX:422,textWidth:307}});
export function interpolateKeys(t,keys){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++){if(t<=keys[i][0]){const [a,x]=keys[i-1],[b,y]=keys[i];return x+(y-x)*(t-a)/(b-a);}}return keys.at(-1)[1];}
const appGray=[[0,128],[.516667,128],[.533333,112],[.55,101],[.566667,86],[.616667,77],[.8,77],[.816667,78],[.833333,89],[.85,98],[.866667,107],[.883333,114],[.9,119],[.916667,123],[.95,123],[.966667,128]];
const approvalGray=[[0,138],[3.283333,138],[3.3,120],[3.316667,108],[3.333333,99],[3.35,89],[3.4,82],[3.466667,81],[3.483333,85],[3.5,97],[3.516667,109],[3.533333,118],[3.55,125],[3.566667,138]];
export function textSweepAt(t,region){const p=sweepSpec[region],elapsed=t-p.start,active=elapsed>=0&&elapsed<p.period*p.waves;return {active,center:p.center+p.speed*((Math.max(0,elapsed))%p.period),halfWidth:p.halfWidth,base:interpolateKeys(t,region==='apps'?appGray:approvalGray),peak:p.peak};}
export function sweepGrayAt(t,region,x){const s=textSweepAt(t,region);return s.active?s.base-(s.base-s.peak)*Math.max(0,1-Math.abs(x-s.center)/s.halfWidth):s.base;}
const waveKeys=[[0,0],[.016667,3],[.033333,7],[.066667,14],[.10,18],[.116667,16],[.15,8],[.166667,2.5],[.2,-7],[.216667,-9.5],[.25,-10],[.266667,-7.5],[.3,-1],[.316667,3],[.35,7],[.366667,7],[.40,4],[.433333,0],[.46,0]];
export function handWaveAt(t){const elapsed=t-sweepSpec.approval.start;if(elapsed<0||elapsed>=1.30)return 0;return interpolateKeys(elapsed%.65,waveKeys);}
// White-card top sampled at x=800 in the original video, normalized to its travel.
const slideKeys=[[2.10,0],[2.133333,1],[2.166667,1],[2.20,2],[2.233333,4],[2.266667,7],[2.30,12],[2.333333,20],[2.366667,37],[2.40,63],[2.433333,80],[2.466667,87],[2.50,95],[2.533333,97],[2.566667,101],[2.60,103],[2.70,103]];
export function iconHopAt(t,index){
  let y=0;
  for(let wave=0;wave<hopSpec.waves;wave++){
    const p=t-hopSpec.start-wave*hopSpec.repeat-index*hopSpec.stagger;
    const h=p<0?0:p<hopSpec.up?smooth(p/hopSpec.up):p<hopSpec.up+hopSpec.hold?1:p<hopSpec.up+hopSpec.hold+hopSpec.down?1-smooth((p-hopSpec.up-hopSpec.hold)/hopSpec.down):0;
    y=Math.min(y,-hopSpec.height*h);
  }
  return y||0;
}
export function stateAt(t) {
  t=Math.max(0,Number(t)||0);
  const approval=clamp((t-spec.approvalAt)/.38);
  return { t, iconY:[0,1,2].map(i=>iconHopAt(t,i)),connectText:textSweepAt(t,'apps'),approvalText:textSweepAt(t,'approval'),handRotation:handWaveAt(t),handScale:1-ease((t-spec.approvalAt)/.15),requestBlur:6*ease((t-spec.approvalAt)/.12),grantedBlur:8*(1-ease((t-spec.approvalAt-.10)/.32)),shieldScale:ease((t-spec.approvalAt-.10)/.32),connect:interpolateKeys(t,slideKeys)/103, appOpacity:1-ease((t-2.10)/.16), projectOpacity:ease((t-2.30)/.15), approval:ease(approval), requestOpacity:1-ease((t-spec.approvalAt)/.2), grantedOpacity:ease((t-spec.approvalAt-.10)/.26), blur:Math.sin(approval*Math.PI)*2.4 };
}
export class Composer {
  constructor(){this.reset();}
  reset(){this.connected=false;this.unrestricted=false;this.connectStarted=null;this.approvalStarted=null;this.hopStarted=null;this.approvalFeedbackStarted=null;this.hovered={apps:false,approval:false};}
  hover(region,enabled){this.hovered[region]=enabled;}
  connect(now){if(this.connected)return false;this.connected=true;this.hopStarted=now;this.connectStarted=now+(spec.connectAt-hopSpec.start)*1000;return true;}
  approve(now){if(this.unrestricted)return false;this.unrestricted=true;this.approvalFeedbackStarted=now;this.approvalStarted=now+(spec.approvalAt-sweepSpec.approval.start)*1000;return true;}
  state(now){const c=this.connectStarted===null?null:stateAt(spec.connectAt+(now-this.connectStarted)/1000);const a=this.approvalStarted===null?null:stateAt(spec.approvalAt+(now-this.approvalStarted)/1000);const connectText=c?.connectText??{...textSweepAt(0,'apps'),base:this.hovered.apps?77:128};const approvalText=a?.approvalText??{...textSweepAt(0,'approval'),base:this.hovered.approval?81:138};return{t:0,iconY:c?.iconY??[0,0,0],connectText,approvalText,handRotation:a?.handRotation??0,handScale:a?.handScale??1,requestBlur:a?.requestBlur??0,grantedBlur:a?.grantedBlur??8,shieldScale:a?.shieldScale??0,connect:c?.connect??0,appOpacity:c?.appOpacity??1,projectOpacity:c?.projectOpacity??0,approval:a?.approval??0,requestOpacity:a?.requestOpacity??1,grantedOpacity:a?.grantedOpacity??0,blur:a?.blur??0};}
}
