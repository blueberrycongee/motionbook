/* A compact measured model, with shape-preserving cubic interpolation at native PTS. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./calibration-data.js'));else root.GenieCalibrated=factory(root.GenieCalibration);})(typeof window!=='undefined'?window:globalThis,function(Data){
  'use strict';
  const clamp=x=>Math.max(0,Math.min(1,x));
  // Fritsch–Carlson/PCHIP slopes: retain recorded holds, avoid overshooting samples.
  function prepare(rows,col){
    const x=rows.map(r=>r[0]),y=rows.map(r=>r[col]),h=x.slice(1).map((v,i)=>v-x[i]),d=h.map((v,i)=>(y[i+1]-y[i])/v),m=Array(x.length).fill(0);
    for(let i=1;i<x.length-1;i++)if(d[i-1]*d[i]>0){const w1=2*h[i]+h[i-1],w2=h[i]+2*h[i-1];m[i]=(w1+w2)/(w1/d[i-1]+w2/d[i]);}
    function edge(h0,h1,d0,d1){let v=((2*h0+h1)*d0-h0*d1)/(h0+h1);if(Math.sign(v)!==Math.sign(d0))return 0;if(Math.sign(d0)!==Math.sign(d1)&&Math.abs(v)>3*Math.abs(d0))return 3*d0;return v;}
    m[0]=edge(h[0],h[1],d[0],d[1]);let n=h.length;m[n]=edge(h[n-1],h[n-2],d[n-1],d[n-2]);
    return t=>{if(t<=x[0])return y[0];if(t>=x.at(-1))return y.at(-1);let i=0;while(x[i+1]<t)i++;const u=(t-x[i])/h[i],u2=u*u,u3=u2*u;return (2*u3-3*u2+1)*y[i]+(u3-2*u2+u)*h[i]*m[i]+(-2*u3+3*u2)*y[i+1]+(u3-u2)*h[i]*m[i+1];};
  }
  const interpolators=Object.fromEntries(['minimize','restore'].map(k=>[k,[1,2,3].map(c=>prepare(Data[k].samples,c))]));
  function sample(progress,direction='minimize'){
    const d=Data[direction],elapsed=(direction==='restore'?1-clamp(progress):clamp(progress))*d.duration;
    const f=interpolators[direction];return {data:d,elapsed,top:f[0](elapsed),leftAmplitude:f[1](elapsed),rightAmplitude:f[2](elapsed)};
  }
  function nativeRow(progress,v,direction='minimize'){
    const s=sample(progress,direction),d=s.data,y=s.top+clamp(v)*d.source[3],c=(1-Math.cos(Math.PI*clamp((y-d.curve[0])/(d.curve[1]-d.curve[0]))))/2;
    const x=d.intercepts[0]+s.leftAmplitude*c,right=d.intercepts[1]+s.rightAmplitude*c;return{x,y,w:right-x};
  }
  function row(progress,v,source,target,options={}){
    const direction=options.direction||'minimize',s=sample(progress,direction),d=s.data,clip=options.clip??584;
    const top=source.y+(s.top-d.source[1])/(d.clip-d.source[1])*(clip-source.y),y=top+clamp(v)*source.h;
    const yn=d.source[1]+(y-source.y)/(clip-source.y)*(d.clip-d.source[1]);
    const c=(1-Math.cos(Math.PI*clamp((yn-d.curve[0])/(d.curve[1]-d.curve[0]))))/2;
    const nl=d.intercepts[0]+s.leftAmplitude*c,nr=d.intercepts[1]+s.rightAmplitude*c;
    const l=source.x+(nl-d.source[0])/(d.target[0]-d.source[0])*(target.x-source.x);
    const nativeRight=d.source[0]+d.source[2],targetRight=d.target[0]+d.target[2];
    const r=source.x+source.w+(nr-nativeRight)/(targetRight-nativeRight)*(target.x+target.w-source.x-source.w);
    return{x:l,y,w:Math.max(.01,r-l)};
  }
  return{Data,prepare,sample,nativeRow,row};
});
