'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const {createCanvas,GlobalFonts}=require('@napi-rs/canvas');
const M=require('../src/motion.js'),S=require('../src/scene.js');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'preview');fs.mkdirSync(OUT,{recursive:true});
GlobalFonts.registerFromPath(path.join(ROOT,'assets/Inter-Regular.ttf'),'Jitter Sans');GlobalFonts.registerFromPath(path.join(ROOT,'assets/Inter-Medium.ttf'),'Jitter Sans');
const canvas=createCanvas(S.W,S.H),ctx=canvas.getContext('2d'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function main(){
 for(const [name,t] of [['rest',0],['onset',.12],['peak',.50],['return',1.7]]){S.draw(ctx,{seconds:t});fs.writeFileSync(path.join(OUT,name+'.png'),await canvas.encode('png'));}
 if(process.argv.includes('--stills'))return;
 const fps=60,duration=4.5,mp4=path.join(OUT,'jitter.mp4'),lossless=path.join(OUT,'jitter-lossless.mkv');
 const ff=cp.spawn('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${S.W}x${S.H}`,'-r',String(fps),'-i','pipe:0','-an','-c:v','libx264','-threads','2','-crf','17','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart',mp4,'-map','0:v','-c:v','ffv1','-level','3','-threads','2','-pix_fmt','bgra',lossless],{stdio:['pipe','inherit','inherit']});
 const end=new Promise((resolve,reject)=>{ff.once('error',reject);ff.once('exit',c=>c?reject(Error('ffmpeg '+c)):resolve());});
 const bindings=[];
 for(let i=0;i<fps*duration;i++){const state=M.previewTime(i/fps);S.draw(ctx,state);const p=ctx.getImageData(0,0,S.W,S.H).data,b=Buffer.from(p.buffer,p.byteOffset,p.byteLength);bindings.push({frame:i,seconds:i/fps,motionSeconds:state.seconds,rgba_sha256:sha(b)});if(!ff.stdin.write(b))await new Promise(r=>ff.stdin.once('drain',r));}
 ff.stdin.end();await end;
 cp.execFileSync('ffmpeg',['-y','-v','error','-threads','2','-filter_complex_threads','1','-i',lossless,'-filter_complex','fps=50,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',path.join(OUT,'jitter.gif')]);
 fs.unlinkSync(lossless);
 const sources=['src/motion.js','src/tracks.js','src/scene.js'].map(p=>({path:p,sha256:sha(fs.readFileSync(path.join(ROOT,p)))}));
 fs.writeFileSync(path.join(OUT,'render-manifest.json'),JSON.stringify({renderer:'Offline @napi-rs/canvas; not a browser or native screen recording',shared_scene:true,width:S.W,height:S.H,fps,frames:bindings.length,duration,gif_fps:50,motion_duration:M.DURATION,sources,mp4_sha256:sha(fs.readFileSync(mp4)),gif_sha256:sha(fs.readFileSync(path.join(OUT,'jitter.gif')))},null,2)+'\n');
 fs.writeFileSync(path.join(OUT,'frame-bindings.json'),JSON.stringify(bindings,null,2)+'\n');
 console.log('Rendered',bindings.length,'frames');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
