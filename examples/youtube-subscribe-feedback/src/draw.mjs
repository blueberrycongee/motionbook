import {BUTTON,clamp,smooth,lerp,mix} from './motion.mjs';
export const SIZE={width:720,height:720};
function round(ctx,x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();}
function text(ctx,str,x,y,size=16,color='#fff',weight=400){ctx.fillStyle=color;ctx.font=`${weight} ${size}px "DejaVu Sans",sans-serif`;ctx.textBaseline='middle';ctx.fillText(str,x,y);}
function line(ctx,pts,color,width=2){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
function star(ctx,x,y,r,color,a=1){ctx.save();ctx.globalAlpha=a;ctx.beginPath();for(let i=0;i<8;i++){let angle=i*Math.PI/4-Math.PI/2,rr=i%2?r*.23:r;let xx=x+Math.cos(angle)*rr,yy=y+Math.sin(angle)*rr;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.restore();}
function bell(ctx,x,y,a=1,angle=0){ctx.save();ctx.translate(x,y-9);ctx.rotate(angle);ctx.translate(0,9);ctx.globalAlpha=a;ctx.fillStyle='#f3f3f3';ctx.beginPath();ctx.moveTo(-9,7);ctx.quadraticCurveTo(-6,2,-6,-4);ctx.quadraticCurveTo(-6,-11,0,-11);ctx.quadraticCurveTo(6,-11,6,-4);ctx.quadraticCurveTo(6,2,9,7);ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(0,8,2.6,0,Math.PI);ctx.fill();ctx.restore();}
export function drawButton(ctx,s,{x=BUTTON.x,y=BUTTON.y,w=BUTTON.width,h=BUTTON.height}={}){
 const width=w*(s.width/BUTTON.width),cx=x+w-width/2,cy=y+h/2;
 ctx.save();ctx.translate(cx,cy);ctx.scale(s.scale,s.scale);
 if(s.glow>0){const g=ctx.createLinearGradient(-width/2,h/2,width/2,-h/2);g.addColorStop(0,'#ff0033');g.addColorStop(1,'#ff1985');ctx.globalAlpha=s.glow;round(ctx,-width/2,-h/2,width,h,h/2,g);ctx.globalAlpha=1;}
 let fill=`rgb(${s.color.join(',')})`;
 if(s.subscribed&&!s.reduced){const g=ctx.createLinearGradient(-width/2,0,width/2,0);g.addColorStop(0,fill);g.addColorStop(1,`rgb(${s.colorRight.join(',')})`);fill=g;}
 const inset=s.glow*2.6;round(ctx,-width/2+inset,-h/2+inset,width-inset*2,h-inset*2,h/2-inset,fill);
 if(s.labelAlpha>0){ctx.globalAlpha=s.labelAlpha;ctx.textAlign='center';ctx.fillStyle=`rgb(${s.labelColor.join(',')})`;ctx.font=`500 ${h*.375}px "DejaVu Sans",sans-serif`;ctx.textBaseline='middle';ctx.fillText(s.label,0,.5,width*.83);ctx.textAlign='left';ctx.globalAlpha=1;}
 if(s.iconAlpha>0){bell(ctx,-11,0,s.iconAlpha,s.bellAngle);ctx.globalAlpha=s.iconAlpha;line(ctx,[[9,-2],[14,3],[19,-2]],'#e3e3e3',2);ctx.globalAlpha=1;}
 for(const p of s.particles){
  const prog=clamp(p.progress),grow=smooth(prog/.23),a=(1-smooth((prog-.68)/.32));const px=p.u*width*(.65+.35*grow),py=p.v*h*(.62+.38*grow),r=p.size*grow;
  if(p.star)star(ctx,px,py,r,p.color,a);else if(prog<.66){ctx.globalAlpha=a;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}else{for(let i=0;i<5;i++){const angle=p.rotation+i/5*Math.PI*2,rr=(3+(prog-.66)*18);ctx.globalAlpha=a*.6;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(px+Math.cos(angle)*rr,py+Math.sin(angle)*rr,1.1,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}}
 }
 ctx.restore();
}
function landscape(ctx,s){
 ctx.save();ctx.beginPath();ctx.roundRect(90,132,540,245,[20,20,0,0]);ctx.clip();
 const g=ctx.createLinearGradient(0,132,0,380);g.addColorStop(0,'#cf6945');g.addColorStop(1,'#ecc190');ctx.fillStyle=g;ctx.fillRect(90,132,540,245);
 ctx.fillStyle='#f5dda8';ctx.beginPath();ctx.arc(500,202,40,0,Math.PI*2);ctx.fill();
 const shift=s.reduced?0:Math.sin(s.t*.6)*7;
 ctx.fillStyle='#875343';ctx.beginPath();ctx.moveTo(75,313);ctx.bezierCurveTo(190,185,248,261,355,263);ctx.bezierCurveTo(435,250,500,280,650,263);ctx.lineTo(650,400);ctx.lineTo(70,400);ctx.fill();
 ctx.fillStyle='#4e655b';ctx.beginPath();ctx.moveTo(75,340);ctx.bezierCurveTo(180,304+shift,222,254,324,312);ctx.bezierCurveTo(421,370,501,287,650,310);ctx.lineTo(650,400);ctx.lineTo(70,400);ctx.fill();
 ctx.fillStyle='#243e38';ctx.beginPath();ctx.moveTo(75,379);ctx.bezierCurveTo(190,314,278,379,359,349);ctx.bezierCurveTo(439,331,488,337,650,363);ctx.lineTo(650,410);ctx.lineTo(70,410);ctx.fill();
 text(ctx,'FIELD NOTES',120,167,11,'#fff1d4',600);text(ctx,'A slower Sunday',120,214,30,'#fff5e3',600);
 text(ctx,'SMALL STORIES / 07',120,252,11,'#ffe6c6',400);
 ctx.strokeStyle='#e8bb89';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(455,378);ctx.bezierCurveTo(405,346,387,350,367,328);ctx.stroke();
 if(s.cue){round(ctx,235,338,250,26,4,'rgba(0,0,0,.76)');ctx.textAlign='center';text(ctx,'If you enjoyed this, subscribe.',360,352,12,'#fff',400);ctx.textAlign='left';}
 ctx.restore();
}
export function drawScene(ctx,s){
 ctx.clearRect(0,0,720,720);ctx.fillStyle='#eeeee8';ctx.fillRect(0,0,720,720);
 text(ctx,'MOTION STUDY',42,38,10,'#77796e',600);text(ctx,'07 / SUBSCRIBE FEEDBACK',42,69,23,'#272a26',600);
 round(ctx,42,89,185,21,11,'#dddeda');text(ctx,'RED / MAGENTA REVISION',54,100,8.8,'#50564a',600);
 ctx.shadowColor='#25342918';ctx.shadowBlur=30;ctx.shadowOffsetY=12;round(ctx,90,132,540,386,20,'#121314');ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 landscape(ctx,s);
 text(ctx,'Finding quiet in the everyday',112,397,17,'#f3f3f0',600);
 ctx.fillStyle='#f1bb80';ctx.beginPath();ctx.arc(132,435,20,0,Math.PI*2);ctx.fill();ctx.fillStyle='#416559';ctx.beginPath();ctx.moveTo(117,446);ctx.lineTo(132,422);ctx.lineTo(147,446);ctx.fill();
 text(ctx,'Field & Frame',164,430,14,'#f6f5f1',600);text(ctx,'42.8K subscribers',164,450,10,'#9b9e9b');
 drawButton(ctx,s);
 round(ctx,111,476,83,25,13,'#292b2b');text(ctx,'♡  2.4K',124,489,11,'#eceee7');round(ctx,204,476,76,25,13,'#292b2b');text(ctx,'↗  Share',216,489,11,'#eceee7');round(ctx,290,476,88,25,13,'#292b2b');text(ctx,'↓  Save',305,489,11,'#eceee7');
 const phase=s.phase==='reward'?2:s.phase==='subscribed'?3:s.phase==='hint'?1:0;
 const labels=['CONTENT CUE','BRANDED RIM','CLICK / SPARKLES','BELL SETTLE'];
 labels.forEach((label,i)=>{const xx=91+i*137;round(ctx,xx,553,124,3,2,i<=phase?'#4b6954':'#d0d3c9');text(ctx,`0${i+1}`,xx,577,10,i===phase?'#283d2b':'#a2a99a',600);text(ctx,label,xx,596,8.5,i===phase?'#283d2b':'#818b7d',600);});
 text(ctx,s.reduced?'Reduced motion: instant confirmation, no sparkles':'Local simulation · original artwork · deterministic timing',90,646,10,'#70796b');
 text(ctx,'Verified reference: Google Design · 11 Feb 2025',90,671,10,'#8b9185');
}
