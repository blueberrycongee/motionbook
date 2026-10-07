(function(root,factory){if(typeof module==='object')module.exports=factory(require('./motion.js'),require('./appearance.js'));else root.CircleScene=factory(root.CircleMotion,root.CircleAppearance);})(typeof globalThis!=='undefined'?globalThis:this,function(M,A){
'use strict';
function rr(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function line(c,points,color,width=1){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function oval(c,x,y,rx,ry,color,angle=0){c.beginPath();c.ellipse(x,y,rx,ry,angle,0,Math.PI*2);c.fillStyle=color;c.fill();}
function shape(c,path,fill,stroke){c.beginPath();for(const [op,...v] of path)c[op](...v);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function text(c,s,x,y,size=12,color='#252824',weight=400,align='left'){c.font=`${weight} ${size}px "Study Sans", sans-serif`;c.fillStyle=color;c.textAlign=align;c.fillText(s,x,y);}
function glasses(c,x,y,scale=1,color='#f8f1d7',angle=-.06){c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);c.lineWidth=1.3;
for(const side of [-1,1]){c.save();c.scale(side,1);shape(c,[['moveTo',3,-8],['bezierCurveTo',11,-11,23,-13,27,-12],['bezierCurveTo',25,0,20,12,11,10],['bezierCurveTo',5,8,2,1,3,-8]],color);shape(c,[['moveTo',7,-5],['bezierCurveTo',12,-7,20,-9,22,-8],['bezierCurveTo',20,1,17,7,12,6],['bezierCurveTo',8,5,6,0,7,-5]],'#293937');line(c,[[9,-3],[17,-5]],'#657875',1.3);c.restore();}line(c,[[-4,-4],[0,-6],[4,-4]],color,4);c.restore();}
function tote(c,x,y,scale=1,color='#ee8058'){c.save();c.translate(x,y);c.scale(scale,scale);c.lineWidth=6;c.strokeStyle='#eeae66';c.beginPath();c.ellipse(0,-24,23,27,0,Math.PI,Math.PI*2);c.stroke();rr(c,-41,-29,82,60,[11,11,18,18],color);for(let i=0;i<5;i++)for(let j=0;j<3;j++)oval(c,-28+i*14,-15+j*15,2.2,2.2,'#bc5e41');line(c,[[-36,-20],[-30,20]],'#f9aa75',2);c.restore();}
function person(c,background=true){
// Original geometric fashion illustration. No reference photographs are embedded.
if(background){const g=c.createLinearGradient(58,50,342,650);g.addColorStop(0,'#4f5950');g.addColorStop(.6,'#707467');g.addColorStop(1,'#aaa58d');c.fillStyle=g;c.fillRect(58,70,284,600);
for(let i=0;i<24;i++)line(c,[[68+i*13,70],[43+i*14,590]],'rgba(220,232,204,.10)',1);
rr(c,76,281,88,243,0,null,'rgba(199,217,185,.22)');rr(c,83,289,76,228,0,null,'rgba(199,217,185,.14)');
shape(c,[['moveTo',58,548],['lineTo',342,509],['lineTo',342,678],['lineTo',58,678]],'#c6bca6');
line(c,[[58,604],[342,565]],'#aea691',1);line(c,[[162,541],[172,678]],'#aea691',1);
oval(c,219,617,94,17,'rgba(34,41,33,.20)');
}
// Legs and sculptural tall boots.
shape(c,[['moveTo',163,395],['lineTo',202,400],['lineTo',186,542],['lineTo',161,540]],'#965f43');
shape(c,[['moveTo',210,399],['lineTo',246,397],['lineTo',267,531],['lineTo',239,538]],'#af7651');
shape(c,[['moveTo',160,494],['lineTo',192,499],['lineTo',187,605],['bezierCurveTo',174,619,152,620,145,612],['lineTo',160,585]],'#f0e8d3');
shape(c,[['moveTo',234,491],['lineTo',264,486],['lineTo',269,590],['bezierCurveTo',300,599,301,608,282,613],['lineTo',244,610]],'#e2d9c2');
line(c,[[172,505],[173,581]],'#c7c3ae',2);line(c,[[250,500],[256,584]],'#bab8a3',2);
// Hair silhouette, neck and independent face.
for(let i=0;i<20;i++){const a=i*2.399;oval(c,210+Math.cos(a)*39,153+Math.sin(a)*53,22+(i%3)*2,24,'#312c26');}
shape(c,[['moveTo',210,177],['lineTo',237,176],['lineTo',233,218],['lineTo',203,221]],'#9a6347');
oval(c,224,158,27,39,'#b57d57',-.10);oval(c,244,166,7,9,'#ad724e');
shape(c,[['moveTo',235,166],['lineTo',243,177],['lineTo',232,180]],'#905638');
line(c,[[224,189],[232,188]],'#653e31',2);
for(let i=0;i<12;i++){const a=i*.46;oval(c,180+i*4.4,120+Math.sin(a)*10,13,14,i%2?'#403329':'#49372a');}
// Chartreuse jacket with oversized independent silhouette.
shape(c,[['moveTo',196,210],['bezierCurveTo',184,205,162,212,151,230],['lineTo',128,335],['lineTo',146,376],['lineTo',165,356],['lineTo',160,420],['quadraticCurveTo',210,437,267,409],['lineTo',255,357],['quadraticCurveTo',281,353,280,329],['lineTo',264,237],['quadraticCurveTo',252,216,232,212],['lineTo',217,235]],'#c5db45');
shape(c,[['moveTo',153,228],['lineTo',158,346],['lineTo',140,365],['lineTo',129,335]],'#a9c638');
shape(c,[['moveTo',252,230],['lineTo',263,356],['lineTo',268,404],['lineTo',242,415],['lineTo',239,245]],'#afcd37');
shape(c,[['moveTo',197,209],['lineTo',218,235],['lineTo',208,251],['lineTo',189,226]],'#d4e566');
shape(c,[['moveTo',234,211],['lineTo',218,235],['lineTo',230,253],['lineTo',244,229]],'#d8e46c');
line(c,[[218,235],[215,398]],'#93b12d',1.4);line(c,[[173,333],[197,336],[197,361],[169,360]],'#a9be39',1.5);line(c,[[238,332],[260,329]],'#8eaa27',1.2);
line(c,[[167,402],[250,401]],'#9bb930',2);line(c,[[226,269],[227,291]],'#e6ecaa',2);
// Hand and bag.
shape(c,[['moveTo',139,363],['lineTo',157,369],['lineTo',155,398],['quadraticCurveTo',150,414,143,403],['lineTo',137,393]],'#b47b53');
tote(c,141,452,1);
glasses(c,222,160,1);
}
function backdrop(c,pose){c.save();c.beginPath();c.roundRect(58,42,284,636,30);c.clip();c.fillStyle='#27302a';c.fillRect(58,42,284,636);c.save();if(pose.profile==='2026'){const tr=pose.sceneTransform;c.translate(tr.tx,tr.ty);c.scale(tr.scale,tr.scale);c.fillStyle='#6f7b6b';c.fillRect(58,70,284,490);for(let i=0;i<14;i++)line(c,[[63+i*22,70],[63+i*22,536]],'rgba(216,226,202,.18)',2);rr(c,137,130,108,364,0,'#747554','#bac69a');for(let j=0;j<7;j++)line(c,[[137,155+j*48],[245,155+j*48]],'#a2ad72',4);c.fillStyle='#bdaf90';c.fillRect(58,512,284,98);c.save();c.translate(73,174);c.scale(.56,.56);person(c,false);c.restore();c.fillStyle='#e3dfd1';c.fillRect(58,535,284,78);text(c,'Studio notes · a little color in the city',72,568,9,'#48503c');text(c,'Original illustration / local sample catalog',72,584,8,'#707961');}else{c.translate(0,pose.shift);person(c);}c.restore();
A.applyFocus(c,pose);
// Fictional social frame, no Google or creator branding.
c.fillStyle='rgba(27,34,28,.18)';c.fillRect(58,70,284,72);text(c,'9:41',75,61,10,'#fff',500);text(c,'5G ▮▮',281,61,10,'#fff',500);oval(c,200,57,5,5,'#121a16');
text(c,'×',70,102,19,'#fff');text(c,'MUSE',200,102,16,'#fff',500,'center');for(let i=0;i<3;i++)oval(c,327,89+i*4,1,1,'#fff');
text(c,'Daily edit',77,124,8,'#d9dfd3');text(c,'♡',312,223,24,'#f7f5ec',400,'center');text(c,'4.2k',312,238,8,'#f7f5ec',400,'center');rr(c,304,257,16,13,4,'#f7f5ec');for(let i=0;i<3;i++)oval(c,308+i*4,263,1,1,'#70776b');text(c,'273',312,291,8,'#f7f5ec',400,'center');
if(pose.dim>0&&!pose.appearance){c.fillStyle=`rgba(17,23,16,${pose.dim})`;c.fillRect(58,70,284,608);}
c.restore();}
function legacySelection(c,pose){const points=pose.stroke;if(points.length<2)return;let linePoints=points,alpha=1;
if(pose.morph>0){const source=M.resample(points),b=pose.box;const target=M.alignedBox(source,[b.cx,b.cy,b.w,b.h,b.r]);linePoints=source.map((p,i)=>({x:M.lerp(p.x,target[i].x,pose.morph),y:M.lerp(p.y,target[i].y,pose.morph)}));}
c.save();c.shadowColor='rgba(255,255,238,.62)';c.shadowBlur=3.6;c.strokeStyle='#fffef6';c.lineWidth=2.7;c.lineCap='round';c.lineJoin='round';const b=pose.box;
for(let i=1;i<linePoints.length;i++){const p=linePoints[i],q=linePoints[i-1],x=(p.x+q.x)/2,y=(p.y+q.y)/2;const midSide=(Math.abs(x-b.cx)<b.w*.19&&Math.abs(y-b.cy)>b.h*.3)||(Math.abs(y-b.cy)<b.h*.16&&Math.abs(x-b.cx)>b.w*.35);c.globalAlpha=midSide?1-pose.gaps:1;c.beginPath();c.moveTo(q.x,q.y);c.lineTo(p.x,p.y);c.stroke();}
c.globalAlpha=1;c.shadowBlur=0;if(pose.pointerAlpha>0){const p=pose.kind==='reference'?{x:M.sample([[4.208333,259],[4.25,242],[4.333333,215],[4.416667,193],[4.5,187],[4.583333,207],[4.666667,230],[4.791667,243]],pose.pts),y:M.sample([[4.208333,151],[4.25,137],[4.333333,137],[4.416667,146],[4.5,167],[4.583333,179],[4.666667,184],[4.791667,183]],pose.pts)}:points.at(-1);A.drawAura(c,p.x,p.y,{strength:.30*pose.pointerAlpha*(pose.pointerAura||0),sigma:17,color:[238,239,216]});oval(c,p.x,p.y,17,17,`rgba(255,255,250,${pose.pointerAlpha*.91})`);c.lineWidth=1;c.strokeStyle=`rgba(255,255,255,${pose.pointerAlpha})`;c.beginPath();c.ellipse(p.x,p.y,17,17,0,0,Math.PI*2);c.stroke();}c.restore();}
function selection(c,pose){c.save();c.beginPath();c.roundRect(58,42,284,636,30);c.clip();if(pose.profile!=='2026'){legacySelection(c,pose);c.restore();return;}const points=pose.stroke,alpha=pose.traceAlpha===undefined?1:pose.traceAlpha;
if(points.length>1&&alpha>0){c.globalAlpha=alpha;c.strokeStyle='rgba(255,255,249,.85)';if(pose.kind==='reference'&&points.length>2){let start=Math.atan2(points[0].y-403,points[0].x-200),prev=start,arc=0;for(const p of points.slice(1)){const a=Math.atan2(p.y-403,p.x-200);arc-=Math.atan2(Math.sin(a-prev),Math.cos(a-prev));prev=a;}if(arc>.08){const g=c.createConicGradient(start,200,403);g.addColorStop(0,'rgba(255,255,249,.12)');for(let j=1;j<=64;j++){const t=j/64,f=M.clamp((1-t)*Math.PI*2/arc),a=.12+.73*M.ease(f/.55);g.addColorStop(t,`rgba(255,255,249,${a})`);}c.strokeStyle=g;}}c.lineWidth=3.8;c.lineCap='round';c.lineJoin='round';c.shadowColor='rgba(255,247,217,.55)';c.shadowBlur=4.3*(pose.traceGlow||0);c.beginPath();c.moveTo(points[0].x,points[0].y);for(let i=0;i<points.length-1;i++){const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];c.bezierCurveTo(p1.x+(p2.x-p0.x)/6,p1.y+(p2.y-p0.y)/6,p2.x-(p3.x-p1.x)/6,p2.y-(p3.y-p1.y)/6,p2.x,p2.y);}c.stroke();c.shadowBlur=0;c.globalAlpha=1;}
if((points.length||pose.cursor)&&pose.pointerAlpha>0){const p=pose.cursor||points.at(-1);A.drawAura(c,p.x,p.y,{strength:.57*pose.pointerAlpha*(pose.pointerAura||0),sigma:12,color:[248,224,146]});oval(c,p.x,p.y,11,11,`rgba(255,255,249,${pose.pointerAlpha})`);}
if(pose.boxAlpha>0){const b=pose.box,r=b.r,x=b.cx-b.w/2,y=b.cy-b.h/2,w=b.w,h=b.h;c.globalAlpha=pose.boxAlpha;c.strokeStyle='#fff';c.lineWidth=3.5;c.lineCap='butt';c.shadowColor='rgba(255,255,255,.55)';c.shadowBlur=2;for(const [sx,sy,angle]of [[x+r,y+r,Math.PI],[x+w-r,y+r,-Math.PI/2],[x+w-r,y+h-r,0],[x+r,y+h-r,Math.PI/2]]){c.beginPath();c.arc(sx,sy,r,angle,angle+Math.PI/2);c.stroke();}c.shadowBlur=0;}
c.restore();}
function currentResults(c,pose){const p=pose.sheetOpen,top=pose.sheetY;c.save();c.beginPath();c.roundRect(58,42,284,636,30);c.clip();if(p>.001){rr(c,58,top,284,680-top,[20,20,0,0],'#fffefa');rr(c,189,top+10,22,3,2,'#d3d8cd');text(c,'Local samples     All     Looks     Objects',69,top+45,9,'#647358');line(c,[[146,top+54],[169,top+54]],'#33492c',2);const ready=pose.pts===null?1:M.ease((pose.pts-6.4)/.4);oval(c,75,top+68,3,3,'#577d67');text(c,ready>.5?'Illustrated outfit matches':'Preparing local samples…',85,top+73,10,'#394d32');if(ready>0){c.globalAlpha=ready;rr(c,72,top+92,120,104,12,'#e6e9d6');rr(c,208,top+92,120,104,12,'#e9e2ce');glasses(c,132,top+139,1.5);tote(c,268,top+145,.75);text(c,'Ivory frames',75,top+213,9,'#53664a');text(c,'Tangerine tote',211,top+213,9,'#53664a');c.globalAlpha=1;}}else rr(c,74,top,252,34,18,'#fffefa');const qy=p>.5?635:top;rr(c,74,qy,252,33,18,'#f0f2eb');searchIcon(c,91,qy+15);text(c,p>.5?'Ask about this sample':'Circle the outfit',110,qy+21,10,'#718064');c.restore();}
function searchIcon(c,x,y){c.strokeStyle='#526946';c.lineWidth=2;c.beginPath();c.arc(x,y,5.5,0,Math.PI*1.7);c.stroke();line(c,[[x+4,y+4],[x+8,y+8]],'#526946',2);}
function results(c,pose){const p=pose.sheetOpen,rootY=pose.sheetY;const x=M.lerp(74,58,p),w=M.lerp(252,284,p);const h=M.lerp(33,281,p);const top=rootY;
c.save();c.beginPath();c.roundRect(58,42,284,636,30);c.clip();c.shadowColor='rgba(25,35,20,.12)';c.shadowBlur=12*p;c.shadowOffsetY=-3*p;if(p>0){c.globalAlpha=Math.min(1,p*2);rr(c,x,top,w,680-top,19,'#fffefb');c.globalAlpha=1;}rr(c,x,top,w,h+4,19,'#fffefb');c.shadowColor='transparent';
if(p>.01){c.globalAlpha=p;rr(c,189,top+10,22,3,2,'#dbddd5');c.globalAlpha=1;}
const qy=top+M.lerp(0,28,p);rr(c,x+M.lerp(0,8,p),qy,w-M.lerp(0,16,p),34,18,'#f4f4ed');searchIcon(c,x+21,qy+16);
if(p>.01){c.save();c.globalAlpha=p;rr(c,x+42,qy+3,30,28,7,'#dcded1');if(pose.target==='bag')tote(c,x+57,qy+20,.23);else glasses(c,x+57,qy+17,.39);text(c,'Local sample results',x+81,qy+21,9,'#52594d');c.restore();}else text(c,'Circle something you like',x+39,qy+21,10,'#78826c');for(let i=0;i<3;i++)oval(c,x+w-17,qy+12+i*4,1.1,1.1,'#5b6d50');
if(p>.01){c.globalAlpha=p;line(c,[[58,top+75],[342,top+75]],'#f0f1eb',5);text(c,'ILLUSTRATED FINDS',68,top+93,7,'#6b745e',500);text(c,'DEMO',331,top+93,7,'#818a74',500,'right');
const cardY=top+106;rr(c,67,cardY,129,125,11,'#e8e7d8');rr(c,203,cardY,129,125,11,'#dce1d2');
if(pose.target==='bag'){tote(c,130,cardY+66,.95);tote(c,268,cardY+66,.9,'#8d9d65');text(c,'Tangerine tote',69,cardY+141,9,'#333c2c',500);text(c,'Moss mini bag',205,cardY+141,9,'#333c2c',500);}else{oval(c,132,cardY+89,42,7,'#cacdbb');glasses(c,131,cardY+61,1.8);oval(c,267,cardY+89,43,7,'#bdc6af');glasses(c,267,cardY+61,1.75,'#a7b77d',.10);text(c,'Ivory cat-eye',69,cardY+141,9,'#333c2c',500);text(c,'Olive frame',205,cardY+141,9,'#333c2c',500);}text(c,'Studio sample · no store',69,cardY+155,7,'#89907f');text(c,'Local catalog · no search',205,cardY+155,7,'#89907f');c.globalAlpha=1;}
c.restore();}
function draw(c,pose,{caption=false}={}){c.save();c.clearRect(0,0,M.W,M.H);c.fillStyle='#f2f3ee';c.fillRect(0,0,M.W,M.H);c.shadowColor='rgba(39,48,37,.18)';c.shadowBlur=16;c.shadowOffsetY=8;rr(c,48,32,304,657,39,'#c9d1c6');c.shadowColor='transparent';c.lineWidth=1.6;rr(c,51,35,298,651,37,'#263128','#718171');rr(c,55,39,290,643,34,'#0c140f');backdrop(c,pose);selection(c,pose);if(pose.profile==='2026')currentResults(c,pose);else results(c,pose);rr(c,162,666,76,3.5,2,'#273127');if(caption)text(c,'Independent motion study · local mock results',200,710,8,'#707e66',400,'center');c.restore();}
return {draw,glasses,tote};
});
