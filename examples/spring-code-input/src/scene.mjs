import {clamp,mix,smooth} from './timeline.mjs';
const C={bg:[246,244,240],tile:[236,235,228],red:[250,227,228],ink:[25,26,19],error:[193,44,74],green:[36,188,78]};
const rgb=c=>`rgb(${c.map(Math.round).join(',')})`,blend=(a,b,p)=>a.map((v,i)=>mix(v,b[i],p));
export function rounded(g,x,y,w,h,rs){const [tl,tr,br,bl]=(Array.isArray(rs)?rs:[rs,rs,rs,rs]).map(r=>Math.min(r,w/2,h/2)),k=.55228475;g.beginPath();g.moveTo(x+tl,y);g.lineTo(x+w-tr,y);g.bezierCurveTo(x+w-tr*(1-k),y,x+w,y+tr*(1-k),x+w,y+tr);g.lineTo(x+w,y+h-br);g.bezierCurveTo(x+w,y+h-br*(1-k),x+w-br*(1-k),y+h,x+w-br,y+h);g.lineTo(x+bl,y+h);g.bezierCurveTo(x+bl*(1-k),y+h,x,y+h-bl*(1-k),x,y+h-bl);g.lineTo(x,y+tl);g.bezierCurveTo(x,y+tl*(1-k),x+tl*(1-k),y,x+tl,y);g.closePath();}
const blur=v=>v>.001?`blur(${v.toFixed(3)}px)`:'none';
function capsule(g,x,y,w,h){rounded(g,x,y,w,h,h/2);}
function lock(g,x,y){g.save();g.translate(x+7,y);g.scale(.9,.8);g.lineWidth=4.3;g.lineJoin='round';g.lineCap='round';rounded(g,-14,-1,28,20,5);g.stroke();g.beginPath();g.moveTo(-8,-1);g.lineTo(-8,-9);g.bezierCurveTo(-8,-22,8,-22,8,-9);g.lineTo(8,-1);g.stroke();g.restore();}
function check(g,x,y){g.lineWidth=3.5;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(x-13,y+0);g.lineTo(x-4,y+9);g.lineTo(x+15,y-11);g.stroke();}
function spinner(g,x,y,t){g.save();g.translate(x,y);g.lineWidth=3.6;g.strokeStyle='#a5a69d';g.beginPath();g.arc(0,0,15,0,Math.PI*2);g.stroke();g.rotate((t-3.1)*Math.PI*2/.85+Math.PI*.45);g.strokeStyle='#191a13';g.lineCap='round';g.beginPath();g.arc(0,0,15,0,Math.PI*.45);g.stroke();g.restore();}
function pointer(g,p,t){if(!p)return;let[x,y,w,h]=p;g.save();g.translate(x,y);g.shadowColor='#0004';g.shadowBlur=3;g.shadowOffsetY=2;g.lineJoin='round';g.lineCap='round';
 if(t>=.033333&&t<.316667){g.scale(w/29,h/38);g.beginPath();g.moveTo(9,22);g.lineTo(9,4);g.bezierCurveTo(9,-1,16,-1,16,4);g.lineTo(16,15);g.bezierCurveTo(16,10,22,11,22,16);g.lineTo(22,17);g.bezierCurveTo(22,13,27,14,27,19);g.bezierCurveTo(31,16,31,25,29,30);g.bezierCurveTo(28,36,22,39,15,38);g.bezierCurveTo(8,38,4,32,2,25);g.lineTo(0,19);g.bezierCurveTo(-1,15,4,14,6,18);g.closePath();g.strokeStyle='#fff';g.lineWidth=4;g.stroke();g.shadowBlur=0;g.strokeStyle='#111';g.lineWidth=1.8;g.fillStyle='#fff';g.fill();g.stroke();}
 else if(t>=.316667&&t<.416667){g.scale(w/10,h/32);g.beginPath();g.moveTo(0,0);g.bezierCurveTo(3,0,5,2,5,5);g.bezierCurveTo(5,2,7,0,10,0);g.moveTo(5,5);g.lineTo(5,27);g.moveTo(0,32);g.bezierCurveTo(3,32,5,30,5,27);g.bezierCurveTo(5,30,7,32,10,32);g.strokeStyle='#fff';g.lineWidth=4;g.stroke();g.shadowBlur=0;g.strokeStyle='#111';g.lineWidth=1.6;g.stroke();}
 else{g.scale(w/18,h/29);g.beginPath();g.moveTo(0,0);g.lineTo(0,22);g.lineTo(5.5,18);g.lineTo(10,29);g.lineTo(14,27);g.lineTo(9,17);g.lineTo(18,17);g.closePath();g.strokeStyle='#fff';g.lineWidth=2.5;g.stroke();g.shadowBlur=0;g.fillStyle='#080909';g.fill();}g.restore();}
export function drawScene(g,s,{width=1494,height=1018,cursor=true}={}){
 g.save();g.clearRect(0,0,width,height);g.fillStyle=rgb(C.bg);g.fillRect(0,0,width,height);const scale=Math.min(width/1494,height/1018);g.translate((width-1494*scale)/2,(height-1018*scale)/2);g.scale(scale,scale);
 const {cx,cy}=s,w=s.width,h=146,x=cx-w/2,y=cy-h/2;
 g.save();g.shadowColor='rgba(111,105,91,.31)';g.shadowBlur=37;g.shadowOffsetY=27;g.fillStyle='#fff';capsule(g,x,y,w,h);g.fill();g.restore();
 g.save();g.shadowColor='rgba(102,99,89,.26)';g.shadowBlur=3;g.shadowOffsetY=2;capsule(g,x,y,w,h);g.fillStyle='#fff';g.fill();g.strokeStyle='#dfded9';g.lineWidth=2;g.stroke();g.restore();
 // Clip the independent drawing to the shell. No source raster is used.
 g.save();capsule(g,x+2,y+2,w-4,h-4);g.clip();
 if(s.slots>0){g.save();g.globalAlpha=s.slots;g.filter=blur(s.slotBlur||0);const inner=w-28,pitch=inner/6,gap=16;
  if(s.cellBlur&&!s.collapse)g.filter='none';
  if(s.entryTiles){g.fillStyle=rgb(C.tile);for(let j=0;j<s.entryTiles.length;j++){const[bx,by,bw,bh]=s.entryTiles[j];g.save();if(j===0&&s.entryTiles.length>=5&&s.t<.54){g.globalAlpha*=clamp((s.t-.475)/.065);g.filter=blur(8*(1-clamp((s.t-.475)/.065)));}rounded(g,bx,by,bw,bh,32);g.fill();g.restore();}}
  for(const i of (s.entryTiles?[]:s.collapse?[0,5,1,4,2,3]:[0,1,2,3,4,5])){g.globalAlpha=s.slots*(s.tileAlpha??1)*(s.cellAlpha?.[i]??1);const box=s.boxes?.[i];let bx=box?box[0]:cx+(i-2.5)*pitch-(pitch-gap)/2;let bw=box?box[1]-box[0]:pitch-gap;
   if(s.collapse){const v=i-2.5;bx=cx+v*122-Math.sign(v)*Math.max(0,Math.abs(v)-.5)*(744-w)/4-Math.sign(v)*(s.clusterInset??Math.min(16,(744-w)/40))-53;bw=106;g.filter=blur(s.cellBlur?.[i]??0);}
   if(s.cellCenters){bx=s.cellCenters[i]-53;bw=106;}
   if(s.cellBlur)g.filter=blur(s.cellBlur[i]);
   const rs=[i===0?58:32,i===5?58:32,i===5?58:32,i===0?58:32];g.fillStyle=rgb(blend(C.tile,C.red,s.error));rounded(g,bx,438,bw,116,rs);g.fill();
   const d=s.digits[i];if(d?.alpha){g.save();g.globalAlpha=s.slots*d.alpha*(s.cellAlpha?.[i]??1)*(s.contentAlpha??1);g.filter=blur(Math.max(s.slotBlur||0,d.blur||0,s.cellBlur?.[i]??0));g.fillStyle=rgb(blend(C.ink,C.error,s.error));g.font='bold 50px StudySans';g.textAlign='center';g.textBaseline='alphabetic';g.fillText(d.char,bx+bw/2,514+d.dy);g.restore();}
  }g.restore();
 }
 if(s.ring&&s.ringAlpha){let[rx,ry,rw,rh]=s.ring;rx+=cx-733;let progress=clamp((rx-376)/610);const rleft=s.ringCorners?.[0]??mix(56,31,clamp(progress*8)),rright=s.ringCorners?.[1]??mix(31,56,clamp((progress-.88)*8.4));
  g.save();g.globalAlpha=s.ringAlpha;g.filter=blur(s.ringBlur||0);g.strokeStyle=rgb(C.ink);g.lineWidth=4.6;rounded(g,rx+2.3,ry+2.3,rw-4.6,rh-4.6,[rleft,rright,rright,rleft]);g.stroke();if(s.caret){g.beginPath();g.lineWidth=3.2;g.lineCap='round';g.moveTo(rx+rw/2,474);g.lineTo(rx+rw/2,518);g.stroke();}g.restore();
 }
 if(s.labelAlpha){g.save();g.globalAlpha=s.labelAlpha;g.filter=blur(s.labelBlur||0);g.translate(cx,cy);g.scale(s.labelScale||1,s.labelScale||1);const inset=Math.max(2,s.inset||14),iw=w-(s.insetX??inset)*2,ih=h-inset*2;g.fillStyle=rgb(blend(C.tile,C.green,s.green||0));capsule(g,-iw/2,-ih/2,iw,ih);g.fill();
  if(s.shine>0&&s.shine<1){g.save();capsule(g,-iw/2,-ih/2,iw,ih);g.clip();const sx=mix(-iw/2-40,iw/2+40,s.shine);const grad=g.createLinearGradient(sx-45,0,sx+45,26);grad.addColorStop(0,'#fff0');grad.addColorStop(.5,'#ffffff75');grad.addColorStop(1,'#fff0');g.fillStyle=grad;g.fillRect(-iw/2,-ih/2,iw,ih);g.restore();}
  const enter=s.label==='Enter code',verified=s.label==='Verified';g.font='bold 39px StudySans';g.textBaseline='alphabetic';g.textAlign='left';const tw=g.measureText(s.label).width,all=tw+64,tx=-all/2+64,ix=-all/2+16;g.fillStyle=rgb(blend(C.ink,[255,255,255],s.green||0));g.strokeStyle=g.fillStyle;if(s.revealAge!=null){for(let i=0;i<s.label.length;i++){const p=clamp((s.revealAge-i*.007)/.095);g.save();g.globalAlpha=smooth(p);g.filter=blur(14*(1-p));g.fillText(s.label[i],tx+g.measureText(s.label.slice(0,i)).width,14);g.restore();}g.globalAlpha=smooth((s.revealAge+.02)/.10);}
  else if(s.verifyMorph!=null&&(s.verifyMorph<1||s.suffixIn<1)){g.fillText('Verif',tx,14);const prefix=g.measureText('Verif').width;g.save();g.globalAlpha*=1-s.verifyMorph;g.filter=blur(16*s.verifyMorph);g.fillText('ying',tx+prefix,14);g.restore();g.save();g.globalAlpha*=s.suffixIn;g.filter=blur(6*(1-s.suffixIn));g.fillText('ied',tx+prefix,14);g.restore();}else g.fillText(s.label,tx+(enter?4:0),14);if(enter)lock(g,ix,0);else if(verified)check(g,ix,0);else spinner(g,ix,0,s.t);g.restore();
 }g.restore();if(cursor){g.globalAlpha=s.pointerAlpha??1;pointer(g,s.pointer,s.t);}g.restore();
}
