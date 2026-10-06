const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const out=process.argv[2];if(!out)throw Error('Provide a new output directory.');if(fs.existsSync(out))throw Error('Output directory already exists.');fs.mkdirSync(out,{recursive:true});const frames=path.resolve(out,'frames');
function run(bin,args){const r=spawnSync(bin,args,{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)throw Error(bin+' failed: '+r.status);}
run(process.execPath,[path.join(__dirname,'render.cjs'),'all',frames]);
run('ffmpeg',['-v','error','-threads','2','-framerate','60','-i',path.join(frames,'%05d.png'),'-c:v','libx264','-threads','2','-preset','medium','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart','-video_track_timescale','60000',path.resolve(out,'full.mp4')]);
run('ffmpeg',['-v','error','-threads','2','-framerate','60','-i',path.join(frames,'%05d.png'),'-filter_complex_threads','1','-filter_complex','fps=30,scale=1005:627:flags=lanczos,split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a','-loop','0',path.resolve(out,'loop.gif')]);
console.log('Offline export complete: '+out);
