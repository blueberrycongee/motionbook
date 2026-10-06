// Independently drawn pointer silhouettes; recorded positions are scalar data.
export function pointer(p){if(!p)return'';const wrap=s=>`<g transform="translate(${p.x} ${p.y})">${s}</g>`;const arrow='<path d="M0 0 L0 16 L4 12 L7.2 19 L10 17.6 L6.8 10.7 L12.7 10.5 Z" fill="white" stroke="#121210" stroke-width="1.25" stroke-linejoin="round"/>';
 if(p.kind==='arrow'||p.kind==='double-arrow')return wrap(`<g transform="scale(.85)">${arrow}${p.kind==='double-arrow'?`<g transform="translate(0 -19)">${arrow}</g>`:''}</g>`);
 if(p.kind==='ibeam')return wrap('<path d="M-3.5 -8 Q0 -6.3 3.5 -8 M0 -7.4 V8 M-3.5 8 Q0 6.3 3.5 8" fill="none" stroke="#eee" stroke-width="2.5"/><path d="M-3.5 -8 Q0 -6.3 3.5 -8 M0 -7.4 V8 M-3.5 8 Q0 6.3 3.5 8" fill="none" stroke="#151511" stroke-width="1"/>');
 const scale=p.kind==='hand'?.84:.94,rotation=p.kind==='hand'?-9:0;
 return wrap(`<g transform="rotate(${rotation}) scale(${scale})"><path d="M0 1 C-.7 -2.7 3 -3 3.8 .2 L4.4 7 C5 4.5 7.9 5.2 8 7.6 C8.7 5.1 11.3 6.3 11.4 8.7 C12.4 6.5 15 8.4 14.6 11 L13.1 17.3 L10 21 L3.1 20.7 L-5.3 11.7 C-8.8 7.9 -5.9 5.3 -3.8 8 L-.4 11.5 Z" fill="white" stroke="#161613" stroke-width="1.5" stroke-linejoin="round"/><path d="M3.5 12 V16.5 M7.4 11.7 V17.3 M11 12 V16.7" fill="none" stroke="#3b3b35" stroke-width="1.4" stroke-linecap="round"/></g>`);
}
