'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const {createCanvas,GlobalFonts}=require('@napi-rs/canvas');const M=require('./src/motion.js'),S=require('./src/scene.js');
const out=path.join(__dirname,'preview');fs.mkdirSync(out,{recursive:true});for(const w of ['Regular','Medium'])GlobalFonts.registerFromPath(path.join(__dirname,'assets/Inter-'+w+'.ttf'),'Study Sans');
const legacy=process.argv.includes('--legacy'),START=legacy?3.5:4.6,END=legacy?6.7:7.1,reference=legacy?M.reference:M.currentReference;
const canvas=createCanvas(400,720),c=canvas.getContext('2d'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const stills=legacy?[['ready',3.5],['drawing',4.5],['closed',5.375],['morph',5.75],['results',6.7]]:[['ready',4.6],['drawing',5.1],['closed',5.6667],['morph',5.9],['results',6.7]];for(const [name,t]of stills){S.draw(c,reference(t),{caption:true});fs.writeFileSync(path.join(out,name+'.png'),await canvas.encode('png'));}
 if(process.argv.includes('--stills'))return;
 const fps=60,count=Math.round((END-START)*fps),video=path.join(out,'circle-to-search.mp4');const ff=cp.spawn('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s','400x720','-r',String(fps),'-i','pipe:0','-an','-c:v','libx264','-threads','2','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',video],{stdio:['pipe','inherit','inherit']});const exit=new Promise((res,rej)=>{ff.on('error',rej);ff.on('exit',code=>code?rej(Error('ffmpeg '+code)):res());});let frames=[];
 for(let f=0;f<count;f++){const pts=START+f/fps,p=reference(pts);S.draw(c,p,{caption:true});const bytes=Buffer.from(c.getImageData(0,0,400,720).data);frames.push({f,pts,rgba:sha(bytes),box:p.box,sheetY:p.sheetY});if(!ff.stdin.write(bytes))await new Promise(res=>ff.stdin.once('drain',res));}ff.stdin.end();await exit;
 cp.execFileSync('ffmpeg',['-y','-v','error','-threads','2','-filter_complex_threads','1','-i',video,'-filter_complex','fps=50,split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=diff[p];[s1][p]paletteuse=dither=sierra2_4a','-loop','0',path.join(out,'Circle-to-Search-原速.gif')]);
 const sourceFiles=['src/motion.js','src/appearance.js','src/scene.js','src/app.js'].map(p=>({path:p,sha256:sha(fs.readFileSync(path.join(__dirname,p)))}));fs.writeFileSync(path.join(out,'render-manifest.json'),JSON.stringify({renderer:'Offline @napi-rs/canvas; same motion.js and scene.js as browser. Not a browser recording.',width:400,height:720,videoFps:fps,gifFps:50,referenceProfile:legacy?'2024':'2026',referencePts:[START,END],sourceFiles,frames},null,2));console.log('Rendered '+count+' frames');
})().catch(e=>{console.error(e);process.exitCode=1;});
