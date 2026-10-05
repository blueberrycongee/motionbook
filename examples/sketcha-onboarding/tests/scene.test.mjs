import test from 'node:test';import assert from 'node:assert/strict';import {createRequire}from'node:module';import fs from'node:fs';import path from'node:path';import {fileURLToPath}from'node:url';
const require=createRequire(import.meta.url);const {createCanvas,Path2D,GlobalFonts}=require('@napi-rs/canvas');
import {configureRenderer,drawScene,COLORS}from'../src/scene.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
GlobalFonts.registerFromPath(path.join(root,'assets/fonts/OnboardingSans-Regular.ttf'),'Study Sans');GlobalFonts.registerFromPath(path.join(root,'assets/fonts/OnboardingChinese-Regular.otf'),'Study CJK');configureRenderer(Path2D);
const c=createCanvas(390,844).getContext('2d');
function pixel(x,y){return '#'+[...c.getImageData(x,y,1,1).data].slice(0,3).map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase();}
test('idle background is the measured cyan, no editorial chrome',()=>{drawScene(c,-1);assert.equal(pixel(195,100),COLORS.blue);assert.equal(pixel(5,5),COLORS.blue);});
test('cat and tiny poke hint are drawn at measured positions',()=>{drawScene(c,-1);assert.equal(pixel(219,620),COLORS.ink);assert.equal(pixel(227,755),COLORS.ink);assert.equal(pixel(190,400),COLORS.blue);});
test('menu palette and intentional top whitespace match measured layout',()=>{drawScene(c,4);assert.equal(pixel(195,100),COLORS.paper);assert.equal(pixel(50,330),COLORS.lime);assert.equal(pixel(50,445),COLORS.mint);assert.equal(pixel(50,572),COLORS.purple);assert.equal(pixel(50,698),COLORS.pink);});
test('partial peel reveals stationary menu at the top while foreground remains lower',()=>{drawScene(c,3.57);assert.equal(pixel(203,20),COLORS.paper);assert.equal(pixel(30,700),COLORS.blue);});
test('all phases render without throwing and produce opaque scene',()=>{for(let t=-1;t<4.1;t+=.025){assert.doesNotThrow(()=>drawScene(c,t));assert.equal(c.getImageData(195,10,1,1).data[3],255);}});
test('runtime has no downloaded screenshot/video, proprietary bundle, or remote dependency',()=>{const app=fs.readFileSync(path.join(root,'src/scene.mjs'),'utf8')+fs.readFileSync(path.join(root,'src/app.mjs'),'utf8');assert.equal(/drawImage|\.mp4|\.webp|https:\/\//.test(app),false);});
test('semantic buttons expose the four observed menu actions plus replay',()=>{const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const key of ['Take a photo','导入','撒点成画','随机形状','重新播放小猫入场'])assert.ok(html.includes(key));assert.ok(html.includes('aria-live="polite"'));});
