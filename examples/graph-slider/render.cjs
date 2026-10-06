const fs=require('node:fs'),path=require('node:path');
process.env.FONTCONFIG_FILE=path.join(__dirname,'fonts.conf');
const sharp=require('sharp'),Scene=require('./scene.js'),Data=require('./motion-data.js');
sharp.concurrency(1);sharp.cache(false);
async function frame(time,out){await sharp(Buffer.from(Scene.render(time))).png().toFile(out);}
(async()=>{
  const arg=process.argv[2]??'0',out=process.argv[3]??'still.png';
  if(arg==='all'){
    fs.mkdirSync(out,{recursive:true});
    for(let i=0;i<Data.frames.length;i++)await frame(Data.frames[i].pts,path.join(out,String(i+1).padStart(5,'0')+'.png'));
    console.log(JSON.stringify({out,frames:Data.frames.length,kind:'offline SVG, not browser capture'}));
  }else{
    const time=Number(arg);if(!Number.isFinite(time))throw Error('Time must be finite');await frame(time,out);
    console.log(JSON.stringify({out,time,kind:'offline SVG, not browser capture'}));
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
