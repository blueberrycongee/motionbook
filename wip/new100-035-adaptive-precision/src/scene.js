(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.CalendarScene=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';const W=1318,H=812;
const num=v=>Number(v.toFixed(3));const esc=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function render(state){const g=state.guide;let out=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Calendar event creation"><rect width="1318" height="812" fill="#191919"/>`;
 for(let i=0;i<5;i++){const y=145+i*124;out+=`<path d="M390 ${y}H930" stroke="#2c2c2c" stroke-width="4"/><text x="309" y="${y+8}" text-anchor="start" font-family="Inter,Arial,sans-serif" font-size="25" font-weight="400" fill="#676767">${i+1} PM</text>`;}
 if(state.ring){const r=state.ring;out+=`<circle cx="${num(r.x)}" cy="${num(r.y)}" r="${num(r.r)}" fill="none" stroke="#1967eb" stroke-width="6" opacity="${num(Math.min(1,r.alpha)*.5)}"/>`;}
 if(state.event){const e=state.event;out+=`<defs><clipPath id="event-clip"><rect x="390" y="${num(e.y)}" width="540" height="${num(Math.max(0,e.h))}" rx="12"/></clipPath></defs><g opacity="${num(e.alpha)}" clip-path="url(#event-clip)"><rect x="390" y="${num(e.y)}" width="540" height="${num(Math.max(0,e.h))}" rx="12" fill="${e.paint?`rgb(${e.paint.map(Math.round).join(',')})`:'#0082fd'}"/><text transform="translate(406 0) scale(.95 1)" x="0" y="${num(e.baseline||e.y+35)}" font-family="Inter,Arial,sans-serif" font-size="${num(e.font||26)}" fill="#fff">${esc(e.label)}</text><text transform="translate(406 0) scale(.95 1)" x="0" y="${num(e.y+71*Math.min(1,Math.max(23,e.font||26)/24.66))}" font-family="Inter,Arial,sans-serif" font-size="${num(28*Math.min(1,Math.max(23,e.font||26)/24.66))}" font-weight="500" fill="#fff">New Event</text></g>`;}
 if(state.event&&state.ring){const r=state.ring;out+=`<circle clip-path="url(#event-clip)" cx="${num(r.x)}" cy="${num(r.y)}" r="${num(r.r)}" fill="none" stroke="#0032f5" stroke-width="6" opacity="${num(Math.min(1,r.alpha)*state.event.alpha*.125)}"/>`;}
 if(g){const c=Math.round(g.c);out+=`<rect x="${num(g.x)}" y="${num(g.y)}" width="${num(g.w)}" height="${num(g.h)}" rx="${num(g.h/2)}" fill="rgb(${c},${c},${c})"/>`;}
 return out+'</svg>';
}
return {W,H,render};
});
