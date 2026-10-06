import {frameAt,clamp,smooth} from './timeline.mjs';
export const normalizeCode=value=>String(value).replace(/[^0-9]/g,'').slice(0,6);
// A deterministic, local-only demo. It never submits or stores entered values.
export class CodeInputModel{
 constructor({reducedMotion=false}={}){this.reducedMotion=reducedMotion;this.reset(0);}
 reset(t=0){this.reopened=false;this.state='idle';this.code='';this.started=t;this.events=[];this.focusFrom=0;this.focusStarted=t;this.version=(this.version||0)+1;}
 activate(t){if(this.state==='idle'){this.state='editing';this.started=t;this.focusStarted=t;return true;}return this.state==='editing';}
 input(value,t){if(this.state!=='editing')return false;const code=normalizeCode(value);if(code===this.code)return false;this.focusFrom=this.focusAt(t);this.focusStarted=t;const old=this.code;this.code=code;this.events=[...code].map((c,i)=>old[i]===c&&this.events[i]!=null?this.events[i]:t);if(code.length===6){this.state='filled';this.started=t;}return true;}
 focusAt(t){const target=Math.min(5,this.code.length),dt=t-this.focusStarted;if(this.reducedMotion||dt>.6)return target;const p=1-Math.exp(-14*Math.max(0,dt))*(Math.cos(18*Math.max(0,dt))+.15*Math.sin(18*Math.max(0,dt)));return this.focusFrom+(target-this.focusFrom)*p;}
 tick(t){for(let i=0;i<4;i++){const age=t-this.started;if(this.state==='filled'&&age>=.2){this.started+=.2;this.state='checking';}
  else if(this.state==='checking'&&age>=1.2){this.started+=1.2;this.state=this.code==='123456'?'success':'error';}
  else if(this.state==='error'&&age>=.85){this.started+=.85;this.state='editing';this.code='';this.events=[];this.focusFrom=0;this.focusStarted=this.started;this.reopened=true;}
  else break;}}
 frame(t){this.tick(t);const age=t-this.started;let s;
 if(this.state==='idle')s=frameAt(0);
 else if(this.state==='editing'){s=frameAt(this.reopened||this.reducedMotion?5:Math.min(1,.3+age));s.t=t;s.digits=[...this.code].map((char,i)=>{const p=this.reducedMotion?1:smooth((t-this.events[i])/.17);return{char,alpha:p,dy:(1-p)*36,blur:(1-p)*7};});const ri=this.focusAt(t);s.ring=[376+122*ri,438,106,116];s.ringAlpha=1;s.ringBlur=0;s.ringCorners=[this.code.length?31:56,this.code.length>=5?56:31];s.caret=Math.floor((t-this.focusStarted)*2)%2===0?1:0;if(this.reopened||age>.65){s.width=746;s.cx=733;s.boxes=null;s.slots=1;s.slotBlur=0;s.labelAlpha=0;}}
 else if(this.state==='filled')s=frameAt(2.7);
 else if(this.state==='checking')s=frameAt(2.766667+Math.min(age,1.17));
 else if(this.state==='error')s=frameAt(3.95+Math.min(age,.84));
 else if(this.state==='success')s=frameAt(7.9+Math.min(age,.9));
 if(this.state!=='editing'&&this.state!=='idle'){s.digits=s.digits.map((d,i)=>({...d,char:this.code[i]||''}));}
 if(this.reducedMotion){if(this.state==='editing'||this.state==='filled'){s={...frameAt(2.7),digits:[...this.code].map(char=>({char,alpha:1,dy:0,blur:0})),ring:this.state==='editing'?[376+122*Math.min(5,this.code.length),438,106,116]:null,ringAlpha:this.state==='editing'?1:0};}
  if(this.state==='checking')s=frameAt(3.6);if(this.state==='error')s={...frameAt(4.2),cx:733,width:746,boxes:null,digits:[...this.code].map(char=>({char,alpha:1,dy:0,blur:0}))};if(this.state==='success')s=frameAt(8.7);s.shine=0;s.caret=1;s.t=0;}
 s.pointer=null;return s;}
}
