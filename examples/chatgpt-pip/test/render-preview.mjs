/** Rebuild clean, effect-only previews. All media is an offline render. */
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const cache=path.join(root,'.render-cache');fs.mkdirSync(cache,{recursive:true});
const env={...process.env,XDG_CACHE_HOME:cache};
function run(command,args){const result=spawnSync(command,args,{cwd:root,env,stdio:'inherit'});if(result.status!==0)throw new Error(`${command} failed: ${result.status}`)}
for(const script of ['test/render-fixtures.mjs','artifacts/snapping/render-snapping.mjs','test/render-hover-v3.mjs'])run(process.execPath,[script]);
const encode=(input,fps,output)=>{
 run('ffmpeg',['-y','-loglevel','error','-framerate',String(fps),'-i',input,'-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',`${output}.mp4`]);
 run('ffmpeg',['-y','-loglevel','error','-framerate',String(fps),'-i',input,'-filter_complex','[0:v]split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a','-loop','0',`${output}.gif`]);
};
encode('artifacts/snapping/frames/frame-%04d.png',30,'artifacts/snapping/pip-snapping-physics');
encode('artifacts/v3/hover-frames/frame-%04d.png',15,'artifacts/v3/pip-hover-interaction-render');
