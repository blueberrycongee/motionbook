(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.MinimapScene=api;})(globalThis,function(){
'use strict';const W=1258,H=644,black=new Set([4,11,23,31,41]);const n=v=>Number(v.toFixed(4));
function render(s){let out=`<svg xmlns="http://www.w3.org/2000/svg" width="1258" height="644" viewBox="0 0 1258 644" role="img" aria-label="Forty-nine fixed-position minimap ticks respond to pointer movement"><rect width="1258" height="644" fill="#fbfbfb"/><path d="M181 218H193L187 228Z" fill="#ed250b"/><path d="M187 232V644" stroke="#fb1422" stroke-width="2"/>`;
 for(let i=0;i<49;i++){const h=Math.max(0,s.h[i]),center=black.has(i)?320:326;out+=`<rect x="${204+18*i}" y="${n(center-h/2)}" width="2" height="${n(h)}" fill="${black.has(i)?'#191919':'#b3b3b3'}"/>`;}
 if(s.cursor){const[x,y,sx=16/17,sy=28/27]=s.cursor;out+=`<defs><filter id="pointer-shadow" x="-60%" y="-50%" width="230%" height="230%"><feDropShadow dx="0" dy="2" stdDeviation="1.3" flood-color="#000" flood-opacity=".2"/></filter></defs><path d="M0 0V26L6.5 20.5L11.5 31.5L16 29.5L11 19H21Z" transform="translate(${n(x)} ${n(y)}) scale(${n(sx)} ${n(sy)})" fill="#050505" stroke="white" stroke-width="1.7" stroke-linejoin="round" filter="url(#pointer-shadow)"/>`;}
 return out+'</svg>';
}return{W,H,render};});
