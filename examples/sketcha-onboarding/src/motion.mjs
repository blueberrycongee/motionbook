/** Seconds after the successful tap release. Measured from the two filmed demos. */
export const TIMES = Object.freeze({
  hintGone: .20, lookStart: .60, lookEnd: 1.60,
  turnAway: 1.63, crouchStart: 1.93, leapStart: 2.06,
  contact: 2.33, scratchStart: 2.53, scratchEnd: 3.00,
  tearStart: 3.51, menuVisible: 3.73, finish: 3.81,
});
export const WIDTH=390, HEIGHT=844;
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const mix=(a,b,p)=>a+(b-a)*p;
export const smooth=p=>{p=clamp(p);return p*p*(3-2*p);};
export const outCubic=p=>1-(1-clamp(p))**3;
export const inCubic=p=>clamp(p)**3;
export const range=(t,a,b)=>clamp((t-a)/(b-a));

export function poseAt(t, idleTime=0) {
  if (t<0) return {phase:'idle', hint:1, look:0, crouch:0, front:0, jump:0, y:0, sx:1, sy:1, scratch:0, tear:0, tail:Math.sin(idleTime*1.4)*.7, done:false};
  const look=smooth(range(t,.60,.83))*(1-smooth(range(t,1.63,1.90)));
  const crouch=smooth(range(t,1.93,2.04))*(1-smooth(range(t,2.06,2.14)));
  const jump=outCubic(range(t,2.06,2.33));
  const front=smooth(range(t,2.12,2.29));
  const scratch=outCubic(range(t,2.53,3.00));
  const tear=range(t,3.51,3.81);
  const impact=t>=2.33&&t<2.53?Math.sin(range(t,2.33,2.53)*Math.PI)*-11:0;
  const fall=570*smooth(range(t,3.45,3.84));
  const y=mix(0,-313,jump)+scratch*102+impact+fall;
  let phase=t<.60?'waiting':t<1.63?'glance':t<1.93?'turn':t<2.06?'crouch':t<2.33?'leap':t<2.53?'impact':t<3.00?'scratch':t<3.51?'hold':t<3.81?'peel':'menu';
  return {phase,hint:1-range(t,0,.20),look,crouch,front,jump,y,
    sx:1+crouch*.065,sy:1-crouch*.10,
    scratch,tear,tail:Math.sin(t*5)*1.5,done:t>=TIMES.finish};
}

export class OnboardingController {
  constructor({reducedMotion=false}={}){this.reducedMotion=reducedMotion;this.startedAt=null;this.state='idle';}
  tap(now){if(this.state!=='idle')return false; this.startedAt=now;this.state=this.reducedMotion?'menu':'animating';return true;}
  time(now){if(this.state==='idle')return -1;if(this.state==='menu')return TIMES.finish;const t=Math.max(0,(now-this.startedAt)/1000);if(t>=TIMES.finish)this.state='menu';return Math.min(t,TIMES.finish);}
  reset(){this.startedAt=null;this.state='idle';}
  reduce(now){this.reducedMotion=true;if(this.state==='animating'){this.startedAt=now-TIMES.finish*1000;this.state='menu';}}
}
