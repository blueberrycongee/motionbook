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

  function state(progress){const p=clamp(progress);return {progress:p,phase:p<.2?'Close-up':p<.66?'Headline parallax':p<.86?'Copy reveal':'Resolved',imageScale:lerp(1.4,1,clamp(p/.78)),headlineY:-.5*smooth(.12,.72,p),copyOpacity:clamp((p-.69)/(.25/1.5)),imageExit:smooth(.68,1,p),singleImage:true};}
  function closeup(c,w,h){
    fill(c,'#949c9d',0,0,w,h);c.save();c.translate(w*.55,h*.44);c.rotate(.31);const scale=Math.max(w/740,h/480);c.scale(scale,scale);c.transform(1,-.04,.10,.96,0,0);c.scale(1.65,1.65);panel(c,800,360,true);c.restore();
    const shade=gradient(c,0,0,w,h,[[0,'rgba(0,0,0,.06)'],[.4,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.35)']]);fill(c,shade,0,0,w,h);
  }
  function render(c,w,h,progress,options={}){
    const s=state(progress),compact=w/h<.9,u=compact?w/550:Math.min(w/1200,h/800),exitY=s.imageExit*h*.89;
    c.save();fill(c,'#f7f8f8',0,0,w,h);c.save();rect(c,0,0,w,h-exitY);c.clip();c.translate(w*.5,-exitY);c.scale(s.imageScale,s.imageScale);c.translate(-w*.5,0);closeup(c,w,h);c.restore();
    // This overlay and image are different layers; no image sequence is involved.
    if(!options.hideText){c.save();c.globalAlpha=1-smooth(.69,.82,s.progress);c.shadowColor='rgba(10,20,25,.25)';c.shadowBlur=16;let x=w*(compact?.09:.145),y=h*.62+s.headlineY*h-exitY*.25;type(c,'PORTS & POSSIBILITIES',x,y-h*.063,compact?w*.025:13*u,600,'#eef2f2','left');type(c,'Room to',x,y+h*.007,compact?w*.115:72*u,700,'#ffffff','left');type(c,'connect.',x,y+h*.105,compact?w*.115:72*u,700,'#ffffff','left');c.restore();
      c.save();c.globalAlpha=s.copyOpacity;x=w*(compact?.10:.165);y=h-exitY+h*.125;type(c,compact?'Your whole world.':'Your whole world. Connected.',x,y,compact?w*.058:31*u,700,'#222a2d','left');if(compact)type(c,'Connected.',x,y+32,compact?w*.058:31*u,700,'#222a2d','left');let lines=compact?['A thoughtfully machined back panel','keeps your tools within reach. Fast I/O,','room for more displays, and space','for your next big idea.']:['A thoughtfully machined back panel keeps your tools within reach.','Fast I/O, room for more displays, and space for your next big idea.'];lines.forEach((t,i)=>type(c,t,x,y+h*.073+i*h*.04,compact?w*.039:21*u,400,'#586166','left'));
      let fy=y+h*(compact?.31:.23);type(c,'1.4 → 1',x,fy,compact?w*.06:36*u,600,'#202a2d','left');type(c,'IMAGE SCALE',x,fy+h*.044,10*u,600,'#7f888d','left');type(c,'−50vh',x+w*.37,fy,compact?w*.06:36*u,600,'#202a2d','left');type(c,'TITLE TRAVEL',x+w*.37,fy+h*.044,10*u,600,'#7f888d','left');c.restore()}
    c.restore();return s;
  }
  return {render,state,duration:7,phases:['Close-up','Headline parallax','Copy reveal','Resolved']};

});
