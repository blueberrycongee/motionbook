import {WIDTH,HEIGHT,poseAt,clamp,mix,smooth,outCubic} from './motion.mjs';
export const COLORS=Object.freeze({blue:'#0C9BE8',ink:'#090E19',eyes:'#EDDBEF',paper:'#D4C4E0',lime:'#B8DB7A',mint:'#96D4B5',purple:'#8F76DC',pink:'#C888C5',muted:'#85768D'});
const {blue,ink,eyes,paper,lime,mint,purple,pink,muted}=COLORS;
const TAU=Math.PI*2;
let Path;
export function configureRenderer(Path2DClass){Path=Path2DClass;}
const paths=new Map();
function path(d){if(!paths.has(d))paths.set(d,new Path(d));return paths.get(d);}
function shape(c,d,fill=ink,stroke=null,width=1){c.fillStyle=fill;if(fill)c.fill(path(d));if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke(path(d));}}
function line(c,d,color=ink,width=1.4){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke(path(d));}
function ellipse(c,x,y,rx,ry,fill=ink,angle=0){c.beginPath();c.ellipse(x,y,rx,ry,angle,0,TAU);c.fillStyle=fill;c.fill();}
function text(c,value,x,y,size=14,color=ink,bold=false){c.fillStyle=color;c.font=`${bold?'700':'400'} ${size}px "Study Sans", "Study CJK", sans-serif`;c.fillText(value,x,y);}
function roundRect(c,x,y,w,h,r,color){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();}

export function drawMenu(c,{pressed=-1}={}) {
 c.fillStyle=paper;c.fillRect(0,0,WIDTH,HEIGHT);
 text(c,'Sketcha',20,255,31,ink,true);
 text(c,'历史',244,238,19,muted);text(c,'作品',244,261,19,muted);
 c.save();c.translate(286,231); c.rotate(-.08);roundRect(c,0,0,19,16,2,muted);c.restore();
 roundRect(c,290,237,21,15,2,paper);roundRect(c,291,238,20,15,2,muted);
 shape(c,'M 294 250 L 299 244 L 303 248 L 306 245 L 310 251 Z',paper);ellipse(c,305,241.5,1.5,1.5,paper);
 c.save();c.translate(347,243);
 const gear=[];for(let n=0;n<24;n++){let a=n/24*TAU, r=n%3===1?10:8;gear.push([Math.cos(a)*r,Math.sin(a)*r]);}
 line(c,`M ${gear.map(p=>p.join(' ')).join(' L ')} Z`,muted,1.35);c.beginPath();c.arc(0,0,3,0,TAU);c.stroke();c.restore();
 const cards=[
  {y:305,color:lime,title:'Take a photo',desc:'直接拍下此刻灵感然后开始涂鸦',icon:camera},
  {y:431,color:mint,title:'导入',desc:'导入相册中的素材开始涂鸦',icon:flower},
  {y:557,color:purple,title:'撒点成画',desc:'使用随机点阵作为灵感开始涂鸦',icon:dottedCat},
  {y:680,color:pink,title:'随机形状',desc:'使用随机形状作为灵感开始涂鸦',icon:fish},
 ];
 cards.forEach((card,i)=>{c.save();if(pressed===i){c.translate(195,card.y+56);c.scale(.983,.983);c.translate(-195,-card.y-56);}roundRect(c,23,card.y,344,112,21,card.color);text(c,card.title,39,card.y+73,18);text(c,card.desc,39,card.y+93,11.2);c.save();c.translate(306,card.y+58);card.icon(c);c.restore();c.restore();});
 // In the filmed endpoint two tiny paws remain at the lower screen edge.
 ellipse(c,167,846.8,5.2,5.8);ellipse(c,179,846.9,5,6.1);
}

function camera(c){
 shape(c,'M -25 -34 Q -18 -37 29 -36 Q 40 -33 41 -22 L 40 4 Q 39 15 32 17 L -23 17 Q -32 16 -33 6 L -34 -20 Q -34 -30 -25 -34 Z',ink);
 shape(c,'M -25 -35 Q -2 -37 29 -35 Q 33 -31 33 -21 L 31 2 Q 31 12 25 12 L -22 12 Q -33 12 -33 1 L -32 -21 Q -31 -32 -25 -35 Z',lime,ink,2);
 line(c,'M -15 15 L -25 35 Q -18 39 -10 39 L -1 17 M 2 17 L 11 42 L 21 41 L 7 16',ink,2.2);
 c.beginPath();c.ellipse(0,-13,16,15.5,-.12,0,TAU);c.lineWidth=2;c.strokeStyle=ink;c.stroke();ellipse(c,0,-13,11,11.2);
 line(c,'M -26 -29 L -20 -29 M -26 -25 L -23 -25',ink,1.4);
 shape(c,'M 14 4 L 17 9 L 19 4 Z M 20 4 L 23 9 L 25 4 Z M 26 4 L 28 9 L 30 4 Z',ink);
}
function flower(c){
 c.save();c.scale(.80,.80);c.rotate(-.08);
 const petals=[[-3,-33,-.09],[18,-25,.66],[31,-5,1.3],[24,19,2.15],[5,28,3.0],[-19,22,3.78],[-30,2,4.6],[-25,-20,5.35]];
 for(const [x,y,a]of petals){c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.ellipse(0,0,10.7,20.6,0,0,TAU);c.fillStyle=mint;c.fill();c.strokeStyle=ink;c.lineWidth=2.6;c.stroke();c.restore();}
 c.beginPath();c.ellipse(-1,1,13.1,13.8,.3,0,TAU);c.fillStyle=mint;c.fill();c.strokeStyle=ink;c.lineWidth=2.5;c.stroke();c.restore();
}
function dottedCat(c){
 line(c,'M -33 -12 L -16 -25 L -5 -7 L 7 -7 L 21 -25 L 34 -5 C 41 -1 44 7 36 12 C 23 21 -12 20 -28 15 C -41 11 -42 -4 -33 -12 Z',ink,1.35);
 for(const [x,y,r]of [[-33,-34,1.2],[-2,-34,1.1],[-9,-24,1],[-17,5,1.2],[-2,11,1.1],[5,6,1.15],[23,2,1.2],[2,33,1],[-28,37,1.1]])ellipse(c,x,y,r,r);
}
function fish(c){
 const fishInk='#332347';
 shape(c,'M -2 -21 C 8 -43 31 -43 25 -25 C 22 -14 9 -12 15 -6 C 20 2 35 -16 36 -5 L 34 8 L 41 14 C 30 21 20 28 6 18 C -3 12 -4 1 -8 -8 Z','#8070E8',fishInk,1);
 line(c,'M 4 -24 C 10 -29 15 -29 21 -30 M 7 -29 Q 15 -34 22 -32 M 1 -18 C 8 -20 12 -25 17 -24 M 8 -16 C 8 -28 7 -31 4 -32 M 7 -18 Q 9 -14 8 -10 M 13 8 Q 25 20 35 10 M 13 11 Q 24 25 37 14 M 19 18 L 20 21 M 23 20 L 24 23 M 28 19 L 29 22',fishInk,.7);
 shape(c,'M -38 -11 Q -27 -17 -21 -22 C -14 -28 0 -26 5 -17 C 10 -9 7 11 -3 22 L -10 29 L -15 22 Q -15 36 -30 45 C -36 39 -30 27 -18 12 C -10 3 -8 -7 -17 -8 Q -31 -6 -38 -11 Z','#DD789B',fishInk,.9);
 ellipse(c,-26,-15,1.1,1.1,fishInk);line(c,'M -35 -11 Q -31 -12 -29 -10 M -18 -18 Q -12 -7 -17 5 M -26 35 Q -25 29 -17 20 M -29 37 Q -28 30 -19 21 M -11 13 L -12 22',fishInk,.65);
 for(let i=0;i<4;i++)for(let j=0;j<4-i/2;j++){let x=-12+i*4.3,y=-17+j*6+i*1.2;line(c,`M ${x} ${y} q 3 3 .2 4`,fishInk,.65);}
}

function hint(c,opacity){if(opacity<=0)return;c.save();c.globalAlpha=opacity;line(c,'M 347 584 C 333 582 321 591 313 603 M 311 594 L 313 604 L 324 601',ink,1.3);c.save();c.translate(359,591);c.rotate(-.13);text(c,'戳',0,0,14,ink,true);c.restore();c.restore();}

const BACK_PROFILE = [
 [174,657,165,642,170,622], [173,616,176,612,178,609],
 [179,598,179,586,180,579], [180,574,181,575,184,578],
 [189,583,194,588,199,592], [206,590,214,588,220,589],
 [222,582,224,574,226,568], [228,564,229,567,231,572],
 [235,580,238,587,241,593], [252,599,265,608,267,622],
 [271,642,258,658,253,660], [256,686,260,700,265,708],
 [270,721,279,733,284,750], [294,776,282,798,253,807],
 [226,816,195,812,179,792], [163,773,166,748,175,725],
 [183,702,190,675,186,660],
];
const GLANCE_PROFILE = [
 [174,657,166,644,168,625], [169,616,172,611,175,608],
 [174,594,180,576,185,566], [185,563,187,563,189,568],
 [193,575,196,585,199,594], [201,593,203,592,205,592],
 [205,581,206,567,207,561], [208,557,210,559,213,563],
 [221,569,229,581,233,590], [249,596,260,611,264,622],
 [269,636,260,649,253,654], [254,671,256,696,260,705],
 [268,722,280,738,284,752], [291,775,281,792,257,804],
 [232,817,197,814,179,794], [163,777,165,752,173,726],
 [181,703,189,680,186,660],
];
/** One connected contour rotates through the turn; no separately scaled head. */
export function backSilhouette(look) {
 const a=clamp(look);
 return 'M 186 660 '+BACK_PROFILE.map((seg,i)=>'C '+seg.map((v,j)=>mix(v,GLANCE_PROFILE[i][j],a).toFixed(3)).join(' ')).join(' ')+' Z';
}
function backCat(c,p){
 c.save();c.translate(225,810);c.scale(p.sx,p.sy);c.translate(-225,-810);
 c.save();c.translate(205,804);c.rotate(p.tail*.003);c.translate(-205,-804);
 shape(c,'M 218 804 C 192 824 158 836 132 820 C 114 810 116 790 126 773 C 133 761 143 757 148 764 C 154 772 145 778 143 783 C 132 805 150 813 166 812 C 184 812 198 806 205 799 Z');c.restore();
 const look=p.look,outline=backSilhouette(look);
 shape(c,outline);
 // Perspective brings the ears together and turns the cheeks and neck together.
 // The three near-side whiskers shorten as they rotate; the far set disappears.
 const w=(a,b)=>mix(a,b,look).toFixed(3);
 line(c,`M ${w(174,176)} ${w(613,612)} L ${w(157,160)} ${w(611,609)} M ${w(172,169)} ${w(625,628)} L ${w(155,157)} ${w(630,628)} M ${w(174,170)} ${w(638,642)} L ${w(151,158)} ${w(648,647)}`,ink,1.7);
 c.save();c.globalAlpha=1-look;
 line(c,'M 248 595 L 270 588 M 261 610 L 276 607 M 266 624 L 281 628',ink,1.7);c.restore();
 c.save();c.clip(path(outline));
 if(look>.002){
  c.globalAlpha=smooth(clamp(look*2));
  const radius=smooth(look);
  ellipse(c,mix(256,235,look),mix(603,612,look),14*radius,15*radius,eyes,-.06);
  ellipse(c,mix(269,264,look),mix(606,614,look),8.5*radius,11*radius,eyes,-.20);
  ellipse(c,mix(255,231,look),mix(600,605,look),3.35*radius,3.4*radius,ink);
  // A tiny blush-pink nose visible between the near eye and clipped far eye.
  c.globalAlpha=smooth(clamp((look-.45)/.5));
  shape(c,'M 249.4 607.8 Q 252.2 609.6 254.1 609.3 L 252.0 616.0 Z','#D996AF');
 } else shape(c,'M 240 592 Q 245 600 255 602 Q 250 598 248 596 Z',eyes);
 c.restore();c.restore();
}

function paw(c,x,y,a=0){
 c.save();c.translate(x,y);c.rotate(a);
 shape(c,'M -6 5 C -15 5 -17 -2 -11 -5 C -17 -13 -10 -18 -6 -12 C -5 -23 2 -22 3 -12 C 8 -23 14 -17 10 -9 C 22 -12 22 -4 13 0 C 12 8 5 10 -1 7 Z');c.restore();
}
function frontCat(c,p){
 // Main body bottom is y=811 at the unshifted reference position.
 const y=p.y+19;
 c.save();c.translate(0,y);
 const spread=smooth(p.front);
 // Tail has one hooked curl, with a rounded tip.
 c.save();c.translate(242,806);c.rotate(Math.sin((p.scratch*1.2+p.tear)*2)*.03);c.translate(-242,-806);
 shape(c,'M 240 802 C 257 810 273 832 278 852 C 286 881 266 903 241 899 C 222 897 215 889 221 881 C 228 873 234 884 249 879 C 268 873 266 852 257 836 C 251 824 244 818 234 811 Z');c.restore();
 // Four long limbs, each ending with an individually drawn paw.
 line(c,`M 190 625 Q 181 607 175 549`,ink,12.6);
 line(c,`M 242 626 Q 248 603 254 550`,ink,13.4);
 line(c,`M 180 766 Q 154 740 139 712`,ink,13.2);
 line(c,`M 266 764 Q 292 738 319 716`,ink,13.2);
 paw(c,174,544,-.12);paw(c,255,544,.05);paw(c,138,711,-.45);paw(c,320,716,.65);
 shape(c,'M 188 646 C 192 678 189 705 178 735 C 167 758 164 781 179 798 C 197 821 235 825 259 811 C 287 797 290 774 277 748 C 258 715 251 686 248 648 Z');
 shape(c,'M 169 643 C 165 632 168 618 177 610 C 193 596 219 592 241 603 C 257 611 266 626 267 644 L 273 677 Q 274 681 269 678 L 250 668 C 231 683 199 680 187 670 L 165 682 Q 160 684 162 678 Z');
 line(c,'M 173 626 L 154 624 M 173 637 L 151 643 M 172 649 L 153 660 M 255 615 L 274 602 M 265 628 L 281 625 M 267 640 L 281 643',ink,1.8);
 const blink=(p.phase==='impact'&&p.y<-320)? .76:1;
 ellipse(c,201,623,13.4,15.2*blink,eyes,-.13);ellipse(c,234,617,13.6,15.2*blink,eyes,-.12);
 ellipse(c,199,615,3.2,3.4*blink);ellipse(c,232,609,3.2,3.5*blink);
 c.restore();
}

function scratches(c,p){
 if(p.scratch<=0||p.tear>=.82)return;
 const shift=p.y+19;const endShift=Math.min(shift,-191.7);
 const sets=[{x:174,y:535,offset:[-5,4,-13,-1],length:[111,135,125,118]}, {x:254,y:535,offset:[-3,-6,7,-2],length:[125,124,117,127]}, {x:138,y:703,offset:[-3,1,6,10],length:[131,130,121,98]}, {x:318,y:706,offset:[5,0,5,15],length:[116,130,138,102]}];
 c.save();c.globalAlpha=1-outCubic(clamp(p.tear/.6));
 for(const set of sets){for(let i=0;i<4;i++){
  const x=set.x-12+i*7+(set.x<200?-1:1)*p.scratch*2;
  const end=set.y+endShift+set.offset[i];const len=set.length[i]*p.scratch;
  line(c,`M ${x-5} ${end-len} Q ${x-2.5} ${end-len*.45} ${x} ${end}`,ink,1.45+(i%2)*.25);

 }
 // Pale puckered edges immediately above each paw.
 c.save();c.globalAlpha*=.2;line(c,`M ${set.x-17} ${set.y+endShift+4} q 5 -12 10 -8 q 5 -15 11 -1 q 8 -8 12 1`,'#75BBE5',1.5);c.restore();
 }
 c.restore();
}

function cyanLayer(c,p){
 if(p.tear<=0){c.fillStyle=blue;c.fillRect(0,0,WIDTH,HEIGHT);return;}
 const e=outCubic(clamp((p.tear-.06)/.75)),drop=1010*e,center=218;
 const top=20+drop*.58,tipY=350+drop;
 const leftBlue=124-420*e,leftInner=162-340*e,rightInner=246+360*e,rightBlue=302+420*e;
 // Two cyan panels meet at the descending tear point. The menu never moves.
 shape(c,`M -180 ${top+37} Q 20 ${top+30} ${leftBlue-6} ${top-4} Q ${leftBlue} ${top-9} ${leftBlue+3} ${top+3} C ${leftBlue+8} ${top+180} ${center-55} ${tipY-93} ${center} ${tipY} L ${center} 1100 L -180 1100 Z`,blue);
 shape(c,`M 570 ${top+10} Q 390 ${top+2} ${rightBlue+3} ${top-27} Q ${rightBlue-2} ${top-32} ${rightBlue-7} ${top-12} C ${rightBlue-23} ${top+124} ${center+42} ${tipY-85} ${center} ${tipY} L ${center} 1100 L 570 1100 Z`,blue);
 // Broad pale-blue folded backs, with the small curl at the upper right.
 shape(c,`M ${leftBlue-1} ${top-5} L ${leftInner} ${top-8} C ${leftInner+3} ${top+121} ${center-18} ${tipY-43} ${center} ${tipY} C ${center-55} ${tipY-94} ${leftBlue+8} ${top+170} ${leftBlue-1} ${top-5} Z`,'#87ACE0');
 shape(c,`M ${rightInner} ${top-12} L ${rightBlue+10} ${top-28} C ${rightBlue-2} ${top+62} ${center+28} ${tipY-49} ${center} ${tipY} C ${center+13} ${tipY-68} ${rightInner-10} ${top+152} ${rightInner} ${top-12} Z`,'#8AB7E5');
 shape(c,`M ${rightBlue-21} ${top-9} Q ${rightBlue-29} ${top-21} ${rightBlue+1} ${top-33} Q ${rightBlue+14} ${top-34} ${rightBlue+18} ${top-22} Q ${rightBlue-9} ${top-21} ${rightBlue-21} ${top-9} Z`,'#179BDA');
 line(c,`M ${rightBlue+9} ${top-24} Q ${rightBlue-19} ${top-1} ${rightBlue+42} ${top+4}`,'#85C0E9',2);

}

export function drawScene(c,t,{idleTime=0,pressed=-1}={}){
 if(!Path)throw new Error('Call configureRenderer(Path2D) before drawing.');
 const p=poseAt(t,idleTime);
 c.save();c.clearRect(0,0,WIDTH,HEIGHT);c.lineCap='round';c.lineJoin='round';
 drawMenu(c,{pressed});
 if(!p.done){
  cyanLayer(c,p);hint(c,p.hint);
  if(p.front<.01){c.save();c.translate(0,p.y);backCat(c,p);c.restore();}
  else {
   scratches(c,p);
   if(p.front<1){
    c.save();c.globalAlpha=1-p.front;c.translate(225,780+p.y);c.scale(1,1-p.front*.3);c.translate(-225,-780);backCat(c,p);c.restore();
    c.save();c.globalAlpha=p.front;c.translate(225,780+p.y);c.scale(.93+ .07*p.front,.72+.28*p.front);c.translate(-225,-780-p.y);frontCat(c,p);c.restore();
   }else {
    if(p.tear>0){c.save();c.globalAlpha=.20;c.translate(4,9);frontCat(c,p);c.restore();}
    frontCat(c,p);
   }
  }
 }
 c.restore();return p;
}
