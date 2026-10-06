(function(r,f){const v=f();if(typeof module==='object')module.exports=v;else r.TossModel=v;})(globalThis,function(){
  'use strict';
  class Toss{
    constructor(){this.reset();}
    reset(){this.state='ready';this.x=938;this.y=936;this.vx=0;this.vy=0;this.misses=0;this.angle=0;this.elapsed=0;this.impact=0;this.last=null;return this;}
    begin(x,y,time){if(this.state==='deleted')return false;this.state='drag';this.x=x;this.y=y;this.last={x,y,time};this.vx=this.vy=0;return true;}
    move(x,y,time){if(this.state!=='drag')return this;const dt=Math.max(.016,(time-this.last.time)/1000);this.vx=.55*this.vx+.45*(x-this.last.x)/dt;this.vy=.55*this.vy+.45*(y-this.last.y)/dt;this.x=x;this.y=y;this.last={x,y,time};return this;}
    release(){if(this.state!=='drag')return this;this.state='flight';this.elapsed=0;this.vx=Math.max(-1800,Math.min(1800,this.vx));this.vy=Math.max(-2100,Math.min(1500,this.vy));if(this.y>=520&&this.y<=720&&this.x>=867&&this.x<=1008){this.state='settling';this.elapsed=0;}return this;}
    step(dt){dt=Math.max(0,Math.min(.05,dt));if(this.state==='flight'){const old=this.y;this.vy+=1900*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;this.angle+=this.vx*dt*.03;this.elapsed+=dt;if(this.vy>0&&old<557&&this.y>=557&&this.x>867&&this.x<1008){this.state='settling';this.elapsed=0;this.impact=1;}else if(this.y>1010){this.state='return';this.elapsed=0;this.from={x:this.x,y:1010};this.misses++;}}else if(this.state==='settling'){this.elapsed+=dt;this.impact=Math.exp(-this.elapsed*8)*Math.sin(this.elapsed*22);if(this.elapsed>.6){this.state='deleted';this.elapsed=0;}}else if(this.state==='return'){this.elapsed+=dt;const t=Math.min(1,this.elapsed/.5),e=1-(1-t)**3;this.x=this.from.x+(938-this.from.x)*e;this.y=this.from.y+(936-this.from.y)*e-100*Math.sin(Math.PI*t);if(t===1){this.state='ready';this.angle=0;}}return this;}
    keyboardDelete(){this.state='settling';this.elapsed=0;this.impact=1;return this;}
  }
  return{Toss};
});
