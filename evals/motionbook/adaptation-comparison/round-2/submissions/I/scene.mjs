/** Original vector study. Scripted states; no DOM, fonts, media, or network required. */
const C = {bg:'#F3F2EE', paper:'#FFFEFC', ink:'#282D2A', muted:'#777C75', line:'#E5E6DF', soft:'#F3F4EF', sage:'#668F7A', amber:'#D99318', amberWash:'#FFF2D5', lilac:'#9690C2', rose:'#D78383'};
const bound = n => Math.max(0, Math.min(1, n));
const ease = n => 1 - Math.pow(1-bound(n), 3);
const lerp = (a,b,p) => a+(b-a)*p;
const n = x => Number(x.toFixed(4));
const escape = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
const rect = (x,y,w,h,r,fill,stroke='none',extras='') => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${r}" fill="${fill}" stroke="${stroke}" ${extras}/>`;
const txt = (x,y,s,size=14,fill=C.ink,weight=400,extra='') => `<text x="${n(x)}" y="${n(y)}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${escape(s)}</text>`;
const path = (d,stroke=C.ink,width=1.6,extra='') => `<path d="${d}" stroke="${stroke}" stroke-width="${width}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const dot = (x,y,color,r=4) => `<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="${color}"/>`;
const tick = (x,y,color=C.ink) => path(`M${x-4} ${y}l3 3 6-7`,color,1.7);
const plus = (x,y,color=C.ink) => path(`M${x-4} ${y}h8M${x} ${y-4}v8`,color,1.5);
const close = (x,y,color=C.muted) => path(`M${x-3} ${y-3}l6 6M${x+3} ${y-3}l-6 6`,color,1.3);

function events(scenario) {
  if(scenario==='interrupted') return [[.5,'list'],[.9,'search'],[1.5,'color'],[1.8,'cancelled'],[2.4,'list'],[2.8,'search'],[3.2,'color'],[3.7,'amber'],[4.2,'created'],[5,'closed']];
  return [[.5,'list'],[.9,'search'],[1.5,'color'],[2.1,'amber'],[2.6,'created'],[3.6,'closed']];
}
const panelHeight = phase => ({list:170,search:140,color:278,amber:278,created:236}[phase] || 170);

export function stateAt(time=0, scenario='normal') {
  const t = Math.max(0,Math.min(6, Number.isFinite(time)?time:0));
  const schedule = events(scenario);
  let phase='initial', at=0, previous='initial';
  for(const [when,what] of schedule) if(t>=when){previous=phase;phase=what;at=when;}
  const created = t >= (scenario==='interrupted'?4.2:2.6);
  const open = ['list','search','color','amber','created'].includes(phase);
  return {t,phase,at,previous,open,created,query:phase==='search'?'Review':'',draft:['color','amber'].includes(phase)?'Review':'',color:phase==='amber'||created?'amber':null,selected:created?['Research','Review']:['Research'],labels:created?['Research','Planning','Review']:['Research','Planning']};
}

function chip(x,y,label,color,{w=114,fill=C.paper,stroke=C.line,opacity=1}={}) {
  return `<g opacity="${n(opacity)}">${rect(x,y,w,34,17,fill,stroke)}${dot(x+15,y+17,color,4)}${txt(x+27,y+22,label,14,C.ink,500)}</g>`;
}
function searchField(value, focused=false) {
  return `<g>${rect(246,277,294,39,9,C.paper,focused?'#BECAC0':C.line)}<circle cx="262" cy="295" r="5.1" fill="none" stroke="${C.muted}" stroke-width="1.4"/>${path('M266 299l3 3',C.muted,1.4)}${txt(279,301,value||'Find or create a label…',13.5,value?C.ink:C.muted)}${focused?path('M323 286v18',C.ink,1.2):''}</g>`;
}
function row(y,name,color,selected,highlight=false) {
  return `${highlight?rect(244,y-17,298,35,8,C.soft):''}${rect(255,y-7,14,14,4,selected?C.ink:C.paper,selected?C.ink:'#CFD3CA')}${selected?tick(262,y+.5,'#FFFFFF'):''}${dot(285,y,color,4)}${txt(299,y+5,name,14,C.ink,selected?500:400)}`;
}
function listBody(created) {
  return `${searchField('')}${txt(254,339,'IN THIS NOTEBOOK',9.5,C.muted,600,'letter-spacing="1.25"')}${row(361,'Research',C.sage,true)}${row(397,'Planning',C.lilac,false)}${created?row(433,'Review',C.amber,true,true):''}${created?`${path('M254 460h278',C.line,1)}${tick(262,479,C.sage)}${txt(277,484,'Review added to this note',11.5,C.muted)}`:''}`;
}
function searchBody() {
  return `${searchField('Review',true)}${txt(254,338,'No matching labels',11.5,C.muted)}${rect(245,352,296,39,9,C.soft)}${plus(263,371)}${txt(279,376,'Create “Review”',14,C.ink,500)}${path('M524 368l3 3-3 3',C.muted,1.4)}`;
}
function paletteBody(amber,age,rm) {
  const highlight = amber ? (rm?1:ease(age/.16)) : 0;
  const selectedColor = amber?C.amber:'#A8ADA5';
  let s = `${path('M255 287l-4 4 4 4',C.muted,1.5)}${txt(266,296,'New label',12.5,C.muted,500)}${chip(363,276,'Review',selectedColor,{w:100})}${close(531,292)}`;
  s += rect(239,319,308,218,12,C.paper,C.line);
  s += `${txt(256,342,'Choose a color',12.5,C.muted,500)}${path('M249 352h288',C.line,1)}`;
  const colors=[['Rose',C.rose],['Amber',C.amber],['Mint',C.sage],['Iris',C.lilac]];
  colors.forEach(([name,color],i)=>{
    const y=371+i*32;
    if(i===1&&amber)s+=`<g opacity="${n(highlight)}">${rect(246,y-15,294,30,7,C.amberWash)}</g>`;
    s+=dot(261,y,color,4.5)+txt(276,y+4.5,name,13.5,C.ink,i===1&&amber?500:400);
    if(i===1&&amber)s+=`<g opacity="${n(highlight)}">${tick(522,y,'#926014')}</g>`;
  });
  s+=path('M249 488h288',C.line,1)+txt(259,515,'Cancel',12.5,C.muted,500);
  s+=rect(432,496,102,29,8,amber?C.ink:'#E8EBE4')+txt(483,515,'Create label',12,amber?'#FFFFFF':'#90958D',500,'text-anchor="middle"');
  return s;
}


function pointerAt(t,scenario,rm) {
  if(rm)return '';
  const points=scenario==='interrupted' ? [
    [0,590,341],[.5,400,239],[.9,306,299],[1.5,399,374],[1.8,531,292],[2.4,400,239],[2.8,306,299],[3.2,399,374],[3.7,310,403],[4.2,490,512],[5,599,390]
  ] : [[0,590,341],[.5,400,239],[.9,306,299],[1.5,399,374],[2.1,310,403],[2.6,490,512],[3.6,599,390]];
  const end=scenario==='interrupted'?5:3.6;
  if(t>=end+.14)return '';
  let a=points[0], b=points[0];
  for(let i=1;i<points.length;i++){ if(t<=points[i][0]){a=points[i-1];b=points[i];break;} a=b=points[i]; }
  const duration=b[0]-a[0], travel=duration>0?ease((t-a[0]-.09)/(duration-.12)):1;
  const x=lerp(a[1],b[1],travel), y=lerp(a[2],b[2],travel);
  let pulse='';
  const clicks=scenario==='interrupted'?[.5,1.5,1.8,2.4,3.2,3.7,4.2]:[.5,1.5,2.1,2.6];
  for(const when of clicks) if(t>=when&&t<when+.18){
    const p=(t-when)/.18;
    pulse=`<circle cx="${n(x)}" cy="${n(y)}" r="${n(5+p*7)}" fill="none" stroke="#687461" stroke-width="1.1" opacity="${n((1-p)*.3)}"/>`;
  }
  const alpha=t<.18?bound(t/.18):t>end?1-bound((t-end)/.14):1;
  return `<g opacity="${n(alpha)}">${pulse}<path d="M0 0L2 17L6.6 12.5L10.7 19L14 17L9.8 10.6L16 9.5Z" transform="translate(${n(x)} ${n(y)})" fill="#384035" stroke="#FFFFFF" stroke-width="1.6" stroke-linejoin="round"/></g>`;
}

export function renderFrame(time=0, options={}) {
  const {width=800,height=600,scenario='normal',reducedMotion=false}=options||{};
  const state=stateAt(time,scenario), t=state.t, rm=!!reducedMotion;
  const age=t-state.at, p=rm?1:ease(age/.24);
  const commitAt=scenario==='interrupted'?4.2:2.6;
  const commitProgress=rm?1:ease((t-commitAt)/.3);
  const shift=state.created?commitProgress:0;
  const addX=363+108*shift;
  const description=state.open?(state.draft?`Creating Review. ${state.color?'Amber selected.':'Choose a color.'}`:state.query?'Searching for Review. No matching labels.':`${state.labels.join(', ')} available.`):state.phase==='cancelled'?'Label creation cancelled. Research is still selected.':'Label picker closed.';
  let body = `<rect width="800" height="600" fill="${C.bg}"/>`;
  body += `<g font-family="Arial, Helvetica, sans-serif">`;
  body += rect(127,98,546,174,20,C.paper,'#E3E4DD','filter="url(#paperShadow)"');
  body += rect(151,119,30,31,8,'#EFF2EB');
  body += `${rect(160,126,13,16,2,'none','#768071')}${path('M163 127v14M165 130h5M165 133h5','#768071',1.1)}`;
  body += txt(192,139,'PROJECT NOTEBOOK',10.5,C.muted,600,'letter-spacing="1.4"');
  body += txt(645,139,'014',11,'#93988F',400,'text-anchor="end"');
  body += txt(152,179,'Onboarding notes',25,C.ink,500,'letter-spacing="-.6"');
  body += path('M152 199h496',C.line,1);
  body += txt(152,240,'Labels',13,C.muted,500);
  body += chip(239,219,'Research',C.sage);
  body += `<g>${rect(addX,219,106,34,17,state.open?'#E8EDE4':'#EEF0EA')}${plus(addX+17,236,state.open?'#485944':C.muted)}${txt(addX+29,241,'Add label',13,state.open?'#42513E':C.muted,500)}</g>`;
  if(state.phase==='cancelled')body+=`${dot(155,292,'#B4B9AF',2.5)}${txt(165,297,'Draft discarded. Your labels are unchanged.',11.5,C.muted)}`;
  if(!state.open&&state.created)body+=`${tick(159,293,C.sage)}${txt(173,298,'2 labels selected',11.5,C.muted)}`;

  if(state.open){
    const opening=state.phase==='list' && ['initial','cancelled'].includes(state.previous);
    const appearance=opening&&!rm ? .18+.82*ease(age/.2) : 1;
    const dy=opening&&!rm ? (1-ease(age/.2))*7:0;
    let startHeight=panelHeight(state.previous), endHeight=panelHeight(state.phase);
    if(opening)startHeight=endHeight;
    const h=rm?endHeight:lerp(startHeight,endHeight,p);
    const nested=state.phase==='color'||state.phase==='amber';
    body+=`<g opacity="${n(appearance)}" transform="translate(0 ${n(dy)})">${rect(233,264,320,h,15,nested?'#F2F3EE':C.paper,'#DDE0D6','filter="url(#pickerShadow)"')}<clipPath id="panelClip">${rect(234,265,318,h-2,14,'white')}</clipPath><g clip-path="url(#panelClip)">`;
    if(state.phase==='list'||state.phase==='created')body+=listBody(state.created);
    else if(state.phase==='search')body+=searchBody();
    else body+=paletteBody(state.phase==='amber',age,rm);
    body+='</g></g>';
  }
  if(state.created){
    // The palette preview becomes the selected chip; the preexisting selection stays anchored.
    const cx=lerp(363,363,commitProgress), cy=lerp(276,219,commitProgress);
    body+=chip(cx,cy,'Review',C.amber,{w:100,fill:'#FFF9ED',stroke:'#E9D8B6'});
  }
  body+='</g>';
  body+=pointerAt(t,scenario,rm);
  const w=Number.isFinite(+width)&&+width>0?+width:800;
  const h=Number.isFinite(+height)&&+height>0?+height:600;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 800 600" role="img" aria-labelledby="sceneTitle sceneDesc" data-phase="${state.phase}" data-created="${state.created}" data-selected="${state.selected.join(',')}"><title id="sceneTitle">Project notebook label picker</title><desc id="sceneDesc">${escape(description)} Selected: ${state.selected.join(', ')}. Scripted interaction study.</desc><metadata id="state">${escape(JSON.stringify({phase:state.phase,open:state.open,created:state.created,selected:state.selected,labels:state.labels,query:state.query,draft:state.draft,color:state.color}))}</metadata><defs><filter id="paperShadow" x="-20%" y="-30%" width="140%" height="170%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="12" result="blur"/><feOffset in="blur" dy="8" result="offset"/><feFlood flood-color="#31382B" flood-opacity=".05" result="color"/><feComposite in="color" in2="offset" operator="in" result="shadow"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="pickerShadow" x="-30%" y="-20%" width="160%" height="160%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur"/><feOffset in="blur" dy="7" result="offset"/><feFlood flood-color="#253023" flood-opacity=".10" result="color"/><feComposite in="color" in2="offset" operator="in" result="shadow"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${body}</svg>`;
}
