/** Original vector study. All state is a pure function of the scripted event time. */
const INK = '#292D2A';
const MUTED = '#767B74';
const GREEN = '#459685';
const AMBER = '#D18A18';
const PURPLE = '#9B8CB8';
const SLATE = '#8C989F';
const palette = [
  ['Slate', SLATE], ['Amber', AMBER], ['Mint', GREEN], ['Lilac', PURPLE]
];
const schedules = {
  normal: [
    [0, 'closed'], [.50, 'list'], [.90, 'search'], [1.50, 'color'],
    [2.10, 'amber'], [2.60, 'created'], [3.60, 'done']
  ],
  interrupted: [
    [0, 'closed'], [.50, 'list'], [.90, 'search'], [1.50, 'color'],
    [1.80, 'cancelled'], [2.40, 'list'], [2.80, 'search'], [3.20, 'color'],
    [3.70, 'amber'], [4.20, 'created'], [5.00, 'done']
  ]
};
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => 1 - (1 - clamp(x)) ** 3;
const mix = (a, b, p) => a + (b - a) * p;
const f = x => Number(x.toFixed(3));
const escape = str => String(str).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;'}[c]));
const isOpen = mode => ['list', 'search', 'color', 'amber', 'created'].includes(mode);
const isColor = mode => mode === 'color' || mode === 'amber';
const height = mode => ({list:164, search:132, color:294, amber:294, created:206}[mode] || 0);

export function stateAt(seconds = 0, scenario = 'normal') {
  const t = Math.max(0, Math.min(6, Number.isFinite(seconds) ? seconds : 0));
  const events = schedules[scenario] || schedules.normal;
  let i = 0;
  while (i + 1 < events.length && t >= events[i + 1][0]) i++;
  const [since, mode] = events[i];
  const previous = i ? events[i - 1][1] : 'closed';
  const committed = mode === 'created' || mode === 'done';
  return {
    t, mode, since, previous, age: t - since, open: isOpen(mode),
    selected: committed ? ['Research', 'Review'] : ['Research'],
    labels: committed ? ['Research', 'Planning', 'Review'] : ['Research', 'Planning'],
    query: mode === 'search' ? 'Review' : '',
    draft: isColor(mode) ? 'Review' : '',
    color: mode === 'amber' || committed ? 'Amber' : null,
    created: committed,
    commitTime: events.find(e => e[1] === 'created')[0]
  };
}

function rect(x,y,w,h,r,fill,stroke='none',extra='') {
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
}
function text(x,y,value,size=14,weight=400,color=INK,extra='') {
  return `<text x="${f(x)}" y="${f(y)}" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${escape(value)}</text>`;
}
function dot(x,y,color,r=4) { return `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${color}"/>`; }
function plus(x,y,color=INK) { return `<path d="M${x-4} ${y}h8M${x} ${y-4}v8" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`; }
function tick(x,y,color='#FFFFFF') { return `<path d="M${x-4} ${y}l2.7 2.8 5-5.6" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`; }
function checkbox(x,y,selected) {
  return rect(x-7,y-7,14,14,4,selected?'#465D50':'#FFFFFF',selected?'#465D50':'#DADFD9') + (selected?tick(x,y):'');
}
function chip(x,y,name,color,opts={}) {
  const w = name === 'Research' ? 113 : 99;
  return `<g ${opts.id ? `data-chip="${opts.id}"` : ''} opacity="${f(opts.opacity ?? 1)}">` +
    rect(x,y,w,32,16,opts.warm?'#FFFBF2':'#FFFFFF',opts.warm?'#EBD9B4':'#DDE1DB') +
    dot(x+15,y+16,color,4.5) + text(x+26,y+21,name,13,500) + '</g>';
}
function magnifier(x,y,color=MUTED) {
  return `<circle cx="${x}" cy="${y}" r="4.5" fill="none" stroke="${color}" stroke-width="1.4"/><path d="M${x+3.5} ${y+3.5}l3.5 3.5" stroke="${color}" stroke-width="1.4" stroke-linecap="round"/>`;
}
function closeIcon(x,y) {return `<path d="M${x-3} ${y-3}l6 6m0-6-6 6" stroke="#949A92" stroke-width="1.3" stroke-linecap="round"/>`;}

function listPanel(mode, h, s, reduced) {
  const x = 222, y = 232;
  const searching = mode === 'search';
  const made = mode === 'created';
  let out = rect(x,y,318,h,15,'#FFFFFF','#DCE0D9','filter="url(#panel-shadow)"');
  out += `<defs><clipPath id="list-clip"><rect x="${x+1}" y="${y+1}" width="316" height="${f(h-2)}" rx="14"/></clipPath></defs><g clip-path="url(#list-clip)">`;
  out += magnifier(x+22,y+24);
  out += text(x+38,y+29,searching?'Review':'Find or create a label…',13,400,searching?INK:'#788170');
  if (searching) out += `<path d="M${x+84} ${y+16}v16" stroke="#59665B" stroke-width="1.2"/>`;
  out += closeIcon(x+295,y+24);
  out += `<path d="M${x+1} ${y+48}h316" stroke="#ECEFE9"/>`;
  if (searching) {
    out += rect(x+9,y+60,300,39,8,'#F1F3EE');
    out += plus(x+26,y+79,'#5D6F60') + text(x+42,y+84,'Create “Review”',13,500);
    out += text(x+281,y+84,'↵',15,400,'#869180');
    out += text(x+18,y+119,'No matching labels',10.5,400,'#788170');
  } else {
    out += rect(x+9,y+58,300,36,8,'#F4F6F1');
    const rows = made ? [['Research',GREEN,true],['Planning',PURPLE,false],['Review',AMBER,true]] : [['Research',GREEN,true],['Planning',PURPLE,false]];
    rows.forEach(([name,color,on],i) => {
      const rowY = y + 77 + i*40;
      if (name === 'Review') out += rect(x+9,rowY-18,300,36,8,'#FEF8EB');
      out += checkbox(x+25,rowY,on) + dot(x+49,rowY,color) + text(x+61,rowY+5,name,13,500);
      if (name === 'Review') out += text(x+277,rowY+4,'New',10,500,'#A27830','text-anchor="end"');
    });
    const footerY = made ? y+193 : y+151;
    out += text(x+17,footerY,made?'2 labels selected':'1 label selected',10.5,400,'#788170');
  }
  return out+'</g>';
}

function colorPanel(mode,h,s,reduced) {
  const x=222,y=232;
  const amber=mode==='amber';
  let out=rect(x,y,318,h,15,'#F0F2ED','#D5DCD1','filter="url(#panel-shadow)"');
  const entering=mode==='color'&&s.mode==='color';
  const bodyProgress=reduced||!entering?1:ease(s.age/.18);
  out += `<defs><clipPath id="color-clip"><rect x="${x+1}" y="${y+1}" width="316" height="${f(h-2)}" rx="14"/></clipPath></defs><g clip-path="url(#color-clip)"><g opacity="${f(.12+.88*bodyProgress)}" transform="translate(0 ${f((1-bodyProgress)*4)})">`;
  out += `<path d="M${x+26} ${y+20}l-4 4 4 4" fill="none" stroke="#838D7D" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  out += text(x+39,y+29,'New label',12.5,500,'#6D7665');
  out += chip(x+199,y+8,'Review',amber?AMBER:SLATE,{warm:amber});
  out += rect(x+5,y+47,308,242,12,'#FFFFFF','#E0E5DA');
  out += text(x+19,y+72,'Choose a color',12,500,'#6D7665');
  out += `<path d="M${x+6} ${y+84}h306" stroke="#EEF0EA"/>`;
  palette.forEach(([name,color],i)=>{
    const cy=y+106+35*i;
    const on=amber&&name==='Amber';
    if (on) out += rect(x+12,cy-15,294,31,7,amber?'#FBF0D6':'#F0F3EF');
    out += dot(x+29,cy,color,4.5)+text(x+44,cy+4.5,name,12.5,500);
    if(on) out += tick(x+289,cy,amber?'#A57013':'#6E7C68');
  });
  out += `<path d="M${x+6} ${y+233}h306" stroke="#EEF0EA"/>`;
  out += text(x+31,y+268,'Cancel',12,500,'#81897A');
  out += rect(x+182,y+246,116,31,8,amber?'#425A49':'#DDE3D7');
  out += text(x+240,y+266,'Create label',12,600,amber?'#FFFFFF':'#9BA591','text-anchor="middle"');
  return out+'</g></g>';
}

export function renderFrame(t = 0, options = {}) {
  const {width=800,height:canvasHeight=600,scenario='normal',reducedMotion=false}=options || {};
  const s=stateAt(t,scenario);
  const reduced=!!reducedMotion;
  const progress=duration=>reduced?1:ease(s.age/duration);
  const afterCommit=s.created ? (reduced?1:ease((s.t-s.commitTime)/.34)) : 0;
  const commitAge=s.t-s.commitTime;
  const spaceProgress=s.created?(reduced?1:ease(commitAge/.12)):0;
  const transferX=reduced?1:ease(commitAge/.16);
  const transferY=reduced?1:ease((commitAge-.04)/.30);
  const addX=mix(344,451,spaceProgress);
  const desc=s.created?'Research and amber Review are selected.':s.mode==='cancelled'?'New label cancelled. Research remains selected. No Review label exists.':s.open?`Research selected. ${s.draft?(s.color?'Amber chosen for draft Review.':'Choosing a color for draft Review.'):s.query?'Searching Review.':'Research and Planning available.'}`:'Research selected. Label picker closed.';
  let out=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${canvasHeight}" viewBox="0 0 800 600" role="img" aria-labelledby="scene-title scene-desc" data-state="${s.mode}" data-selected="${s.selected.join(',')}" data-created="${s.created}" data-open="${s.open}" data-reduced-motion="${reduced}"><title id="scene-title">Project notebook label picker</title><desc id="scene-desc">${escape(desc)}</desc><defs>
    <filter id="card-shadow" x="-20%" y="-40%" width="140%" height="190%"><feGaussianBlur in="SourceAlpha" stdDeviation="13" result="blur"/><feOffset in="blur" dy="7" result="offset"/><feFlood flood-color="#405036" flood-opacity=".055" result="color"/><feComposite in="color" in2="offset" operator="in" result="shadow"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="panel-shadow" x="-25%" y="-20%" width="150%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur"/><feOffset in="blur" dy="9" result="offset"/><feFlood flood-color="#293922" flood-opacity=".14" result="color"/><feComposite in="color" in2="offset" operator="in" result="shadow"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs><rect width="800" height="600" fill="#F4F5F0"/><g font-family="Arial, Helvetica, sans-serif">`;
  out += rect(140,114,520,150,19,'#FCFDF9','#DFE4D8','filter="url(#card-shadow)"');
  out += rect(164,137,28,30,7,'#EFF2E8','#D8E0CF');
  out += `<path d="M172 138v28m5-20h8m-8 5h8m-8 5h5" stroke="#8C9B7E" stroke-width="1.4" stroke-linecap="round"/>`;
  out += text(205,158,'Project notebook',18,600,'#3A4734');
  out += `<path d="M164 181h472" stroke="#E8ECE0"/>`;
  out += text(164,211,'Labels',12,500,'#6D7665');
  out += chip(222,191,'Research',GREEN,{id:'Research'});
  if(s.created && afterCommit === 1) {
    const p=afterCommit;
    // The nested preview becomes the selected chip; it is one moving object.
    const cx=mix(421,344,p), cy=mix(240,191,p);
    out += chip(cx,cy,'Review',AMBER,{id:'Review',warm:true});
  }
  const buttonFill=s.open?'#E5EADF':'#EFF2E9';
  out += rect(addX,191,103,32,16,buttonFill,'none');
  out += plus(f(addX+16),207,'#65745A') + text(addX+28,212,'Add label',12,500,'#65745A');
  let panelMode=s.mode, visibility=s.open?1:0, shiftY=0;
  const opening=s.open&&!isOpen(s.previous);
  const closing=!s.open&&isOpen(s.previous);
  if(opening){const p=progress(.22);visibility=reduced?1:.04+.96*p;shiftY=(1-p)*-7;}
  if(closing&&!reduced&&s.age<.16){panelMode=s.previous;visibility=1-progress(.16);shiftY=-4*progress(.16);}
  if(visibility>0){
    let h=height(panelMode);
    if(s.open&&isOpen(s.previous)&&height(s.previous)!==h)h=mix(height(s.previous),h,progress(.25));
    // Color detail is revealed inside the same shell, with restrained nested depth.
    const panel=isColor(panelMode)?colorPanel(panelMode,h,s,reduced):listPanel(panelMode,h,s,reduced);
    out += `<g data-picker="true" opacity="${f(visibility)}" transform="translate(0 ${f(shiftY)})">${panel}</g>`;
  }
  // A commit handoff is drawn above the panel so the preview travels unobscured.
  if(s.created&&afterCommit<1)out += chip(mix(421,344,transferX),mix(240,191,transferY),'Review',AMBER,{warm:true});
  out += '</g></svg>';
  return out;
}
