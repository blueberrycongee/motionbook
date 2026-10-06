'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..'),cache=fs.mkdtempSync(path.join(os.tmpdir(),'light-work-fonts-'));
const xml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const config=path.join(cache,'fonts.conf');
fs.writeFileSync(config,`<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><dir>/usr/share/fonts</dir><dir>${xml(path.join(root,'assets'))}</dir><cachedir>${xml(cache)}</cachedir></fontconfig>`);
process.env.FONTCONFIG_FILE=config;
const sharp=require('sharp'),S=require('../scene'),T=require('../timeline');sharp.concurrency(2);sharp.cache({memory:64,files:0,items:20});
const args=process.argv.slice(2),native=args.includes('--native'),w=native?1506:752,h=native?1502:750;
async function render(t,file){let svg=S.svg(T.at(t));if(!native)svg=svg.replace('width="1506" height="1502"',`width="${w}" height="${h}"`);await sharp(Buffer.from(svg)).removeAlpha().png().toFile(file);}
(async()=>{if(args[0]==='all'){const out=path.resolve(args[1]||'frames');fs.mkdirSync(out,{recursive:true});const pts=new Map(T.frames.map(a=>[Math.round(a[0]*60),a[0]]));for(let i=0;i<1140;i++)await render(pts.get(i)??i/60,path.join(out,String(i).padStart(4,'0')+'.png'));}else{const t=Number(args[0]||0);if(!Number.isFinite(t))throw Error('Time must be finite seconds');await render(t,path.resolve(args[1]||'frame.png'));}})().catch(e=>{console.error(e);process.exitCode=1;});
