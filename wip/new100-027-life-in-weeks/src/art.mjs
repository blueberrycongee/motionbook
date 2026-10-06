import {TYPE} from './type.mjs';
export const n=value=>Number(value.toFixed(3));
export function homography(q) {
 const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=q;
 const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3,den=dx1*dy2-dx2*dy1;
 const g=Math.abs(den)<1e-10?0:(dx3*dy2-dx2*dy3)/den,h=Math.abs(den)<1e-10?0:(dx1*dy3-dx3*dy1)/den;
 return [x1-x0+g*x1,x3-x0+h*x3,x0,y1-y0+g*y1,y3-y0+h*y3,y0,g,h];
}
export function project(point,q) {
 if(!q)return point;
 const m=Array.isArray(q[0])?homography(q):q,[x,y]=point,d=m[6]*x+m[7]*y+1;
 return [(m[0]*x+m[1]*y+m[2])/d,(m[3]*x+m[4]*y+m[5])/d];
}
export function path(points,fill='#222',q=null,extra='') {
 const m=q?homography(q):null;
 return `<path d="${points.map((point,i)=>{const p=project(point,m);return(i?'L':'M')+n(p[0])+' '+n(p[1]);}).join('')}Z" fill="${fill}" ${extra}/>`;
}
export function rounded(x,y,w,h,r) {
 const points=[];
 for(const[cx,cy,start]of[[x+w-r,y+r,-90],[x+w-r,y+h-r,0],[x+r,y+h-r,90],[x+r,y+r,180]]) {
  for(let i=0;i<=12;i++){const a=(start+i*7.5)*Math.PI/180;points.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}
 }
 return points;
}
export function line(points,color='#999',width=1,extra='') {
 return `<path d="${points.map((p,i)=>(i?'L':'M')+p.map(n).join(' ')).join('')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
}
export function text(str,x,y,size=14,fill='#222',weight='Regular',anchor='start',q=null,W=1,H=1,spacing=0) {
 const font=TYPE[weight],width=[...str].reduce((a,c)=>a+(font[c]?.a||.3)*size+spacing,0)-spacing,m=q?homography(q):null;
 x-=anchor==='middle'?width/2:anchor==='end'?width:0;let d='';
 for(const c of str){const glyph=font[c];if(!glyph){x+=size*.3;continue;}for(const contour of glyph.p)d+=contour.map((p,i)=>{const v=project([(x+p[0]*size)/W,(y+p[1]*size)/H],m);return(i?'L':'M')+n(v[0])+' '+n(v[1]);}).join('')+'Z';x+=glyph.a*size+spacing;}
 return `<path d="${d}" fill="${fill}"/>`;
}
export function partialLine(points,progress) {
 if(progress<=0)return [];if(progress>=1)return points;
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));let remaining=lengths.reduce((a,b)=>a+b,0)*progress,out=[points[0]];
 for(let i=0;i<lengths.length;i++){if(remaining>=lengths[i]){out.push(points[i+1]);remaining-=lengths[i];}else{const t=remaining/lengths[i];out.push(points[i].map((v,j)=>v+(points[i+1][j]-v)*t));break;}}
 return out;
}
