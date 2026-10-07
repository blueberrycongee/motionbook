(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MotionScene=factory()})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const clamp=x=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
  const claims=[['A compact engine.','A wider creative world.'],['More room for ideas.','Less time waiting.'],['Accelerate the ordinary.','Explore the extraordinary.'],['Quiet under pressure.','Ready for the next take.'],['One seamless workspace.','Every detail connected.'],['Your workflow, amplified.','From first thought','to the final frame.']];
  function poly(c,pts,fill,stroke){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke()}}
  function background(c,w,h,time=0){
    c.save(); c.scale(w/1188,h/761);
    const t=time/6*Math.PI*2;
    const bg=c.createLinearGradient(0,0,1188,761);bg.addColorStop(0,'#111c20');bg.addColorStop(.5,'#15313b');bg.addColorStop(1,'#090b18');c.fillStyle=bg;c.fillRect(0,0,1188,761);
    const sx=Math.sin(t)*24,sy=Math.cos(t)*10;
    function iso(x,y,z){return [710+(x-y)*.85+sx,330+(x+y)*.38-z+sy]}
    function block(x,y,z,dx,dy,dz,accent){
      const a=iso(x,y,z+dz),b=iso(x+dx,y,z+dz),d=iso(x,y+dy,z+dz),e=iso(x+dx,y+dy,z+dz),al=iso(x,y,z),bl=iso(x+dx,y,z),dl=iso(x,y+dy,z),el=iso(x+dx,y+dy,z);
      const side=c.createLinearGradient(a[0],a[1],bl[0],bl[1]);side.addColorStop(0,accent?'#345b6e':'#222b37');side.addColorStop(.5,accent?'#172f41':'#101724');side.addColorStop(1,'#070b13');
      poly(c,[d,e,el,dl],side,'#496875');poly(c,[b,e,el,bl],'#18212d','#38414e');
      const top=c.createLinearGradient(a[0],a[1],e[0],e[1]);top.addColorStop(0,accent?'#9ad2d2':'#839298');top.addColorStop(.3,accent?'#6299a8':'#4a626d');top.addColorStop(1,accent?'#263c63':'#242d45');poly(c,[a,b,e,d],top,'#88aab0');
    }
    // Original procedural architecture. It is not a product model or a sourced render.
    block(-410,-310,-40,750,540,40,false);
    for(let j=0;j<8;j++)for(let i=0;i<7;i++){
      const x=-340+i*96,y=-270+j*66;const k=(i*13+j*7)%11;
      const height=30+(k%4)*30+Math.sin(t+(i+j)*.65)*8;
      block(x,y,0,54,38,height,k%3===0);
      if(k%2===0){c.strokeStyle=k%3?'#afaeff':'#73efd6';c.lineWidth=2;c.beginPath();let a=iso(x+5,y+4,height+1),b=iso(x+48,y+4,height+1);c.moveTo(...a);c.lineTo(...b);c.stroke()}
    }
    for(let q=0;q<6;q++){
      let x=-340+q*130;block(x,-280,0,15,540,18,false);
      const a=iso(x+8,-270,21),b=iso(x+8,250,21);c.strokeStyle=q%2?'#b58aff':'#44dacf';c.globalAlpha=.35+.25*Math.sin(t+q);c.lineWidth=3;c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke();c.globalAlpha=1;
    }
    let veil=c.createLinearGradient(0,0,1050,0);veil.addColorStop(0,'rgba(3,10,14,.70)');veil.addColorStop(.42,'rgba(3,10,14,.43)');veil.addColorStop(1,'rgba(3,10,14,.04)');c.fillStyle=veil;c.fillRect(0,0,1188,761);
    c.restore();
  }
  const metrics={viewportHeight:761,listHeight:706,sourceScale:751/761,cropTop:51,qStart:-140,qEnd:1170,claimPitch:122,margin:58};
  const opacityBounds=[[-19.9,108.1],[166.1,294.1],[352.1,480.1],[538.1,666.1],[724.1,852.1],[894.1,1086.1]];
  function state(progress){
    const p=clamp(progress),m=metrics,q=m.qStart+(m.qEnd-m.qStart)*p;
    const keyframeProgress=(q+.5*m.viewportHeight)/(2.5*m.viewportHeight);
    const listTranslation=(m.viewportHeight+m.listHeight)*(.5-keyframeProgress);
    const bodyTop=Math.max(-q,0);
    const firstMarker=((m.viewportHeight-m.listHeight)/2+6+listTranslation+bodyTop)*m.sourceScale-m.cropTop;
    return {progress:p,sectionScroll:q,listTranslation,firstMarker,firstBaseline:firstMarker+20,rowPitch:m.claimPitch*m.sourceScale,
      backgroundOffset:Math.max(0,bodyTop*m.sourceScale-m.cropTop),opacities:opacityBounds.map(([a,b])=>clamp((q-a)/(b-a))),
      claimOffset:listTranslation,mediaClock:'independent',sourceMechanism:'linear scroll list plus independent media; pre-sticky body offset is separate'};
  }
  function overlay(c,w,h,progress,options={}){
    const s=state(progress),mobile=w<600,vw=mobile?520:1158,vh=mobile?880:690,yScale=vh/690;
    c.save();c.scale(w/vw,h/vh);c.beginPath();c.rect(0,0,vw,vh);c.clip();
    if(s.backgroundOffset>0){c.fillStyle='#fafafa';c.fillRect(0,0,vw,s.backgroundOffset*yScale)}
    claims.forEach((lines,i)=>{const opacity=s.opacities[i];if(opacity<.0001)return;c.save();c.globalAlpha=opacity;const y=(s.firstMarker+i*s.rowPitch)*yScale;c.fillStyle='#fff';c.fillRect(mobile?28:174,y,5,20);c.font='600 '+(mobile?24:28*metrics.sourceScale)+'px "DejaVu Sans", sans-serif';c.textBaseline='alphabetic';lines.forEach((line,j)=>c.fillText(line,mobile?48:198,y+20+j*(mobile?34:32*metrics.sourceScale)));c.restore();});
    const px=mobile?vw-45:1047,py=vh-67;c.strokeStyle='rgba(255,255,255,.72)';c.lineWidth=1.5;c.beginPath();c.arc(px,py,18,0,Math.PI*2);c.stroke();c.fillStyle='white';if(options.paused){poly(c,[[px-5,py-9],[px+8,py],[px-5,py+9]],'white')}else{c.fillRect(px-6,py-7,3,14);c.fillRect(px+2,py-7,3,14)}
    c.restore();return s;
  }
  function backgroundLayer(c,w,h,p,options={}){const s=state(p);c.save();c.fillStyle='#fafafa';c.fillRect(0,0,w,h);c.translate(0,s.backgroundOffset*h/690);background(c,w,h,options.mediaTime===undefined?(options.time||0):options.mediaTime);c.restore();}
  function render(c,w,h,progress,options={}){backgroundLayer(c,w,h,progress,options);return overlay(c,w,h,progress,options)}
  return {render,renderBackground:background,renderBackgroundLayer:backgroundLayer,renderOverlay:overlay,state,duration:4.52,claims,metrics,opacityBounds};
});
