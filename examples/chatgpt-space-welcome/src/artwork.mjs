import {clamp,lerp,smooth,typedText,editProgress} from './motion.mjs';
export const DOC_SIZES=[[754,447],[1200,1594],[686,432],[500,658]];
export const NAMES=['ChatGPT','亨利·考德威尔','埃里克·汤普森','贾斯敏·刘','玛雅·帕特尔'];
export const NAME_COLORS=['#ffffff','#a855f7','#00b99c','#ffd238','#00b1ff'];
export function roundRect(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
export function text(c,value,x,y,size,color='#111',weight=400,align='left',font='Arial, "Noto Sans CJK SC", sans-serif'){c.fillStyle=color;c.textAlign=align;c.textBaseline='top';c.font=`${weight} ${size}px ${font}`;c.fillText(value,x,y);}
function line(c,points,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function selection(c,b,color,screenScale,typing=false,time=0){if(!b)return;c.lineWidth=1.15/screenScale;c.strokeStyle=color;c.strokeRect(...b);const size=4/screenScale;for(const x of [b[0],b[0]+b[2]])for(const y of [b[1],b[1]+b[3]]){c.fillStyle='#fff';c.fillRect(x-size/2,y-size/2,size,size);c.strokeRect(x-size/2,y-size/2,size,size);}if(typing&&time%1<.49){c.fillStyle=color;c.fillRect(b[0]+b[2]-7,b[1]+3,3/screenScale,b[3]-6);}}
function palette(c,x,y,colors,chosen=0){roundRect(c,x,y,166,62,15,'white');colors.forEach((fill,i)=>{c.beginPath();c.arc(x+33+i*48,y+31,15,0,Math.PI*2);c.fillStyle=fill;c.fill();if(i===chosen){c.lineWidth=2;c.strokeStyle='#333';c.beginPath();c.arc(x+33+i*48,y+31,20,0,Math.PI*2);c.stroke();}});}
function landscape(c,x,y,w,h){
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
  let g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'#39b2dc');g.addColorStop(.4,'#cef2ed');g.addColorStop(.42,'#28837f');g.addColorStop(1,'#fedc28');c.fillStyle=g;c.fillRect(x,y,w,h);
  const colors=['#fbce20','#fa6a27','#ca365c','#e42e94','#429a4a','#ebad14','#123bb6','#3bd3bb'];
  for(let i=0;i<24;i++){const a=i/24;c.beginPath();c.moveTo(x+w*.52+a*w*.15,y+h*.33);c.lineTo(x+(a*1.8-.4)*w,y+h);c.lineTo(x+((a+.065)*1.8-.4)*w,y+h);c.closePath();c.fillStyle=colors[i%colors.length];c.fill();}
  c.beginPath();c.moveTo(x+w*.56,y+h*.34);c.bezierCurveTo(x+w*.38,y+h*.54,x+w*.65,y+h*.6,x+w*.5,y+h);c.lineTo(x+w*.62,y+h);c.bezierCurveTo(x+w*.69,y+h*.63,x+w*.5,y+h*.5,x+w*.58,y+h*.34);c.fillStyle='#d6f3df';c.fill();
  c.restore();
}
function vase(c,x,y,w,h,color){c.save();c.translate(x,y);let g=c.createLinearGradient(-w/2,0,w/2,0);g.addColorStop(0,'#685949');g.addColorStop(.4,color);g.addColorStop(.8,color);g.addColorStop(1,'#9b8c73');c.fillStyle=g;c.beginPath();c.moveTo(-w*.15,-h);c.bezierCurveTo(-w*.1,-h*.7,-w*.6,-h*.53,-w*.5,-h*.13);c.bezierCurveTo(-w*.45,h*.05,w*.4,h*.04,w*.46,-h*.12);c.bezierCurveTo(w*.58,-h*.5,w*.12,-h*.7,w*.16,-h);c.closePath();c.fill();c.fillStyle='#594332';c.beginPath();c.ellipse(0,-h,w*.15,w*.04,0,0,Math.PI*2);c.fill();c.restore();}
function potteryPhoto(c,x,y,w,h,variant=0){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();let g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#b66845');g.addColorStop(1,'#813c2a');c.fillStyle=g;c.fillRect(x,y,w,h);c.fillStyle='#cdb899';c.fillRect(x,y+h*.7,w,h*.3);if(variant===0){vase(c,x+w*.31,y+h*.83,w*.27,h*.66,'#d9d3bf');vase(c,x+w*.67,y+h*.88,w*.24,h*.27,'#bdb79c');line(c,[[x+w*.32,y+h*.4],[x+w*.48,y+h*.12],[x+w*.69,y+h*.19]],'#705c24',2);for(let i=0;i<13;i++){c.fillStyle='#d8bb4b';c.beginPath();c.arc(x+w*(.42+i*.024),y+h*(.15+Math.sin(i)*.04),2,0,7);c.fill();}}else vase(c,x+w*.5,y+h*.9,w*.6,h*.7,variant===2?'#94ada4':'#e5d0a6');c.restore();}
function lamp(c){const ink='#b8cde8';c.lineJoin='round';c.lineCap='round';const paths=[[[182,542],[348,542],[360,552],[174,552],[182,542]],[[221,535],[190,326],[317,164]],[[239,535],[210,329],[331,180]],[[191,328],[332,163]],[[207,332],[342,179]],[[320,177],[332,124],[350,116],[365,125],[371,154]],[[340,163],[327,189],[317,260],[429,225],[390,172],[373,157]],[[319,260],[430,226]]];for(const p of paths)line(c,p,ink,3);for(const [x,y,r] of [[202,330,9],[333,171,8],[227,539,6]]){c.beginPath();c.arc(x,y,r,0,7);c.strokeStyle=ink;c.lineWidth=3;c.stroke();}line(c,[[191,350],[230,349],[244,498]],'#718fb8',2);}
export const JOBS=[['title','paper','subtitle','year'],['title','image','intro'],['products','shop','paper','products2'],['width','height','name']];
const original={pitchTitle:'田野\n笔记',pitchRevision:'工作室\n笔记',subtitle:'创意与灵感',year:'2026',articleTitle:'智能时代',articleRevision:'智能纪元',intro:'在未来二十年里，我们将能够做到祖辈眼中如同魔法般的事情。',shop:'陶瓷工作室',shopRevision:'陶艺工作室',width:'210 毫米',height:'440 毫米',name:'工作室台灯'};
export function jobState(index,time){const cycle=Math.floor(time/3.75),age=(time%3.75)+.24,kind=JOBS[index][cycle%JOBS[index].length],edit=editProgress(age,kind==='intro'?original.intro.length:8);return{kind,cycle,age,...edit,active:age<3.55,color:NAME_COLORS[index],text:original};}
export function paintArtwork(c,index,job,scale,time){
  const [w,h]=DOC_SIZES[index],j=job,active=j.active,kind=j.kind;
  let bounds=null; const prog=j.progress,cycle=j.cycle;
  if(index===0){
    const color=kind==='paper'?`rgb(255 ${Math.round(91+29*smooth(prog))} ${Math.round(53+26*smooth(prog))})`:cycle>0?'#ff784f':'#ff5b35';c.fillStyle=color;c.fillRect(0,0,w,h);
    let title=cycle?original.pitchRevision:original.pitchTitle;
    if(kind==='title')title=typedText(original.pitchRevision,prog); title.split('\n').forEach((t,i)=>text(c,t,22,106+i*118,142));
    roundRect(c,35,33,96,37,20,'#f5f4ef','#222');text(c,kind==='year'?typedText('2027',prog):'2026',83,36,20,'#111',400,'center');
    text(c,kind==='subtitle'?typedText('灵感，从这里开始',prog):original.subtitle,736,386,20,'#111',400,'right');
    bounds=kind==='title'?[22,112,430,242]:kind==='subtitle'?[526,387,210,28]:kind==='year'?[35,33,96,37]:null;
    if(kind==='paper'&&j.age>.35)palette(c,550,28,['#ff5b35','#ff784f','#cfc4f4'],j.age>.48?1:0);
  }else if(index===1){
    c.fillStyle='#fff';c.fillRect(0,0,w,h);text(c,kind==='title'?typedText(original.articleRevision,prog):original.articleTitle,100,128,96,'#111',700);text(c,'2024年9月23日',100,252,48,'#707070');
    c.save();c.beginPath();c.rect(100,352,1000,350);c.clip();if(kind==='image'){const s=1+prog*.08;c.translate(600,527);c.scale(s,s);c.translate(-600,-527);}landscape(c,100,352,1000,350);c.restore();
    const intro=kind==='intro'?typedText(original.intro,prog):original.intro; const chars=Array.from(intro);for(let n=0;n<chars.length;n+=24)text(c,chars.slice(n,n+24).join(''),100,748+Math.floor(n/24)*60,40.92);
    const para='科技的发展让人类不断拓展创造的可能。我们共同探索、记录与分享，将灵感变成真实作品。每一次协作都带来新的想法，也让更远的未来逐渐清晰。';for(let k=0;k<3;k++)for(let n=0;n<72;n+=24)text(c,Array.from(para.repeat(2)).slice(n,n+24).join(''),100,938+k*206+Math.floor(n/24)*60,40.92,'#444');
    bounds=kind==='title'?[100,128,1000,116]:kind==='intro'?[100,748,1000,120]:kind==='image'?[100,352,1000,350]:null;
  }else if(index===2){
    c.fillStyle=kind==='paper'&&prog>.5?'#d9cfbd':'#bfb8dc';c.fillRect(0,0,w,h);c.fillStyle='#f4f2f8';c.fillRect(0,0,w,50);['#ee6864','#f7cb4e','#62c76a'].forEach((color,i)=>{c.beginPath();c.arc(28+i*27,25,8.5,0,7);c.fillStyle=color;c.fill();});
    c.fillStyle='#f7f3ea';c.fillRect(140,76,406,331);text(c,kind==='shop'?typedText(original.shopRevision,prog):original.shop,152,80,20);potteryPhoto(c,140,105,406,182);
    const reordering=kind==='products'||kind==='products2';
    for(let i=0;i<3;i++){const from=i*128,to=[256,0,128][i],x=153+(reordering?lerp(from,to,1-Math.exp(-8*prog)*(Math.cos(12*prog)+2/3*Math.sin(12*prog))):from);potteryPhoto(c,x,299,124,77,i+1);text(c,['浅碗','花器','手工茶杯'][i],x,378,12);}
    bounds=kind==='shop'?[152,80,184,25]:reordering?[153,299,124,96]:null;
    if(kind==='paper'&&j.age>.35)palette(c,505,58,['#bfb8dc','#d9cfbd','#cfc4f4'],j.age>.48?1:0);
  }else{
    c.fillStyle='#063084';c.fillRect(0,0,w,h);c.lineWidth=1;for(let x=11.894;x<w;x+=18.1819)line(c,[[x,0],[x,h]],'#4c76b526',1);for(let y=1.862;y<h;y+=18.1143)line(c,[[0,y],[w,y]],'#4c76b526',1);lamp(c);
    line(c,[[215,73],[412,73]],'#b6cbe8',1);line(c,[[94,152],[94,333]],'#b6cbe8',1);line(c,[[94,365],[94,533]],'#b6cbe8',1);
    c.setLineDash([3,3]);line(c,[[215,74],[215,96]],'#a1badb',1);line(c,[[412,74],[412,96]],'#a1badb',1);line(c,[[90,151],[138,151]],'#a1badb',1);line(c,[[95,533],[138,533]],'#a1badb',1);c.setLineDash([]);
    text(c,kind==='width'?typedText('220 毫米',prog):original.width,285,53,14,'#e8effa');text(c,kind==='height'?typedText('460 毫米',prog):original.height,61,341,14,'#e8effa');text(c,kind==='name'?typedText('工作室新台灯',prog):original.name,27,615,12,'#e8effa');
    bounds=kind==='width'?[285,53,65,19]:kind==='height'?[61,341,58,20]:[27,615,160,20];
  }
  if(active&&bounds)selection(c,bounds,j.color,scale,j.typing,time);
  return bounds;
}
