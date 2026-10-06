// Independently drawn rounded letterforms. No font file or traced reference pixels.
const glyphs={
 U:{a:23,d:'M0 0V15.5Q0 25 9 25Q18 25 18 15.5V0'},
 p:{a:20.5,d:'M0 7V33M0 12Q3 7 8 7C19 7 19 25 8 25Q3 25 0 21'},
 d:{a:20.5,d:'M15.5 0V25M15.5 11Q12.5 7 7.5 7C-3 7 -3 25 7.5 25Q12.5 25 15.5 21'},
 a:{a:20,d:'M1 10Q4 7 9 7Q16 7 16 13V25M16 16H7C-2 16 -1 25 6 25Q13 25 16 20'},
 t:{a:13.5,d:'M5 1V20Q5 26 12 24M0 8H12'},
 e:{a:21,d:'M0 16H15C15 4 -1 4 0 17C0 26 10 27 15 22'},
 i:{a:9,d:'M1 8V25',dot:[1,.8]},
 n:{a:21,d:'M0 8V25M0 13Q2 7 8 7Q16 7 16 14V25'},
 g:{a:22,d:'M16 8V27Q16 34 8 34Q3 34 0 31M16 12Q13 7 8 7C-3 7 -3 25 8 25Q13 25 16 20'}
};
export function lettering(text,x,y,{opacity=1,scale=1,blur=0}={}){let at=0;let s=`<g opacity="${opacity}" transform="translate(${x},${y}) scale(${scale})" ${blur>0?'filter="url(#textBlur)"':''} fill="none" stroke="#0079eb" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round">`;for(const c of text){const g=glyphs[c];if(!g)continue;s+=`<g transform="translate(${at},0)"><path d="${g.d}"/>${g.dot?`<circle cx="${g.dot[0]}" cy="${g.dot[1]}" r="2.65" fill="#0079eb" stroke="none"/>`:''}</g>`;at+=g.a;}return s+'</g>';}
