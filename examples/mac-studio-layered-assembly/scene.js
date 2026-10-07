/* Six perfectly registered original hardware layers. Canvas is shared by live and export. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./hardware.js'));else root.MotionScene=factory(root.MotionHardware);})(typeof globalThis!=='undefined'?globalThis:this,function(Hardware){
'use strict';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:0));
const map=(p,a,b)=>clamp((p-a)/(b-a));
function state(p){p=clamp(p);return {progress:p,layers:{fans:1,chip:map(p,0,1/6),connections:map(p,1/6,3/8),foot:map(p,3/8,7/12),caseXray:map(p,7/12,19/24),case:map(p,19/24,1)},dimensions:{labels:map(p,.65,1),first:map(p,.65,.85),second:map(p,.65,.85),third:map(p,.85,1)},phase:p<1/6?'cooling + logic board':p<3/8?'front I/O + antenna':p<7/12?'perforated base':p<19/24?'translucent enclosure':p<1?'closing the enclosure':'dimensions'};}
function rr(c,x,y,w,h,r=2){c.beginPath();c.roundRect(x,y,w,h,r);}
function fill(c,color,x,y,w,h,r=0){c.fillStyle=color;if(r){rr(c,x,y,w,h,r);c.fill();}else c.fillRect(x,y,w,h);}
function line(c,color,width,pts){c.strokeStyle=color;c.lineWidth=width;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();}
function bolt(c,x,y,r=2){let g=c.createRadialGradient(x-1,y-1,.1,x,y,r);g.addColorStop(0,'#b8bab6');g.addColorStop(.35,'#70736c');g.addColorStop(1,'#181d1b');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();line(c,'#343833',.7,[[x-r*.4,y],[x+r*.4,y]]);}
function metal(c,x,y,w,h,light='#a8a79b',dark='#444842'){const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,light);g.addColorStop(.2,dark);g.addColorStop(.65,'#76776d');g.addColorStop(1,'#303531');fill(c,g,x,y,w,h,1.5);}
function base(c){
 // The subtle outer silhouette is already in place in the first X-ray.
 c.save();c.globalAlpha=.23;Hardware.model(c,0);c.restore();
 const back=c.createLinearGradient(0,7,0,242);back.addColorStop(0,'#535653');back.addColorStop(.13,'#161b19');back.addColorStop(.65,'#252925');back.addColorStop(1,'#a0a398');fill(c,back,-255,10,510,232,9);
 // Structural rails, flange, and a real-looking inner chamber.
 fill(c,'#777a74',-263,14,9,225,3);fill(c,'#555953',254,14,9,225,3);metal(c,-255,14,510,7,'#9d9f98','#40463e');
 fill(c,'#0d1110',-239,131,478,102,4);
 for(let side of [-1,1]){const x=side<0?-239:12;const w=227;
  const fan=c.createLinearGradient(x,25,x,125);fan.addColorStop(0,'#0d1110');fan.addColorStop(.15,'#232724');fan.addColorStop(.48,'#111513');fan.addColorStop(1,'#060a08');fill(c,fan,x,25,w,103,8);
  line(c,'#3b403a',1,[[x+6,30],[x+w-7,30],[x+w-2,37]]);
  // Two dense banks of dark radial cooler fins seen edge-on.
  for(let j=0;j<47;j++){let xx=x+8+j*4.45;let v=37+Math.sin(j*.9)*9;fill(c,`rgb(${v},${v+4},${v+1})`,xx,37,1.5,31);fill(c,'#3b4039',xx,74,1.15,35);}
  fill(c,'#080c0a',x+5,68,w-10,5);line(c,'#32372f',1,[[x+9,111],[x+w-12,111]]);
  [x+4,x+w-5].forEach(xx=>{bolt(c,xx,33,1.6);bolt(c,xx,118,1.8);});
 }
 // Central bearing tower and inter-fan bridge.
 fill(c,'#171c18',-12,20,24,117,4);metal(c,-7,56,14,17,'#3e443c','#121711');fill(c,'#0c110e',-14,83,28,13,3);line(c,'#43483f',2,[[-64,119],[-25,121],[-12,105],[0,99],[12,108],[23,122],[69,121]]);
 // Main board edge, substrate laminate, and power delivery under the fan bank.
 metal(c,-253,147,506,4,'#d1c5a9','#514b3d');fill(c,'#3f453b',-248,152,496,4);fill(c,'#b2a48c',-246,156,492,2);fill(c,'#242b23',-240,159,480,7);
 for(let i=0;i<47;i++){const x=-232+i*10;fill(c,i%4?'#b4aa8d':'#434b3c',x,152,4,2);if(i%3===0)fill(c,'#979988',x,162,6,2);}
 for(let i=0;i<14;i++){const x=-228+i*35;fill(c,'#293029',x,179+(i%3)*4,18,15+(i%4)*4,1);fill(c,'#62675a',x+2,177+(i%3)*4,14,2);line(c,'#6b705d',.6,[[x+2,202],[x+2,208],[x+12,208],[x+12,212]]);}
 metal(c,-253,231,506,5,'#b1b4a8','#555d4e');[-231,-174,-92,30,146,231].forEach(x=>bolt(c,x,235,2));
 // Original patterned base silhouette in its initial, translucent state.
 c.save();c.globalAlpha=.6;foot(c);c.restore();
}
function chip(c){
 const board=c.createLinearGradient(0,167,0,229);board.addColorStop(0,'#1d2921');board.addColorStop(1,'#344034');fill(c,board,-153,172,314,51,3);
 // Copper traces are deterministic and remain registered during every fade.
 for(let i=0;i<27;i++){const x=-145+i*11;line(c,i%3?'#667158':'#9f9270',.6,[[x,177],[x+4,180],[x+4,187],[x+8,190],[x+8,214]]);}
 metal(c,-58,177,112,42,'#c0bdac','#77796c');fill(c,'#575f53',-48,183,92,30,2);fill(c,'#a3a897',-37,187,70,21,2);line(c,'#e2e0ca',.7,[[-33,189],[27,189],[31,193]]);
 [[-138,182],[-106,183],[69,184],[105,184]].forEach(([x,y])=>{fill(c,'#171d18',x,y,24,19,2);fill(c,'#4e5849',x+2,y+2,20,2);for(let k=0;k<5;k++){fill(c,'#9a9d86',x+2+k*4,y-2,1,2);fill(c,'#9a9d86',x+2+k*4,y+19,1,2);}});
 [-149,155].forEach(x=>bolt(c,x,216,2));
}
function connections(c){
 // Front connection daughterboard and antenna ring at the same camera origin.
 metal(c,-208,185,24,39,'#bfc0b4','#555b51');metal(c,-165,185,24,39,'#bfc0b4','#555b51');
 [-199,-156].forEach(x=>{fill(c,'#1a201c',x,191,7,22,3);fill(c,'#7c8476',x+1,194,1.3,15);});
 metal(c,-121,188,98,33,'#c7c6b9','#555b50');fill(c,'#222920',-114,200,79,7,2);fill(c,'#929781',-111,201,71,1);
 [[-206,218],[-144,219],[-115,215],[-29,215]].forEach(([x,y])=>bolt(c,x,y,1.5));
 c.strokeStyle='#b5a987';c.lineWidth=2.8;c.beginPath();c.ellipse(194,214,37,9,-.08,0,Math.PI*2);c.stroke();c.strokeStyle='#4c5645';c.lineWidth=1;c.stroke();
 metal(c,157,219,77,6,'#c2b399','#696452');fill(c,'#393f33',182,194,22,19,2);bolt(c,193,198,3);line(c,'#9b987c',1,[[193,195],[179,176],[136,175],[135,163]]);
}
function foot(c){
 const g=c.createLinearGradient(0,239,0,268);g.addColorStop(0,'#747972');g.addColorStop(.35,'#aeb2a9');g.addColorStop(1,'#414940');c.beginPath();c.moveTo(-253,240);c.lineTo(253,240);c.lineTo(226,265);c.lineTo(-225,265);c.closePath();c.fillStyle=g;c.fill();
 c.save();c.clip();for(let row=0;row<9;row++){for(let col=0;col<110;col++){let x=-250+col*4.6+row%2*2.3,y=242+row*2.45;c.fillStyle='#252d24';c.beginPath();c.ellipse(x,y,1.25,.68,0,0,Math.PI*2);c.fill();}}c.restore();line(c,'#b7bab2',.7,[[-225,265],[225,265]]);
}
function ghost(c){
 c.save();c.globalAlpha*=.45;Hardware.model(c,0);c.restore();
 // Shell interior stiffening tabs fade in together, with no displacement.
 for(let x of [-172,-49,91,189]){metal(c,x,73,17,7,'#a3a79e','#686e62');line(c,'#60695c',1,[[x+8,67],[x+8,78]]);bolt(c,x+8,75,1.5);}
}
function dimension(c,s){const d=s.dimensions;const top=-23,left=-280,right=280,bottom=268,offset=15;c.strokeStyle='#a5a7a8';c.lineWidth=.8;
 function seg(x1,y1,x2,y2,t){if(t<=0)return;c.beginPath();c.moveTo(x1,y1);c.lineTo(x1+(x2-x1)*t,y1+(y2-y1)*t);c.stroke();}
 seg(left,top+10,left,top,d.first);seg(left,top,right,top,d.second);seg(right,top,right,top+10,d.third);
 seg(right+4,0,right+offset,0,d.first);seg(right+offset,0,right+offset,bottom,d.second);seg(right+offset,bottom,right+4,bottom,d.third);
 c.save();c.globalAlpha=d.labels;c.fillStyle='#505255';c.font='600 15px Arial, Helvetica, "DejaVu Sans", sans-serif';c.fillText('200 mm',left,top-9);c.font='600 12px Arial, Helvetica, "DejaVu Sans", sans-serif';c.fillText('96 mm',right+offset+8,bottom-1);c.restore();
}
function render(c,w,h,p,options={}){const s=state(p);c.clearRect(0,0,w,h);c.fillStyle=options.background||'#fafafa';c.fillRect(0,0,w,h);const mobile=w<600;const k=Math.min(w/(mobile?720:664),h/(mobile?610:430));const x=w/2-15*k,y=(h-40-268*k)/2+6*k;
 c.save();c.translate(x,y);c.scale(k,k);base(c);
 function layer(opacity,fn){if(opacity<=0)return;c.save();c.globalAlpha=opacity;fn(c);c.restore();}
 layer(s.layers.chip,chip);layer(s.layers.connections,connections);layer(s.layers.foot,foot);layer(s.layers.caseXray,ghost);layer(s.layers.case,c=>Hardware.model(c,0));dimension(c,s);c.restore();return s;
}
return {render,state,duration:7,meta:{id:'02-assembly',layers:6,originalArtwork:true,sourceMechanism:'registered layer crossfades with three-segment measurement lines'}};
});
