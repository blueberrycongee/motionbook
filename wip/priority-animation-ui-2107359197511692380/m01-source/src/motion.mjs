export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
export function spring(t,decay=6,frequency=10.2){if(t<=0)return 0;return 1-Math.exp(-decay*t)*(Math.cos(frequency*t)+decay/frequency*Math.sin(frequency*t));}
export const referenceEvents=[{time:.526,type:'start'},{time:2.324,type:'cancel'},{time:3.607,type:'start'},{time:5.422,type:'cancel'},{time:6.823,type:'start'},{time:9.235,type:'cancel'}];
export function stateAt(time,events=referenceEvents){let q=0,start=null,last=null;for(const e of events){if(e.time>time)break;q+=(e.type==='start'?1:-1)*spring(time-e.time);if(e.type==='start')start=e.time;last=e;}const updating=last?.type==='start';const age=start===null?0:Math.max(0,time-start);const fade=updating?1:1-smooth((time-(last?.time??0))/.19);return{time,q,updating,age,fill:clamp((age-.17)/8)*fade,label:clamp(q),cancel:clamp(q),events};}
export class ProgressController{
 constructor({duration=8,reducedMotion=false}={}){this.events=[];this.duration=duration;this.reducedMotion=reducedMotion;this.current='idle';this.started=null;this.last=-Infinity;}
 activate(t){if(!Number.isFinite(t)||t<this.last||this.current==='updating')return false;this.events.push({time:t,type:'start'});this.current='updating';this.started=t;this.last=t;return true;}
 cancel(t){if(!Number.isFinite(t)||t<this.last||this.current!=='updating')return false;this.events.push({time:t,type:'cancel'});this.current='idle';this.started=null;this.last=t;return true;}
 reset(t){if(this.current==='updating')this.cancel(t);this.events=[];this.current='idle';this.started=null;this.last=t;}
 sample(t){if(this.current==='updating'&&t-this.started>=this.duration)this.cancel(t);const s=stateAt(t,this.events);s.fill=this.current==='updating'?clamp((t-this.started)/this.duration):s.fill;if(this.reducedMotion){s.q=this.current==='updating'?1:0;s.label=s.cancel=s.q;}return s;}
}
