import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const {createCanvas,GlobalFonts}=require('@napi-rs/canvas');GlobalFonts.registerFromPath(new URL('../assets/StudySans.ttf',import.meta.url).pathname,'StudySans');GlobalFonts.registerFromPath(new URL('../assets/StudyCJK.otf',import.meta.url).pathname,'StudyCJK');
import fs from 'node:fs/promises';
const out=new URL('../assets/',import.meta.url);const W=1600,H=1000;
const colors={red:'#f2281b',cream:'#f1f0df',blue:'#2736f1',black:'#121414',back:'#e2e4df'};
function setup(bg){const c=createCanvas(W,H),g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,W,H);g.fillStyle=colors.black;g.strokeStyle=colors.black;return[c,g]}
function text(g,s,x,y,size,color=colors.black){g.fillStyle=color;g.font=`${size}px StudySans`;g.fillText(s,x,y)}
function line(g,x1,y1,x2,y2,color=colors.black,width=1){g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}
function circle(g,x,y,r,color){g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()}
// Original vector construction of the light character, not a raster trace.
function light(g,x,y,s){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=colors.black;g.fillRect(213,0,40,228);g.fillRect(40,190,420,36);g.save();g.translate(107,30);g.rotate(-.53);g.fillRect(0,0,36,126);g.restore();g.save();g.translate(365,12);g.rotate(.53);g.fillRect(0,0,36,126);g.restore();g.beginPath();g.moveTo(180,220);g.bezierCurveTo(182,371,95,434,31,469);g.lineTo(7,438);g.bezierCurveTo(98,385,134,334,137,220);g.fill();g.beginPath();g.moveTo(273,217);g.lineTo(312,217);g.lineTo(312,419);g.quadraticCurveTo(312,440,337,440);g.lineTo(405,440);g.quadraticCurveTo(427,440,429,362);g.lineTo(466,379);g.quadraticCurveTo(465,478,414,479);g.lineTo(327,479);g.quadraticCurveTo(273,479,273,427);g.closePath();g.fill();g.restore()}
{
const[c,g]=setup(colors.red);circle(g,1193,194,118,colors.cream);g.save();g.beginPath();g.rect(1050,194,290,160);g.clip();circle(g,1193,194,118,colors.black);g.restore();light(g,580,290,1.15);line(g,552,84,695,84);line(g,552,84,552,223);for(let i=0;i<13;i++)line(g,1160+i*8,550,1160+i*8,855,colors.cream,1.6);line(g,552,914,1290,914);text(g,'H I K A R I  /  L I G H T',552,951,12);text(g,'17',1255,950,14);await fs.writeFile(new URL('poster-light.png',out),c.toBuffer('image/png'));
}
{
const[c,g]=setup(colors.back);g.fillStyle=colors.black;g.beginPath();g.roundRect(410,63,784,874,106);g.fill();text(g,'Nö',432,482,420,colors.cream);text(g,'02',660,866,405,colors.cream);text(g,'N / 01—02',449,540,11,colors.cream);['FORM','TYPE','SPACE','PRINT','OBJECT','ARCHIVE'].forEach((s,i)=>text(g,s,449,590+i*21,9,colors.cream));text(g,'POSTER / FORM STUDY',450,904,9,colors.cream);text(g,'22',1140,904,9,colors.cream);await fs.writeFile(new URL('poster-number.png',out),c.toBuffer('image/png'));
}
{
const[c,g]=setup(colors.blue);text(g,'TYPE / COUNTERFORM',408,133,11,colors.cream);text(g,'Aa',402,643,560,colors.cream);line(g,410,704,1205,704,colors.cream,1);text(g,'UPPERCASE',410,753,11,colors.cream);text(g,'LOWERCASE',410,776,11,colors.cream);text(g,'04',840,931,270,colors.cream);text(g,'ONE COLOR / TWO FORMS',410,878,9,colors.cream);text(g,'04',1190,960,9,colors.cream);await fs.writeFile(new URL('poster-type.png',out),c.toBuffer('image/png'));
}
{
const[c,g]=setup(colors.back);g.fillStyle=colors.cream;g.beginPath();g.roundRect(485,45,640,912,80);g.fill();text(g,'03',513,669,485);circle(g,1027,212,47,colors.blue);circle(g,1027,351,47,colors.blue);line(g,523,832,1075,832,'#a8a99f');text(g,'SERIES / INTERVAL',523,78,11);text(g,'COMPOSITION',525,884,10);text(g,'STUDY NO. 03',525,911,10);await fs.writeFile(new URL('poster-interval.png',out),c.toBuffer('image/png'));
}
{
const[c,g]=setup(colors.cream);circle(g,1190,146,52,colors.red);line(g,398,87,639,87,'#c3c3b2');line(g,398,87,398,270,'#c3c3b2');line(g,1206,885,971,885,'#c3c3b2');line(g,1206,885,1206,711,'#c3c3b2');g.fillStyle=colors.black;g.font='344px StudyCJK';g.fillText('余白',404,831);text(g,'Y O H A K U  /  N E G A T I V E  S P A C E',410,925,11);await fs.writeFile(new URL('poster-space.png',out),c.toBuffer('image/png'));
}
