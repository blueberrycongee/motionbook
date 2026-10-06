import {path,rounded,text,line,project,homography,partialLine} from './art.mjs';
import {PATTERN} from './pattern.mjs';
import {TYPE} from './type.mjs';
function icon(k,x,y) {
 let s=path(rounded(x,y,36,37,9),'#23221f');
 const X=x+18,Y=y+18,st='fill="none" stroke="#9c9b94" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"';
 const p=d=>`<path d="${d}" ${st}/>`;
 if(k===0)s+=p(`M${X-4} ${Y-8.5}h8q2.5 0 2.5 2.5v11.5q0 2.5-2.5 2.5h-8q-2.5 0-2.5-2.5v-11.5q0-2.5 2.5-2.5 M${X-2} ${Y-5.5}h4 M${X-4} ${Y+7}q.4-4 4-4q3.6 0 4 4`)+`<circle cx="${X}" cy="${Y-1.5}" r="2.1" ${st}/>`;
 if(k===1)s+=p(`M${X-5.5} ${Y-6}h11q2.5 0 2.5 2.5v8q0 2.5-2.5 2.5h-11q-2.5 0-2.5-2.5v-8q0-2.5 2.5-2.5 M${X-7.5} ${Y-3.5}q7.5 4.8 15 0`);
 if(k===2)s+=p(`M${X-6.5} ${Y-2}h13v10q0 1-1 1h-11q-1 0-1-1z M${X-5} ${Y-2}l10-3.5l2.5-4 M${X-2.5} ${Y+2.5}h5`)+path([[X-5,Y-8],[X-3,Y-11],[X-1,Y-8],[X-3,Y-5]],'#9c9b94')+path([[X-.5,Y-10],[X+2,Y-13.5],[X+5,Y-10],[X+2,Y-6.5]],'#9c9b94');
 if(k===3)s+=p(`M${X-2} ${Y+8}h-2q-2.5 0-2.5-2.5v-12q0-2.5 2.5-2.5h7.5q2.5 0 2.5 2.5v4.7 M${X-3.5} ${Y-5}h5.5 M${X-3.5} ${Y-1.5}h2.5 M${X+1} ${Y+8}l.5-3.3l5.7-5.7q1.5-1.3 2.7.1q1.2 1.4-.1 2.7l-5.7 5.7z`);
 if(k===4)s+=p(`M${X-4} ${Y-8.5}h8q2.5 0 2.5 2.5v14.5l-3-2-3 2-3-2-3 2v-14.5q0-2.5 2.5-2.5 M${X-3.2} ${Y-4.5}h6 M${X-3.2} ${Y-.5}h2.5`);
 if(k===5)s+=p(`M${X} ${Y-6}q-4-2-8 0v13q4 2 8 1q4 1 8-1v-13q-4-2-8 0v14`);
 if(k===6)s+=`<circle cx="${X}" cy="${Y}" r="8.3" ${st}/>`+p(`M${X-2.3} ${Y-3.2}c0-3.2 5.4-3.4 5.4-.1c0 2.2-3.1 2.4-3.1 4.2 M${X} ${Y+5}h.05`);
 return s;
}
export function backdrop(s) {
 let out='<defs><linearGradient id="backdrop" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#080805"/><stop offset="1" stop-color="#0b0907"/></linearGradient><linearGradient id="cardRed" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d23614"/><stop offset="1" stop-color="#cf3b17"/></linearGradient></defs><rect width="824" height="720" fill="url(#backdrop)"/>';
 out+=text('Membership',165,83,55.5,'#eeede7','Serif');
 out+=`<g opacity="${s.hover??0}">${path(rounded(138,456,546,81,16),'#11100e')}</g>`;
 const labels=['Member','ankursahuhp@gmail.com','Replay Onboarding','Edit Card','Get Invoice','Library Updates','Need Help?'];
 for(let k=0;k<7;k++){const y=152+k*81.5;out+=icon(k,165,y)+text(labels[k],218,y+24,17,'#e9e8e3');if(k!==4)out+=line([[165,y+59],[659,y+59]],'#1a1814',.7);if([2,3,5].includes(k))out+=line([[647,y+15],[652,y+19],[648,y+23]],'#66635d',1);}
 out+=text('ankur',658,176,17,'#8c8a82','Regular','end')+path(rounded(601,235,58,36,18),'#25241f')+text('Edit',630,258,16,'#a5a29a','Regular','middle');
 out+=`<g transform="translate(560 611) rotate(12)">${path(rounded(0,0,218,290,18),'url(#cardRed)')}</g>`;
 out+=PATTERN.map(({a,b})=>line([a,b],'#fca977',1.5)).join('');
 return out+`<rect width="824" height="720" fill="black" opacity="${s.dim??0}"/>`;
}
const W=433,H=580/3;
function logo(q) {
 let out=`<defs><clipPath id="logo">${path(rounded(359,26,49,49,12).map(([x,y])=>[x/W,y/H]),'white',q)}</clipPath></defs><g clip-path="url(#logo)">`;
 for(const [col,cells]of [[0,['#09000d','#f14bee','#d33a15','#fdca0a']],[1,['#e8e4d1','#54ff8b','#0c9ee3','#1e42dd']]])for(let j=0;j<4;j++){
  const x=359+col*24.5,y=26+j*12.25;
  out+=path([[x/W,y/H],[(x+24.5)/W,y/H],[(x+24.5)/W,(y+12.25)/H],[x/W,(y+12.25)/H]],cells[j],q);
 }
 return out+'</g>';
}
export function paperContent(s,part,q) {
 if(!q)return '';
 const T=(str,x,y,size=13,color='#292822',font='Regular',anchor='start')=>text(str,x,y-part*H,size,color,font,anchor,q,W,H);
 const P=(points,color)=>path(points.map(([x,y])=>[x/W,(y-part*H)/H]),color,q);
 let out='';
 if(part===0){
  out+=T('Invoice',30,58,32,'#171710','Serif')+logo(q);
  const row=(label,value,y)=>{const width=[...label].reduce((n,c)=>n+(TYPE.Regular[c]?.a||.3)*13,0);return T(label,30,y,13,'#78756e')+T(value,30+width,y,13);};
  out+=row('Invoice number ','1784925191620',95)+row('Date of issue ','June 18, 2026',117)+row('Date due ','June 18, 2026',139);
  out+=T('Interface Craft',30,185,14,'#28271f','SemiBold')+T('Bill to',237,185,14,'#28271f','SemiBold')+P(rounded(361,170,46,22,3),'#eae5dc')+T('Edit',384,186,13,'#817f77','Regular','middle');
 }
 if(part===1)out+=T('2108 N St Ste N',30,207)+T('Sacramento, CA 95816 US',30,225)+T('ANKUR',237,207)+T('ankursahuhp@gmail.com',237,230,12.5,'#6b6860');
 if(part===2){
  out+=P([[30,427],[407,427],[407,427.8],[30,427.8]],'#e2dcd2')+T('Membership',30,456,14)+T('$249.00',407,456,14,'#292822','Medium','end')+T('JUNE30 (30% Off)',30,487,14)+T('-$74.70',407,487,14,'#292822','Medium','end')+P([[30,505],[407,505],[407,505.8],[30,505.8]],'#e2dcd2')+T('Total paid',30,535,15,'#292822','SemiBold')+T('$174.30',407,535,15,'#292822','SemiBold','end');
 }
 return out;
}
