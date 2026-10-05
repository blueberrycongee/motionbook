/** Source-evidenced native hover state. No speculative hover enlargement or stack expansion. */
export const hoverSpec=Object.freeze({itemTintAlpha:.06,controlsDuration:.12,revealDeadband:.001,controlIdleOpacity:.7,controlHoveredOpacity:1,controlHeight:22,iconWidth:22,buttonGap:1,textFontSize:12,textFontWeight:'semibold',textHorizontalPadding:16,tooltip:'native AppKit; no custom delay established'});
const clamp=x=>Math.max(0,Math.min(1,x));
const inside=(p,r)=>r&&p.x>=r.x&&p.y>=r.y&&p.x<=r.x+r.width&&p.y<=r.y+r.height;
// kCAMediaTimingFunctionEaseInEaseOut == cubic-bezier(.42,0,.58,1).
export function easeInOut(progress){const x=clamp(progress);if(x===0||x===1)return x;let lo=0,hi=1,u=x;for(let i=0;i<25;i++){u=(lo+hi)/2;const px=3*(1-u)*(1-u)*u*.42+3*(1-u)*u*u*.58+u*u*u;if(px<x)lo=u;else hi=u;}return 3*(1-u)*u*u+u*u*u;}
export class HoverController {
 constructor({now=()=>Date.now()/1000}={}){this.now=now;this.from=0;this.target=0;this.changedAt=this.now();this.itemID=null;this.controlID=null;this.controlsVisible=true;this.buttons=[];}
 revealAt(time=this.now()){const elapsed=time-this.changedAt;if(elapsed>=hoverSpec.controlsDuration-1e-12)return this.target;return this.from+(this.target-this.from)*easeInOut(elapsed/hoverSpec.controlsDuration)}
 setReveal(target,time=this.now()){target=clamp(target);if(Math.abs(target-this.target)<hoverSpec.revealDeadband)return false;this.from=this.revealAt(time);this.target=target;this.changedAt=time;return true;}
 setControls({visible=true,buttons=[]}){this.controlsVisible=visible;this.buttons=buttons.map(x=>({...x}));if(this.controlID&&!this.buttons.some(x=>x.id===this.controlID&&!x.hidden))this.controlID=null;}
 controlAt(point,time=this.now()){if(!this.controlsVisible||this.target<=hoverSpec.revealDeadband)return null;return this.buttons.find(x=>!x.hidden&&inside(point,x.frame))?.id??null;}
 update({itemID=null,inControlsHoverFrame=false,inResizeHandle=false,point={x:-Infinity,y:-Infinity},resizing=false},time=this.now()){
  if(resizing)return this.snapshot(time);
  this.setReveal(itemID!==null||(this.controlsVisible&&inControlsHoverFrame)?1:0,time);this.itemID=itemID;this.controlID=inResizeHandle?null:this.controlAt(point,time);return this.snapshot(time);
 }
 clear(time=this.now()){this.setReveal(0,time);this.itemID=null;this.controlID=null;return this.snapshot(time);}
 hitTest({point,passthroughFrame,resizeHandleFrame,items=[]},time=this.now()){
  if(inside(point,passthroughFrame))return null;
  if(inside(point,resizeHandleFrame))return {kind:'resize'};
  const item=[...items].filter(x=>x.visible!==false&&!x.exiting).sort((a,b)=>(b.zIndex??0)-(a.zIndex??0)).find(x=>inside(point,x.frame));if(item)return {kind:'item',id:item.id};
  const control=this.controlAt(point,time);return control?{kind:'control',id:control}:null;
 }
 snapshot(time=this.now()){return {itemID:this.itemID,controlID:this.controlID,reveal:this.revealAt(time),revealTarget:this.target,tintAlpha:this.itemID?hoverSpec.itemTintAlpha:0,itemScale:1,controlsVisible:this.controlsVisible,buttons:this.buttons.map(x=>({...x,opacity:x.id===this.controlID?1:.7}))};}
}
export const contrastSpec=Object.freeze({sampleWidth:24,sampleHeight:12,sampleInterval:.05,alphaCutoff:.05,whiteToBlack:.74,blackToWhite:.56,minimumColorDwell:.24,requiredDarkSamples:3,glyphTransition:.16,luminanceWeights:[.2126,.7152,.0722]});
export function sampledLuminance(pixels,{premultiplied=true}={}){let total=0,weight=0;for(let i=0;i+3<pixels.length;i+=4){const a=pixels[i+3]/255;if(a<=.05)continue;const m=premultiplied?1/a:1;const r=Math.min(1,pixels[i]/255*m),g=Math.min(1,pixels[i+1]/255*m),b=Math.min(1,pixels[i+2]/255*m);total+=(r*.2126+g*.7152+b*.0722)*a;weight+=a;}return weight?Math.max(0,Math.min(1,total/weight)):null;}
export class ContrastController {
 constructor({now=()=>Date.now()/1000,initial='white'}={}){this.now=now;this.color=initial;this.fromGray=initial==='white'?1:0;this.changedAt=-Infinity;this.lastSample=-Infinity;this.darkSamples=0;}
 sample(luminance,time=this.now(),{force=false}={}){
  if(!force&&time-this.lastSample<.05-1e-12)return this.snapshot(time);this.lastSample=time;if(luminance===null||!Number.isFinite(luminance))return this.snapshot(time);
  let next=this.color;
  if(this.color==='white'){this.darkSamples=0;if(luminance>.74)next='black';}
  else if(luminance<.56){if(time-this.changedAt>=.24){this.darkSamples++;if(this.darkSamples>=3)next='white';}}
  else this.darkSamples=0;
  if(next!==this.color){this.fromGray=this.snapshot(time).glyphGray;this.color=next;this.changedAt=time;this.darkSamples=0;}
  return this.snapshot(time);
 }
 snapshot(time=this.now()){const target=this.color==='white'?1:0,progress=time-this.changedAt>=.16-1e-12?1:clamp((time-this.changedAt)/.16);return {color:this.color,textGray:target,glyphGray:this.fromGray+(target-this.fromGray)*easeInOut(progress),darkSamples:this.darkSamples,lastSample:this.lastSample};}
}
/** Uses measured text width, never assumes a font has a platform-independent width. */
export function controlGeometry({placement='pinned',textWidth=24,above=false}){
 const home=placement==='home',pet=placement==='pet',firstWidth=home?Math.max(22,Math.ceil(textWidth)+16):22;
 const x=above?(home?-8:-4):6,y=above?-24:6,buttons=[{id:home?'hide-menu':'return-home',x,y,width:firstWidth,height:22}];
 if(!pet)buttons.push({id:'send-pet',x:x+firstWidth+1,y,width:22,height:22});
 const width=firstWidth+(pet?0:23),fog={x:x-18,y:y-10,width:width+36,height:42,radius:21};
 return {buttons,row:{x,y,width,height:22},fog,backdrop:{x:fog.x-22,y:fog.y-22,width:fog.width+44,height:fog.height+44},blurRadius:6,maskBlurRadius:14};
}
