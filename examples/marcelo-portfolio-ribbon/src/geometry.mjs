export const DURATION = 11.75;
export const TILE_COUNT = 10;
export const PANEL_WIDTH = .438;
export const PANEL_GAP = .0048;
export const mod = (v,n) => ((v%n)+n)%n;
export const lerp = (a,b,t) => a+(b-a)*t;
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function liveGeometry(x,velocity=0){
 const edge=Math.max(0,(Math.abs(x-.5)-.235)/.265);
 const wave=clamp(velocity,-2.2,2.2)*.05*Math.sin(2*Math.PI*x);
 return [.322-.213*edge*edge+wave,.709+.213*edge*edge+wave];
}
export function sampleCurve(values,x){
 const u=clamp(x)*(values.length-1),i=Math.floor(u),t=u-i;
 const p0=values[Math.max(0,i-1)],p1=values[i],p2=values[Math.min(values.length-1,i+1)],p3=values[Math.min(values.length-1,i+2)];
 return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t);
}
export function frameAt(t,frames){
 t=clamp(t,0,DURATION);let lo=0,hi=frames.length-1;
 while(lo<hi){const mid=Math.floor((lo+hi+1)/2);if(frames[mid].t<=t)lo=mid;else hi=mid-1;}
 const a=frames[lo],b=frames[Math.min(lo+1,frames.length-1)]; const q=b.t>a.t?(t-a.t)/(b.t-a.t):0;
 return {panelWidth:lerp(a.panelWidth||PANEL_WIDTH,b.panelWidth||PANEL_WIDTH,q),offset:lerp(a.offset,b.offset,q),top:a.top.map((v,i)=>lerp(v,b.top[i],q)),bottom:a.bottom.map((v,i)=>lerp(v,b.bottom[i],q))};
}
export function columnState(x,state){
 const u=mod(x/(state.panelWidth||PANEL_WIDTH)+state.offset,TILE_COUNT),tile=Math.floor(u),local=u-tile;
 const gap=PANEL_GAP/(state.panelWidth||PANEL_WIDTH);
 const [top,bottom]=state.top?[sampleCurve(state.top,x),sampleCurve(state.bottom,x)]:liveGeometry(x,state.velocity||0);
 return {tile,u:clamp((local-gap/2)/(1-gap)),gap:local<gap/2||local>1-gap/2,top,bottom};
}
export class RibbonController{
 constructor(){this.offset=-.013;this.velocity=0;this.dragging=false;this.lastX=0;this.lastTime=0;this.reducedMotion=false;}
 begin(x,t){this.dragging=true;this.lastX=x;this.lastTime=t;this.velocity=0;}
 move(x,t){if(!this.dragging)return;const dx=(this.lastX-x)/PANEL_WIDTH;const dt=Math.max(.008,Math.min(.08,t-this.lastTime));this.offset+=dx;this.velocity=dx/dt;this.lastX=x;this.lastTime=t;}
 end(){this.dragging=false;if(this.reducedMotion)this.velocity=0;}
 wheel(delta){this.offset+=delta;this.velocity=this.reducedMotion?0:delta*20;}
 step(dt){if(!this.dragging){const decay=Math.exp(-Math.min(.05,dt)*7.5);this.offset+=this.velocity*(1-decay)/7.5;this.velocity*=decay;if(Math.abs(this.velocity)<.0001)this.velocity=0;}if(Math.abs(this.offset)>1000)this.offset=mod(this.offset,TILE_COUNT);return{offset:this.offset,velocity:this.reducedMotion?0:this.velocity};}
}
