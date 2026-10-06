// Independently drawn pointer silhouettes; the two-triangle drag pointer is observed in the source.
export function pointer(p){if(!p)return'';const [l,t,r,b]=p.bbox,w=r-l,h=b-t;let d;
 if(p.kind==='resize')d='M0 6 L12.8 0 L12.8 12 Z M25 0 L37 6 L25 12 Z';else d='M0 0 L0 23 L5.7 18.7 L10.5 29 L15 26.8 L10.6 17 L17 17 Z';
 const sx=w/(p.kind==='resize'?37:17),sy=h/(p.kind==='resize'?12:29);return `<g transform="translate(${l} ${t}) scale(${sx} ${sy})"><path d="${d}" fill="#111" stroke="#111" stroke-width="3" stroke-linejoin="round" opacity=".25" transform="translate(0 2)" filter="url(#pointerBlur)"/><path d="${d}" fill="none" stroke="white" stroke-width="4" stroke-linejoin="round"/><path d="${d}" fill="#050505" stroke="#050505" stroke-width=".4" stroke-linejoin="round"/></g>`;
}
