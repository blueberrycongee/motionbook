import {CONTROLS} from './controls.mjs';
import {path,rounded,text,line,partialLine,project} from './art.mjs';
import {backdrop,paperContent} from './layout.mjs';
import {PEN} from './pen.mjs';
import {pointer} from './pointer.mjs';
export const WIDTH=824,HEIGHT=720,DURATION=15.6;
export function nativeState(t){let lo=0,hi=CONTROLS.length-1;while(lo<hi){const m=Math.floor((lo+hi+1)/2);if(CONTROLS[m].t<=t+.000002)lo=m;else hi=m-1;}return structuredClone(CONTROLS[lo]);}
export function demoState(t){t=((t%DURATION)+DURATION)%DURATION;if(t<14.5)return nativeState(Math.min(t,13.833437));if(t<15.1)return {crossfade:(t-14.5)/.6,from:nativeState(13.833437),to:nativeState(0)};return nativeState(0);}
export function scene(s){
 if(s.crossfade!==undefined)return `<svg xmlns="http://www.w3.org/2000/svg" width="824" height="720" viewBox="0 0 824 720">${scene(s.from)}<g opacity="${s.crossfade}">${scene(s.to).replaceAll('id="','id="reset-').replaceAll('url(#','url(#reset-')}</g></svg>`;
 const [L,T,R,B]=s.bbox;
 let out=`<svg xmlns="http://www.w3.org/2000/svg" width="824" height="720" viewBox="0 0 824 720"><defs><linearGradient id="paperFill" gradientUnits="userSpaceOnUse" x1="0" y1="${T}" x2="0" y2="${B}">${s.paperColors.map((c,j)=>`<stop offset="${j/8}" stop-color="rgb(${c.map(Math.round).join(',')})"/>`).join('')}</linearGradient><filter id="paperShadow" x="-30%" y="-25%" width="160%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="7" flood-opacity=".25"/></filter></defs>${backdrop(s)}`;
 if(s.reverseFold){const f=s.reverseFold;out+=`<g filter="url(#paperShadow)">${path(f.back,`rgb(${f.backColor.join(',')})`)}${f.front?path(f.front,`rgb(${f.frontColor.join(',')})`):''}</g>`;}
 else out+=`<g filter="url(#paperShadow)">${path(s.outline,'url(#paperFill)')}</g>`;
 if(s.content)out+=paperContent(s,0,s.top)+paperContent(s,1,s.middle)+paperContent(s,2,s.bottom);
 if(s.pen&&s.bottom)for(let j=0;j<4;j++){const p=partialLine(PEN[s.pen.cycle][j],s.pen.progress[j]);if(p.length>1)out+=line(p.map(([x,y])=>project([(x-195)/433,(y-78-2*580/3)/(580/3)],s.bottom)),'#c2423a',j===1?1.2:1.55);}
 if(s.foldLine)out+=line(s.foldLine,'#e7e0d5',.75);
 if(s.download>0)out+=`<g opacity="${s.download}" transform="translate(0 ${s.downloadY||0})">${path(rounded(329,676,165,44,22),'white')}${text('Download PDF',411.5,703,16,'#111','Regular','middle')}</g>`;
 return out+pointer(s.cursor)+'</svg>';
}
