(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.CalendarModel=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const X=390,W=540,Y=144.5,HOUR=124,MIN=780,MAX=1020;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const toMinute=y=>clamp(Math.round(((y-Y)/HOUR*60+MIN)/15)*15,MIN,MAX);
const toY=m=>Y+(m-MIN)/60*HOUR;
const format=m=>{const h=Math.floor(m/60)%12||12,n=m%60;return h+(n?':'+String(n).padStart(2,'0'):'')+' PM';};
const interval=(a,b)=>format(Math.min(a,b))+' - '+format(Math.max(a,b));
class Calendar{
 constructor(){this.reset();}
 reset(){this.pointer={x:1102,y:442};this.down=false;this.anchor=null;this.current=null;this.cardAlpha=0;this.ringAlpha=0;this.ringRadius=32;this.guide={x:1070,y:410,w:64,h:64,c:53};this.velocity={};this.elapsed=0;this.lastInterval=null;}
 move(x,y){this.pointer={x:clamp(x,0,1318),y:clamp(y,0,812)};if(this.down)this.current=toMinute(y);}
 press(x,y){this.move(x,y);if(x<X||x>X+W||y<Y-40||y>Y+4*HOUR+40)return false;this.down=true;this.anchor=toMinute(y);this.current=this.anchor;this.cardAlpha=0;this.ringAlpha=0;this.ringRadius=30;return true;}
 release(){if(this.down){this.lastInterval=[Math.min(this.anchor,this.current),Math.max(this.anchor,this.current)];this.down=false;return true;}return false;}
 cancel(){this.down=false;this.anchor=null;this.current=null;this.cardAlpha=0;this.lastInterval=null;}
 step(dt){dt=clamp(dt,0,.05);this.elapsed+=dt;const inside=this.pointer.x>=X&&this.pointer.x<=X+W;const gy=inside?toY(toMinute(this.pointer.y)):this.pointer.y;const target={x:inside?X:this.pointer.x-32,y:inside?gy-(this.down?4:2):gy-32,w:inside?W:64,h:inside?(this.down?8:4):64,c:this.down?100:53};
  for(const k of Object.keys(target)){let v=this.velocity[k]||0;v+=(target[k]-this.guide[k])*240*dt;v*=Math.exp(-24*dt);this.guide[k]+=v*dt;this.velocity[k]=v;}
  this.ringAlpha+=(Number(this.down)-this.ringAlpha)*(1-Math.exp(-23*dt));this.ringRadius+=(50-this.ringRadius)*(1-Math.exp(-16*dt));
  const nonzero=this.current!==this.anchor;this.cardAlpha+=((this.down&&nonzero?1:0)-this.cardAlpha)*(1-Math.exp(-26*dt));
  return this.state();
 }
 state(){let event=null;if(this.anchor!==null&&this.cardAlpha>.001){const a=toY(this.anchor),b=this.guide.y+this.guide.h/2,up=this.current<this.anchor;const top=up?Math.min(a,b)+8:a-8;const height=Math.max(2,Math.abs(b-a));event={y:top,h:height,alpha:this.cardAlpha,label:interval(this.anchor,this.current),font:26,baseline:top+35};}
 return {guide:this.guide,event,ring:this.ringAlpha>.001?{x:this.pointer.x,y:this.pointer.y,r:this.ringRadius,alpha:this.ringAlpha}:null};}
}
return {Calendar,X,W,Y,HOUR,MIN,MAX,toMinute,toY,format,interval,clamp};
});
