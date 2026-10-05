// All native values below were statically recovered from sky.node 26.930.51102.
// Native display-space color and macOS runtime rendering remain unverified.
export const nativeSpec=Object.freeze({
  maxDisplaySizeDefault:200,maxDisplaySizeMin:1,maxDisplaySizeMax:400,browserInitialMaxDisplaySize:400,
  cornerRadius:8,shadowOpacity:.16,shadowRadius:10,shadowOffsetY:-6,
  enterScale:.72,appearanceSpring:{mass:1,stiffness:185,damping:18,initialVelocity:0},
  motionSpring:{mass:1,stiffness:260,damping:32,initialVelocity:0},
  enterOpacityDuration:.2,exitOpacityDuration:.22,enterBlurDuration:.28,exitBlurDuration:.24,appearanceBlur:18,
  completedComputerLifetime:30,iconSize:50,checkSize:18,badgeSize:17.5,badgeRadius:8.75,badgeOffset:18,badgeCheckScale:.5,
  scrimOpacity:.17,iconFadeDuration:.35,fullCheckAt:1,miniCheckAt:2.5,dimOpacity:.65,dimDuration:.25,checkOpacityDuration:.2,
  badgeColor:[0,230/255,45/255,1],badgeShadowOpacity:.8,badgeShadowRadius:4,
  completionSpring:{mass:1,stiffness:170,damping:18,initialVelocity:0},
  panel:{styleMask:128,backing:2,level:0,collectionBehavior:264,opaque:false,hasShadow:false,hidesOnDeactivate:false,movableByWindowBackground:false}
});
export const clampDisplaySize=value=>Number.isFinite(value)?Math.min(400,Math.max(1,value)):200;
export function fitDisplaySize(width,height,maximum=200){const m=clampDisplaySize(maximum);if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return {width:m,height:m};const ratio=m/Math.max(width,height);return {width:Math.max(1,width*ratio),height:Math.max(1,height*ratio)};}
export function springProgress(t,{mass=1,stiffness=170,damping=18}={}){
 if(t<=0)return 0;const w0=Math.sqrt(stiffness/mass),zeta=damping/(2*Math.sqrt(stiffness*mass));
 if(zeta>=1)return 1-Math.exp(-w0*t)*(1+w0*t);
 const wd=w0*Math.sqrt(1-zeta*zeta);return 1-Math.exp(-zeta*w0*t)*(Math.cos(wd*t)+zeta*w0/wd*Math.sin(wd*t));
}
const clamp=x=>Math.min(1,Math.max(0,x));
export function completionAt(seconds,{hasIcon=true}={}){
 const s=nativeSpec;if(seconds<0)return {stage:'hidden',scrim:0,icon:0,dim:0,checkOpacity:0,checkScale:0,badgeOpacity:0,badgeScale:0,offset:0};
 const fullAt=hasIcon?s.fullCheckAt:0;const miniAt=hasIcon?s.miniCheckAt:Infinity;
 const full=seconds>=fullAt,mini=seconds>=miniAt;
 return {stage:mini?'miniCheckmark':full?'fullCheckmark':'applicationIcon',
  scrim:s.scrimOpacity*clamp(seconds/s.iconFadeDuration),icon:hasIcon?clamp(seconds/s.iconFadeDuration):0,
  dim:hasIcon&&full?s.dimOpacity*clamp((seconds-fullAt)/s.dimDuration)*(mini?1-clamp((seconds-miniAt)/s.dimDuration):1):0,
  checkOpacity:full?clamp((seconds-fullAt)/s.checkOpacityDuration):0,
  checkScale:mini?1-.5*springProgress(seconds-miniAt,s.completionSpring):full?.01+.99*springProgress(seconds-fullAt,s.completionSpring):0,
  badgeOpacity:mini?clamp((seconds-miniAt)/s.checkOpacityDuration):0,
  badgeScale:mini?.01+.99*springProgress(seconds-miniAt,s.completionSpring):0,
  offset:mini?s.badgeOffset*springProgress(seconds-miniAt,s.completionSpring):0};
}
