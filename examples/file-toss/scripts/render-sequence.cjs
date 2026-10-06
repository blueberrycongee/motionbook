// Offline SVG export. This does not launch or validate a browser.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');process.env.FONTCONFIG_FILE=path.join(root,'fonts.conf');
let sharp;try{sharp=require('sharp')}catch(e){if(process.env.MOTION_SHARP_MODULE)sharp=require(process.env.MOTION_SHARP_MODULE);else throw e;}
sharp.concurrency(1);sharp.cache(false);const Scene=require('../scene.js');
const destination=path.resolve(process.argv[2]||'frames'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
if(fs.existsSync(destination)&&fs.readdirSync(destination).length)throw Error('Choose an empty output directory; existing evidence is preserved.');
fs.mkdirSync(destination,{recursive:true});
(async()=>{const frames=[];for(let i=0;i<312;i++){const t=i/30,{data,info}=await sharp(Buffer.from(Scene.render(t))).ensureAlpha().raw().toBuffer({resolveWithObject:true});const name=String(i+1).padStart(5,'0')+'.png',png=await sharp(data,{raw:info}).png().toBuffer();fs.writeFileSync(path.join(destination,name),png);frames.push({index:i,render_time:t,kind:i<282?'native':'authored_tail',png_sha256:sha(png),rgba_sha256:sha(data)});}fs.writeFileSync(path.join(destination,'render-binding.json'),JSON.stringify({kind:'offline SVG raster; not browser capture',width:1920,height:1360,fps:30,frames},null,2)+'\n');console.log('Rendered 312 offline states.');})();
