(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.MinimapModel=api;})(globalThis,function(){
'use strict';const COUNT=49,START=204,SPACING=18,BLACK=new Set([4,11,23,31,41]);const baseline=i=>BLACK.has(i)?48:36;const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
class Minimap{
 constructor(){this.reset();}
 reset(){this.h=Array.from({length:COUNT},(_,i)=>baseline(i));this.v=Array(COUNT).fill(0);this.cursor=null;this.active=false;}
 move(x,y){this.cursor=[clamp(x,0,1258),clamp(y,0,644)];this.active=x>=186&&x<=1090&&y>=216&&y<=432;}
 leave(){this.cursor=null;this.active=false;}
 step(dt){dt=clamp(dt,0,.1);const n=Math.max(1,Math.ceil(dt/(1/120))),d=dt/n;for(let step=0;step<n;step++)for(let i=0;i<COUNT;i++){const dx=START+18*i-(this.cursor?.[0]||0);const scale=this.active?1+2.85*Math.exp(-dx*dx/(2*78*78)):1;const target=baseline(i)*scale;this.v[i]+=(target-this.h[i])*240*d;this.v[i]*=Math.exp(-15*d);this.h[i]=clamp(this.h[i]+this.v[i]*d,0,250);}return this.state();}
 state(){return {h:[...this.h],cursor:this.cursor?[...this.cursor]:null};}
}
return{Minimap,COUNT,START,SPACING,BLACK,baseline,clamp};
});
