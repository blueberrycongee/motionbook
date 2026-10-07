/* Original procedural artwork. No external images, fonts, or dependencies. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MotionScene=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';

  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(x)?x:0));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smooth=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t)};
  const ease=t=>1-Math.pow(1-clamp(t),3);
  function rect(c,x,y,w,h,r=0){c.beginPath();if(r)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h)}
  function fill(c,color,x,y,w,h,r=0){c.fillStyle=color;rect(c,x,y,w,h,r);c.fill()}
  function line(c,color,width,x1,y1,x2,y2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
  function type(c,text,x,y,size,weight=600,color='#161819',align='center'){c.fillStyle=color;c.font=weight+' '+size+'px "DejaVu Sans", Arial, sans-serif';c.textAlign=align;c.textBaseline='middle';c.fillText(text,x,y)}
  function gradient(c,x,y,x2,y2,stops){const g=c.createLinearGradient(x,y,x2,y2);stops.forEach(([n,v])=>g.addColorStop(n,v));return g}
  function port(c,x,y,w,h,r=3){fill(c,'#a7a9a7',x-1,y-1,w+2,h+2,r);fill(c,'#202221',x,y,w,h,r);fill(c,'#06090b',x+2,y+2,w-4,h-4,Math.max(1,r-1));line(c,'#727b80',.9,x+3,y+h-2,x+w-3,y+h-2)}
  function panel(c,w,h,back){
    c.save();rect(c,-w/2,-h/2,w,h,14);c.clip();
    fill(c,gradient(c,-w/2,0,w/2,0,[[0,'#656a6b'],[.014,'#eef0ef'],[.06,'#b8bdbe'],[.22,'#d1d5d5'],[.68,'#bec4c4'],[.91,'#eff1ef'],[.972,'#b0b7b7'],[1,'#555d5f']]),-w/2,-h/2,w,h);
    const vertical=gradient(c,0,-h/2,0,h/2,[[0,'rgba(255,255,255,.25)'],[.58,'rgba(180,184,181,0)'],[1,'rgba(55,63,64,.22)']]);fill(c,vertical,-w/2,-h/2,w,h);
    // Machining lines are original procedural marks, not an imported texture.
    for(let i=0;i<h;i+=2){line(c,i%4===0?'rgba(255,255,255,.055)':'rgba(0,0,0,.025)',.45,-w/2,-h/2+i,w/2,-h/2+i)}
    line(c,'rgba(255,255,255,.8)',1.2,-w/2+14,-h/2+1,w/2-14,-h/2+1);
    if(back){
      fill(c,'rgba(45,51,53,.1)',-w*.421,-h*.41,w*.842,h*.52,4);
      for(let row=0;row<15;row++)for(let col=0;col<65;col++){const x=-w*.408+col*w*.0127+(row%2)*w*.0063,y=-h*.38+row*h*.0303;c.fillStyle='#272e32';c.beginPath();c.ellipse(x,y,1.45,1.8,0,0,Math.PI*2);c.fill();c.fillStyle='rgba(255,255,255,.38)';c.beginPath();c.ellipse(x,y+1.4,1.6,.5,0,0,Math.PI*2);c.fill()}
      for(let i=0;i<4;i++)port(c,-210+i*35,65,10,25,4);
      port(c,-52,66,36,24,3);port(c,4,65,46,26,5);port(c,69,67,24,21,3);port(c,117,67,24,21,3);port(c,165,72,39,12,3);
      c.strokeStyle='#939c9f';c.lineWidth=2;c.beginPath();c.arc(235,78,10,0,Math.PI*2);c.stroke();line(c,'#757f81',1.2,235,69,235,77);
      [-204,-169,-134,-99,-33,27,82,130,185].forEach((x,i)=>{type(c,i<4?'↯':i<6?'▧':'·',x,50,9,400,'#646f73')});
    }else{
      port(c,-177,63,12,26,5);port(c,-142,63,12,26,5);port(c,-107,63,12,26,5);port(c,-44,74,83,6,2);
      c.shadowColor='#c8ffe6';c.shadowBlur=6;fill(c,'#e8fff1',220,76,5,5,2.5);c.shadowBlur=0;
      type(c,'STUDIO / 01',0,-40,9,600,'rgba(56,65,68,.28)');
    }
    c.restore();
  }
  function hardware(c,cx,cy,scale,yaw){
    const W=560,H=235,D=230,cs=Math.cos(yaw),sn=Math.sin(yaw),pitch=.045;
    const project=(x,y,z)=>[cx+scale*(x*cs+z*sn),cy+scale*(y+(z*cs-x*sn)*pitch)];
    function face(a,b,d,w,h,fn){let p=project(...a),q=project(...b),r=project(...d);c.save();c.transform((q[0]-p[0])/w,(q[1]-p[1])/w,(r[0]-p[0])/h,(r[1]-p[1])/h,p[0],p[1]);fn();c.restore()}
    c.save();c.translate(cx,cy+scale*(H*.62));c.scale(scale,scale*.12);let g=c.createRadialGradient(0,0,2,0,0,340);g.addColorStop(0,'rgba(35,40,44,.26)');g.addColorStop(1,'rgba(35,40,44,0)');fill(c,g,-380,-80,760,160);c.restore();
    // Rounded top face is drawn with a neutral brushed-metal sheen.
    face([-W/2,-H/2,-D/2],[W/2,-H/2,-D/2],[-W/2,-H/2,D/2],W,D,()=>fill(c,gradient(c,0,0,W,D,[[0,'#f0f2ef'],[.5,'#d6dbd8'],[1,'#9ea9ac']]),0,0,W,D,16));
    if(Math.abs(sn)>.0001){let x=sn>0?-W/2:W/2;face([x,-H/2,-D/2],[x,-H/2,D/2],[x,H/2,-D/2],D,H,()=>{fill(c,gradient(c,0,0,D,0,[[0,'#889194'],[.16,'#bbc2c2'],[.72,'#dae0dd'],[1,'#b7c0c0']]),0,0,D,H,13);for(let i=0;i<35;i++)line(c,'rgba(30,40,42,.11)',1.3,18+i*5,H-13,18+i*5,H-4)})}
    const back=cs<0,z=back?-D/2:D/2;
    face([back?W/2:-W/2,-H/2,z],[back?-W/2:W/2,-H/2,z],[back?W/2:-W/2,H/2,z],W,H,()=>{c.translate(W/2,H/2);panel(c,W,H,back)});
    // The base is a dark floating plinth, intentionally different from the reference product.
    c.save();let p1=project(-W*.43,H/2+2,z),p2=project(W*.43,H/2+2,z);c.strokeStyle='#303739';c.lineWidth=Math.max(1,scale*5);c.beginPath();c.moveTo(...p1);c.lineTo(...p2);c.stroke();c.restore();
  }

  const PHASES=['Front','Turn','Push in','Color environment','Performance','Chips & specs'];
  function state(progress){const p=clamp(progress),t=smooth(.065,.267,p),push=smooth(.282,.467,p),chips=smooth(.828,.912,p),specTime=(p-.884)*7;
    return {progress:p,phase: p<.065?PHASES[0]:p<.282?PHASES[1]:p<.467?PHASES[2]:p<.71?PHASES[3]:p<.828?PHASES[4]:PHASES[5],yaw:t*Math.PI,scale:lerp(1,7,push),hardwareFrame:Math.round(t*42),environmentFrame:Math.round(clamp((p-.467)/.243)*110),environmentOpacity:smooth(.445,.49,p)*(1-smooth(.66,.716,p)),introOpacity:1-smooth(.26,.32,p),performanceOpacity:smooth(.704,.78,p),chipProgress:chips,specs:Array.from({length:5},(_,i)=>ease((specTime-i*.09)/.3)),staggerSeconds:.09,itemDurationSeconds:.3};
  }
  function environment(c,w,h,t){
    fill(c,'#060612',0,0,w,h);const g=c.createRadialGradient(w*.5,h*.47,0,w*.5,h*.45,w*.65);g.addColorStop(0,'#242856');g.addColorStop(.4,'#100e31');g.addColorStop(1,'#040411');fill(c,g,0,0,w,h);
    // A deterministic woven light sculpture. Each strand is independently generated.
    const spread=lerp(.7,1,smooth(0,.5,t)),twist=t*2.3;
    for(let i=0;i<360;i++){
      const u=i/359,theta=u*Math.PI*2,a=Math.sin(theta*3+twist),b=Math.cos(theta*5-twist*.7),depth=(Math.sin(theta+twist)+1)*.5;
      c.strokeStyle=gradient(c,w*.2,h*.7,w*.8,h*.2,[[0,`rgba(27,146,245,${.11+depth*.22})`],[.42,`rgba(193,132,255,${.24+depth*.31})`],[.64,`rgba(255,197,140,${.35+depth*.3})`],[1,`rgba(240,110,66,${.14+depth*.3})`]]);c.lineWidth=.45+depth*1.2;c.beginPath();
      for(let j=0;j<=100;j++){const v=j/100,angle=v*Math.PI*2+theta,x=w*.5+w*.365*spread*Math.sin(angle)*(.64+.25*Math.cos(angle*3+twist)),y=h*.46+h*.285*(Math.cos(angle*2+theta*.33+twist)*(.45+.4*Math.sin(theta*2))+Math.sin(angle)*.26)+h*.05*b; j?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
    }
    c.save();c.globalAlpha=.22;c.scale(1,-.23);c.translate(0,-h*4.5);for(let i=0;i<90;i++){let x=w*(.2+.6*i/90);line(c,i%2?'#edaa86':'#826eed',1,x,h*.65,x+w*.06*Math.sin(i+t*5),h*.94)}c.restore();
    for(let i=0;i<75;i++){let x=((i*73.391)%997)/997*w,y=((i*53.147)%593)/593*h;fill(c,'rgba(217,217,255,.3)',x,y,.7,.7)}
  }
  function chip(c,x,y,size,variant,alpha){
    if(alpha<=0)return;c.save();c.globalAlpha*=alpha;c.translate(x,y);const colors=variant?['#8ce6fa','#4285d1','#7762f2']:['#d6a8ff','#a66cf3','#567bc3'];c.shadowColor=colors[1];c.shadowBlur=size*.09;
    fill(c,gradient(c,0,0,size,size,[[0,colors[0]],[.38,colors[1]],[.75,'#1a273b'],[1,colors[2]]]),-size/2,-size/2,size,size,3);c.shadowBlur=0;fill(c,'#06070a',-size/2+2,-size/2+2,size-4,size-4,2);
    c.save();rect(c,-size/2+3,-size/2+3,size-6,size-6,2);c.clip();for(let i=0;i<65;i++){const n=i/65;c.strokeStyle=gradient(c,-size/2,size/2,size/2,-size/2,[[0,colors[0]+'bb'],[.5,colors[1]+'55'],[1,colors[2]+'00']]);c.lineWidth=1;c.beginPath();c.moveTo(-size*.65+n*size*.45,size*.6);c.bezierCurveTo(-size*.6+n*size*.9,-size*.15,size*.2,-size*.2,size*.6,-size*.5+n*size*.14);c.stroke()}c.restore();
    type(c,variant?'N2':'N1',0,-size*.04,size*.28,600,'#f8f7ff');type(c,variant?'ULTRA':'CORE',0,size*.23,size*.09,500,'#c5cbd7');c.restore();
  }
  function render(c,w,h,progress,options={}){
    const s=state(progress),p=s.progress,compact=w/h<.9,base=Math.min(w/1200,h/800),fw=w*.5,unit=compact?w/650:base;
    c.save();fill(c,'#f6f7f7',0,0,w,h);
    if(p<.495){
      const productScale=(compact?w*.00132:Math.min(w*.00089,h*.00135))*s.scale;hardware(c,fw,h*.505,productScale,s.yaw);
      c.save();c.globalAlpha=s.introOpacity;if(!options.hideText){type(c,'Made for what’s next.',fw,h*(compact?.22:.205),compact?w*.074:Math.min(w*.056,h*.081),700);type(c,'A small studio. A bigger possibility.',fw,h*.735,compact?w*.032:Math.min(w*.022,h*.032),600);type(c,'Original hardware · Scroll-driven story',fw,h*.78,compact?w*.026:Math.min(w*.013,h*.021),400,'#687174')}c.restore();
    }
    if(s.environmentOpacity>0){c.save();c.globalAlpha=s.environmentOpacity;environment(c,w,h,clamp((p-.467)/.243));c.restore()}
    if(p>.665){const black=smooth(.665,.716,p);fill(c,'rgba(0,0,0,'+black+')',0,0,w,h)}
    if(s.performanceOpacity>0){
      c.save();c.globalAlpha=s.performanceOpacity;const shift=s.chipProgress*h*.24,headlineY=h*.47-shift;if(!options.hideText){type(c,'PERFORMANCE',fw,headlineY-h*.102,11*unit,600,'#a4a7b0');type(c,'Find your',fw,headlineY-h*.012,compact?w*.092:Math.min(w*.058,h*.082),700,'#f5f5f7');type(c,'next dimension.',fw,headlineY+h*.07,compact?w*.092:Math.min(w*.058,h*.082),700,'#f5f5f7');type(c,'Two original chips. One continuous story.',fw,headlineY+h*.15,compact?w*.029:Math.min(w*.015,h*.023),400,'#9699a3')}
      if(s.chipProgress>0){const size=compact?w*.23:Math.min(w*.182,h*.262),spread=compact?w*.225:w*.158,offset=(1-s.chipProgress)*w*.21,cy=h*.53+(1-s.chipProgress)*h*.1;chip(c,fw-spread-offset,cy,size,0,s.chipProgress);chip(c,fw+spread+offset,cy,size,1,s.chipProgress);
        if(!options.hideText){const rows=compact?[['12-core CPU','24-core CPU'],['32-core GPU','64-core GPU'],['96 GB memory','192 GB memory'],['600 GB/s','1.2 TB/s'],['Create freely','Think bigger']]:[['12-core compute','24-core compute'],['32-core graphics','64-core graphics'],['96 GB unified memory','192 GB unified memory'],['600 GB/s bandwidth','1.2 TB/s bandwidth'],['Creative headroom','Limitless ideas']];rows.forEach((row,i)=>{c.save();c.globalAlpha*=s.specs[i];const y=cy+size*.7+i*h*.031+(1-s.specs[i])*30*unit;for(let j=0;j<2;j++)type(c,row[j],fw+(j?spread:-spread),y,compact?Math.max(11,w*.028):Math.min(w*.014,h*.021),i===0?600:400,j?'#b6d9ef':'#cbb6ea');c.restore()})}}
      c.restore();
    }
    c.restore();return s;
  }
  return {render,state,duration:7,phases:PHASES};

});
