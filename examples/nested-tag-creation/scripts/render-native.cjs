'use strict';
const fs=require('node:fs'),path=require('node:path');const root=path.join(__dirname,'..');process.env.FONTCONFIG_FILE=path.join(root,'fonts.conf');let sharp;try{sharp=require('sharp');}catch(error){if(process.env.MOTION_SHARP_MODULE)sharp=require(process.env.MOTION_SHARP_MODULE);else throw error;}
sharp.concurrency(1);sharp.cache(false);const Data=require('../motion-data.js'),Scene=require('../scene.js'),raster=require('../raster.cjs').createRasterizer(sharp),out=path.resolve(process.argv[2]||path.join(root,'preview/frames'));
const times=[...Data.pts,...Array.from({length:60},(_,i)=>22.035+i/60)];
if(process.argv[2]==='--timeline'){console.log(JSON.stringify({times,duration:Scene.DURATION,originalFrameCount:Data.pts.length,width:Scene.W,height:Scene.H}));process.exit(0);}
fs.mkdirSync(out,{recursive:true});
(async()=>{for(let i=0;i<times.length;i++){await fs.promises.writeFile(path.join(out,`${String(i+1).padStart(5,'0')}.png`),await raster(times[i]));if(i%100===0)console.log(`Offline raster ${i}/${times.length}`);}console.log(JSON.stringify({frames:times.length,duration:Scene.DURATION,output:out,browserCapture:false}));})().catch(error=>{console.error(error);process.exitCode=1;});
