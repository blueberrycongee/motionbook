import {spec,stateAt} from './model.mjs';
const n=v=>Number(v.toFixed(4));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const measuredWidths={'Start by typing...':358.96875,'Request approval':312.453125,'Connect apps':250.375,'Select a project':279.984375,'Unrestricted access':359.875};
const text=(x,y,s,size,color,width)=>`<text transform="translate(${x} ${y}) scale(${n(width&&measuredWidths[s]?width/measuredWidths[s]:1)} 1)" x="0" y="0" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="400" fill="${color}">${esc(s)}</text>`;
const gray=v=>{const b=Math.round(v).toString(16).padStart(2,'0');return '#'+b+b+b;};
const hand=(x,y,scale=1,angle=0,shade=145,shrink=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><g transform="translate(22 22) scale(${n(shrink)}) translate(-22 -22) rotate(${n(angle)} 22 40)"><path d="M12 21V8.8a3 3 0 016 0v10.5V5.6a3 3 0 016 0v14.1V8.5a3 3 0 016 0v13.2V14a3 3 0 016 0v15.1c0 9-5 13.1-13 13.1-7.4 0-10.5-3.9-14.7-10.2L3 24.7c-2.7-4 1.3-7 4.2-4.1l4.8 5.1" fill="none" stroke="${gray(shade)}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
function sweepGradient(id,s,x,scale){return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${n((s.center-s.halfWidth-x)/scale)}" x2="${n((s.center+s.halfWidth-x)/scale)}"><stop stop-color="${gray(s.base)}"/><stop offset=".5" stop-color="${gray(s.peak)}"/><stop offset="1" stop-color="${gray(s.base)}"/></linearGradient>`;}
const shield=(x,y)=>`<g transform="translate(${x} ${y})" fill="none" stroke="#dc3b0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 1 33 7v12c0 8.5-6.4 14.5-15 18C9.4 33.5 3 27.5 3 19V7Z"/><path d="M18 11v9"/><circle cx="18" cy="26.5" r="1.3" fill="#dc3b0b" stroke="none"/></g>`;
function logos(offsets=[0,0,0]){return `<g transform="translate(296 761)"><g transform="translate(0 ${n(offsets[0])})">
<path d="M4 4V28" stroke="#e4274c" stroke-width="7" stroke-linecap="round"/><path d="M30 4V28" stroke="#27b7e9" stroke-width="7" stroke-linecap="round"/><path d="M4 5 17 16 30 5" fill="none" stroke="#ed2948" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="m25 9 5-4" stroke="#f4be27" stroke-width="7" stroke-linecap="round"/>
</g><g transform="translate(52 ${n(-1+offsets[1])})"><g fill="#2fc2d4"><rect x="8" y="0" width="7" height="15" rx="3.5"/><rect x="0" y="7" width="7" height="7" rx="3.5"/></g><g fill="#26b67a"><rect x="18" y="8" width="15" height="7" rx="3.5"/><rect x="18" y="0" width="7" height="7" rx="3.5"/></g><g fill="#e64689"><rect x="0" y="18" width="15" height="7" rx="3.5"/><rect x="8" y="26" width="7" height="7" rx="3.5"/></g><g fill="#ecb52f"><rect x="18" y="18" width="7" height="15" rx="3.5"/><rect x="26" y="18" width="7" height="7" rx="3.5"/></g></g>
<g transform="translate(102 ${n(-2+offsets[2])})"><path d="m3 13 12-11 12 11" fill="none" stroke="url(#chevron)" stroke-width="7"/><path d="M2 24q13 14 26 0" fill="none" stroke="url(#smile)" stroke-width="7"/></g></g>`;}
function folder(){return `<g transform="translate(297 449)"><path d="M5 14V7q0-6 6-6h6l5 6h7q7 0 7 7v13H5" fill="#0aa5ed"/><path d="M3 15h30q7 0 5 7l-2 9q-1 4-6 4H11q-6 0-7-5L1 20q-1-5 2-5" fill="#38c7ed"/></g>`;}
function pointer(t){
 const pts=[[0,775,990],[.2,726,930],[.43,556,783],[.72,556,783],[1.18,580,1048],[2.7,580,1048],[3.06,550,814],[3.34,542,782],[3.61,542,782],[4.10,695,930],[4.55,730,945],[6.7,730,945]];
 let i=0;while(i<pts.length-2&&t>pts[i+1][0])i++;const a=pts[i],b=pts[i+1],p=Math.max(0,Math.min(1,(t-a[0])/(b[0]-a[0])));let x=a[1]+(b[1]-a[1])*p,y=a[2]+(b[2]-a[2])*p;
 return `<path transform="translate(${n(x)} ${n(y)})" d="M0 0 0 27 7 21 13 32 18 29 12 18 22 18Z" stroke="white" stroke-width="2.2" fill="#121212" stroke-linejoin="round"/>`;
}
export function renderScene(input=0,{cursor=false}={}){
 const s=typeof input==='number'?stateAt(input):input,y=spec.cardY+spec.travel*s.connect;
 const apps=s.connectText,request=s.approvalText;
 const shift=12*s.approval,requestY=spec.cardY+237,finalX=366;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1090" height="1238" viewBox="0 0 1090 1238" role="img" aria-label="Reconstructed chat composer animation">
 <defs>${sweepGradient('appsSweep',apps,444,246/measuredWidths['Connect apps'])}${sweepGradient('approvalSweep',request,422,307/measuredWidths['Request approval'])}<linearGradient id="chevron" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#e32cec"/><stop offset="1" stop-color="#ffb142"/></linearGradient><linearGradient id="smile"><stop stop-color="#803bff"/><stop offset="1" stop-color="#39c8ec"/></linearGradient><filter id="shadow" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="3" stdDeviation="2.2" flood-color="#777" flood-opacity=".11"/></filter><filter id="requestBlur"><feGaussianBlur stdDeviation="${n(s.requestBlur)}"/></filter><filter id="grantedBlur"><feGaussianBlur stdDeviation="${n(s.grantedBlur)}"/></filter></defs>
 <rect width="1090" height="1238" fill="#faf8f6"/>
 <path d="M241 0V1238M0 416H1090M0 827H1090" fill="none" stroke="#e9e7e4" stroke-width="2" stroke-dasharray="12 13"/>
 <rect x="241" y="416" width="1250" height="411" rx="55" fill="#eeecea"/>
 <g opacity="${n(s.appOpacity)}">${logos(s.iconY)}${text(444,790,'Connect apps',38,apps.active?'url(#appsSweep)':gray(apps.base),246)}</g>
 <g opacity="${n(s.projectOpacity)}">${folder()}${text(355,480,'Select a project',38,'#888784',268)}</g>
 <g transform="translate(0 ${n(y-spec.cardY)})">
 <rect x="241.8" y="416.5" width="1250" height="305" rx="55" fill="#fff" stroke="#edebea" stroke-width="1.6" filter="url(#shadow)"/>
 ${text(296,522,'Start by typing...',46,'#bdbdbb',341)}
 <path transform="translate(0 ${n(11*s.connect)})" d="M303 640h27M316.5 626.5v27" fill="none" stroke="#92928f" stroke-width="2.8" stroke-linecap="round"/>
 <rect x="366" y="617" width="${n(389+35*s.approval)}" height="68" rx="21" fill="#fce8e4" opacity="${n(s.approval)}"/>
 <g opacity="${n(s.requestOpacity)}" filter="url(#requestBlur)" transform="translate(${n(shift)} ${n(3*s.approval+11*s.connect)})">${hand(369,620,.87,s.handRotation,request.base,s.handScale)}${text(422,653,'Request approval',38,request.active?'url(#approvalSweep)':gray(request.base),307)}</g>
 <g opacity="${n(s.grantedOpacity)}" transform="translate(${n((1-s.approval)*8)} ${n((1-s.approval)*6)})"><g transform="translate(400 650) scale(${n(s.shieldScale)}) translate(-400 -650)">${shield(382,632)}</g><g filter="url(#grantedBlur)">${text(434,663,'Unrestricted access',38,'#dc3b0b',342)}</g></g>
 </g>
 ${cursor?pointer(s.t):''}
 </svg>`;
}
