import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const{createCanvas,GlobalFonts}=require('@napi-rs/canvas');
import{mkdir,writeFile}from'node:fs/promises';import{execFileSync}from'node:child_process';
import{demoFrame,TIMING}from'./src/motion.mjs';import{drawScene}from'./src/draw.mjs';
process.chdir(new URL('.',import.meta.url).pathname);
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','DejaVu Sans');GlobalFonts.registerFromPath('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','DejaVu Sans');
await mkdir('output/frames',{recursive:true});await mkdir('evidence',{recursive:true});
const c=createCanvas(720,720),ctx=c.getContext('2d');const fps=30,count=Math.round(TIMING.duration*fps);
for(let i=0;i<count;i++){
 const t=i/fps;drawScene(ctx,demoFrame(t));await writeFile(`output/frames/${String(i).padStart(3,'0')}.png`,c.toBuffer('image/png'));
}
for(const[name,t,reduced]of[['hint',1.1,false],['reward',TIMING.click+.6,false],['settled',5,false],['reduced',TIMING.click+.01,true]]){drawScene(ctx,demoFrame(t,{reduced}));await writeFile(`evidence/${name}.png`,c.toBuffer('image/png'));}
for(const[dir,out]of[['frames','07-youtube-subscribe-demo.gif']])execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate','30','-i',`output/${dir}/%03d.png`,'-frames:v',String(count),'-filter_complex','[0:v]split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle','-loop','0',`output/${out}`]);
console.log(JSON.stringify({frames:count,fps,duration:count/fps,canvas:'720x720',reference:'Google Design 2025-02-11 official red-magenta components; source media excluded'}));
