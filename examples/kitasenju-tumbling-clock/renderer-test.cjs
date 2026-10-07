'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const {performance}=require('node:perf_hooks');
const {createCanvas}=require('@napi-rs/canvas');
const R=require('./renderer.js');
const root=__dirname,results=[];
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function test(name,fn){const t=performance.now();const result=fn();results.push({name,passed:true,ms:+(performance.now()-t).toFixed(2),...result});console.log('PASS '+name);}
function render(bodies,options={}){const width=options.width||564,height=options.height||342,c=createCanvas(width,height),ctx=c.getContext('2d');const stats=R.render(ctx,bodies,{width,height,...options});return {c,ctx,stats,pixels:ctx.getImageData(0,0,width,height).data};}
function alphaPixels(data){let n=0;for(let i=0;i<data.length;i+=4){assert.equal(data[i],data[i+1]);assert.equal(data[i],data[i+2]);assert.equal(data[i+3],255);if(data[i])n++;}return n;}
const pile=count=>Array.from({length:count},(_,i)=>({id:'digit-'+i,digit:String((i+4)%10),position:[((i%6)-2.5)*180,200-Math.floor(i/6)*105,Math.floor(i/6)*40],rotation:[Math.sin(i)*.9,Math.cos(i)*.8,i*.4],scale:210,thickness:50}));

test('Watertight geometry, triangle winding, cap area, holes and genus',()=>{
  let triangles=0;let maxAreaError=0;
  for(const [digit,g] of Object.entries(R.DATA.digits)){
    const edges=new Map(),directed=new Map(),used=new Set();let area=0,volume=0;
    for(const t of g.triangles){
      const [a,b,c,kind]=t;assert(a!==b&&b!==c&&a!==c);[a,b,c].forEach(i=>{assert(Number.isInteger(i)&&i>=0&&i<g.vertices.length);used.add(i)});
      const p=g.vertices[a],q=g.vertices[b],r=g.vertices[c],cross=[(q[1]-p[1])*(r[2]-p[2])-(q[2]-p[2])*(r[1]-p[1]),(q[2]-p[2])*(r[0]-p[0])-(q[0]-p[0])*(r[2]-p[2]),(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0])];
      assert(Math.hypot(...cross)>1e-12);if(kind===0){assert(cross[2]>0);area+=cross[2]/2;}if(kind===1)assert(cross[2]<0);
      volume+=(p[0]*(q[1]*r[2]-q[2]*r[1])+p[1]*(q[2]*r[0]-q[0]*r[2])+p[2]*(q[0]*r[1]-q[1]*r[0]))/6;
      for(const [u,v] of [[a,b],[b,c],[c,a]]){const key=u<v?u+','+v:v+','+u;edges.set(key,(edges.get(key)||0)+1);const dir=u+','+v;directed.set(dir,(directed.get(dir)||0)+1);}
    }
    assert.equal(used.size,g.vertices.length,digit+' has unreferenced vertices');for(const n of edges.values())assert.equal(n,2);for(const [key,n] of directed){const [a,b]=key.split(',');assert.equal(directed.get(b+','+a),n);}
    const target=g.contours.reduce((sum,c)=>sum+c.signedArea,0);assert(Math.abs(area-target)<2e-8);assert(Math.abs(volume-target)<2e-8);
    const holes=g.contours.filter(c=>c.role==='hole').length;assert.equal(g.vertices.length-edges.size+g.triangles.length,2-2*holes);
    assert.equal(g.validation.holes,({0:1,1:0,2:0,3:0,4:1,5:0,6:1,7:0,8:2,9:1})[digit]);
    triangles+=g.triangles.length;maxAreaError=Math.max(maxAreaError,Math.abs(area-target));
  }
  const one=R.DATA.digits['1'];assert.match(one.provenance,/Original/);const base=one.contours[0].points.filter(p=>p[1]===-.5);assert.equal(base.length,2);const ring=one.contours[0].points,mid=[];for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];if((a[1]<-.25)!==(b[1]<-.25))mid.push(a[0]+(b[0]-a[0])*(-.25-a[1])/(b[1]-a[1]));}const stemWidth=Math.max(...mid)-Math.min(...mid),baseWidth=Math.abs(base[0][0]-base[1][0]);assert(Math.abs(baseWidth-stemWidth)<.025,'1 base follows stem width, without a wide foot');
  return {digits:10,totalTriangles:triangles,maxAreaError};
});

test('Analytical glyph silhouette and holes match all front pixels',()=>{
  const width=192,height=232,scale=740,camera=R.cameraOptions({width,height,antialias:1}),depth=1300-.005;
  let pixelsChecked=0,disagreements=0;
  for(const digit of '0123456789'){
    const out=render([{digit,scale,thickness:.01}],{width,height,antialias:1});
    alphaPixels(out.pixels);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const px=(x+.5-width/2)*depth/camera.focal/scale,py=-(y+.5-height/2)*depth/camera.focal/scale;
      const expect=R.containsDigit(digit,[px,py]);const actual=out.pixels[(y*width+x)*4]>0;
      if(expect!==actual)disagreements++;pixelsChecked++;
    }
  }
  assert.equal(disagreements,0);return {pixelsChecked,disagreements};
});

test('Nearer cap wins regardless of draw order',()=>{
  const front={digit:'1',scale:500,position:[0,0,300],rotation:[0,0,.15]};
  const back={digit:'8',scale:650,position:[0,0,-100],rotation:[0,.65,0]};
  const a=render([front,back],{antialias:1}),b=render([back,front],{antialias:1}),f=render([front],{antialias:1}),r=render([back],{antialias:1});
  assert.deepEqual(a.pixels,b.pixels);let covered=0;
  for(let i=0;i<a.pixels.length;i+=4)if(f.pixels[i]&&r.pixels[i]){assert.equal(a.pixels[i],f.pixels[i]);covered++;}
  assert(covered>1000);return {overlapPixels:covered,sha256:hash(a.pixels)};
});

test('Intersecting tilted caps use per-pixel depth rather than one face order',()=>{
  const options={width:564,height:342,antialias:1},camera=R.cameraOptions(options);
  const bodies=[{digit:'8',scale:720,thickness:1,rotation:[0,.65,0]},{digit:'8',scale:720,thickness:1,rotation:[0,-.65,0]}];
  const solo=bodies.map(b=>render([b],options)),combined=render(bodies,options);
  const planes=bodies.map(b=>{const m=R.matrixFromQuaternion(R.quaternionFromEuler(b.rotation)),n=[m[2],m[5],m[8]],center=n.map(x=>x*.5);return {n,center,shade:Math.round(255*Math.min(1,camera.ambient+camera.diffuse*Math.max(0,n.reduce((s,x,i)=>s+x*camera.light[i],0))))};});
  assert.notEqual(planes[0].shade,planes[1].shade);
  const wins=[0,0];
  for(let y=0;y<342;y++)for(let x=0;x<564;x++){
    const i=(y*564+x)*4;
    if(solo[0].pixels[i]!==planes[0].shade||solo[1].pixels[i]!==planes[1].shade)continue;
    const ray=[(x+.5-282)/camera.focal,-(y+.5-171)/camera.focal,-1];
    const depth=planes.map(p=>(p.n[0]*p.center[0]+p.n[1]*p.center[1]+p.n[2]*(p.center[2]-camera.cameraDistance))/(p.n[0]*ray[0]+p.n[1]*ray[1]+p.n[2]*ray[2]));
    if(Math.abs(depth[0]-depth[1])<.001)continue;
    const winner=depth[0]<depth[1]?0:1;assert.equal(combined.pixels[i],planes[winner].shade);wins[winner]++;
  }
  assert(wins[0]>1000&&wins[1]>1000);return {leftPlaneWins:wins[0],rightPlaneWins:wins[1]};
});

test('Intersecting pile is order independent and deterministic',()=>{
  const bodies=pile(30),a=render(bodies),b=render(bodies.slice().reverse()),c=render(bodies);
  assert.deepEqual(a.pixels,b.pixels);assert.deepEqual(a.pixels,c.pixels);assert(alphaPixels(a.pixels)>10000);
  fs.writeFileSync(path.join(root,'assets/renderer-pile.png'),a.c.toBuffer('image/png'));
  return {bodies:30,sha256:hash(a.pixels),...a.stats};
});

test('Browser-global entry executes same pixel code as Node',()=>{
  const sandbox={};vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root,'geometry-data.js'),'utf8'),sandbox,{filename:'geometry-data.js'});
  vm.runInContext(fs.readFileSync(path.join(root,'renderer.js'),'utf8'),sandbox,{filename:'renderer.js'});
  assert.equal(typeof sandbox.ClockRenderer.render,'function');
  let captured=null;
  const ctx={createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),putImageData:im=>{captured=im.data.slice()}};
  const bodies=pile(18),options={width:564,height:342,antialias:2};
  sandbox.ClockRenderer.render(ctx,bodies,options);const node=render(bodies,options);assert.deepEqual(captured,node.pixels);
  return {sha256:hash(captured),note:'Browser UMD path evaluated in isolated JavaScript VM with ImageData shim; real-browser display QA is separate'};
});

test('Euler X→Y→Z matches xyzw quaternion, nonunit quaternions normalize',()=>{
  const body={digit:'8',position:[-40,10,30],rotation:[.42,-.71,1.13],scale:420};
  const q=R.quaternionFromEuler(body.rotation),a=render([body]),b=render([{...body,quaternion:q,rotation:[0,0,0]}]),c=render([{...body,quaternion:q.map(n=>n*3)}]);
  assert.deepEqual(a.pixels,b.pixels);assert.deepEqual(a.pixels,c.pixels);
  const m=R.matrixFromQuaternion(q),v=[.3,.4,.5],rx=body.rotation[0],ry=body.rotation[1],rz=body.rotation[2];
  const u=[v[0],v[1]*Math.cos(rx)-v[2]*Math.sin(rx),v[1]*Math.sin(rx)+v[2]*Math.cos(rx)];
  const w=[u[0]*Math.cos(ry)+u[2]*Math.sin(ry),u[1],-u[0]*Math.sin(ry)+u[2]*Math.cos(ry)];
  const expected=[w[0]*Math.cos(rz)-w[1]*Math.sin(rz),w[0]*Math.sin(rz)+w[1]*Math.cos(rz),w[2]];
  for(let i=0;i<3;i++)assert(Math.abs(m[i*3]*v[0]+m[i*3+1]*v[1]+m[i*3+2]*v[2]-expected[i])<1e-14);
});

test('Camera projection, focal length, target and proportional resize',()=>{
  const opts={width:564,height:342};assert.deepEqual(R.project([0,0,0],opts),[282,171,1300]);
  const p=R.project([0,210,0],opts),f=342/(2*Math.tan(20*Math.PI/180));assert(Math.abs(p[1]-(171-210*f/1300))<1e-12);
  const a=R.project([200,100,50],opts),b=R.project([200,100,50],{width:1128,height:684});assert.equal(b[0],a[0]*2);assert.equal(b[1],a[1]*2);
  assert.deepEqual(R.project([100,200,300],{...opts,target:[100,200,300]}),[282,171,1300]);assert.equal(R.project([0,0,1300],opts),null);
  const c=createCanvas(564,342),ctx=c.getContext('2d');R.render(ctx,pile(18),opts);c.width=720;c.height=436;const s=R.render(ctx,pile(18),{width:720,height:436});assert.equal(s.width,720);assert.equal(ctx.getImageData(719,435,1,1).data[3],255);
});

test('Near/far clipping and offscreen geometry stay finite and bounded',()=>{
  const a=render([{digit:'8',position:[0,0,1295],rotation:[.4,.3,.5],scale:210}],{width:160,height:100,near:5,far:200});assert(a.stats.clippedTriangles>0);alphaPixels(a.pixels);
  const b=render([{digit:'0',position:[100000,-100000,-100000],scale:2000}],{width:10,height:10,far:300000});assert.equal(b.stats.occupiedPixels,0);
  const empty=render([], {width:1,height:1});assert.deepEqual([...empty.pixels],[0,0,0,255]);
});

test('Finite and malformed data rejected atomically; finite workload limits',()=>{
  const c=createCanvas(80,60),ctx=c.getContext('2d'),valid={digit:'8'};ctx.fillStyle='rgb(13,19,23)';ctx.fillRect(0,0,80,60);const original=ctx.getImageData(0,0,80,60).data;
  const malformed=[null,undefined,{},[null],[{digit:'x'}],[{digit:10}],[{digit:NaN}],[{digit:'8',position:[0,Infinity,0]}],[{digit:'8',position:[0,0]}],[{digit:'8',rotation:[0,NaN,0]}],[{digit:'8',quaternion:[0,0,0,0]}],[{digit:'8',quaternion:[0,0,0,Infinity]}],[{digit:'8',scale:0}],[{digit:'8',scale:Infinity}],[{digit:'8',thickness:0}],[{digit:'8',depth:NaN}],Array(49).fill(valid)];
  for(const b of malformed)assert.throws(()=>R.render(ctx,b,{width:80,height:60}));
  const badOpts=[{width:NaN},{width:2049},{height:0},{width:1.5},{width:2048,height:2048},{antialias:3},{antialias:Infinity},{cameraDistance:NaN},{fov:180},{near:0},{far:1},{target:[NaN,0,0]},{light:[0,0,0]},{ambient:NaN},{diffuse:3},{sideAlbedo:-1},{thickness:Infinity}];
  for(const o of badOpts)assert.throws(()=>R.render(ctx,[valid],{width:80,height:60,...o}));
  assert.deepEqual(ctx.getImageData(0,0,80,60).data,original);assert.throws(()=>R.render({},[]));
  const maximum=render(Array.from({length:R.LIMITS.bodies},(_,i)=>({digit:String(i%10),position:[100000,100000,0]})),{width:1,height:1,antialias:1});assert.equal(maximum.stats.bodies,R.LIMITS.bodies);
  return {bodyLimit:R.LIMITS.bodies,dimensionLimit:R.LIMITS.dimension,pixelLimit:R.LIMITS.pixels,malformedCases:malformed.length+badOpts.length};
});

test('Performance samples for 18 and 30 digits at requested output sizes',()=>{
  const benchmarks=[];
  for(const count of [18,30])for(const [width,height] of [[564,342],[720,436]])for(const antialias of [1,2]){
    const bodies=pile(count),c=createCanvas(width,height),ctx=c.getContext('2d'),options={width,height,antialias};
    for(let i=0;i<5;i++)R.render(ctx,bodies,options);
    const times=[];for(let i=0;i<20;i++){const t=performance.now();R.render(ctx,bodies,options);times.push(performance.now()-t);}
    times.sort((a,b)=>a-b);benchmarks.push({bodies:count,width,height,antialias,medianMs:+times[10].toFixed(2),p95Ms:+times[19].toFixed(2)});
  }
  return {benchmarks};
});

const row=render([...'123948'].map((digit,i)=>({digit,position:[(i-2.5)*170,100,0]})));
fs.writeFileSync(path.join(root,'assets/renderer-row.png'),row.c.toBuffer('image/png'));
const poses=[[0,0,0],[-.35,-.55,-.08],[.28,2.52,.13]],sheet=createCanvas(1600,660),sc=sheet.getContext('2d');sc.fillStyle='#000';sc.fillRect(0,0,1600,660);
poses.forEach((rotation,y)=>[...'0123456789'].forEach((digit,x)=>{const tile=render([{digit,rotation,scale:680}],{width:160,height:220});sc.drawImage(tile.c,x*160,y*220)}));
fs.writeFileSync(path.join(root,'assets/renderer-contact-sheet.png'),sheet.toBuffer('image/png'));
const report={passed:true,total:results.length,node:process.version,canvas:require('@napi-rs/canvas/package.json').version,geometrySHA256:hash(fs.readFileSync(path.join(root,'geometry-data.js'))),rendererSHA256:hash(fs.readFileSync(path.join(root,'renderer.js'))),results};
fs.writeFileSync(path.join(root,'assets/renderer-tests.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
