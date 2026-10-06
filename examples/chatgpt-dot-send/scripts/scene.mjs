import {CSS,box,plan,sample,layout,composerHeight,flip} from '../src/pipeline.mjs';
export const SIZE={cssWidth:360,cssHeight:480,renderScale:2,width:720,height:960};
export const TIMES={first:1250,draft:3400,newline:3950,second:5100,end:7350};
export const messages=[{id:'old',self:true,sender:'owner',time:0,lines:['周末想去海边。']},{id:'reply',self:false,sender:'dot',time:100,lines:['好呀，想看日出还是日落？','我可以帮你安排。']},{id:'one',self:true,sender:'owner',time:1250,lines:['日落吧。']},{id:'two',self:true,sender:'owner',time:5100,lines:['最好人少一点，','想慢慢走走。']}];
const composer=h=>box(16,480-10-h,328,h);
const beforeFirst=layout(messages.slice(0,2),44),afterFirst=layout(messages.slice(0,3),44);
const beforeSecond=layout(messages.slice(0,3),98),afterSecond=layout(messages,58);
export const p1=plan({origin:composer(44),body:afterFirst.get('one'),bubble:afterFirst.get('one'),textWidth:afterFirst.get('one').textWidth});
export const p2=plan({origin:composer(98),body:afterSecond.get('two'),bubble:afterSecond.get('two'),textWidth:afterSecond.get('two').textWidth});
export function scene(ms){const first=ms>=TIMES.first,second=ms>=TIMES.second,height=composerHeight(ms,{newline:TIMES.newline,send:TIMES.second});const rows=layout(messages.slice(0,second?4:first?3:2),height);return {first,second,height,composer:composer(height),rows,firstAge:ms-TIMES.first,secondAge:ms-TIMES.second,draft:!first?['日落吧。']:!second&&ms>=TIMES.draft?(ms>=TIMES.newline?messages[3].lines:[messages[3].lines[0]]):[],rowCorrection(id){if(second&&beforeSecond.has(id))return flip(beforeSecond.get(id).top,afterSecond.get(id).top,ms-TIMES.second);if(first&&beforeFirst.has(id))return flip(beforeFirst.get(id).top,afterFirst.get(id).top,ms-TIMES.first);return 0;}};}
const text=(x,y,s,size=16,color='#272c34',weight=400)=>`<text x="${x}" y="${y}" font-family="Noto Sans CJK SC,sans-serif" font-size="${size}" fill="${color}" font-weight="${weight}">${s.replaceAll('&','&amp;').replaceAll('<','&lt;')}</text>`;
const rect=(x,y,w,h,color,r=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${color}"/>`;
const leftPath=(x,y,w,h,tl,bl)=>`M${x+tl} ${y}H${x+w}V${y+h}H${x+bl}A${bl} ${bl} 0 0 1 ${x} ${y+h-bl}V${y+tl}A${tl} ${tl} 0 0 1 ${x+tl} ${y}Z`;
const rightPath=(x,y,w,h,tr,br)=>`M${x} ${y}H${x+w-tr}A${tr} ${tr} 0 0 1 ${x+w} ${y+tr}V${y+h-br}A${br} ${br} 0 0 1 ${x+w-br} ${y+h}H${x}Z`;
function skin(b,p,f){const left=b.left+f.leftShift,right=b.right-p.rightCap,centerRight=right,centerWidth=p.centerWidth*f.centerScale;return `<path d="${leftPath(left,b.top,p.leftCap+p.seam,b.height,p.corners[0],p.corners[3])}" fill="#dceaff"/>${rect(centerRight-centerWidth,b.top,centerWidth,b.height,'#dceaff')}<path d="${rightPath(b.right-p.rightCap-p.seam,b.top,p.rightCap+p.seam,b.height,p.corners[1],p.corners[2])}" fill="#dceaff"/>`;}
function bubble(b,m,p,elapsed){const f=p?sample(p,elapsed):null;const baseline=b.top+29;let content=f&&f.shapeActive?skin(b,p,f):rect(b.left,b.top,b.width,b.height,'#dceaff',22);content+=m.lines.map((line,i)=>text(b.left+16+(f?.textShift??0),baseline+i*24,line)).join('');return f?`<g transform="translate(${f.translateX} ${f.translateY}) translate(${b.right} ${b.bottom}) scale(${f.scaleX} ${f.scaleY}) translate(${-b.right} ${-b.bottom})">${content}</g>`:content;}
export function render(ms,{scale=2}={}){const s=scene(ms),c=s.composer;let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${360*scale}" height="${480*scale}" viewBox="0 0 360 480"><defs><clipPath id="chat"><rect x="0" y="54" width="360" height="422"/></clipPath></defs>${rect(0,0,360,480,'#fff')}<circle cx="30" cy="28" r="12" fill="#e1edff"/><circle cx="30" cy="28" r="4.5" fill="#5c95e9"/>${text(51,34,'dot',17,'#272c34',600)}<path d="M16 53H344" stroke="#f0f1f3" stroke-width=".5"/><g clip-path="url(#chat)">`;
 svg+=rect(c.left,c.top,c.width,c.height,'#f1f5fc',22);
 const draftBaseline=c.top+(ms>=TIMES.newline&&!s.second?31:29);
 if(s.draft.length)svg+=s.draft.map((line,i)=>text(c.left+16,draftBaseline+i*20,line)).join('');else svg+=text(c.left+16,c.top+29,'发消息',16,'#a8b2c1');
 svg+=`<path d="M290 441V453M284 447H296" fill="none" stroke="#8f9dae" stroke-width="1.5" stroke-linecap="round"/>${rect(310,433,28,28,s.draft.length?'#c8ddfa':'#e5ebf4',14)}<path d="M324 454V440M319 445l5-5 5 5" fill="none" stroke="${s.draft.length?'#386fb5':'#a7b5c7'}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
 for(const m of messages){const b=s.rows.get(m.id);if(!b)continue;const correction=s.rowCorrection(m.id);svg+=`<g transform="translate(0 ${correction})">`;if(!m.self)svg+=m.lines.map((line,i)=>text(b.left,b.top+22+i*24,line)).join('');else svg+=bubble(b,m,m.id==='one'?p1:m.id==='two'?p2:null,m.id==='one'?s.firstAge:s.secondAge);svg+='</g>';}
 return svg+'</g></svg>';
}
