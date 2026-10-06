import{scene,nativeState,demoState}from'./scene.mjs';import{CONTROLS}from'./controls.mjs';import{Controller}from'./controller.mjs';import{downloadPDF}from'./pdf.mjs';
const stage=document.querySelector('#stage'),art=document.querySelector('#art'),replay=document.querySelector('#replay'),open=document.querySelector('#open'),download=document.querySelector('#download');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const model=new Controller(reduced);let start=performance.now()/1000,lastKey='',latest;
function draw(now=performance.now()/1000){const frame=model.frame(now);const s=frame===null?demoState(now-start):nativeState(CONTROLS[frame].t);if(frame!==null)s.cursor=null;const key=JSON.stringify([s.frame,s.t,s.crossfade,s.cursor]);if(key!==lastKey){art.innerHTML=scene(s);lastKey=key;}latest=s;download.hidden=!(s.download>.9);open.hidden=model.mode==='open'||model.mode==='opening'||(s.bbox&&(s.bbox[2]-s.bbox[0])*(s.bbox[3]-s.bbox[1])>30000);stage.setAttribute('data-state',model.mode);}
function play(){draw();if(!reduced)requestAnimationFrame(play);}play();
replay.addEventListener('click',()=>{const t=performance.now()/1000;start=t;model.replay(t);draw(t);});
open.addEventListener('click',e=>{e.stopPropagation();model.open(performance.now()/1000);draw();});
download.addEventListener('click',e=>{e.stopPropagation();downloadPDF();});
stage.addEventListener('click',e=>{const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)*824/r.width,y=(e.clientY-r.top)*720/r.height;const b=latest?.bbox;if(b&&(x<b[0]||x>b[2]||y<b[1]||y>b[3])){model.close(performance.now()/1000,latest?.frame??null);draw();}});
addEventListener('keydown',e=>{if(e.key==='Escape'){model.close(performance.now()/1000,latest?.frame??null);draw();}if(e.key.toLowerCase()==='r'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){start=performance.now()/1000;model.replay(start);draw();}});
