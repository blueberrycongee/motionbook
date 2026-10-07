/* Original procedural studio-box artwork. No external assets. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MotionScene=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:0));
const remap=(p,a,b)=>clamp((p-a)/(b-a));
const smooth=t=>t*t*(3-2*t);
const sine=t=>(1-Math.cos(Math.PI*clamp(t)))/2;
function state(p){p=clamp(p);const rotation=remap(p,50/220,195/220);return {progress:p,rotation,angle:-Math.PI*Math.round(rotation*89)/89,frame:Math.round(rotation*89),frontEnter:remap(p,-50/220,16/220),frontHeading:remap(p,-50/220,16/220)*(1-remap(p,156/220,160/220)),frontList:sine(remap(p,-10/220,39/220))*(1-remap(p,153/220,160/220)),backHeading:remap(p,160/220,176/220),backList:remap(p,160/220,195/220),phase:p<50/220?'front hold':p<160/220?'turntable':'rear connections'};}
function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
function path(c,pts){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();}
function text(c,s,x,y,size=18,weight=500,color='#1d1d1f'){c.fillStyle=color;c.font=`${weight} ${size}px Arial, Helvetica, "DejaVu Sans", sans-serif`;c.fillText(s,x,y);}
function rgba(n,a=1){n=Math.round(clamp(n,0,255));return `rgba(${n},${Math.min(255,n+1)},${Math.min(255,n+2)},${a})`;}
function project(x,y,z,angle){const a=Math.cos(angle),b=Math.sin(angle);return {x:x*a+z*b,y:y-(-x*b+z*a)*.01,depth:-x*b+z*a};}
function outline(half=280,rad=32){const pts=[];[[half-rad,half-rad,0],[ -half+rad,half-rad,Math.PI/2],[-half+rad,-half+rad,Math.PI],[half-rad,-half+rad,Math.PI*1.5]].forEach(([cx,cz,a])=>{for(let j=0;j<=18;j++){const th=a+j/18*Math.PI/2;pts.push({x:cx+rad*Math.cos(th),z:cz+rad*Math.sin(th)});}});return pts;}
function model(c,angle){
 const H=244, points=outline(), pr=(x,y,z)=>project(x,y,z,angle);
 // Soft contact shadow and a subtly inset perforated base.
 c.save();c.scale(1,.055);const sh=c.createRadialGradient(0,5050,40,0,5050,340);sh.addColorStop(0,'rgba(0,0,0,.045)');sh.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=sh;c.fillRect(-400,4550,800,1100);c.restore();
 let foot=points.map(p=>pr(p.x*.87,H+24,p.z*.87));path(c,foot);c.fillStyle='#303335';c.fill();
 const strips=[];
 for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length];let dx=q.x-p.x,dz=q.z-p.z;let nx=dz,nz=-dx,len=Math.hypot(nx,nz);nx/=len;nz/=len;let nzv=-nx*Math.sin(angle)+nz*Math.cos(angle);if(nzv>=-.001)continue;strips.push({p,q,nx,nz,nzv,d:(pr(p.x,0,p.z).depth+pr(q.x,0,q.z).depth)/2});}
 strips.sort((a,b)=>b.d-a.d);
 // Lower grille is always registered to the same footprint.
 for(const f of strips){let {p,q}=f;path(c,[pr(p.x*.98,H-1,p.z*.98),pr(q.x*.98,H-1,q.z*.98),pr(q.x*.88,H+23,q.z*.88),pr(p.x*.88,H+23,p.z*.88)]);let g=c.createLinearGradient(0,H-5,0,H+28);g.addColorStop(0,'#74777a');g.addColorStop(.45,'#a7a9aa');g.addColorStop(1,'#4a4d4f');c.fillStyle=g;c.fill();}
 // Small perforations follow the inset bevel, not the camera plane.
 for(let row=0;row<8;row++){let t=(row+.5)/8;for(let j=0;j<170;j++){const th=j/170*Math.PI*2;const limit=250/Math.max(Math.abs(Math.cos(th)),Math.abs(Math.sin(th)));let x=Math.cos(th)*limit,z=Math.sin(th)*limit;const pp=pr(x,H+4+t*17,z);if(pp.depth<0){c.fillStyle='rgba(15,18,20,.74)';c.beginPath();c.ellipse(pp.x,pp.y,1.05,.63,0,0,Math.PI*2);c.fill();}}}
 // Top slab and rounded metal walls, sampled along the original rounded-square perimeter.
 path(c,points.map(p=>pr(p.x,0,p.z)));let top=c.createLinearGradient(0,-9,0,12);top.addColorStop(0,'#c0c3c4');top.addColorStop(.7,'#e4e5e6');top.addColorStop(1,'#b6b8b9');c.fillStyle=top;c.fill();
 for(const f of strips){const {p,q,nx,nz,nzv}=f;let worldNx=nx*Math.cos(angle)+nz*Math.sin(angle);let reflection=-46*Math.exp(-Math.pow((worldNx+.5)/.31,2))-43*Math.exp(-Math.pow((worldNx+.91)/.11,2))+28*Math.exp(-Math.pow((worldNx-.65)/.17,2))-44*Math.exp(-Math.pow((worldNx-.94)/.1,2));let lum=171+22*(-nzv)+reflection+worldNx*24;
 path(c,[pr(p.x,0,p.z),pr(q.x,0,q.z),pr(q.x,H,q.z),pr(p.x,H,p.z)]);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,rgba(lum+7));g.addColorStop(.2,rgba(lum+2));g.addColorStop(.63,rgba(lum-3));g.addColorStop(1,rgba(lum-11));c.fillStyle=g;c.fill();c.strokeStyle=g;c.lineWidth=.7;c.stroke();
 }
 // Front or back plates use the face's affine projection, including its tiny vertical skew.
 const co=Math.cos(angle),si=Math.sin(angle);
 function face(z,back,paint){if((back?co:-co)>=0)return;const p=pr(0,0,z);c.save();c.transform(co,si*.01,0,1,p.x,p.y);paint(c);c.restore();}
 face(-280.04,false,function(c){
  // A gentle horizontal studio reflection, with a original two-line status mark.
  const g=c.createLinearGradient(-247,0,247,0);g.addColorStop(0,'rgba(255,255,255,.01)');g.addColorStop(.4,'rgba(255,255,255,.07)');g.addColorStop(1,'rgba(0,0,0,.035)');c.fillStyle=g;c.fillRect(-246,1,492,H-1);
  socket(c,-190,188,7,22,3);socket(c,-147,188,7,22,3);socket(c,-103,195,74,7,3);
  c.fillStyle='#f1f7f5';c.shadowColor='rgba(239,255,249,.8)';c.shadowBlur=4;c.beginPath();c.arc(199,199,3.5,0,Math.PI*2);c.fill();c.shadowBlur=0;
 });
 face(280.04,true,function(c){
  // Mirror local geometry so the rear reads normally after the half turn.
  c.scale(-1,1);
  const g=c.createLinearGradient(-245,0,245,0);g.addColorStop(0,'rgba(0,0,0,.09)');g.addColorStop(.55,'rgba(255,255,255,.065)');g.addColorStop(1,'rgba(0,0,0,.03)');c.fillStyle=g;c.fillRect(-246,2,492,H-3);
  c.fillStyle='#272b2d';for(let row=0;row<29;row++){for(let col=0;col<86;col++){const x=-234+col*5.5+(row%2)*2.75,y=15+row*4.25;c.beginPath();c.ellipse(x,y,1.6,1.5,0,0,Math.PI*2);c.fill();}}
  [-216,-192,-168,-144].forEach(x=>socket(c,x,190,6,22,2.8));
  socket(c,-115,187,31,28,2);c.fillStyle='#35393b';c.fillRect(-110,193,21,13);c.fillStyle='#999c9d';for(let j=0;j<6;j++)c.fillRect(-108+j*3,194,1,5);
  socket(c,-60,182,41,34,15);c.fillStyle='#696c6e';[-48,-32].forEach(x=>{c.beginPath();c.arc(x,199,4,0,Math.PI*2);c.fill();});
  [4,30].forEach(x=>{socket(c,x,187,11,31,1.5);c.fillStyle='#777b7c';c.fillRect(x+4,193,3,17);});
  socket(c,65,193,35,13,3);c.fillStyle='#727576';c.fillRect(71,196,23,2);
  socket(c,122,195,9,9,4.5);
  c.strokeStyle='#8f9293';c.lineWidth=.8;c.beginPath();c.arc(163,199,11,0,Math.PI*2);c.stroke();c.lineWidth=1.2;c.strokeStyle='#44494b';c.beginPath();c.arc(163,200,5,-.8,Math.PI+ .8);c.stroke();c.beginPath();c.moveTo(163,191);c.lineTo(163,198);c.stroke();
  // Connector category marks are intentionally generic.
  text(c,'I/O',-205,174,6,700,'#616568');text(c,'NET',-109,174,6,700,'#616568');text(c,'USB',8,174,6,700,'#616568');text(c,'VIDEO',68,174,6,700,'#616568');
 });
 // Crisp lower lip emphasizes the precision machining.
 c.strokeStyle='rgba(255,255,255,.32)';c.lineWidth=.75;for(const {p,q} of strips){c.beginPath();let a=pr(p.x,H,p.z),b=pr(q.x,H,q.z);c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
}
function socket(c,x,y,w,h,r){rr(c,x-1,y-1,w+2,h+2,r+1);c.fillStyle='#878a8b';c.fill();rr(c,x,y,w,h,r);let g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#111416');g.addColorStop(.55,'#303536');g.addColorStop(1,'#101315');c.fillStyle=g;c.fill();if(w<10){c.fillStyle='rgba(190,193,194,.38)';rr(c,x+1,y+2,1.5,h-4,1);c.fill();}}
function render(c,w,h,p,options={}){const s=state(p);c.clearRect(0,0,w,h);c.fillStyle=options.background||'#fafafa';c.fillRect(0,0,w,h);const mobile=w<600;const k=Math.min(w/(mobile?680:970),h/(mobile?650:570));const cx=w/2,top=(h-(mobile?600:540)*k)/2+(mobile?24:5)*k;
 c.save();c.translate(cx,top);c.scale(k,k);model(c,s.angle);c.restore();
 const left=cx-280*k, width=560*k, y=top+350*k;
 function copy(alpha,heading,lines,isBack){if(alpha<=0)return;c.save();c.globalAlpha=alpha;const headingOffset=isBack?0:(1-s.frontEnter)*150*k;text(c,heading,left,y+4*k+headingOffset,16*k,600);c.strokeStyle='#b6b8ba';c.lineWidth=Math.max(.7,k);c.beginPath();c.moveTo(left,y+20*k+headingOffset);c.lineTo(left+width*(isBack?1:s.frontEnter),y+20*k+headingOffset);c.stroke();c.restore();
 const listAlpha=isBack?s.backList:s.frontList;c.save();c.globalAlpha=listAlpha;
 const offset=(1-listAlpha)*(isBack?48:42)*k;
 if(isBack){text(c,'4× high-speed USB-C',left,y+53*k+offset,25*k,600);text(c,'1× Ethernet · 2× USB-A',left,y+82*k+offset,25*k,600);const right=left+340*k;text(c,'1× video output',right,y+53*k+offset*1.6,22*k,600);text(c,'1× audio jack',right,y+82*k+offset*1.6,22*k,600);}
 else{lines.forEach((line,i)=>text(c,line,left,y+(53+i*30)*k+offset,27*k,600));}c.restore();}
 copy(s.frontHeading,'Front connections',['2× USB-C','1× memory card reader'],false);copy(s.backHeading,'Rear connections',[],true);
 return s;
}
return {render,state,model,duration:7,meta:{id:'01-turntable',frames:90,originalArtwork:true,sourceMechanism:'scroll-scrubbed frame sequence with synchronized captions'}};
});
