import {StarField,cardPose,sceneOpacity,clamp,bezier,smoother,travelDuration} from './motion.mjs';
import {DOC_SIZES,paintArtwork,jobState,roundRect,text,NAMES,NAME_COLORS} from './artwork.mjs';
export function transformPoint(pose,x,y){const a=pose.angle*Math.PI/180;return{x:pose.x+x*Math.cos(a)-y*Math.sin(a),y:pose.y+x*Math.sin(a)+y*Math.cos(a)};}
export class SpaceScene{
  constructor(width,height,createCanvas){this.createCanvas=createCanvas;this.glows=new Map();this.cardSurfaces=[];this.resize(width,height);}
  resize(width,height){this.width=width;this.height=height;this.field=new StarField(width,height);this.time=0;this.labels=[];this.cardSurfaces=[];this.lastPoses=[];}
  beginWarp(){this.field.beginWarp();}
  step(dt,pointer={},moving=true){if(moving)this.time+=Math.min(.04,Math.max(0,dt));this.field.step(dt,pointer,moving);}
  glow(color){if(this.glows.has(color))return this.glows.get(color);const s=this.createCanvas(64,64),c=s.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);for(const [at,col] of [[0,'#fff'],[.045,'#fff'],[.1,color+'e8'],[.22,color+'66'],[.45,color+'20'],[1,color+'00']])g.addColorStop(at,col);c.fillStyle=g;c.fillRect(0,0,64,64);this.glows.set(color,s);return s;}
  draw(c,{pointer={active:false},offsets=[],focus=-1,reduced=false,hover=false}={}){
    const w=this.width,h=this.height,t=this.time,warp=this.field.warp;
    c.clearRect(0,0,w,h);c.fillStyle='#000';c.fillRect(0,0,w,h);c.save();c.globalAlpha=sceneOpacity(t,warp);
    for(const s of this.field.stars){if(s.sx< -140||s.sx>w+140||s.sy< -140||s.sy>h+140)continue;c.globalAlpha=sceneOpacity(t,warp)*s.opacity;const radius=s.radius||s.size;
      if(s.trail<1){c.strokeStyle=s.color;c.lineWidth=Math.min(2,radius*.7);c.lineCap='round';c.beginPath();c.moveTo(w/2+(s.sx-w/2)*s.trail,h/2+(s.sy-h/2)*s.trail);c.lineTo(s.sx,s.sy);c.stroke();}
      if(s.size>.84){const n=radius*9;c.drawImage(this.glow(s.color),s.sx-n/2,s.sy-n/2,n,n);}else{c.fillStyle=s.color;c.fillRect(s.sx,s.sy,radius,radius);}
    }
    const sceneAlpha=sceneOpacity(t,warp);c.globalAlpha=sceneAlpha;
    const vignette=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.18,w/2,h/2,Math.hypot(w,h)/2);vignette.addColorStop(0,'#0000');vignette.addColorStop(1,'#0002');c.fillStyle=vignette;c.fillRect(0,0,w,h);
    const copyAlpha=warp===null?1:1-bezier(clamp(warp/.4),.42,0,1,1);c.save();c.globalAlpha=sceneAlpha*copyAlpha;const shrink=warp===null?1:1-.06*bezier(clamp(warp/.4),.42,0,1,1);c.translate(w/2,h/2);c.scale(shrink,shrink);
    if(warp!==null)c.filter=`blur(${(1-copyAlpha)*7}px)`;
    const compact=w<=540||h<=500,heading=compact?36:44;
    text(c,'欢迎来到 Space',0,-84,heading,'#fefefd',400,'center');
    if(w<650){text(c,'你与 ChatGPT 和团队一起创作、',0,-23,16,'#d4d4d4',400,'center');text(c,'分享和协作的全新空间',0,1,16,'#d4d4d4',400,'center');}else text(c,'你与 ChatGPT 和团队一起创作、分享和协作的全新空间',0,-23,16,'#d4d4d4',400,'center');
    const by=compact?62:44,bw=148,bh=42;this.button={x:w/2-bw/2,y:h/2+by,width:bw,height:bh};
    c.save();c.translate(0,by+bh/2);c.scale(hover?1.05:1,hover?1.05:1);roundRect(c,-bw/2,-bh/2,bw,bh,24,'#fff');text(c,'继续前往空间',0,-12,16,'#111',600,'center');c.restore();c.restore();
    this.lastPoses=[];const jobBoxes=[];
    for(let i=0;i<4;i++){
      const pose=cardPose(i,w,h,t,warp,offsets[i]);this.lastPoses.push(pose);if(!pose.visible||pose.opacity<=0)continue;
      const [dw,dh]=DOC_SIZES[i],scale=pose.width/dw,j=jobState(i,t);j.color=i===0?'#60b4ff':NAME_COLORS[i];
      c.save();c.globalAlpha=sceneAlpha*pose.opacity;c.translate(pose.x,pose.y);c.rotate(pose.angle*Math.PI/180);c.translate(-pose.width/2,-pose.height/2);c.beginPath();c.roundRect(0,0,pose.width,pose.height,7);c.clip();c.scale(scale,pose.height/dh);const box=paintArtwork(c,i,j,scale,t);c.restore();
      if(focus===i){c.save();c.strokeStyle='#fff';c.lineWidth=2;c.translate(pose.x,pose.y);c.rotate(pose.angle*Math.PI/180);c.strokeRect(-pose.width/2-5,-pose.height/2-5,pose.width+10,pose.height+10);c.restore();}
      const anchor=box?transformPoint(pose,-pose.width/2+(box[0]+box[2])*scale,-pose.height/2+(box[1]+box[3])*pose.height/dh):transformPoint(pose,pose.width/2-5,pose.height/2-5);jobBoxes.push({...anchor,index:i});
    }
    if(warp===null||warp<.3){c.globalAlpha=sceneAlpha*(warp===null?1:1-clamp(warp/.3));this.drawLabels(c,jobBoxes,t,w,h);}
    if(pointer.active&&warp===null){const x=clamp(pointer.x+12,4,w-44),y=clamp(pointer.y+18,4,h-40);roundRect(c,x,y,39,35,[0,8,8,8],'#fff');text(c,'你',x+19.5,y+7,18,'#111',400,'center');}
    c.restore();
  }
  drawLabels(c,anchors,time,w,h){
    const small=w<=760,fs=small?13:16,padx=small?8:10,pady=small?3:6;
    const obstacles=[];
    for(let i=0;i<5;i++){
      let a=anchors[i]||anchors[1]||{x:w*(i<2?.15:.75),y:h*(i%2?.25:.75)};
      if(i===4){const p=this.lastPoses[1];a=p?.visible?transformPoint(p,-p.width/2,-p.height/2+32):{x:w*.72,y:h*.28};}
      const name=NAMES[i];c.font=`500 ${fs}px Arial, "Noto Sans CJK SC", sans-serif`;const labelW=c.measureText(name).width+2*padx+(i===0?24:0),labelH=fs+4+2*pady;
      const options=[[1,1],[-1,1],[1,-1],[-1,-1]].map(([sx,sy])=>{const x=clamp(a.x+(sx>0?8:-labelW-8),4,w-labelW-4),y=clamp(a.y+(sy>0?8:-labelH-8),4,h-labelH-4);const overlap=obstacles.reduce((sum,b)=>sum+Math.max(0,Math.min(x+labelW,b.x+b.w)-Math.max(x,b.x))*Math.max(0,Math.min(y+labelH,b.y+b.h)-Math.max(y,b.y)),0);return{x,y,score:overlap*.15+Math.hypot(x-a.x,y-a.y),sx,sy};});
      options.sort((a,b)=>a.score-b.score);const p=options[0],prev=this.labels[i];let x=p.x,y=p.y;
      if(prev){const f=1-Math.exp(-1/60/.09);x=prev.x+(x-prev.x)*f;y=prev.y+(y-prev.y)*f;}
      this.labels[i]={x,y};obstacles.push({x,y,w:labelW,h:labelH});roundRect(c,x,y,labelW,labelH,[p.sx>0&&p.sy>0?0:9,p.sx<0&&p.sy>0?0:9,p.sx<0&&p.sy<0?0:9,p.sx>0&&p.sy<0?0:9],NAME_COLORS[i]);
      if(i===0){c.save();c.translate(x+padx+9,y+labelH/2);c.strokeStyle='#363636';c.lineWidth=1.15;for(let j=0;j<6;j++){c.rotate(Math.PI/3);c.beginPath();c.ellipse(3,0,5,3,0,0,Math.PI*2);c.stroke();}c.restore();}
      text(c,name,x+padx+(i===0?24:0),y+pady,fs,i===0||i>=3?'#101010':'white',500);
    }
  }
  hitCard(x,y){for(let i=3;i>=0;i--){const p=this.lastPoses[i];if(!p?.visible)continue;const a=-p.angle*Math.PI/180,dx=x-p.x,dy=y-p.y,lx=dx*Math.cos(a)-dy*Math.sin(a),ly=dx*Math.sin(a)+dy*Math.cos(a);if(Math.abs(lx)<=p.width/2&&Math.abs(ly)<=p.height/2)return i;}return -1;}
}
