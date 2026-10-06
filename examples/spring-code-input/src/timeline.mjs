import {COLLAPSE_CENTERS_1,COLLAPSE_CENTERS_2} from './collapse-layout.mjs';
import {ERROR_DIGITS,VERIFY_INSET_X} from './error-motion.mjs';
import {ENTRY_TILES} from './entry-tiles.mjs';
import {CONTROLS} from './motion-data.mjs';
export const DURATION=8.883333;
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const mix=(a,b,t)=>a+(b-a)*t;
export const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
export function sample(t){
 let lo=0,hi=CONTROLS.length-1;
 while(lo+1<hi){const m=(lo+hi)>>1;if(CONTROLS[m][0]<=t)lo=m;else hi=m;}
 const a=CONTROLS[lo],b=CONTROLS[hi],p=clamp((t-a[0])/(b[0]-a[0]));
 const lerpArr=(x,y)=>x&&y?x.map((n,i)=>Array.isArray(n)?lerpArr(n,y[i]):mix(n,y[i],p)):(p<.5?x:y);
 return [t,mix(a[1],b[1],p),mix(a[2],b[2],p),lerpArr(a[3],b[3]),mix(a[4],b[4],p),lerpArr(a[5],b[5]),lerpArr(a[6],b[6])];
}

function sampleControls(rows,t){let i=0;while(i+1<rows.length&&rows[i+1][0]<t)i++;const a=rows[i],b=rows[Math.min(i+1,rows.length-1)],p=clamp((t-a[0])/(b[0]-a[0]||1));const lerp=(x,y)=>Array.isArray(x)?x.map((v,j)=>lerp(v,y[j])):mix(x,y,p);return lerp(a[1],b[1]);}
const FIRST=[1.10,1.383333,1.75,2.00,2.083333,2.55];
const SECOND=[5.233333,5.466667,5.733333,5.983333,6.266667,6.533333];
function digitStates(code,ts,t,clear=false){return [...code].map((char,i)=>{
 let p=clamp((t-ts[i])/.13),exit=clear?1-Math.pow(1-clamp((t-(4.30+(5-i)*.05))/.07),3):0;
 return {char,alpha:smooth(p)*(1-exit),dy:36*(1-smooth(p))+36*exit,blur:7*(1-p)+9*exit};
});}
export function frameAt(t){
 t=clamp(t,0,DURATION);const c=sample(t);const width=c[2]-c[1]+5;
 const s={t,cx:733,cy:496,width,height:146,inset:14,slots:0,label:'Enter code',labelAlpha:1,labelBlur:0,labelScale:1,slotBlur:0,green:0,error:0,shine:0,ring:null,ringAlpha:0,ringBlur:0,caret:0,digits:[],boxes:null,pointer:c[6]};
 if(t<.3)return s;
 if(t<.416667){s.labelAlpha=1-smooth((t-.30)/.095);s.labelBlur=24*smooth((t-.30)/.09);s.labelScale=mix(1,.65,smooth((t-.30)/.12));return s;}
 s.labelAlpha=0;
 if(t<2.766667){s.slots=smooth((t-.40)/.033333);s.slotBlur=10*(1-smooth((t-.416667)/.09));s.digits=digitStates('213212',FIRST,t);s.ringAlpha=smooth((t-.433333)/.15)*(1-smooth((t-2.55)/.14));s.ringBlur=8*(1-smooth((t-.47)/.14))+14*Math.sqrt(clamp((t-2.55)/.1));s.caret=(t>=.55&&t<1.1||t>1.65&&t<2.18)?1:0;}
 else if(t<3.15){s.collapseAge=t-2.766667;s.slots=1-smooth((s.collapseAge-.13)/.07);s.collapse=clamp((744-width)/544);s.slotBlur=0;s.digits=digitStates('213212',FIRST,t);s.label='Verifying';s.labelAlpha=smooth((t-2.92)/.16);s.labelBlur=18*(1-smooth((t-2.92)/.16));}
 else if(t<3.95){s.label='Verifying';s.labelAlpha=1;s.inset=c[4];}
 else if(t<4.7){s.label='Verifying';s.labelAlpha=1-smooth((t-3.95)/.09);s.labelBlur=24*smooth((t-3.95)/.09);s.slots=smooth((t-3.983333)/.016667);s.tileAlpha=smooth((t-4.0)/.14);s.contentAlpha=Math.max(smooth((t-3.97)/.14),.55*(1-smooth((t-4.0)/.05)))*(.8+.2*smooth((t-4.0)/.17));s.clusterInset=Math.max(0,Math.min(28,(744-width)/16));s.entryError=true;s.collapse=clamp((744-width)/544);s.collapseAge=.145*(1-smooth((t-4.0)/.17));s.slotBlur=0;s.error=1-smooth((t-4.6)/.20);s.digits=digitStates('213212',FIRST,t,true);s.cx=(c[1]+c[2])/2;s.ringAlpha=smooth((t-4.6)/.16);s.ringBlur=10*(1-smooth((t-4.633333)/.17));}
 else if(t<6.716667){s.slots=1;s.error=1-smooth((t-4.6)/.2);s.digits=digitStates('123456',SECOND,t);s.ringAlpha=smooth((t-4.6)/.16)*(1-smooth((t-6.533333)/.14));s.ringBlur=10*(1-smooth((t-4.633333)/.17))+14*Math.sqrt(clamp((t-6.533333)/.1));s.caret=(t>4.933333&&t<5.65||t>6.083333&&t<6.54)?1:0;}
 else if(t<7.1){s.collapseAge=Math.max(0,t-6.75);s.collapseCycle=2;s.slots=1-smooth((s.collapseAge-.13)/.07);s.collapse=clamp((744-width)/544);s.slotBlur=0;s.digits=digitStates('123456',SECOND,t);s.label='Verifying';s.labelAlpha=smooth((t-6.88)/.16);s.labelBlur=18*(1-smooth((t-6.88)/.16));}
 else if(t<7.9){s.label='Verifying';s.labelAlpha=1;s.inset=c[4];}
 else{s.label='Verified';s.labelAlpha=1;s.green=1-Math.pow(1-clamp((t-7.90)/.25),3);s.verifyMorph=smooth((t-7.9)/.06);s.suffixIn=smooth((t-7.955)/.105);s.labelBlur=0;s.shine=clamp((t-8.32)/.24);}
 if(s.slots){s.boxes=c[5];if(c[3])s.ring=c[3];else if(s.ringAlpha){const idx=t<2.77?Math.min(5,FIRST.filter(x=>t>=x).length):t<5.23?0:Math.min(5,SECOND.filter(x=>t>=x).length);s.ring=[376+idx*122,438,106,116];}}
 if(t>=.416667&&t<=.666667){let i=0;while(i+1<ENTRY_TILES.length&&ENTRY_TILES[i+1][0]<t)i++;const a=ENTRY_TILES[i],b=ENTRY_TILES[Math.min(i+1,ENTRY_TILES.length-1)],q=clamp((t-a[0])/(b[0]-a[0]||1));s.entryTiles=a[1].length===b[1].length?a[1].map((v,j)=>v.map((x,k)=>mix(x,b[1][j][k],q))):(q<.5?a[1]:b[1]);}
 if((t>.90&&t<2.766667)||(t>4.5&&t<6.716667))s.boxes=Array.from({length:6},(_,i)=>[376+122*i,482+122*i]);
 if(s.label==='Verifying'&&s.labelAlpha>.2){const u=t<4? t-3 : t-6.983333;const keys=[[0,20],[.05,15],[.116667,10],[.183333,10],[.25,13],[.35,14],[.45,14]];if(u>=0&&u<.45){let i=0;while(i+1<keys.length&&keys[i+1][0]<u)i++;s.inset=mix(keys[i][1],keys[i+1][1],smooth((u-keys[i][0])/(keys[i+1][0]-keys[i][0])));}}
 if(t>.433333&&t<.583333&&s.ring){s.ring=[Math.max(375,c[1]+17),438,106,116];}
 if(s.label==='Verifying'){const u=t<4?t-3.07:t-7.053333;if(u>=0&&u<.10)s.labelBlur=Math.max(s.labelBlur,.9*(1-smooth(u/.10)));}
 if(t>=2.75&&t<=2.95)s.cellCenters=sampleControls(COLLAPSE_CENTERS_1,t);if(t>=6.733333&&t<=6.933333)s.cellCenters=sampleControls(COLLAPSE_CENTERS_2,t);
 if(s.collapseAge!=null){s.cellBlur=[0,.016,.05,.05,.016,0].map(delay=>Math.max(0,s.collapseAge-delay)*150);s.cellAlpha=s.entryError?[.075,.09,.105,.105,.09,.075].map(delay=>1-smooth((s.collapseAge-delay)/.09)):[0,.016,.05,.05,.016,0].map((delay,i)=>1-smooth((s.collapseAge-delay)/(i===2||i===3?.15:.10)));}
 if(s.collapseCycle===2){for(const i of[0,5]){s.cellBlur[i]=(s.collapseAge+.025)*150;s.cellAlpha[i]=1-smooth((s.collapseAge+.025)/.10);}const middleAlpha=sampleControls([[0,1],[.05,1],[.066667,.85],[.083333,.68],[.10,.57],[.116667,.49],[.133333,.43],[.15,.37],[.166667,.25],[.183333,.15],[.20,.06],[.216667,0]],s.collapseAge);for(const i of[2,3])s.cellAlpha[i]=middleAlpha;}
 if(s.label==='Verifying'&&t>=2.94&&t<3.15)s.revealAge=t-2.946667;if(s.label==='Verifying'&&t>=6.923333&&t<7.133333)s.revealAge=t-6.93;
 if(s.entryError){for(const i of[2,3])s.cellBlur[i]=Math.max(s.cellBlur[i],2*(1-smooth((t-4.116667)/.05)));}
 if(t>=4.25&&t<=4.7){const values=sampleControls(ERROR_DIGITS,t);s.digits=s.digits.map((d,i)=>({...d,alpha:values[i][0],dy:values[i][1],blur:values[i][2]}));}
 if(s.label==='Verifying'&&(t>=3.05&&t<3.95||t>=7.033333&&t<7.9))s.insetX=sampleControls(VERIFY_INSET_X,t);
 if(s.ring){let left=56,right=t<.55?mix(56,31,smooth((t-.50)/.05)):31;if(t>=1.1&&t<4.5||t>=5.233333)left=31;if(t>=2.083333&&t<4.5||t>=6.266667)right=56;s.ringCorners=[left,right];}
 return s;
}

export const LOOP_DURATION=DURATION+1;
// An explicitly authored closing transition follows the complete observed sequence.
export function loopFrameAt(t){if(t<=DURATION)return frameAt(t);const age=t-DURATION;if(age>=.95)return frameAt(0);const end=frameAt(DURATION),start=frameAt(0),s={...end,t,pointer:null};
 const collapse=smooth((age-.10)/.30),restore=smooth((age-.38)/.40);s.width=mix(mix(end.width,220,collapse),start.width,restore);s.green=1-smooth((age-.20)/.30);s.shine=0;
 if(age<.38){s.label='Verified';s.labelAlpha=1-smooth((age-.12)/.23);s.labelBlur=15*smooth((age-.12)/.23);}
 else{s.label='Enter code';s.labelAlpha=smooth((age-.38)/.28);s.labelBlur=15*(1-smooth((age-.38)/.28));s.verifyMorph=undefined;s.suffixIn=undefined;}
 if(age>.70){s.pointer=start.pointer;s.pointerAlpha=smooth((age-.70)/.20);s.t=0;}return s;}
