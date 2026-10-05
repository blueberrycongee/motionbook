/** Offline render of shared hover/interaction state. NOT an app recording. */
import {createRequire}from'node:module';import fs from'node:fs/promises';import path from'node:path';
import {HoverController,ContrastController,controlGeometry}from'../src/hover-behavior.mjs';
import {advanceSpring,motionSpring,resizeDisplaySize,chooseTargetAnchor,nativeRestOffset}from'../src/stack-behavior.mjs';
const require=createRequire(import.meta.url),sharp=require('sharp'),root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'artifacts/v3');await fs.mkdir(path.join(dir,'hover-frames'),{recursive:true});
const png=await fs.readFile(path.join(root,'public/fixtures/initial.png')),image='data:image/png;base64,'+png.toString('base64');
const petPNG=await fs.readFile(path.join(root,'public/assets/pop-out-window-egg@3x.png')),pet='data:image/png;base64,'+petPNG.toString('base64');
const text=(x,y,s,size=14,color='#334a3b',extra='')=>`<text x="${x}" y="${y}" font-family="Arial,DejaVu Sans,sans-serif" font-size="${size}" fill="${color}" ${extra}>${s.replaceAll('&','&amp;').replaceAll('<','&lt;')}</text>`;
const svg=b=>`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="660" viewBox="0 100 1280 660"><defs><filter id="shadow" x="-30%" y="-40%" width="160%" height="200%"><feDropShadow dx="0" dy="6" stdDeviation="10" flood-opacity=".16"/></filter><filter id="fog"><feGaussianBlur stdDeviation="5"/></filter><filter id="white"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/></filter></defs>${b}</svg>`;
const zoom=1.6,fps=15,duration=21,hover=new HoverController({now:()=>0}),contrast=new ContrastController({now:()=>0});let priorPhase=-1;const trace=[];
function tile({x,y,w,h,tint=0,dark=false}){return `<g transform="translate(${x} ${y}) scale(${zoom})"><rect width="${w}" height="${h}" rx="8" fill="#f0f0f0" filter="url(#shadow)"/><clipPath id="clip${x}"><rect width="${w}" height="${h}" rx="8"/></clipPath><g clip-path="url(#clip${x})"><image href="${image}" width="${w}" height="${h}"/>${dark?`<rect width="${w}" height="${h}" fill="black" opacity=".82"/>`:""}<rect width="${w}" height="${h}" fill="black" opacity="${tint}"/></g></g>`;}
function cursor(x,y){return `<g transform="translate(${x} ${y})"><path d="M0 0L0 23l6-6 5 10 5-2-5-10 9-1Z" fill="#252b28" stroke="white" stroke-width="1.5"/></g>`}
function controls({x,y,geometry,state,contrast,placement}){const g=geometry;let b=`<g transform="translate(${x} ${y}) scale(${zoom})" opacity="${state.reveal}"><rect x="${g.fog.x}" y="${g.fog.y}" width="${g.fog.width}" height="${g.fog.height}" rx="21" fill="${contrast.color==='white'?'#303b33':'#f5f5f5'}" opacity=".72" filter="url(#fog)"/>`;
 for(const button of g.buttons){const opacity=state.controlID===button.id?1:.7,gray=Math.round((button.id==='hide-menu'?contrast.textGray:contrast.glyphGray)*255),color=`rgb(${gray},${gray},${gray})`;b+=`<g opacity="${opacity}">`;
  if(button.id==='hide-menu')b+=text(button.x+8,button.y+15,'Hide',12,color,'font-weight="600"');
  else if(button.id==='return-home')b+=`<path d="m${button.x+6} ${button.y+6} 10 10m0-10-10 10" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
  else b+=`<image href="${pet}" x="${button.x+3}" y="${button.y+4}" width="16" height="16" ${gray>127?'filter="url(#white)"':''}/>`;b+='</g>';
 }
 return b+'</g>';}
const stages=[
 ['Idle','No hover-driven enlargement','Image scale stays exactly 1.0'],
 ['Pointer enters the image','6% black tint, applied immediately','Control group fades in over 120ms'],
 ['Hover the return control','Glyph opacity 0.7 → 1.0','Pinned × returns to the sidebar; it does not close the card'],
 ['Hover Send to Pet','Second control: 22pt cell / 16pt glyph','Native tooltips use AppKit timing, with no invented delay'],
 ['Leave the control group','Fade out from its current presentation opacity','120ms EaseInEaseOut; image tint clears immediately'],
 ['A second card joins the stack','Controls move above the topmost card','22pt / 28pt stack offsets; no hover expansion'],
 ['Resize interaction','100–400pt maximum dimension; source aspect preserved','Hover recalculation and contrast sampling pause during resize'],
 ['Drag and release','4pt drag threshold and smoothed release velocity','Velocity-projected target; source-specific springs'],
 ['Sidebar placement','Hide opens a two-action native menu','Hide for this task / Hide for all active tasks'],
 ['Pet placement','One return control; second control is hidden','Content identity is preserved across placement changes'],
 ['Contrast hysteresis','White → black above 0.74; black → white below 0.56','240ms dwell + 3 samples; icon color transition 160ms']
];
function render(t){let phase=t<1?0:t<2.5?1:t<4?2:t<5.5?3:t<7?4:t<9?5:t<11?6:t<14?7:t<16.5?8:t<18.5?9:10;const[title,sub,note]=stages[phase];let placement=phase===8?'home':phase===9?'pet':'pinned',count=phase===5?2:1,w=400,h=250,x=390,y=256;
 if(phase===6){w=resizeDisplaySize({startSize:400,startPointerY:0,pointerY:(t-9)*50,direction:-1});h=w*600/960;x=390+(400-w)*zoom;y=256+(250-h)*zoom;}
 if(phase===7){const duration=t-11,a=duration<1.5?Math.max(0,duration/1.5):1;const initial={position:390,velocity:0,target:140};const p=duration<1.5?390-250*a:advanceSpring(initial,duration-1.5,motionSpring({index:0})).position;x=p;}
 if(phase===10){x=390;}
 let reference={x,y};if(count>1){const back=nativeRestOffset(2,1,{width:w,height:h});reference={x:x-28*zoom,y:y-22*zoom};}
 const geometry=controlGeometry({placement,textWidth:25,above:count>1});hover.setControls({buttons:geometry.buttons.map(b=>({id:b.id,frame:{x:b.x,y:b.y,width:b.width,height:b.height}}))});
 let point={x:160,y:120},itemID='front',inControlsHoverFrame=false,resizing=phase===6;
 if(phase===0||phase===4){itemID=null;point={x:-50,y:-30};}
 if(phase===2||phase===8||phase===9){const b=geometry.buttons[0];point={x:b.x+11,y:b.y+11};itemID=count>1?null:'front';inControlsHoverFrame=true;}
 if(phase===3){const b=geometry.buttons[1];point={x:b.x+11,y:b.y+11};inControlsHoverFrame=true;}
 if(phase===5){point={x:geometry.buttons[1].x+11,y:geometry.buttons[1].y+11};itemID=null;inControlsHoverFrame=true;}
 if(phase===6){point={x:0,y:0};}
 const state=hover.update({itemID,point,inControlsHoverFrame,resizing},t);const dark=phase===10&&t>=19.4;const lum=dark?.2:.92;const c=contrast.sample(lum,t,{force:false});
 if(phase!==priorPhase){trace.push({at:t,phase,title,state});priorPhase=phase;}
 let b='<rect x="0" y="100" width="1280" height="660" fill="#f7f9f7"/><rect x="36" y="209" width="1208" height="470" rx="18" fill="#eaf0ea" stroke="#dce6dc"/>';
 if(phase===10&&dark)b+='<rect x="370" y="236" width="680" height="440" rx="18" fill="#303b33"/>';
 if(count>1)b+=tile({x:reference.x,y:reference.y,w,h,tint:0});
 b+=tile({x,y,w,h,tint:state.itemID?.06:0,dark});
 b+=controls({x:reference.x,y:reference.y,geometry,state,contrast:c,placement});
 if(phase===8&&t>=15.1){const mx=x+(geometry.row.x)*zoom,my=y+(geometry.row.y+26)*zoom;b+=`<rect x="${mx}" y="${my}" width="232" height="73" rx="8" fill="#fafafafa" stroke="#0002" filter="url(#shadow)"/>`+text(mx+14,my+29,'Hide for this task',13,'#29392d')+text(mx+14,my+56,'Hide for all active tasks',13,'#29392d');}
 let cursorX=reference.x+point.x*zoom,cursorY=reference.y+point.y*zoom;
 if(phase===7){cursorX=x+140*zoom;cursorY=y+110*zoom;}
 b+=cursor(cursorX,cursorY);
 return svg(b);}
for(let i=0;i<fps*duration;i++){const t=i/fps,out=Buffer.from(render(t));await sharp(out).png().toFile(path.join(dir,`hover-frames/frame-${String(i).padStart(4,'0')}.png`));if([0,30,48,67,112,143,188,235,260,303].includes(i))await sharp(out).png().toFile(path.join(dir,`hover-state-${String(i).padStart(3,'0')}.png`));}
await fs.writeFile(path.join(dir,'hover-render-trace.json'),JSON.stringify(trace,null,2));console.log('315 offline hover/interaction frames rendered; not runtime UI screenshots.');
