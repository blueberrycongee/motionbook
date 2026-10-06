/** Independently authored state model, using measured package constants. */
export const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const smooth=t=>t*t*(3-2*t);
export const smoother=t=>t*t*t*(t*(t*6-15)+10);
export const COLORS=['#f5f6fb','#7ab1fe','#6dcbf4','#fa994c','#f87915'];
export const CARD_CONFIG=[
  {kind:'pitch',width:.115814,max:166.772,ratio:754/447,x:-.38455,y:-.37928,mx:553.752,my:341.352,rotate:-3,phase:0,out:[-.45,-.4]},
  {kind:'article',width:.074373,max:107.097,ratio:1200/1594,x:.28136,y:-.35326,mx:405.158,my:317.934,rotate:4,phase:4,out:[.45,-.4]},
  {kind:'pottery',width:.105546,max:151.986,ratio:171.598/108.067,x:-.34037,y:.18176,mx:490.133,my:163.584,rotate:4,phase:8,out:[-.45,.4]},
  {kind:'blueprint',width:.077065,max:110.974,ratio:500/658,x:.282595,y:.134228,mx:406.937,my:120.805,rotate:12,phase:6,out:[.45,.4]}
];
export function bezier(x,x1,y1,x2,y2){
  if(x<=0)return 0;if(x>=1)return 1;
  const axis=(t,a,b)=>3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t;
  let lo=0,hi=1; for(let i=0;i<22;i++){let t=(lo+hi)/2; if(axis(t,x1,x2)<x)lo=t;else hi=t;}
  return axis((lo+hi)/2,y1,y2);
}
export function starCount(w,h){return Math.min(11000,Math.max(1000,Math.round(w*h/190)));}
export function createRng(seed=42){return()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};}
export class StarField{
  constructor(width,height){this.reset(width,height);}
  reset(width,height){
    Object.assign(this,{width,height,time:0,px:0,py:0,warp:null,random:createRng()});
    const r=this.random;
    this.stars=Array.from({length:starCount(width,height)},()=>{
      const z=.45+r()*2.8,x=(r()-.5)*width*z*1.06,y=(r()-.5)*height*z*1.06,rank=r(),colorR=r();
      let size=.3+r()*.48;if(rank>=.992)size=1.9+r()*.8;else if(rank>=.88)size=.85+r()*.7;
      const alpha=rank<.88?.15+r()*.35:.4+r()*.5,phase=r()*Math.PI*2;
      return{x,y,z,size,alpha,brightness:alpha,color:COLORS[[.52,.7,.85,.93,1].findIndex(t=>colorR<t)],phase,rate:.3+r()*.65,vx:(r()-.5)*1.6,vy:(r()-.5)*1.3,ox:0,oy:0,sx:x/z+width/2,sy:y/z+height/2};
    });
  }
  beginWarp(){if(this.warp!==null)return;this.warp=0;for(const s of this.stars){s.x=(s.sx-this.width/2)*s.z;s.y=(s.sy-this.height/2)*s.z;s.ox=s.oy=0;}}
  step(delta,pointer={active:false},moving=true){
    const dt=moving?Math.min(.04,Math.max(0,delta)):0,w=this.width,h=this.height;
    this.time+=dt;if(this.warp!==null)this.warp+=dt;
    const warp=this.warp,progress=warp===null?0:clamp(warp/1.5),speed=.006+progress**2.5*6.2;
    const tx=pointer.active&&warp===null?(pointer.x/w-.5)*12:0,ty=pointer.active&&warp===null?(pointer.y/h-.5)*12:0;
    this.px+=(tx-this.px)*(1-Math.exp(-dt*2));this.py+=(ty-this.py)*(1-Math.exp(-dt*2));
    for(const s of this.stars){
      s.z-=dt*speed;if(warp===null){s.x+=s.vx*dt;s.y+=s.vy*dt;}
      if(s.z<.12){s.z=3.15;s.x=(this.random()-.5)*w*(warp===null?3.3:1.45);s.y=(this.random()-.5)*h*(warp===null?3.3:1.45);s.ox=s.oy=0;}
      let x=s.x/s.z+w/2,y=s.y/s.z+h/2,boost=0;
      if(warp===null){
        x+=this.px/s.z+Math.sin(this.time*.19+s.phase)*3;
        y+=this.py/s.z+Math.cos(this.time*.14+s.phase)*2;
        if(x< -40||x>w+40||y< -40||y>h+40){s.x=(this.random()-.5)*w*s.z;s.y=(this.random()-.5)*h*s.z;x=s.x/s.z+w/2;y=s.y/s.z+h/2;}
        let ox=0,oy=0;
        if(pointer.active&&moving){const dx=x-pointer.x,dy=y-pointer.y,d=Math.hypot(dx,dy);if(d<190&&d>.01){const q=1-d/190,f=q*q*54*(pointer.down?1.8:1);ox=dx/d*f;oy=dy/d*f;boost=q*.28;}}
        const follow=1-Math.exp(-dt*(ox||oy?7:2.8));s.ox+=(ox-s.ox)*follow;s.oy+=(oy-s.oy)*follow;x+=s.ox;y+=s.oy;
        s.brightness=Math.min(1,s.alpha*(.78+Math.sin(this.time*s.rate+s.phase)*.22)+boost);
      }
      s.sx=x;s.sy=y;s.radius=Math.min(s.size*(.66+.6/s.z),5);
      s.opacity=warp===null?s.brightness:Math.min(1,s.brightness+(s.alpha-s.brightness)*clamp(warp/.3)+progress*.3);
      s.trail=warp!==null&&warp>.12?s.z/(s.z+Math.min(.5,speed*.046)):1;
    }
  }
}
export function cardPose(index,width,height,time,warp=null,offset={x:0,y:0,angle:0}){
  const c=CARD_CONFIG[index];let cw=Math.min(width*c.width,c.max),x=width/2+Math.sign(c.x)*Math.min(width*Math.abs(c.x),c.mx),y=height/2+Math.sign(c.y)*Math.min(height*Math.abs(c.y),c.my),scale=1.5;
  if(width<=760){const xs=[.10,.72,.13,.70],ys=[.14,.11,.70,.69],ws=[.23,.15,.22,.16];cw=Math.min(width*ws[index],c.max);x=width*xs[index];y=height*ys[index];scale=1.25;}
  if(width<=540){const xs=[.09,.69,.12,.66],ys=[.15,.12,.73,.70],ws=[.30,.21,.28,.22];cw=Math.min(width*ws[index],c.max);x=width*xs[index];y=height*ys[index];}
  if(height<=500){cw=Math.min(cw,width*.12);x=width/2+(index%2===0?-Math.min(width*.46,662.4):Math.min(width*.34,489.6));}
  const ch=cw/c.ratio,p=((time+c.phase)%13)/13,half=p<.5?p*2:2-p*2,drift=bezier(half,.42,0,.58,1);
  let fade=1,exit=0;
  if(warp!==null){exit=bezier(clamp(warp/1.1),.55,.02,.95,.7);fade=1-bezier(clamp((warp-.15)/.55),.25,.1,.25,1);}
  return{kind:c.kind,x:x+cw/2+drift*5*scale+(offset.x||0)+c.out[0]*width*exit,y:y+ch/2-drift*15*scale+(offset.y||0)+c.out[1]*height*exit,width:cw*scale*(1+.6*exit),height:ch*scale*(1+.6*exit),angle:c.rotate+lerp(-1,1.2,drift)+(offset.angle||0)+c.rotate*3*exit,opacity:fade,visible:width>540&&height>460};
}
export function springValue(position,velocity,t){const damping=3.432/2,omega=Math.sqrt(6.76-damping*damping);return Math.exp(-damping*t)*(position*Math.cos(omega*t)+(velocity+damping*position)/omega*Math.sin(omega*t));}
export function limitedVelocity(x,y){const f=Math.min(1,1200/(Math.hypot(x,y)||1));return{x:x*f,y:y*f};}
export function travelDuration(dx,dy){return .38+Math.min(.62,Math.hypot(dx,dy)/1700);}
export function editProgress(age,length){const duration=length>40?4.3:length>20?3.5:length>12?2.9:2.1;return{selected:age>=.22&&age<.7,typing:age>=.7&&age<.7+duration,progress:clamp((age-.7)/duration),duration};}
export function typedText(text,progress){const chars=Array.from(text);let total=0;const ends=chars.map((c,i)=>{total+=/\s/u.test(c)?1.65:/[.,]/u.test(c)?2.8:.72+(i*7%5)*.11;return total;});return chars.filter((_,i)=>ends[i]/total<=progress).join('');}
export function sceneOpacity(time,warp){if(warp!==null)return 1-bezier(clamp((warp-1.65)/.7),.42,0,.58,1);return bezier(clamp(time/.7),.42,0,.58,1);}
