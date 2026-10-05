export const SIZE=128;
export const PERIOD=2.1;
const C={bg:'#060711',table:'#21191e',tableHi:'#302228',edge:'#101016',case:'#29282d',caseHi:'#39383d',bezel:'#41413f',bezelHi:'#63645e',bezelShade:'#303131',screen:'#1747ce',screenHi:'#205ce2',screenDark:'#102e89',ink:'#292e59',paper:'#b7b5aa',paperHi:'#d1cfc2',orange:'#a37650',orangeHi:'#c29160',orangeLo:'#795a46',cream:'#abaea6',creamHi:'#c9c9b6',nose:'#252431'};
let ctx;
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function poly(points,color){
 let ymin=Math.floor(Math.min(...points.map(p=>p[1]))),ymax=Math.ceil(Math.max(...points.map(p=>p[1])));
 for(let y=ymin;y<ymax;y++){
  const xs=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))xs.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
  xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)rect(Math.ceil(xs[i]),y,Math.ceil(xs[i+1])-Math.ceil(xs[i]),1,color);
 }
}
function line(x0,y0,x1,y1,color,width=1){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);let dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,e=dx+dy;for(;;){rect(x0,y0,width,width,color);if(x0===x1&&y0===y1)break;let e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}
function ellipse(x,y,rx,ry,color){for(let yy=-ry;yy<=ry;yy++){const w=Math.floor(rx*Math.sqrt(Math.max(0,1-yy*yy/(ry*ry))));rect(x-w,y+yy,w*2+1,1,color);}}
function dots(seed,n,bounds,color){let k=seed;for(let i=0;i<n;i++){k=(k*1664525+1013904223)>>>0;const x=bounds[0]+k%(bounds[2]-bounds[0]);k=(k*1664525+1013904223)>>>0;const y=bounds[1]+k%(bounds[3]-bounds[1]);rect(x,y,1,1,color);}}
function bone(x,y,color){rect(x+1,y,5,2,color);rect(x,y-1,2,4,color);rect(x+5,y-1,2,4,color);}
function heart(x,y,color){poly([[x,y+1],[x+2,y],[x+4,y+2],[x+6,y],[x+8,y+1],[x+8,y+3],[x+4,y+7],[x,y+3]],color);}
function background(t){
 rect(0,0,128,128,C.bg);
 poly([[0,90],[40,77],[86,66],[128,76],[128,128],[0,128]],C.table);
 poly([[0,105],[48,85],[96,76],[128,84],[128,126],[0,128]],'#271e23');
 line(83,77,126,92,'#3c2931');line(108,96,127,101,'#34272d');line(2,120,74,102,'#38292e');
 // Tower: receding top, left side and bay face.
 poly([[47,5],[72,3],[111,11],[82,17]],'#353439');
 poly([[48,8],[81,16],[80,87],[48,75]],'#17171e');
 poly([[55,7],[77,5],[107,11],[82,14]],'#414046');
 poly([[49,9],[58,10],[69,14],[82,17],[82,86],[69,84],[65,32]],'#111218');
 poly([[82,16],[112,11],[111,77],[82,88]],'#27262c');
 poly([[85,18],[109,14],[109,75],[85,83]],'#302e35');
 poly([[88,21],[108,17],[108,32],[87,36]],'#232228');
 line(89,23,105,20,'#101118');line(88,25,106,22,'#39373d');line(88,27,104,24,'#14141a');
 line(89,31,103,28,'#18171f',2);rect(100,27,4,1,'#0d0e14');rect(91,31,1,1,'#49464b');
 poly([[87,37],[108,34],[108,44],[87,48]],'#202027');
 line(90,39,105,36,'#101118',2);line(92,40,104,38,'#434047');
 for(let i=0;i<4;i++)rect(89+i*5,43-i,3,1,['#533642','#2d3646','#513340','#334254'][i]);
 line(88,52,106,48,'#24232b',2);rect(88,53,1,2,'#72a44f');rect(91,53,1,2,t%0.7<0.3?'#ce6743':'#693e37');
 line(88,59,105,56,'#14151c',2);line(88,64,105,61,'#17171f',2);line(88,69,105,66,'#18171e',2);
 for(let x=70;x<78;x+=2)for(let y=24;y<38;y+=2)rect(x,y,1,1,'#292b35');
 rect(110,24,7,3,'#335f2e');rect(116,25,2,2,'#315327');rect(111,25,1,1,'#4d7536');rect(114,25,1,1,'#4d7536');
 rect(108,45,7,3,'#1636a3');rect(113,47,3,2,'#153286');
 // Small sleeping dog ornament on the tower.
 poly([[77,10],[80,8],[85,8],[86,5],[88,7],[90,5],[92,8],[92,11],[88,13],[81,13]],'#665f78');
 rect(88,8,1,1,'#24213e');rect(90,9,1,1,'#aaa19c');rect(77,10,2,1,'#77708b');
 // Monitor and heavy stand.
 poly([[0,79],[65,72],[71,79],[52,87],[9,92],[0,91]],'#0b0c12');
 poly([[27,82],[46,79],[50,88],[26,93],[15,92]],'#202128');
 poly([[26,88],[47,85],[51,89],[21,96],[8,95]],'#2c2d32');
 poly([[0,10],[44,8],[65,12],[69,17],[71,31],[71,74],[66,81],[0,89]],C.bezelShade);
 poly([[0,10],[46,9],[63,12],[67,17],[68,28],[68,73],[64,79],[0,86]],C.bezel);
 poly([[0,11],[43,9],[61,12],[65,16],[47,14],[0,17]],'#565751');
 line(0,14,44,11,'#696963',2);line(19,11,46,10,'#595954');line(1,16,46,13,'#63645d');line(47,12,60,13,'#7b7863');
 poly([[0,26],[60,20],[63,25],[65,66],[62,73],[0,81]],'#10151f');
 poly([[0,25],[59,20],[62,24],[65,66],[62,71],[0,80]],'#3d555d');
 line(1,79,58,73,'#090c11',2);line(60,26,63,64,'#677279');
 // A bone sticker and tiny orange tab.
 bone(5,19,'#a5a054');rect(6,18,1,1,'#d1c968');rect(10,19,1,1,'#d1c968');
 rect(52,15,10,3,'#a86031');rect(54,16,1,1,'#743d25');rect(57,16,1,1,'#743d25');rect(60,16,1,1,'#743d25');
 // Monitor brand is an abstract 2-pixel emblem, not a text overlay.
 for(const p of [[31,79],[33,78],[34,80],[36,78],[38,77],[38,79]])rect(...p,1,1,'#23282a');
 // Pink heart note tucked into the bezel.
 poly([[55,72],[64,70],[66,80],[62,83],[57,81]],'#765267');
 rect(57,72,1,1,'#39263a');rect(60,72,1,1,'#39263a');
 line(57,75,59,74,'#362339');line(59,74,61,76,'#362339');line(61,76,63,74,'#362339');line(63,74,64,76,'#362339');line(64,76,61,80,'#362339');line(61,80,57,77,'#362339');
 // Cable, mouse and keyboard behind the dog.
 line(64,81,77,88,'#090c10',2);line(77,88,91,88,'#090c10',2);line(104,82,116,82,'#131118');
 ellipse(123,85,12,6,'#100e16');ellipse(123,83,10,5,'#47353f');ellipse(123,81,7,3,'#674754');line(121,79,120,85,'#3e2d3b');rect(123,80,3,1,'#805b66');
 poly([[0,102],[70,90],[83,101],[10,127],[5,126]],'#070a0f');
 poly([[0,99],[69,90],[77,100],[7,123],[3,121]],'#2a2c34');
 poly([[0,100],[68,92],[72,99],[7,119]],'#34353d');
 line(5,120,73,100,'#161820',2);line(7,118,72,99,'#4a4b50');
 for(let row=0;row<5;row++)for(let col=0;col<16;col++){
  let x=1+col*4.1+row*.65,y=101+row*3.25-col*.52;
  poly([[x,y],[x+3,y-.5],[x+3.5,y+1.5],[x+.5,y+2]],'#171c26');
  line(x,y,x+2,y,'#45474c');rect(x+1,y+1,1,1,(row+col)%4===0?'#333942':'#2a303b');
 }
 poly([[17,114],[37,110],[39,112],[20,117]],'#181e29');line(18,114,36,111,'#41464e');
 rect(59,94,1,1,'#77af63');rect(61,94,1,1,'#393c43');
}
// A tiny dog portrait drawn in pixels, reused only inside the fictional desktop.
function iconDog(x,y,scale=1,color='#555478'){
 const blocks=[[4,0,2,4],[9,0,2,4],[3,3,9,7],[1,6,5,3],[5,10,7,3]];
 for(const [a,b,w,h]of blocks)rect(x+a*scale,y+b*scale,w*scale,h*scale,color);
 rect(x+2*scale,y+7*scale,6*scale,2*scale,C.paper);rect(x+1*scale,y+6*scale,2*scale,scale,color);
 rect(x+5*scale,y+5*scale,scale,scale,C.paperHi);rect(x+6*scale,y+9*scale,4*scale,2*scale,C.paper);
}
function win(x,y,w,h,kind,seed=0){
 rect(x+1,y+1,w,h,'#252b5a');rect(x,y,w,h,C.paper);rect(x+1,y+1,w-2,2,kind==='food'?'#72432e':'#525b8d');
 rect(x+w-3,y+1,2,2,'#bfc0b6');rect(x+1,y+4,w-2,h-5,kind==='cards'?'#225e2b':kind==='food'?'#8e512f':C.paper);
 if(kind==='dog')iconDog(x+2,y+4,1,'#525775');
 if(kind==='bone'){bone(x+4,y+8,'#615e5e');rect(x+2,y+5,2,1,'#8a8a76');}
 if(kind==='food'){
  // Original-style food pop-up, adapted into a dog-biscuit ad with no caption.
  ellipse(x+12,y+14,9,6,'#69472d');ellipse(x+12,y+12,9,5,'#b08a45');ellipse(x+12,y+11,8,4,'#cba459');
  for(let i=0;i<9;i++)rect(x+5+(i*7)%15,y+9+(i*3)%5,1,1,'#8f672c');
  bone(x+8,y+11,'#ebca76');heart(x+w-9,y+5,'#bcbc98');rect(x+2,y+h-3,12,1,'#d5b85d');
 }
 if(kind==='cards'){
  for(let row=0;row<2;row++)for(let col=0;col<6;col++){
   const xx=x+2+col*4, yy=y+6+row*7;rect(xx,yy,3,5,'#bbb9aa');rect(xx+1,yy+1,1,1,(col+row)%2?'#84373f':'#25313a');rect(xx+1,yy+3,1,1,(col+row)%2?'#84373f':'#25313a');
  }
 }
 if(kind==='blue'){rect(x+1,y+4,w-2,h-5,'#09488b');bone(x+5,y+10,'#d9ca76');for(let i=0;i<3;i++)rect(x+4+i*3,y+6,1,1,'#9ed9e1');}
 if(kind==='flower'){
  rect(x+1,y+4,w-2,h-5,'#296921');for(let i=0;i<6;i++)ellipse(x+8+Math.round(Math.cos(i)*4),y+11+Math.round(Math.sin(i)*4),2,2,'#a456a2');rect(x+8,y+10,2,2,'#d6b752');line(x+9,y+14,x+10,y+19,'#75a751');
 }
}
function desktop(t,canvasFactory){
 const cv=canvasFactory(64,52),old=ctx;ctx=cv.getContext('2d');
 rect(0,0,64,52,C.screen);rect(0,0,64,1,C.screenHi);rect(0,50,64,2,'#123b9f');
 // Desktop icons: folder, globe, recycle bin, dog food, mail.
 poly([[2,6],[4,4],[5,6],[7,6],[7,9],[2,9]],'#bdbe9f');
 rect(3,15,3,5,'#419a6c');rect(1,17,6,2,'#41a6b6');rect(4,16,3,2,'#aa4eb4');rect(3,14,1,2,'#b3d099');
 rect(2,24,3,4,'#889ab0');rect(3,24,3,1,'#5367a0');
 rect(2,35,4,4,'#af832c');rect(3,34,2,1,'#d9b961');
 rect(46,3,3,4,'#973b24');rect(47,2,2,2,'#689c47');rect(52,4,4,2,'#202c71');rect(54,3,1,1,'#243572');rect(53,10,4,3,'#8e949f');
 const f=Math.floor(((t%PERIOD)+PERIOD)%PERIOD/0.1);
 if(f<6){
  win(6,26,22,19,'dog'); if(f>0)win(14,21,22,19,'dog');if(f>2)win(27,15,23,19,'dog');if(f>3)win(5,12,14,11,'bone');
 }else if(f<12){ win(6,26,22,19,'dog');win(27,15,23,19,'dog');win(8,17,42,29,'food'); }
 else if(f<17){win(4,24,23,23,'blue');win(11,22,23,24,'blue');win(33,17,17,25,'flower');if(f>13)win(26,12,18,13,'bone');}
 else {win(8,18,44,29,'cards');}
 // A two-pixel cursor stays inside the fictional CRT.
 const mx=f<6?30+f*3:f<12?48:f<17?25:41, my=f<6?28-f:f<12?42:f<17?30:34;
 poly([[mx,my],[mx,my+5],[mx+1,my+3],[mx+3,my+3]],'#d0d7dd');
 // CRT phosphor texture stays subtle and locked to the pixel grid.
 for(let y=1;y<52;y+=2)rect(0,y,64,1,'rgba(8,15,73,.025)');
 ctx=old;
 // Pixel-wise affine placement into the angled CRT aperture.
 const data=cv.getContext('2d').getImageData(0,0,64,52).data;
 for(let yy=20;yy<79;yy++)for(let xx=0;xx<64;xx++){
  const y=yy-26+Math.floor(xx*.09),x=xx+3-Math.floor(y*.065);
  if(x<0||x>=64||y<0||y>=52||yy>77-Math.max(0,xx-53)*.35||y<Math.max(0,x-59))continue;
  const i=(y*64+x)*4;
  rect(xx,yy,1,1,`rgb(${data[i]},${data[i+1]},${data[i+2]})`);
 }
}
function shiba(t){
 const f=Math.floor(((t%PERIOD)+PERIOD)%PERIOD/.1), bob=(f>=7&&f<=10)?1:0;
 // Rear three-quarter sit, based on inspected photographs: broad rump,
 // front legs below the chest, and a continuous nape/back silhouette.
 const coat='#a67549',gold='#b78654',dark='#785539',shade='#8d643e';
 // Grounded, folded hindquarters. The frame crops the feet naturally.
 poly([[79,105],[85,97],[93,92],[102,94],[108,102],[114,113],[118,123],[116,128],[77,128]],'#242027');
 poly([[81,105],[86,97],[94,93],[102,96],[107,104],[112,114],[115,124],[113,128],[79,128]],coat);
 // Far foreleg, tucked behind the chest, instead of a human-style arm.
 poly([[81,94],[86,96],[86,111],[84,122],[84,128],[78,128],[78,124],[80,122],[81,111]],'#807969');
 poly([[81,104],[83,106],[82,122],[80,126],[77,127],[77,128],[84,128],[85,122],[86,110]],'#acaea1');
 // Near shoulder flows into the rounded trunk, without a collar break.
 poly([[85,86],[93,84],[101,86],[104,94],[108,102],[110,113],[108,123],[105,128],[88,128],[85,117],[83,106],[83,96]],coat);
 poly([[91,92],[98,92],[103,99],[106,108],[106,117],[101,124],[95,128],[91,124],[90,113],[88,105]],gold);
 poly([[103,99],[108,104],[112,113],[114,123],[111,128],[102,128],[105,121],[106,112]],shade);
 // A real foreleg descends vertically from the chest; the paw is near the
 // lower crop, rather than projected horizontally onto the keyboard.
 poly([[83,96],[87,98],[88,107],[87,117],[87,125],[90,127],[90,128],[80,128],[80,126],[82,124],[82,114]],'#a6a995');
 poly([[84,100],[86,103],[85,119],[84,125],[87,127],[81,127],[82,124],[83,112]],'#c1c0a9');
 line(82,126,82,127,'#8c8c7d');line(85,127,86,127,'#8c8c7d');
 // Folded thigh/hock gives the seated silhouette its weight.
 poly([[98,113],[105,111],[111,117],[112,124],[108,128],[94,128],[90,125],[92,121]],'#966942');
 poly([[98,115],[103,114],[108,119],[108,124],[105,127],[95,127],[94,124]],'#ac7a4d');
 line(94,124,98,126,'#805b3b');
 // Thick curled tail attaches low at the rump and overlaps the back.
 // Its irregular C silhouette and hidden root avoid the former flat donut.
 const wag=(f===4||f===5||f===14||f===15)?-1:0;
 ellipse(114,121,12,12,shade);
 ellipse(113,121,10,10,coat);
 ctx.save();ctx.translate(0,wag);
 poly([[108,125],[117,127],[124,124],[128,119],[128,110],[125,104],[121,101],[114,100],[109,102],[105,106],[104,111],[107,116],[112,117],[115,115],[114,112],[111,111],[112,108],[115,106],[119,108],[121,111],[121,116],[117,120],[109,121]],'#72553b');
 poly([[110,124],[117,125],[123,122],[126,118],[126,111],[123,106],[119,103],[114,103],[110,105],[107,108],[107,112],[109,114],[112,114],[112,112],[110,111],[111,107],[114,105],[118,105],[122,108],[123,112],[122,117],[118,121],[111,122]],'#ceb88b');
 poly([[109,107],[112,104],[117,103],[122,106],[125,111],[125,116],[122,121],[117,124],[111,123],[115,121],[119,118],[121,114],[120,110],[116,107],[112,108],[110,112],[108,111]],'#d5c79d');
 poly([[110,108],[113,106],[117,107],[119,110],[119,114],[116,116],[113,115],[111,112]],'#c9b283');
 poly([[115,105],[120,106],[123,109],[125,113],[124,117],[121,121],[117,122],[119,119],[121,115],[121,111],[118,109]],'#e0d1aa');
 poly([[109,122],[113,124],[116,124],[116,126],[111,125],[108,124]],'#b49a6d');
 ctx.restore();
 // Broad furred neck: same connected mass as the shoulders.
 poly([[84,79],[94,75],[102,80],[103,88],[102,94],[105,100],[101,103],[94,100],[90,97],[85,96],[82,91]],coat);
 poly([[91,87],[99,84],[102,88],[100,94],[103,98],[99,100],[91,96],[87,93]],shade);
 // Fur rolls at the nape are subtle colour steps, never a black collar.
 poly([[86,88],[91,91],[96,91],[100,89],[101,92],[96,95],[91,95],[86,92]],'#90663f');
 poly([[84,84],[88,88],[89,91],[86,94],[83,91],[81,87]],'#b9b99e');
 // Head is turned away toward the monitor; only a slim side of the face
 // and one small eye are visible. Compact ears sit on the same skull.
 ctx.save();ctx.translate(0,bob);
 // Far ear first, then forehead and the camera-side ear.
 poly([[93,74],[94,67],[96,64],[99,69],[100,74]],dark);
 poly([[95,72],[96,67],[98,70],[99,74]],gold);
 poly([[79,76],[82,72],[88,70],[94,70],[99,73],[102,77],[102,82],[100,87],[96,90],[89,90],[84,87],[81,85],[77,85],[74,82],[74,79]],coat);
 poly([[84,72],[88,70],[93,71],[97,74],[99,80],[98,85],[94,88],[89,86],[86,81]],gold);
 poly([[95,73],[100,76],[102,80],[101,85],[98,89],[94,90],[95,85],[96,79]],shade);
 // Near ear is a small forward-leaning triangle with a furred base.
 poly([[84,77],[83,71],[84,67],[87,69],[91,74],[90,78]],shade);
 poly([[85,75],[85,70],[87,71],[90,75],[89,78]],gold);
 poly([[85,71],[87,73],[88,75],[85,75]],'#716154');
 // Tapered muzzle projects from the skull, cream restricted to cheek/jaw.
 poly([[79,77],[80,78],[82,79],[84,80],[84,83],[87,84],[88,87],[85,87],[82,85],[78,84],[75,82],[75,80]],'#c1c0ab');
 poly([[76,78],[79,78],[81,80],[80,82],[76,82],[74,81]],'#d0cfb9');
 poly([[74,78],[76,78],[77,79],[76,81],[74,80]],'#242630');
 // The eye is tucked along the forward edge, not in the middle of a
 // human-like profile. Brief one-pixel blink follows the original rhythm.
 if(f===13)line(80,76,82,76,'#35342f');else {rect(81,75,2,1,'#302e2d');rect(81,76,1,1,'#48433c');}
 rect(81,73,2,1,'#cfad78');line(78,83,80,83,'#7b796b');
 rect(75,78,1,1,'#9daeb6');line(78,76,80,74,'#b7b5a3');
 ctx.restore();
}
function texture(){
 const img=ctx.getImageData(0,0,128,128),d=img.data;
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){
  const i=(y*128+x)*4,r=d[i],g=d[i+1],b=d[i+2];
  if(Math.max(r,g,b)<20||b>r*1.5)continue;
  const h=((x*1973+y*9277+1013)*26699)>>>0;
  const q=(h%11===0)?4:(h%7===0)?-3:0;
  if(q)for(let c=0;c<3;c++)d[i+c]=Math.max(0,Math.min(255,d[i+c]+q));
 }
 ctx.putImageData(img,0,0);
}
export function drawScene(context,time,canvasFactory){ctx=context;ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,128,128);background(time);desktop(time,canvasFactory);shiba(time);texture();}
