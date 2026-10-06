'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),fontRoot=path.join(root,'assets'),cache=fs.mkdtempSync(path.join(os.tmpdir(),'elastic-clock-fonts-')),xml=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const config=path.join(cache,'fonts.conf');fs.writeFileSync(config,`<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><dir>/usr/share/fonts</dir><dir>${xml(fontRoot)}</dir><cachedir>${xml(cache)}</cachedir></fontconfig>`);process.env.FONTCONFIG_FILE=config;
const sharp=require('sharp');sharp.concurrency(1);sharp.cache({memory:16,files:0,items:0});
const S=require('../scene'),T=require('../timeline'),width=864,height=540,count=1200,hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const time=i=>i<T.frames.length?T.frames[i].t:i/60;
async function renderRGB(t,w=width,h=height){const svg=S.svg(T.at(t)).replace('width="1726" height="1080"',`width="${w}" height="${h}"`);return sharp(Buffer.from(svg)).removeAlpha().raw().toBuffer();}
async function png(i,target){const raw=await renderRGB(time(i));await sharp(raw,{raw:{width,height,channels:3}}).png().toFile(target);return {i,t:time(i),rgbSHA256:hash(raw),pngSHA256:hash(fs.readFileSync(target))};}
module.exports={renderRGB,time,count,width,height,hash,root};
if(require.main===module)(async()=>{const [mode,target]=process.argv.slice(2);if(!target)throw Error('Usage: node scripts/render.cjs FRAME output.png, or --all output-directory');if(mode==='--all'){fs.mkdirSync(target,{recursive:true});const rows=[];for(let i=0;i<count;i++)rows.push(await png(i,path.join(target,String(i).padStart(4,'0')+'.png')));fs.writeFileSync(path.join(target,'frame-hashes.jsonl'),rows.map(x=>JSON.stringify(x)).join('\n')+'\n');console.log(`Rendered ${rows.length} offline SVG frames.`);}else{const i=Number(mode);if(!Number.isInteger(i)||i<0||i>=count)throw Error('FRAME must be an integer from 0 to 1199');console.log(JSON.stringify(await png(i,target)));}})().catch(e=>{console.error(e.message);process.exitCode=1;});
