import test from'node:test';import assert from'node:assert/strict';import{createRequire}from'node:module';
import{backSilhouette}from'../src/scene.mjs';
const require=createRequire(import.meta.url);const{createCanvas,Path2D}=require('@napi-rs/canvas');
test('back-to-profile turn is a single connected head-neck-body contour',()=>{for(let n=0;n<=100;n++){const d=backSilhouette(n/100);assert.equal((d.match(/M /g)||[]).length,1);assert.equal((d.match(/ Z/g)||[]).length,1);assert.equal((d.match(/C /g)||[]).length,17);assert.equal(/NaN|Infinity/.test(d),false);}});
test('coordinated profile morph retains a grounded, continuous center of mass',()=>{
 const c=createCanvas(390,844).getContext('2d');let prior=null;let firstArea=0;
 for(let n=0;n<=100;n++){c.clearRect(0,0,390,844);c.fillStyle='#000';c.fill(new Path2D(backSilhouette(n/100)));const d=c.getImageData(100,540,220,295).data;let total=0,xSum=0,ySum=0;
  for(let i=0;i<d.length;i+=4){const w=d[i+3]/255;total+=w;xSum+=(i/4%220+100)*w;ySum+=(Math.floor(i/4/220)+540)*w;}
  const center={x:xSum/total,y:ySum/total};if(n===0)firstArea=total;
  assert.ok(total/firstArea>.94&&total/firstArea<1.08);assert.ok(center.x>215&&center.x<235);assert.ok(center.y>690&&center.y<735);
  if(prior){assert.ok(Math.abs(center.x-prior.x)<.15);assert.ok(Math.abs(center.y-prior.y)<.15);}prior=center;
 }
});
