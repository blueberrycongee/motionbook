const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
process.env.FONTCONFIG_FILE=path.join(__dirname,'fonts.conf');
const sharp=require('sharp'),Scene=require('./scene.js'),bindings=require('./validation/frame-bindings.json');
sharp.concurrency(1);sharp.cache(false);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{const selected=process.argv[2]?process.argv[2].split(',').map(Number):bindings.frames.map(x=>x.index);for(const i of selected){const f=bindings.frames[i];if(!f)throw Error('Invalid frame '+i);const svg=Scene.render(f.pts),rgba=await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer();if(hash(svg)!==f.svg_sha256||hash(rgba)!==f.rgba_sha256)throw Error('Raster mismatch at '+i);}console.log(JSON.stringify({pass:true,fresh_rgba_frames:selected.length,indices:selected,browser_execution:false}));})().catch(e=>{console.error(e);process.exitCode=1;});
