(function(root,factory){const api=typeof module==='object'?factory(require('./model.js')):factory(root.RouterModel);if(typeof module==='object')module.exports=api;else root.RouterMotion=api;})(globalThis,function(Model){
  'use strict';
  const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t;
  const ease=(t,d)=>1-(1-clamp(t/d))**3;
  const spring=(t,w=28,z=1)=>{if(t<=0)return 0;if(z===1)return 1-(1+w*t)*Math.exp(-w*t);const d=Math.sqrt(1-z*z);return 1-Math.exp(-z*w*t)*(Math.cos(w*d*t)+z/d*Math.sin(w*d*t));};
  const colors=Model.MODELS.map(m=>[1,3,5].map(i=>parseInt(m.color.slice(i,i+2),16)));
  const key=s=>[s.policy,s.fallback,s.source,s.destination,s.hover,s.menu,s.menuHover,s.dirty].join('|');
  const status=s=>s.policy===0?0:s.policy===2?2:s.dirty>.5?3:1;
  class Transition{
    constructor(reduced=false){this.reduced=reduced;this.target=null;this.from=null;this.started=0;this.label=null;this.selection=null;}
    reset(state,now){this.from=state;this.target=state;this.started=now;this.currentKey=key(state);this.label=null;this.selection=null;}
    sample(now,target){if(!this.target)this.reset(target,now);if(key(target)!==this.currentKey){const old=this.at(now),previous=this.target;if(status(previous)!==status(target))this.label={old:status(previous),new:status(target),start:now};if(previous.source!==target.source||previous.destination!==target.destination)this.selection={old:previous.source,new:target.source,destinationOld:previous.destination,destinationNew:target.destination,start:now};this.from=old;this.target=target;this.currentKey=key(target);this.started=now;}this.target.time=target.time;return this.reduced?this.target:this.at(now);}
    at(now){const a=this.from,b=this.target,t=Math.max(0,now-this.started);if(!a||!b)return b;const s={...b},allocation=ease(t,.58),thumb=spring(t),hover=ease(t,.2),menu=ease(t,.18),toggle=spring(t,35,.7);
      for(const k of['price','p95','errors'])s[k]=mix(a[k],b[k],allocation);s.shares=a.shares.map((v,i)=>mix(v,b.shares[i],allocation));s.thumb=mix(a.thumb??a.policy,b.thumb??b.policy,thumb);const positions=[798,851,933],widths=[52,80,73],oldGeometry=a.thumbGeometry??{x:positions[a.policy],width:widths[a.policy]};s.thumbGeometry={x:mix(oldGeometry.x,positions[b.policy],thumb),width:mix(oldGeometry.width,widths[b.policy],thumb)};
      s.policyInk=Model.POLICIES.map((_,i)=>mix(a.policyInk?.[i]??(a.policy===i?1:0),b.policy===i?1:0,ease(t,.18)));s.routeAlpha=a.routeAlpha.map((v,i)=>mix(v,b.routeAlpha[i],hover));s.rowAlpha=a.rowAlpha.map((v,i)=>mix(v,b.rowAlpha[i],hover));s.fallback=mix(a.fallback,b.fallback,toggle);s.knobX=mix(a.knobX??mix(510,522,a.fallback),mix(510,522,b.fallback),toggle);s.dependentAlpha=mix(a.dependentAlpha??(.5+.5*a.fallback),.5+.5*b.fallback,ease(t,.18));const off=[238,236,242],on=[216,85,43];s.toggleFill=off.map((v,i)=>mix(v,on[i],clamp(s.fallback)));
      s.menu=mix(a.menu,b.menu,menu);const scale=.94+.06*spring(t,38,.72);if(b.menu>.5)s.menuTransform={scale,x:620*(1-scale),y:693*(1-scale)};else s.menuTransform={scale:.94+.06*s.menu,x:620*(.06-.06*s.menu),y:693*(.06-.06*s.menu)};s.chevronAngle=mix(a.chevronAngle??180*a.menu,180*b.menu,ease(t,.2));s.dirty=mix(a.dirty,b.dirty,ease(t,.15));
      if(this.label){const f=this.label,u=now-f.start,old=ease(u,.13),next=ease(u,.17);if(u<.35){s.statusFit={old:f.old,new:f.new,oldY:-7*old,newY:7*(1-next),oldAlpha:1-old,newAlpha:next,colorProgress:ease(u,.28)};if((f.old!==1)!==(f.new!==1))s.footerRoll={...s.statusFit,old:f.old!==1?1:0,new:f.new!==1?1:0};}}
      if(this.selection){const f=this.selection,u=now-f.start,q=ease(u,.17);if(u<.3)s.selectorRoll={...f,oldY:-7*ease(u,.13),newY:7*(1-q),oldAlpha:1-ease(u,.13),newAlpha:q};const color=ease(u,.28);s.selectorDotRGB=colors[f.old].map((v,i)=>mix(v,colors[f.new][i],color));s.destinationDotRGB=colors[f.destinationOld].map((v,i)=>mix(v,colors[f.destinationNew][i],color));}
      return s;
    }
  }
  return{Transition};
});
