'use strict';
// Offline export calls exactly the same motion and rasterizer used by app.js.
const fs=require('node:fs'),path=require('node:path');
const {createCanvas}=require('@napi-rs/canvas');
const Motion=require('./motion.js'),Renderer=require('./renderer.js'),Config=require('./scene-config.js');
function argument(name,fallback){const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1];}
const out=path.resolve(argument('out',path.join(__dirname,'preview/frames'))),start=Number(argument('start',14.784142261714624)),duration=Number(argument('duration',5.1)),fps=Number(argument('fps',25)),width=Number(argument('width',564));
if(!Number.isFinite(start)||start<0||start+duration>120||!Number.isFinite(duration)||duration<=0||duration>60||!Number.isFinite(fps)||fps<1||fps>60||!Number.isInteger(width)||width<128||width>1440)throw new RangeError('Invalid export arguments');
fs.mkdirSync(out,{recursive:true});const height=Math.round(width*Config.height/Config.width),sim=Motion.createSimulation(Config.motion),c=createCanvas(width,height),ctx=c.getContext('2d');
const custom=argument('times',''),times=custom?JSON.parse(fs.readFileSync(custom,'utf8')).map(Number):Array.from({length:Math.ceil(duration*fps)},(_,i)=>start+i*duration/Math.ceil(duration*fps));
const frames=[];let began=Date.now();for(let i=0;i<times.length;i++){const t=times[i],s=sim.stateAt(t);const stats=Renderer.render(ctx,s.bodies,{...Config.render,width,height});const name=String(i).padStart(5,'0')+'.png';fs.writeFileSync(path.join(out,name),c.toBuffer('image/png'));frames.push({file:name,time:t,bodies:s.bodies.length,stats});}
const report={method:'Shared motion.js and renderer.js; no captured source textures',configuration:Config,width,height,start,duration,nominalFps:fps,frames,renderWallMs:Date.now()-began};fs.writeFileSync(path.join(out,'render-manifest.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({frames:times.length,width,height,renderWallMs:report.renderWallMs,configuration:Config}));
