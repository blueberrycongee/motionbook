import {ribbonIntensity,paintDither} from "./left-surface.mjs";
export {ribbonIntensity};
import {sculptureDensity,sculptureIntensity} from "./right-surface.mjs";
export {sculptureIntensity};
/** Independent procedural reconstruction. No source artwork, video pixels or third-party model is used. */
export const W=1920,H=1440,PERIOD=17.7;
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const TAU=Math.PI*2,hash=(x,y)=>{let n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)};
const smooth=(a,b,x)=>{let q=clamp((x-a)/(b-a));return q*q*(3-2*q)};
function rounded(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke()}}
function txt(ctx,s,x,y,size,color,family='"Liberation Sans", Arial, sans-serif'){ctx.fillStyle=color;ctx.font=`${size}px ${family}`;ctx.textAlign='left';ctx.fillText(s,x,y)}
function icon(ctx,type,x,y,color){ctx.save();ctx.translate(x,y);ctx.strokeStyle=color;ctx.lineWidth=1.8;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();if(type==='copy'){ctx.rect(0,0,12,13);ctx.rect(6,6,12,13)}else if(type==='pin'){ctx.moveTo(8,20);ctx.bezierCurveTo(-7,8,0,0,8,0);ctx.bezierCurveTo(16,0,23,8,8,20);ctx.moveTo(11,7);ctx.arc(8,7,3,0,TAU)}else{for(let [a,b,s]of[[0,0,1],[15,0,-1],[0,15,1],[15,15,-1]]){let sy=b? -1:1;ctx.moveTo(a,b+5*sy);ctx.lineTo(a,b);ctx.lineTo(a+s*5,b);ctx.moveTo(a,b);ctx.lineTo(a+s*5,b+sy*5)}}ctx.stroke();ctx.restore()}
function avatar(ctx,x,y,i,green){ctx.save();ctx.beginPath();ctx.arc(x,y,17,0,TAU);ctx.clip();ctx.fillStyle=['#345147','#8c9790','#adab99'][i];ctx.fillRect(x-18,y-18,36,36);ctx.fillStyle=green?'#bcc5a1':['#ead6c4','#d4b6a5','#f3c1bb'][i];ctx.beginPath();ctx.ellipse(x+1,y-1,6,9,-.12,0,TAU);ctx.fill();ctx.beginPath();ctx.ellipse(x,y+18,13,13,0,0,TAU);ctx.fill();ctx.fillStyle=['#242727','#696459','#57484b'][i];ctx.beginPath();ctx.ellipse(x-1,y-7,7,7,-.2,Math.PI,TAU);ctx.fill();ctx.restore();ctx.strokeStyle=green?'#9cb89a':'#f0eef6';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,17,0,TAU);ctx.stroke()}
export function drawCardUI(ctx,x,kind,added=false){
 const green=kind===0,bg=green?'#375e3a':'#cdcee5',fg=green?'#f1f5e9':'#5e54cd',muted=green?'#b7cbb0':'#848494',sub=green?'#c0d0b9':'#5e54cd';
 ctx.fillStyle=bg;ctx.fillRect(x,894,800,444);
 txt(ctx,green?'Stock Card':'MY CARD',x+38,966,21,sub);
 rounded(ctx,x+610,931,164,54,14,'#fff','#e9e9e6');icon(ctx,'copy',x+629,951,'#282c2b');txt(ctx,added?'Added':'Add Card',x+668,967,21,'#1f2321');
 txt(ctx,green?'NYC Exchange':'Shanghai Stock Exchange',x+38,1060,42,fg,'"Liberation Serif", "Times New Roman", serif');
 const lines=green?["The NYC Exchange is the world's largest stock","exchange by market capitalization of its listed","companies."]:["The Shanghai Stock Exchange, one of the largest in the","world, plays a pivotal role in the investment landscape of","China."];
 lines.forEach((s,i)=>txt(ctx,s,x+38,1115+i*21,21,muted));
 icon(ctx,'pin',x+40,1228,green?'#aecaa9':'#6256d2');txt(ctx,green?'NYC, United States':'Shanghai, China',x+78,1245,21,sub);
 for(let i=2;i>=0;i--)avatar(ctx,x+52+i*24,1287,i,green);
 txt(ctx,green?'+30 more are watching':'+35 more are participating',x+130,1295,21,green?'#8fa986':'#9594a6');
 rounded(ctx,x+610,1259,164,54,7,green?'#448239':'#4e50ce');icon(ctx,'expand',x+638,1278,'#f1f1fc');txt(ctx,'Expand',x+675,1295,21,'#fff');
}
export function draw(ctx,t,width=W,height=H,options={}){
 ctx.save();ctx.scale(width/W,height/H);ctx.fillStyle='#404040';ctx.fillRect(0,0,W,H);
 for(let x of [120,1000]){ctx.fillStyle='#fff';ctx.fillRect(x,104,800,790)}
 // Measured folded surfaces with a fixed screen-space Bayer halftone.
 paintDither(ctx,t);
 ctx.save();ctx.beginPath();ctx.rect(1000,104,800,790);ctx.clip();ctx.textAlign='center';ctx.lineCap='round';ctx.lineJoin='round';
 for(let row=0;row<65;row++)for(let col=0;col<66;col++){
  const px=col*12.3+3,py=row*12.3+2,F=sculptureDensity(px/800,py/790,t),n=hash(col,row);
  if(F>.002){
   // Faint continuous surface under the glyphs is visible in the inspected source.
   const haze=clamp(F*.8+Math.max(F-.12,0)*2,0,.80),ink=clamp(F*5.0,0,1);
   ctx.fillStyle=`rgba(136,143,224,${haze})`;ctx.fillRect(1000+px-6.3,104+py-2,12.6,12.6);
   ctx.strokeStyle=`rgba(54,48,205,${ink})`;ctx.lineWidth=1.80;ctx.beginPath();if(n>.49){ctx.moveTo(1000+px-2.7,104+py+1.2);ctx.lineTo(1000+px+.7,104+py-.3);ctx.lineTo(1000+px+.7,104+py+11.6)}else{ctx.ellipse(1000+px,104+py+5.8,3.5,5.7,0,0,TAU)}ctx.stroke();
  }else if(n>.997){ctx.strokeStyle=`rgba(113,102,210,${.025+.045*Math.sin(t*TAU/3+n*6)**2})`;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(1000+px,104+py+5.8,3.3,5.5,0,0,TAU);ctx.stroke()}
 }
 ctx.restore();drawCardUI(ctx,120,0,options.added?.[0]);drawCardUI(ctx,1000,1,options.added?.[1]);ctx.restore();
}
