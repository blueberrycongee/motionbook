'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
const M=require('../src/motion.js'),S=require('../src/scene.js');
const root=path.join(__dirname,'..'),out=path.join(root,'preview');
GlobalFonts.registerFromPath(path.join(root,'assets/Inter-Regular.ttf'),'Jitter Sans');GlobalFonts.registerFromPath(path.join(root,'assets/Inter-Medium.ttf'),'Jitter Sans');
const W=1080,H=800,canvas=createCanvas(W,H),c=canvas.getContext('2d'),scene=createCanvas(S.W,S.H),sc=scene.getContext('2d');
async function main(){
 const mp4=path.join(out,'jitter-reference-comparison.mp4'),lossless=path.join(out,'comparison-lossless.mkv'),fps=30000/1001;
 const ff=cp.spawn('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(fps),'-i','pipe:0','-an','-c:v','libx264','-threads','2','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',mp4,'-map','0:v','-c:v','ffv1','-level','3','-threads','2','-pix_fmt','bgra',lossless],{stdio:['pipe','inherit','inherit']});
 const ended=new Promise((resolve,reject)=>{ff.once('error',reject);ff.once('exit',n=>n?reject(Error(String(n))):resolve());});
 for(let k=24;k<=88;k++){
  const t=(k-27)/fps,reference=await loadImage(path.join(root,`evidence/frames/f-${String(k+1).padStart(3,'0')}.png`));
  c.fillStyle='#f0f1f5';c.fillRect(0,0,W,H);S.text(c,'Jitter · frame-aligned comparison',32,40,24,'#273242',500);
  S.text(c,'APPLE · WWDC24 reference',32,82,16,'#5c6879',500);S.text(c,'RECONSTRUCTION · original text',563,82,16,'#5c6879',500);
  S.rr(c,24,103,501,409,18,'#fff');S.rr(c,555,103,501,409,18,'#fff');
  c.drawImage(reference,590,177,737,727,62,112,420,394);
  S.draw(sc,{seconds:Math.max(0,t),selected:k>=26});c.drawImage(scene,181,391,438,369,575,112,460,388);
  S.text(c,'Selected word · 3× inspection crop',32,548,14,'#637084');S.text(c,'Same clock and fitted transform · new wording',563,548,14,'#637084');
  S.rr(c,24,561,501,160,14,'#fff');S.rr(c,555,561,501,160,14,'#fff');
  c.drawImage(reference,709,234,150,46,47,574,450,138);
  c.save();c.translate(577,582);c.scale(3,3);c.fillStyle='#bbd9fa';c.fillRect(0,3,159,31);S.drawWord(c,'wiggling',2,28,35,Math.max(0,t),'#142133',false,168);c.restore();
  S.text(c,`Source time ≈ ${(1316.79+k/fps).toFixed(3)} s  ·  source frame ${k}`,32,749,13,'#596677');
  S.text(c,'Coordinated rocking; independent random phases are not established by this clip',32,780,13,'#596677');
  S.text(c,'Source: Apple WWDC24 Keynote, 21:57–22:00 · developer.apple.com/videos/play/wwdc2024/101/',1060,749,11,'#727d8c',400,'right');
  if([30,39,42,51,72,87].includes(k))fs.writeFileSync(path.join(out,`comparison-${k}.png`),await canvas.encode('png'));
  const a=c.getImageData(0,0,W,H).data;if(!ff.stdin.write(Buffer.from(a.buffer,a.byteOffset,a.byteLength)))await new Promise(r=>ff.stdin.once('drain',r));
 }
 ff.stdin.end();await ended;
 cp.execFileSync('ffmpeg',['-y','-v','error','-threads','2','-filter_complex_threads','1','-i',lossless,'-filter_complex','fps=30,split[a][b];[a]palettegen[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',path.join(out,'jitter-reference-comparison.gif')]);
 fs.unlinkSync(lossless);
 console.log('Compared 65 source-aligned frames');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
