'use strict';
const fs=require('node:fs');const path=require('node:path');
process.env.FONTCONFIG_FILE=path.join(__dirname,'fonts.conf');
let sharp;try{sharp=require('sharp');}catch(error){if(process.env.MOTION_SHARP_MODULE)sharp=require(process.env.MOTION_SHARP_MODULE);else throw error;}
sharp.concurrency(1);sharp.cache(false);const Scene=require('./scene.js');
const time=Number(process.argv[2]||0),output=process.argv[3]||'still.png';
if(!Number.isFinite(time))throw new Error('Time must be finite');
sharp(Buffer.from(Scene.render(time))).png().toFile(output).then(()=>console.log(JSON.stringify({output,time,width:Scene.W,height:Scene.H,kind:'offline SVG raster, not browser capture'})));
