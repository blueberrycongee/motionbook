// Independently drawn graphic geometry. No source image or extracted vector is embedded.
export const FLAME='M-2.8 27.4 L-21.4 17.6 Q-25.3 15.6-23.7 10.5 L-17.2-13.8 Q-16.2-19.1-12.4-16.9 L-6.3-12.2 L2.1-27.2 Q3.8-30.8 7.5-29.3 Q10.2-28.8 11.3-24.7 L23.2 12.4 Q24.1 16.6 20.3 18.7 L3.2 27.4 Q.1 29.4-2.8 27.4Z';
export const INNER='M-2-.1 Q-.4-3 1.2-.4 L8.2 12.7 Q9.2 14.8 7.5 16.2 L2.3 18.9 Q0 19.9-2.1 18.7 L-7.6 15.5 Q-10 14.3-8.3 11.7Z';
export const SEED='M-.14-.94 Q0-1.1 .17-.92 L.86-.22 Q1.1 0 .84 .24 L.2 .88 Q0 1.05-.2 .88 L-.86 .25 Q-1.08 0-.84-.25Z';
export const STAR='M-.09-.9 Q0-1.12 .09-.9 L.31-.35 Q.33-.31 .39-.29 L.9-.09 Q1.12 0 .9 .09 L.36 .31 Q.32 .33 .30 .38 L.09 .9 Q0 1.12-.09 .9 L-.31 .36 Q-.33 .32-.38 .30 L-.9 .09 Q-1.12 0-.9-.09 L-.35-.31 Q-.32-.33-.30-.38Z';
export const ARROW='M0 0V18.4L4.8 14.1L8.2 21.1L11.1 19.7L7.7 13.1L14.1 12.9Z';
export const HAND='M4 11L3 2.4Q3-.4 5-.4Q7-.4 7 2V9L7.7 6.8Q9 5.4 10.6 7V9L11.4 7.3Q13 6.8 14 8.4V10L15 8.8Q17 8.6 17.7 10.3L18.3 15.5Q18.4 20 15.6 24H7Q5.4 21 3.4 18.8L0 14Q-1 11 1 10.5Q2.4 10 4 13Z';
export function flameMarkup(inner=true){return `<defs><linearGradient id="fire" x1="0" y1="-29" x2="0" y2="29" gradientUnits="userSpaceOnUse"><stop stop-color="#f45708"/><stop offset=".43" stop-color="#f45608"/><stop offset="1" stop-color="#ffac61"/></linearGradient></defs><path d="${FLAME}" fill="url(#fire)"/>${inner?`<path d="${INNER}" fill="#ffe4cf"/>`:``}`;}
// Project the independently drawn rounded seed as a small planar graphic.
const seedPoints=[[-.14,-.94]];
let last=seedPoints[0];
for(const [kind,control,end]of[['Q',[0,-1.1],[.17,-.92]],['L',null,[.86,-.22]],['Q',[1.1,0],[.84,.24]],['L',null,[.2,.88]],['Q',[0,1.05],[-.2,.88]],['L',null,[-.86,.25]],['Q',[-1.08,0],[-.84,-.25]],['L',null,[-.14,-.94]]]){if(kind==='Q'){for(let j=1;j<=10;j++){const t=j/10;seedPoints.push([(1-t)**2*last[0]+2*(1-t)*t*control[0]+t*t*end[0],(1-t)**2*last[1]+2*(1-t)*t*control[1]+t*t*end[1]]);}}else seedPoints.push(end);last=end;}
export function projectSeed(p){const[x,y,a,b,c,d,q,r]=p;return seedPoints.map(([u,v],i)=>{u*=30;v*=30;const den=1+q*u+r*v;return `${i?'L':'M'}${(x+(a*u+b*v)/den).toFixed(4)} ${(y+(c*u+d*v)/den).toFixed(4)}`;}).join('')+'Z';}
