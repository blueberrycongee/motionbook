import {columnState} from './geometry.mjs';
export const ASSET_NAMES=['poster-light.png','sphere-cobalt.jpg','poster-number.png','portrait-red.jpg','poster-type.png','sculpture-chrome.jpg','poster-interval.png','portrait-crimson.jpg','poster-space.png','portrait-cobalt.jpg'];
export function makeTextures(images,createCanvas){
 return images.map((im,i)=>{
  if(i%2===0)return im;
  const c=createCanvas(1600,1000),g=c.getContext('2d');
  g.drawImage(im,0,0,2,im.height,0,0,301,1000);
  g.drawImage(im,im.width-2,0,2,im.height,1299,0,301,1000);
  g.drawImage(im,300,0,1000,1000);return c;
 });
}
export function drawChrome(g,w,h){
 const s=w/1512;
 g.save();g.scale(s,s);g.fillStyle='#282a28';g.strokeStyle='#454745';g.lineWidth=.6;
 g.font='10px StudySans, Arial';g.textBaseline='middle';g.letterSpacing='1px';
 g.strokeRect(32,53,4.4,4.4);g.fillText('REEL FLUX ®',43,56);
 g.textAlign='right';g.fillText('ARCHIVE — Nº 07',1430,56);g.strokeRect(1440,53,4.4,4.4);
 g.textAlign='center';g.font='14px StudySans, Arial';g.fillText('+',756,59);
 const footer=h/s-86;g.textAlign='left';g.font='10px StudySans, Arial';g.strokeRect(32,footer-2,4.4,4.4);g.fillText('40.7128° N  74.0060° W',43,footer+1);
 g.textAlign='center';g.letterSpacing='0px';g.font='10px StudySans, Arial';g.fillText('/10 Photos',756,footer+1);
 g.textAlign='right';g.letterSpacing='1px';g.fillText('MOTION STUDY / SS 2026',1472,footer+1);g.strokeRect(1480,footer-2,4.4,4.4);
 g.fillStyle='#373936';g.beginPath();g.roundRect(1465,35,35,35,10);g.fill();g.strokeStyle='#b7b9b3';g.lineWidth=.8;
 for(const[dx,dy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){let x=1482,y=52;g.beginPath();g.moveTo(x+dx*2,y+dy*2);g.lineTo(x+dx*7,y+dy*7);g.moveTo(x+dx*3,y+dy*7);g.lineTo(x+dx*7,y+dy*7);g.lineTo(x+dx*7,y+dy*3);g.stroke();}
 g.restore();
}
export function drawRibbon(g,textures,state,{width,height,chrome=true,pointer=null}={}){
 const w=width||g.canvas.width,h=height||g.canvas.height;
 g.clearRect(0,0,w,h);g.fillStyle='#e9e9e9';g.fillRect(0,0,w,h);
 // Screen-space inverse mesh. The same column projection drives browser and offline output.
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 const step=1;
 for(let x=0;x<w;x+=step){
  const col=columnState((x+.5)/w,state);if(col.gap)continue;const img=textures[col.tile];
  const du=1/w/(state.panelWidth||.438)*img.width;const sx=Math.min(img.width-1,col.u*img.width);const sw=Math.min(du+1,img.width-sx);
  g.drawImage(img,sx,0,sw,img.height,x,col.top*h,step+.3,(col.bottom-col.top)*h);
 }
 // Subpixel cool/warm glint on the rim reproduces the thin chromatic edge of the bent mesh.
 for(const[edge,color,yshift]of[['top','rgba(89,170,255,.4)',-.25],['bottom','rgba(255,189,91,.30)',.25]]){
  g.strokeStyle=color;g.lineWidth=.65;g.beginPath();let active=false;
  for(let x=0;x<=w;x+=2){const q=columnState(x/w,state);if(q.gap){active=false;continue;}const y=q[edge]*h+yshift;if(!active){g.moveTo(x,y);active=true;}else g.lineTo(x,y);}g.stroke();
 }
 if(chrome)drawChrome(g,w,h);
 if(pointer){const x=pointer[0]*w,y=pointer[1]*h;g.save();g.translate(x,y);g.fillStyle='#fcfcf4';g.strokeStyle='#353633';g.lineWidth=.8;g.beginPath();g.moveTo(-2,4);g.lineTo(-4,0);g.quadraticCurveTo(-5,-2,-3,-2);g.lineTo(-1,0);g.lineTo(-1,-5);g.quadraticCurveTo(-1,-7,1,-6);g.lineTo(1,-2);g.lineTo(2,-6);g.quadraticCurveTo(3,-7,4,-5);g.lineTo(4,-1);g.lineTo(5,-4);g.quadraticCurveTo(7,-5,7,-2);g.lineTo(8,-3);g.quadraticCurveTo(10,-2,8,3);g.lineTo(6,6);g.lineTo(0,6);g.closePath();g.fill();g.stroke();g.restore();}
}
