const fs=require('fs'),path=require('path'),crypto=require('crypto'),sharp=require('sharp');
const Scene=require('../src/scene.js'),Trace=require('../src/trace.js');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const verify=process.argv[2]==='--verify',target=process.argv[verify?3:2];
if(!target)throw Error('Use: node scripts/render.cjs OUTPUT_DIR, or --verify BINDINGS_JSON');
const expected=verify?JSON.parse(fs.readFileSync(target,'utf8')).frames:null;
if(!verify)fs.mkdirSync(target,{recursive:true});
(async()=>{const frames=[];for(let i=0;i<Trace.frames.length;i++){
 const svg=Buffer.from(Scene.render(Trace.frames[i]));const png=await sharp(svg).png().toBuffer();
 const raw=await sharp(png).ensureAlpha().raw().toBuffer();
 const row={frame:i,pts:Trace.frames[i].t,svg_sha256:sha(svg),png_sha256:sha(png),rgba_sha256:sha(raw)};
 if(verify){if(row.rgba_sha256!==expected[i].rgba_sha256||row.svg_sha256!==expected[i].svg_sha256||row.pts!==expected[i].pts)throw Error('Binding mismatch at frame '+i);}
 else fs.writeFileSync(path.join(target,String(i).padStart(3,'0')+'.png'),png);
 frames.push(row);
}if(!verify)fs.writeFileSync(path.join(target,'bindings.json'),JSON.stringify({frames},null,2)+'\n');console.log(JSON.stringify({frames:frames.length,verified:verify,all_pass:true}));})().catch(e=>{console.error(e);process.exit(1);});
