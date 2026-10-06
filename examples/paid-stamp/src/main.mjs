import {scene} from './scene.mjs';
import {initialState,reduce,drawState,STATUSES,COLORS} from './model.mjs';
import {invoicePdf} from './pdf.mjs';
const $=id=>document.getElementById(id),motion=matchMedia('(prefers-reduced-motion: reduce)');
let state=initialState(motion.matches),last=0,drag=null,lastVisualKey='';
const announce=message=>{$('announcement').textContent=message;};
function dispatch(action){state=reduce(state,action);render();}
function modePhase(){if(state.mode==='live')return state.phase;const f=Math.round(state.time*60);return f<123||state.time>=9.6?'editor':f>=256&&f<308?'confirm':f>=400&&state.time<9?'final':'busy';}
function render(){
 const pose=drawState(state),i=pose.frame||0,key=JSON.stringify({...pose,t:0,frame:0,visiblePhase:[i>=199,i<55,i<84,i<132,i<150]});if(key!==lastVisualKey){$('art').innerHTML=scene(pose);lastVisualKey=key;}const visibleDate=state.mode==='demo'?{day:pose.day??13,month:9,year:2026}:state;const phase=modePhase();
 $('editor').hidden=phase!=='editor';$('confirmation').hidden=phase!=='confirm';$('finished').hidden=phase!=='final';
 document.querySelectorAll('[data-status]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.status)===state.status)));
 document.querySelectorAll('[data-color]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.color)===state.color)));
 document.querySelectorAll('[data-field]').forEach(el=>{el.setAttribute('aria-valuenow',String(Math.round(visibleDate[el.dataset.field])));if(el.dataset.field==='day')el.setAttribute('aria-valuemax',String(new Date(Date.UTC(visibleDate.year,visibleDate.month,0)).getUTCDate()));});
 $('mark').setAttribute('aria-label',`Mark invoice as ${STATUSES[state.status].toLowerCase()}`);
}
for(const [index,label] of STATUSES.entries()){
 const b=document.createElement('button');b.dataset.status=String(index);b.setAttribute('aria-label',label);b.style.left=`${[307,359,433,515][index]/10.8}%`;b.style.width=`${[50,74,82,45][index]/10.8}%`;b.addEventListener('click',()=>dispatch({type:'status',index}));$('statuses').append(b);
}
for(const [index,label] of ['Red','Blue','Green','Purple','Charcoal'].entries()){
 const b=document.createElement('button');b.dataset.color=String(index);b.setAttribute('aria-label',`${label} stamp`);b.style.left=`${55.37+index*3.33}%`;b.addEventListener('click',()=>dispatch({type:'color',index}));$('colors').append(b);
}
for(const el of document.querySelectorAll('[data-field]')){
 const field=el.dataset.field;el.setAttribute('role','spinbutton');el.setAttribute('aria-valuemin',field==='year'?'1900':'1');el.setAttribute('aria-valuemax',field==='year'?'2100':field==='month'?'12':'31');
 el.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();dispatch({type:'date',field,delta:['ArrowUp','ArrowRight'].includes(e.key)?1:-1});}});
 el.addEventListener('wheel',e=>{e.preventDefault();dispatch({type:'date',field,delta:Math.sign(e.deltaY)});},{passive:false});
 el.addEventListener('pointerdown',e=>{dispatch({type:'date',field,delta:0});drag={field,id:e.pointerId,y:e.clientY,start:state[field]};el.setPointerCapture(e.pointerId);});
 el.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const scale=document.querySelector('.stage').getBoundingClientRect().width/1080;dispatch({type:'date',field,value:drag.start+(drag.y-e.clientY)/(38*scale)});});
 const end=e=>{if(!drag||drag.id!==e.pointerId)return;dispatch({type:'date',field,value:Math.round(state[field])});drag=null;if(el.hasPointerCapture?.(e.pointerId))el.releasePointerCapture(e.pointerId);};
 el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('lostpointercapture',()=>{if(drag?.field===field){dispatch({type:'date',field,value:Math.round(state[field])});drag=null;}});
}
$('mark').addEventListener('click',()=>{dispatch({type:'mark'});announce('Applying invoice stamp.');});
$('undo').addEventListener('click',()=>{dispatch({type:'undo'});announce('Stamp undone. Choose a payment date.');});
$('done').addEventListener('click',()=>{dispatch({type:'done'});announce('Invoice marked.');});
$('next').addEventListener('click',()=>{dispatch({type:'next'});announce('Ready for the next invoice.');});
$('replay').addEventListener('click',()=>dispatch({type:'reset',reduced:motion.matches}));
$('download').addEventListener('click',()=>{const pose=drawState(state),pdf=invoicePdf({day:Math.round(pose.day),month:pose.month??9,year:pose.year??2026,status:pose.status??'Paid'}),url=URL.createObjectURL(new Blob([pdf],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download='invoice-FUI-0067.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Illustrative invoice PDF downloaded.');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key.toLowerCase()==='r'){dispatch({type:'reset',reduced:motion.matches});}else if(e.key==='Enter'&&modePhase()==='editor'&&e.target===document.body){dispatch({type:'mark'});}});
motion.addEventListener('change',()=>dispatch({type:'motion',reduced:motion.matches}));
function frame(now){const dt=last?(now-last)/1000:0;last=now;if(!motion.matches){state=reduce(state,{type:'tick',dt});render();}requestAnimationFrame(frame);}
render();requestAnimationFrame(frame);
