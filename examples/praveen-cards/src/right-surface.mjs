import {rightSurfaceData as D} from './right-surface-data.mjs';
export const referenceDuration=D.duration;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(a,b,x)=>{const q=clamp((x-a)/(b-a));return q*q*(3-2*q)};
let cachedTime=NaN,cachedRows;
/** Interpolated lofted sections describe the silhouette and the folded lighting.
 * No pixel frame is sampled at runtime; glyphs and colors are regenerated.
 */
function sections(t){
 t=((t%D.duration)+D.duration)%D.duration;
 if(t===cachedTime)return cachedRows;
 let i=0;while(i<D.poses.length-2&&D.poses[i+1].t<t)i++;
 const a=D.poses[i],b=D.poses[Math.min(i+1,D.poses.length-1)],u=clamp((t-a.t)/Math.max(.00001,b.t-a.t));
 cachedRows=a.rows.map((r,y)=>r.map((v,k)=>v+(b.rows[y][k]-v)*u));cachedTime=t;return cachedRows;
}
function evalSection(r,x){
 const [l,h]=r;if(h-l<.005)return 0;
 const edge=smooth(l-.018,l+.012,x)*(1-smooth(h-.012,h+.018,x));if(edge<.001)return 0;
 const u=clamp((x-l)/(h-l),0,1)*2-1;
 let v=r[2]+r[3]*u,T0=1,T1=u;
 for(let j=2;j<6;j++){let T2=2*u*T1-T0;v+=r[j+2]*T2;T0=T1;T1=T2;}
 return clamp(v,0,.40)*edge;
}
export function sculptureDensity(x,y,t){
 const rows=sections(t);let j=0;while(j<D.ys.length-2&&D.ys[j+1]<y)j++;
 const q=clamp((y-D.ys[j])/(D.ys[j+1]-D.ys[j]));return evalSection(rows[j],x)*(1-q)+evalSection(rows[j+1],x)*q;
}
export function sculptureIntensity(x,y,t){return clamp(sculptureDensity(x,y,t)*2.8);}
