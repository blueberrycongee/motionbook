'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
process.env.FONTCONFIG_FILE=__dirname+'/fonts.conf';
const S=require('./scene.js');
function ff(args){cp.execFileSync('ffmpeg',['-y','-v','error','-threads','2',...args],{stdio:'inherit'});}
(async()=>{
 if(process.argv[2]==='--chunk'){
  const sharp=require('sharp');sharp.concurrency(2);sharp.cache(false);
  const [dir,start,end]=process.argv.slice(3);
  for(let i=+start;i<+end;i++){const t=i<615?S.DATA[i][0]:i/60;await sharp(Buffer.from(S.svg(t))).flatten({background:'#fdfdfd'}).removeAlpha().png().toFile(path.join(dir,'replica-'+String(i+1).padStart(5,'0')+'.png'));}
  return;
 }
 const dir=path.join(__dirname,'preview'),n=Math.round(S.DURATION*60),audit=process.env.AUDIT_DIR;
 fs.mkdirSync(dir,{recursive:true});
 const temp=audit?path.join(audit,'native'):fs.mkdtempSync(path.join(os.tmpdir(),'sidebar-render-'));
 fs.mkdirSync(temp,{recursive:true});
 if(!process.argv.includes('--encode-existing'))for(let start=0;start<n;start+=32){cp.execFileSync(process.execPath,[__filename,'--chunk',temp,String(start),String(Math.min(n,start+32))],{stdio:'inherit'});console.log('Raster',Math.min(n,start+32),'/',n);}
 for(const[name,f]of[['transactional',0],['analytics',180],['templates',400]])fs.copyFileSync(path.join(temp,'replica-'+String(f+1).padStart(5,'0')+'.png'),path.join(dir,name+'.png'));
 const mp4=path.join(dir,'loop.mp4'),gif=path.join(dir,'loop.gif'),palette=path.join(temp,'palette.png');
 ff(['-framerate','60','-i',path.join(temp,'replica-%05d.png'),'-frames:v',String(n),'-an','-c:v','libx264','-threads','2','-preset','fast','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',mp4]);
 ff(['-xerror','-i',mp4,'-f','null','-']);
 ff(['-i',mp4,'-vf','fps=20,scale=1448:-2:flags=lanczos,palettegen=stats_mode=diff','-frames:v','1','-threads','1',palette]);
 ff(['-i',mp4,'-i',palette,'-filter_complex_threads','2','-lavfi','[0:v]fps=20,scale=1448:-2:flags=lanczos[v];[v][1:v]paletteuse=dither=bayer:bayer_scale=3','-loop','0',gif]);
 fs.writeFileSync(path.join(dir,'render.json'),JSON.stringify({kind:'Offline rendering of the shared SVG scene; not a browser recording',frames:n,fps:60,duration:S.DURATION,width:S.W,height:S.H,original_frames:615,original_pts_used:true,authored_tail_frames:n-615,gif_fps:20,threads:2,method:'Isolated32-frame raster chunks, standalone MP4 encode, bounded two-pass GIF palette'},null,2));
 if(!audit)fs.rmSync(temp,{recursive:true,force:true});
 console.log('Rendered',n,'frames');
})().catch(e=>{console.error(e);process.exitCode=1});
