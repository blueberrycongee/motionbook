const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
const Scene=require('./scene.js');
GlobalFonts.registerFromPath(path.join(__dirname,'assets/Mono.ttf'),'Replica Mono');
GlobalFonts.registerFromPath(path.join(__dirname,'assets/Mono-Bold.ttf'),'Replica Mono');
GlobalFonts.registerFromPath(path.join(__dirname,'assets/StudySans-Regular.ttf'),'Replica Sans');
GlobalFonts.registerFromPath(path.join(__dirname,'assets/StudySans-Semibold.ttf'),'Replica Sans');
for(const font of ['StudyHand-Regular.ttf','StudyHand-Semibold.ttf','StudyHand-Bold.ttf'])GlobalFonts.registerFromPath(path.join(__dirname,'assets',font),'Hand');
(async()=>{const canvas=createCanvas(Scene.W,Scene.H),ctx=canvas.getContext('2d'),assets={};for(const [key,rel]of Object.entries(Scene.ASSETS||{}))assets[key]=await loadImage(path.join(__dirname,rel));
const out=path.join(__dirname,'preview');fs.mkdirSync(out,{recursive:true});
for(const [label,t]of Object.entries(Scene.STILLS)){Scene.draw(ctx,t,assets);fs.writeFileSync(path.join(out,label+'.png'),await canvas.encode('png'));}
if(process.argv.includes('--stills'))return;
const fps=Scene.FPS||60,count=Math.round(Scene.DURATION*fps);
const enc=cp.spawn('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${Scene.W}x${Scene.H}`,'-r',String(fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'loop.mp4')],{stdio:['pipe','inherit','inherit']});
for(let i=0;i<count;i++){Scene.draw(ctx,i/fps,assets);const pixels=ctx.getImageData(0,0,Scene.W,Scene.H).data;if(!enc.stdin.write(Buffer.from(pixels.buffer)))await new Promise(r=>enc.stdin.once('drain',r));if(i%30===0&&global.gc)global.gc();if(i%120===0)console.log(i+'/'+count);}
enc.stdin.end();await new Promise((r,j)=>enc.once('exit',c=>c?j(new Error('ffmpeg '+c)):r()));
const temporary=fs.mkdtempSync(require('node:path').join(require('node:os').tmpdir(),'motion-palette-')),palette=path.join(temporary,'palette.png');
cp.execFileSync('ffmpeg',['-y','-v','error','-threads','2','-filter_threads','1','-i',path.join(out,'loop.mp4'),'-vf',`fps=20,scale=${Math.min(Scene.W,864)}:-1:flags=lanczos,palettegen=stats_mode=diff`,'-frames:v','1',palette]);
cp.execFileSync('ffmpeg',['-y','-v','error','-threads','2','-filter_complex_threads','1','-i',path.join(out,'loop.mp4'),'-i',palette,'-lavfi',`fps=20,scale=${Math.min(Scene.W,864)}:-1:flags=lanczos[v];[v][1:v]paletteuse=dither=bayer:bayer_scale=3`,'-loop','0',path.join(out,'loop.gif')]);fs.rmSync(temporary,{recursive:true,force:true});
fs.writeFileSync(path.join(out,'preview.json'),JSON.stringify({kind:'Offline Canvas 2D render; same scene.js as browser, not a browser capture',renderer:'@napi-rs/canvas',width:Scene.W,height:Scene.H,fps,frames:count,duration:Scene.DURATION,gifFps:20,loop:'Scene state returns exactly to initial state at duration'},null,2)+'\n');})();
