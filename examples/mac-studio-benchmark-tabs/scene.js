/* Original performance data and artwork. Geometry and motion researched from
   apple.com/mac-studio, 2026-10-07. No Apple assets or benchmark claims. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MotionScene=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const duration=4.064, transitionDuration=1.8;
  const tabs=[
    {name:'Language models',title:'Faster first-token response in a local model workflow',values:[8.8,2.6,1]},
    {name:'AI training',title:'Faster training in an image-classification workflow',values:[4.6,1.7,1]},
    {name:'Video editing',title:'Faster subject isolation in a video-editing workflow',values:[5.4,1.9,1]},
    {name:'3D rendering',title:'Faster path tracing in a three-dimensional scene',values:[6.2,2.1,1]},
    {name:'Code compiling',title:'Faster clean builds in a large application project',values:[3.8,1.5,1]}
  ];
  const devices=['Studio concept · current','Studio concept · previous','Studio concept · baseline'];
  const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(+v)?+v:0));
  const ease=v=>1-Math.pow(1-clamp(v),3);
  function transition(tab,previousTab,progress){
    const elapsed=clamp(progress)*transitionDuration;
    const out=1-clamp(elapsed/.16),incoming=clamp((elapsed-.16)/.2);
    return {tab,previousTab,progress:clamp(progress),elapsed,out,incoming,bars:[0,1,2].map(i=>ease((elapsed-(.4+.1*i))/1.2))};
  }
  function state(progress,options={}){
    if(Number.isInteger(options.tab))return transition(((options.tab%tabs.length)+tabs.length)%tabs.length,Number.isInteger(options.previousTab)?((options.previousTab%tabs.length)+tabs.length)%tabs.length:2,options.transitionProgress===undefined?1:options.transitionProgress);
    const time=clamp(progress)*duration;
    if(time<.326)return transition(2,2,1);
    if(time<2.310)return transition(0,2,(time-.326)/transitionDuration);
    return transition(1,0,(time-2.310)/transitionDuration);
  }
  function font(ctx,size,weight){ctx.font=(weight||400)+' '+size+'px "Motion Sans"';}
  function rr(ctx,x,y,w,h,r){if(w<=0||h<=0)return;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
  function layout(ctx,w,h){
    const narrow=w<700;
    const scale=narrow?1:w/1188;
    const left=narrow?24:w*.149, right=narrow?24:w*.158;
    const width=w-left-right;
    const tabSize=narrow?22:32*scale, line=narrow?35:36*scale;
    const top=narrow?84:72*scale;
    font(ctx,tabSize,600);let x=left,y=top;const hit=[];
    tabs.forEach((tab,i)=>{const tw=ctx.measureText(tab.name).width;const separator=i===tabs.length-1?0:ctx.measureText(' / ').width;if(x+tw>left+width&&x>left){x=left;y+=line;}hit.push({x,y:y-6*scale,width:tw,height:line,index:i});x+=tw+separator;});
    const headingY=narrow?y+77:252*scale;
    const chartTop=narrow?headingY+105:348*scale;
    const row=narrow?129:137*scale;
    const numberW=narrow?79:133*scale;
    return {narrow,scale,left,width,tabSize,line,top,hit,headingY,chartTop,row,barWidth:width-numberW,numberX:left+width-numberW+25*scale,height:narrow?chartTop+row*2+100:761*scale};
  }
  function wrap(ctx,text,x,y,width,lineHeight){let line='';for(const word of text.split(' ')){const test=line?line+' '+word:word;if(ctx.measureText(test).width>width&&line){ctx.fillText(line,x,y);line=word;y+=lineHeight;}else line=test;}ctx.fillText(line,x,y);return y;}
  function drawChart(ctx,L,s,index,alpha,bars){
    if(alpha<=0)return;ctx.save();ctx.globalAlpha=alpha;
    const tab=tabs[index],S=L.scale;
    ctx.fillStyle='#1d1d1f';font(ctx,L.narrow?24:28*S,600);ctx.textBaseline='top';wrap(ctx,tab.title,L.left,L.headingY,L.width,L.narrow?28:32*S);
    for(let i=0;i<3;i++){
      const y=L.chartTop+i*L.row,full=L.barWidth*tab.values[i]/tab.values[0],reveal=bars[i];
      // Move a full-size bar from -100% inside a stationary rounded mask.
      ctx.save();ctx.beginPath();ctx.roundRect(L.left,y,full,10*S,5*S);ctx.clip();ctx.globalAlpha=alpha*reveal;
      let fill='#939398';if(i===0){fill=ctx.createLinearGradient(L.left,y,L.left+full,y);fill.addColorStop(0,'#f2b9ff');fill.addColorStop(.46,'#b144f6');fill.addColorStop(1,'#6948ff');}
      ctx.fillStyle=fill;rr(ctx,L.left-full*(1-reveal),y,full,10*S,5*S);ctx.restore();
      font(ctx,L.narrow?18:24*S,400);ctx.fillStyle='#29292b';ctx.fillText(devices[i],L.left,y+25*S);
      if(i<2){font(ctx,L.narrow?36:48*S,600);ctx.fillStyle=i===0?'#823cf4':'#949497';ctx.fillText(tab.values[i].toFixed(1)+'×',L.numberX,y-5*S);}
    }ctx.restore();
  }
  function render(ctx,w,h,progress,options={}){
    const s=state(progress,options),L=layout(ctx,w,h);ctx.save();ctx.clearRect(0,0,w,h);ctx.fillStyle='#fafafa';ctx.fillRect(0,0,w,h);ctx.textBaseline='top';
    const S=L.scale;ctx.fillStyle='#202023';font(ctx,L.narrow?15:20*S,600);ctx.fillText('FORM / STUDIO',L.narrow?24:96*S,L.narrow?19:18*S);
    ctx.fillStyle='#737377';font(ctx,L.narrow?10:12*S,400);ctx.textAlign='right';ctx.fillText('MOTION STUDY 03',w-(L.narrow?24:96*S),L.narrow?22:22*S);ctx.textAlign='left';ctx.fillStyle='#d9d9dc';ctx.fillRect(0,L.narrow?53:51*S,w,1);
    font(ctx,L.tabSize,600);
    L.hit.forEach((box,i)=>{ctx.fillStyle=i===s.tab?'#843cf2':'#757579';ctx.fillText(tabs[i].name,box.x,box.y+6*S);if(i<tabs.length-1){ctx.fillStyle='#89898c';ctx.fillText(' /',box.x+box.width,box.y+6*S);}});
    if(options.previousFrame){
      // A rapid selection fades the actual visible chart, not an unfinished target at 100%.
      const bottom=L.narrow?L.chartTop+L.row*2+76:721*S;
      ctx.save();ctx.beginPath();ctx.rect(0,L.headingY-1,w,bottom-L.headingY);ctx.clip();
      ctx.globalAlpha=s.out;ctx.drawImage(options.previousFrame,0,0,w,h);ctx.restore();
    }else if(s.previousTab!==s.tab)drawChart(ctx,L,s,s.previousTab,s.out,[1,1,1]);
    drawChart(ctx,L,s,s.tab,options.previousFrame?s.incoming:s.previousTab===s.tab?1:s.incoming,s.bars);
    ctx.fillStyle='#77777d';font(ctx,L.narrow?11:12*S,400);const foot=L.narrow?L.chartTop+L.row*2+76:721*S;
    wrap(ctx,'Fictional example data · Relative performance · Baseline = 1×',L.left,foot,L.width,17*S);
    ctx.restore();return s;
  }
  return {render,state,layout,tabs,devices,duration,transitionDuration,clamp,ease};
});
