(function(root){'use strict';const D=typeof module!=='undefined'?require('./motion-data'):root.LightMotionData;const F=D.frames,clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
function unpack(a){return {light:a[1],emitter:a[2],dy:a[3],toggle:a[4],tip:a[5],tipBlur:a[6],tipMix:a[7],cursor:[a[8],a[9],a[10]]};}
function at(time){let t=((time%19)+19)%19;if(t>=17.2){const p=smooth((t-18.25)/.55);return {...unpack(F[0]),cursor:[1540+(1492-1540)*p,1098,p>0]};}let l=0,h=F.length-1;while(l<h){let m=(l+h+1)>>1;if(F[m][0]<=t)l=m;else h=m-1;}const a=F[l],b=F[Math.min(l+1,F.length-1)],q=b[0]>a[0]?clamp((t-a[0])/(b[0]-a[0])):0,v=a.map((x,i)=>i===10?(q<.5?x:b[i]):x+(b[i]-x)*q);return unpack(v);}
const api={at,unpack,duration:19,sourceDuration:17.2,frames:F};if(typeof module!=='undefined')module.exports=api;else root.LightTimeline=api;
})(globalThis);
