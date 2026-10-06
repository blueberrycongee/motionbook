import{text,n}from'./art.mjs';import{COUNTS}from'./counts.mjs';
export const WIDTH=1920,HEIGHT=1514,TOTAL=4680;
export const COLORS=['#0ca6ef','#2d71fb','#7e32fa','#f58b05'];
const pale=['#b9e8fa','#c8d7ff','#d9ccfe','#f9e57d'];
export const stageForWeek=w=>w<260?0:w<936?1:w<3380?2:3;
export const cell=index=>({x:489.968279+Math.floor(index/52)*10.576544,y:368.764916+(index%52)*10.571365,w:8.461257,h:8.507488});
const rect=(x,y,w,h,r,fill,extra='')=>`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${r}" fill="${fill}" ${extra}/>`;
let frameCache='';
function foundation(){if(frameCache)return frameCache;let o=rect(0,0,1920,1514,0,'white')+rect(440,250,1042,1060,60,'#000','opacity=".10" filter="url(#cardShadow)"')+rect(440,232,1042,1058,60,'#dedede')+rect(440,230,1042,1057,60,'#f2f2f2')+rect(462,340,998,653,32,'white')+text('Life in Weeks',490,304,28,'#222','SemiBold')+rect(1140,273,292,42,21,'#e4e3e6');
 const legends=[['Childhood','0–5',496,515,626],['School','5–18',754,773,850],['Career','18–65',992,1011,1085],['Retirement','65–90',1241,1260,1375]];
 for(let j=0;j<4;j++){const [name,range,cx,x,rx]=legends[j];o+=`<circle cx="${cx}" cy="952.5" r="6.1" fill="${COLORS[j]}"/>`+text(name,x,959,20.5,'#4e4d51')+text(range,rx,959,20.5,'#7a787f','Mono');}
 for(const [label,x,anchor]of[['WEEKS LIVED',498,'start'],['WEEKS REMAINING',960,'middle'],['LIFE ELAPSED',1420,'end']])o+=text(label,x,1040,18,'#76747a','Medium',anchor,null,1,1,1.5);
 o+=text('0',507,1164,21,'#7a787f','Mono','middle')+text('90',1405,1164,21,'#7a787f','Mono','middle')+text('Each cell is one week · drag to set your age',960,1240,22,'#77757b','Regular','middle');
 return frameCache=o;
}
export function stateAt(frame){const i=Math.max(0,Math.min(444,Math.floor(frame)));return{i,weeks:COUNTS[i],pulse:1};}
export function scene(s){const w=Math.max(0,Math.min(TOTAL,Math.round(s.weeks))),stage=stageForWeek(w),color=COLORS[stage],age=Math.round(w/52),cx=570+w/TOTAL*766;let o=`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1514" viewBox="0 0 1920 1514"><defs><filter id="cardShadow" x="-20%" y="-10%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter><filter id="knobShadow" x="-50%" y="-60%" width="200%" height="240%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity=".13"/></filter><filter id="pulseBlur"><feGaussianBlur stdDeviation="5"/></filter><clipPath id="barClip">${rect(534,1148,838,16,8,'white')}</clipPath></defs>`+foundation();
 for(let i=0;i<TOTAL;i++){const c=cell(i);o+=rect(c.x-c.w/2,c.y-c.h/2,c.w,c.h,1.5,i<w?COLORS[stageForWeek(i)]:'#f2f2f2');}
 if(w<TOTAL){const c=cell(w);o+=rect(c.x-12,c.y-12,24,24,8,color,'opacity=".25" filter="url(#pulseBlur)"')+rect(c.x-10,c.y-10,20,20,7,'#fff','opacity=".8"')+rect(c.x-7.8,c.y-7.8,15.6,15.6,5,color);}
 o+=text(`Week ${(w+1).toLocaleString('en-US')} of 4,680`,1286,303,22,'#626067','Mono','middle')+text(w.toLocaleString('en-US'),497,1088,31.2,'#1b1b1d','MonoBold')+text((TOTAL-w).toLocaleString('en-US'),960,1088,31.2,'#1b1b1d','MonoBold','middle')+text(`${(w/TOTAL*100).toFixed(1)}%`,1424,1088,31.2,'#1b1b1d','MonoBold','end');
 o+='<g clip-path="url(#barClip)">';let stops=[0,5,18,65,90];for(let j=0;j<4;j++){const x=534+838*stops[j]/90,width=838*(stops[j+1]-stops[j])/90;o+=rect(x,1148,width,16,0,pale[j]);const filled=Math.max(0,Math.min(width,cx-x));if(filled)o+=rect(x,1148,filled,16,0,COLORS[j]);}o+='</g>';
 o+=rect(cx-37,1131,74,50,25,'white','stroke="#d0cdd6" stroke-width="1.5" filter="url(#knobShadow)"')+text(String(age),cx,1165,23,color,'MonoBold','middle');return o+'</svg>';
}
