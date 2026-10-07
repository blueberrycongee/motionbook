(function(){'use strict';
const {createModel,makeParticles,renderMedia}=SpoilerMotion;
const canvas=document.getElementById('canvas'),ctx=canvas.getContext('2d'),media=document.getElementById('media'),status=document.getElementById('status'),hint=document.getElementById('hint'),reduced=document.getElementById('reduced');
const mq=matchMedia('(prefers-reduced-motion: reduce)');reduced.checked=mq.matches;
const model=createModel({width:480,height:360,reducedMotion:reduced.checked}),particles=makeParticles(),start=performance.now();let lastPhase='',loaded=false,raf=0,dirty=true;
const createCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});
const assetURLs=window.SPOILER_ASSETS||{clear:'assets/original-still-life.png',blur:'assets/original-still-life-blurred.png'};
let assets;
const now=()=>performance.now()-start;
function draw(t){const sample=model.sample(t);renderMedia(ctx,{model:sample,time:t,width:canvas.width,height:canvas.height,assets,particles,createCanvas});
 if(sample.phase!==lastPhase){lastPhase=sample.phase;status.textContent=sample.phase[0].toUpperCase()+sample.phase.slice(1);media.setAttribute('aria-label',sample.phase==='revealed'?'Media revealed: original illustration of wrapped gifts':sample.target?'Revealing hidden media':'Reveal hidden media');hint.textContent=sample.target?'Use “Hide again” to replay':'Tap the image to reveal';}dirty=false;
}
function frame(){raf=0;if(!loaded||document.hidden)return;const t=now(),s=model.sample(t);if(dirty||!s.reducedMotion&&(s.phase!=='revealed'))draw(t);if(!s.reducedMotion&&s.phase!=='revealed')raf=requestAnimationFrame(frame);}
function wake(){dirty=true;if(!raf)raf=requestAnimationFrame(frame);}
media.addEventListener('click',e=>{const r=media.getBoundingClientRect();const point=e.detail===0?{x:240,y:180}:{x:(e.clientX-r.left)*480/r.width,y:(e.clientY-r.top)*360/r.height};model.reveal(now(),point);wake();});
document.getElementById('hide').addEventListener('click',()=>{model.hide(now());wake();});
document.getElementById('reset').addEventListener('click',()=>{model.reset(now());wake();});
reduced.addEventListener('change',()=>{model.setReducedMotion(reduced.checked,now());wake();});
mq.addEventListener('change',e=>{reduced.checked=e.matches;model.setReducedMotion(e.matches,now());wake();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();});
Promise.all([load(assetURLs.clear),load(assetURLs.blur)]).then(([clear,blur])=>{assets={clear,blur};loaded=true;wake();}).catch(()=>{status.textContent='Artwork could not load. Keep assets beside index.html or use standalone.html.';});
})();
