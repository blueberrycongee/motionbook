(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.CalendarScene=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';const W=1318,H=812;
const num=v=>Number(v.toFixed(3));const esc=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function render(state){const g=state.guide;let out=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Calendar event creation"><rect width="1318" height="812" fill="#191919"/>`;
 for(let i=0;i<5;i++){const y=144.5+i*124;out+=`<path d="M390 ${y}H930" stroke="#2c2c2c" stroke-width="4"/><text x="367" y="${y+8.7}" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="26" font-weight="400" fill="#676767">${i+1} PM</text>`;}
 if(state.event){const e=state.event;out+=`<defs><clipPath id="event-clip"><rect x="390" y="${num(e.y)}" width="540" height="${num(Math.max(0,e.h))}" rx="12"/></clipPath></defs><g opacity="${num(e.alpha)}" clip-path="url(#event-clip)"><rect x="390" y="${num(e.y)}" width="540" height="${num(Math.max(0,e.h))}" rx="12" fill="#0082fd"/><text x="406" y="${num(e.baseline||e.y+35)}" font-family="Inter,Arial,sans-serif" font-size="${num(e.font||26)}" fill="#fff">${esc(e.label)}</text><text x="406" y="${num(e.y+71)}" font-family="Inter,Arial,sans-serif" font-size="28" font-weight="500" fill="#fff">New Event</text></g>`;}
 if(g){const c=Math.round(g.c);out+=`<rect x="${num(g.x)}" y="${num(g.y)}" width="${num(g.w)}" height="${num(g.h)}" rx="${num(g.h/2)}" fill="rgb(${c},${c},${c})"/>`;}
 if(state.ring){const r=state.ring;out+=`<circle cx="${num(r.x)}" cy="${num(r.y)}" r="${num(r.r)}" fill="none" stroke="#29518b" stroke-width="6" opacity="${num(Math.min(1,r.alpha))}"/>`;}
 return out+'</svg>';
}
return {W,H,render};
});
