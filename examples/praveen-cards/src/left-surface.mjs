import {leftSurfaceData as D} from './left-surface-data.mjs';
export const ribbonPeriod=D.period;
export const leftTimelineDuration=D.clock.duration;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(a,b,x)=>{const q=clamp((x-a)/(b-a));return q*q*(3-2*q)};
function section(segs,x){let out=0;for(const r of segs){const[l,h]=r,fl=r[8],fr=r[9];if(x<l-(fl?.006:0)||x>h+(fr?.006:0))continue;const u=clamp((x-l)/(h-l))*2-1;let v=r[2]+r[3]*u,T0=1,T1=u;for(let i=2;i<6;i++){let T=2*u*T1-T0;v+=r[i+2]*T;T0=T1;T1=T}const edge=(fl?smooth(l-.006,l+.006,x):1)*(fr?1-smooth(h-.006,h+.006,x):1);out=Math.max(out,clamp(v,0,.34)*edge)}return out}
function pose(p,x,j,u){return section(p.rows[j],x)*(1-u)+section(p.rows[j+1],x)*u}
export function ribbonCycleDensity(x,y,phase){const pos=(((phase%D.period)+D.period)%D.period)/D.period*D.count,i=Math.floor(pos),q=pos-i;const yy=clamp(y)*(D.sectionCount-1),j=Math.min(D.sectionCount-2,Math.floor(yy)),u=yy-j;return pose(D.poses[i],x,j,u)*(1-q)+pose(D.poses[(i+1)%D.count],x,j,u)*q}
export function ribbonDensity(x,y,t){const time=((t%D.clock.duration)+D.clock.duration)%D.clock.duration,n=time*D.clock.fps,i=Math.min(D.clock.phase_frames.length-2,Math.floor(n)),u=clamp(n-i),phase=(D.clock.phase_frames[i]*(1-u)+D.clock.phase_frames[i+1]*u)/30;return ribbonCycleDensity(x,y,phase)}
export function ribbonIntensity(x,y,t){return clamp(ribbonDensity(x,y,t)/.30)}
const layers=new WeakMap();
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
export function paintDither(ctx,t){
 const w=327,h=323;let cache=layers.get(ctx);
 if(!cache){const c=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(w,h):typeof document!=='undefined'?document.createElement('canvas'):new ctx.canvas.constructor(w,h);c.width=w;c.height=h;const cctx=c.getContext('2d');cache={c,cctx,data:cctx.createImageData(w,h),field:new Float32Array(193*191)};layers.set(ctx,cache)}
 const pixels=cache.data.data,field=cache.field,fw=193,fh=191;
 for(let fy=0;fy<fh;fy++)for(let fx=0;fx<fw;fx++)field[fy*fw+fx]=ribbonDensity(fx/(fw-1),fy/(fh-1),t);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const sx=x*(fw-1)/(w-1),sy=y*(fh-1)/(h-1),ix=Math.min(fw-2,Math.floor(sx)),iy=Math.min(fh-2,Math.floor(sy)),u=sx-ix,v=sy-iy,j=iy*fw+ix,F=(field[j]*(1-u)+field[j+1]*u)*(1-v)+(field[j+fw]*(1-u)+field[j+fw+1]*u)*v,coverage=clamp(F/.337),threshold=(BAYER[(y&3)*4+(x&3)]+.5)/16;
  const alpha=smooth(threshold-.035,threshold+.035,coverage),i=(y*w+x)*4;
  pixels[i]=255+(40-255)*alpha;pixels[i+1]=255+(131-255)*alpha;pixels[i+2]=255+(50-255)*alpha;pixels[i+3]=255;
 }
 cache.cctx.putImageData(cache.data,0,0);ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(cache.c,120,104,800,790);ctx.restore();
}
