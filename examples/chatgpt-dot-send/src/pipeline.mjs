import {SPEC,clamp,bezier,springForDistance,shapeEase} from './motion.mjs';
export const CSS=Object.freeze({rootFontSize:16,fontSize:16,lineHeight:24,bubblePaddingX:16,bubblePaddingY:10,bubbleRadius:22,listGap:4,rowMargin:12,lastMargin:32,footerBottom:10,composerSingle:44,composerMulti:98,spacingDuration:220,spacingDelta:14});
export const spacingEase=bezier(.2,0,0,1),compressEase=bezier(.65,0,.35,1),recoverEase=bezier(.19,0,.48,1);
export const box=(left,top,width,height)=>({left,top,width,height,right:left+width,bottom:top+height});
export function plan({origin,body,bubble,textWidth,zoom=1,radii=[22,22,22,22]}){
 if(!(zoom>0&&body.width>0&&body.height>0&&bubble.width>0&&bubble.height>0))throw new RangeError('Nonzero dimensions and positive CSS zoom required');
 const width=body.width/zoom,height=body.height/zoom;
 const x=(origin.right-body.right)/zoom,y=(Math.min(origin.top,origin.bottom-body.height)-body.top)/zoom;
 const bw=bubble.width/zoom,bh=bubble.height/zoom;
 const [tl,tr,br,bl]=radii;
 const normal=Math.min(1,bw/(tl+tr)||1,bw/(bl+br)||1,bh/(tl+bl)||1,bh/(tr+br)||1);
 const corners=radii.map(r=>r*normal),leftCap=Math.max(corners[0],corners[3]),rightCap=Math.max(corners[1],corners[2]);
 const extra=Math.max(0,origin.width/zoom-bw),centerWidth=Math.max(1,bw+extra-leftCap-rightCap);
 const scale=clamp(Math.max(width,height)/360);
 return {x,y,width,height,bubbleWidth:bw,bubbleHeight:bh,textWidth:textWidth/zoom,corners,leftCap,rightCap,seam:1/zoom,extra,centerWidth,centerFinalScale:(bw-leftCap-rightCap)/centerWidth,scaleX:Math.max(.5,1-18*scale/width),scaleY:Math.max(.5,1-4*scale/height),spring:springForDistance(Math.hypot(x,y)),travelMs:600,shapeMs:190,holdMs:800};
}
export function sample(p,ms){
 const t=clamp(ms/p.travelMs),progress=p.spring.at(t);
 const squish=t<1/3?compressEase(t*3):t<.9?1-recoverEase((t-1/3)/(.9-1/3)):0;
 const shaped=shapeEase(clamp(ms/p.shapeMs));
 return {translateX:p.x*(1-progress),translateY:p.y*(1-progress),scaleX:1-(1-p.scaleX)*squish,scaleY:1-(1-p.scaleY)*squish,leftShift:-p.extra*(1-shaped),textShift:-p.extra*(1-shaped),centerScale:1+(p.centerFinalScale-1)*shaped,shapeActive:ms<p.shapeMs,textWidthLocked:ms<p.shapeMs,bodyWidthLocked:ms<p.holdMs,sendMarker:ms<p.holdMs};
}
export function waapiTracks(p){return {
 travel:{keyframes:[{translate:`${p.x}px ${p.y}px`},{translate:'0px 0px'}],options:{duration:600,easing:`linear(${p.spring.samples.join(', ')})`}},
 squish:{keyframes:[{transform:'scale(1)',offset:0,easing:'cubic-bezier(0.65, 0, 0.35, 1)'},{transform:`scale(${p.scaleX}, ${p.scaleY})`,offset:1/3,easing:'cubic-bezier(0.19, 0, 0.48, 1)'},{transform:'scale(1)',offset:.9,easing:'cubic-bezier(0.65, 0, 0.35, 1)'},{transform:'scale(1)',offset:1}],options:{duration:600,easing:'linear'}},
 shape:{duration:190,easing:'cubic-bezier(0.73, 0.42, 0.54, 1)',fill:'both'},hold:{duration:800}
};}
export function grouped(a,b){return Boolean(a&&b&&a.self&&b.self&&a.sender===b.sender&&Math.abs(b.time-a.time)<=1800000);}
export function messageMetric(message){
 const textWidth=Math.max(...message.lines.map(s=>[...s].length*CSS.fontSize));
 return {width:message.self?textWidth+32:328,height:message.lines.length*24+(message.self?20:6),textWidth};
}
export function layout(messages,composerHeight,{height=480,right=344,left=16}={}){
 let cursor=height-CSS.footerBottom-composerHeight-CSS.lastMargin;
 const positions=new Map();
 for(let i=messages.length-1;i>=0;i--){const m=messages[i],metric=messageMetric(m);cursor-=metric.height;positions.set(m.id,{...box(m.self?right-metric.width:left,cursor,metric.width,metric.height),textWidth:metric.textWidth});if(i>0)cursor-=CSS.listGap+(grouped(messages[i-1],m)?0:CSS.rowMargin);}
 return positions;
}
export function composerHeight(ms,{newline,send}){
 if(ms<newline)return CSS.composerSingle;
 if(ms<send)return 84+CSS.spacingDelta*spacingEase(clamp((ms-newline)/CSS.spacingDuration));
 return CSS.composerSingle+CSS.spacingDelta*(1-spacingEase(clamp((ms-send)/CSS.spacingDuration)));
}
export const flip=(before,after,ms)=> (before-after)*(1-shapeEase(clamp(ms/190)));
