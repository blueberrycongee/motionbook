import {createRequire}from'node:module';import{mkdirSync,writeFileSync}from'node:fs';import{spawn}from'node:child_process';import{once}from'node:events';
import{SpaceScene}from'../src/scene.mjs';import{springValue}from'../src/motion.mjs';
const require=createRequire(import.meta.url);const{createCanvas,GlobalFonts}=require('@napi-rs/canvas');
for(const p of ['/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf'])try{GlobalFonts.registerFromPath(p);}catch{}
const width=1440,height=1116,fps=60,seconds=18,out=new URL('../artifacts/',import.meta.url).pathname;mkdirSync(out,{recursive:true});
const canvas=createCanvas(width,height),ctx=canvas.getContext('2d'),scene=new SpaceScene(width,height,createCanvas),still=process.argv.includes('--still');
let encoder;if(!still){encoder=spawn('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',`${width}x${height}`,'-r',String(fps),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',out+'space-welcome-60fps.mp4'],{stdio:['pipe','inherit','inherit']});}
const snapshots=new Map([[150,'idle'],[450,'collaboration'],[650,'pointer'],[908,'warp'],[935,'warp-fast']]);
for(let frame=0;frame<(still?151:seconds*fps);frame++){
 const t=frame/fps,p={active:t>7.5&&t<12.5,x:width*(.39+.19*Math.sin((t-7.5)*.9)),y:height*(.45+.14*Math.cos((t-7.5)*.8)),down:t>9.3&&t<9.8};
 if(frame===900)scene.beginWarp();scene.step(frame?1/fps:0,p);
 const offsets=Array.from({length:4},()=>({x:0,y:0,angle:0}));
 // Preview fixture: a keyboard toss exercises the recovered release spring.
 if(t>=11.5&&t<15){const elapsed=t-11.5;offsets[2]={x:springValue(0,580,elapsed),y:springValue(0,-500,elapsed),angle:0};}
 scene.draw(ctx,{pointer:p,offsets,hover:t>14.5&&t<15});
 if(snapshots.has(frame))writeFileSync(out+snapshots.get(frame)+'.png',canvas.toBuffer('image/png'));
 if(!still){const bytes=Buffer.from(ctx.getImageData(0,0,width,height).data.buffer);if(!encoder.stdin.write(bytes))await once(encoder.stdin,'drain');}
 if(frame%120===0)console.log(`Frame ${frame}/${seconds*fps}`);
}
if(encoder){encoder.stdin.end();const[code]=await once(encoder,'close');if(code)throw new Error('ffmpeg exited '+code);}
