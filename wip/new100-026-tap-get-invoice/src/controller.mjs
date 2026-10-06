import{CONTROLS}from'./controls.mjs';
const area=i=>{const b=CONTROLS[i].bbox;return(b[2]-b[0])*(b[3]-b[1]);};
function nearestArea(i,lo,hi){let best=lo;for(let k=lo;k<=hi;k++)if(Math.abs(area(k)-area(i))<Math.abs(area(best)-area(i)))best=k;return best;}
export class Controller{
 constructor(reduced=false){this.reduced=reduced;this.mode=reduced?'closed':'demo';this.started=0;this.from=0;}
 frame(now){if(this.mode==='demo')return null;if(this.mode==='closed')return 0;if(this.mode==='open')return 180;const end=this.mode==='opening'?180:250;const i=Math.min(end,this.from+Math.floor(Math.max(0,now-this.started)*60));if(i===end)this.mode=this.mode==='opening'?'open':'closed';return this.mode==='closed'?0:i;}
 open(now){const i=this.frame(now);if(this.mode==='open'||this.mode==='opening')return;if(this.reduced){this.mode='open';return;}this.from=i===null||this.mode==='closed'?12:nearestArea(i,12,70);this.started=now;this.mode='opening';}
 close(now,observedFrame=null){let i=this.frame(now);if(i===null&&observedFrame!==null){i=observedFrame;if(area(i)<3000){this.mode='closed';return;}}if(this.mode==='closed'||this.mode==='closing')return;if(this.reduced){this.mode='closed';return;}this.from=i===null?205:nearestArea(i,205,250);this.started=now;this.mode='closing';}
 replay(now){this.started=now;this.from=0;this.mode=this.reduced?'closed':'demo';}
}
