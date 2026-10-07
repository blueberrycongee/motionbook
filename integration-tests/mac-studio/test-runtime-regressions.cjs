'use strict';
// Offline real-Canvas + DOM adapter regressions. This is not browser QA.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {createCanvas,Image}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'../..'),failures=[],passed=[];
const slugMap={"01-turntable": "mac-studio-turntable", "02-assembly": "mac-studio-layered-assembly", "03-stats": "mac-studio-benchmark-tabs", "04-relay": "mac-studio-scroll-relay", "05-hero": "mac-studio-hero-transition", "06-parallax": "mac-studio-parallax-features", "07-gallery": "mac-studio-crossfade-gallery"};
const previewMap={"deliverables/01-turntable-recreated.gif": "examples/mac-studio-turntable/preview/loop.gif", "deliverables/02-assembly-recreated.gif": "examples/mac-studio-layered-assembly/preview/loop.gif", "deliverables/03-stats-recreated.gif": "examples/mac-studio-benchmark-tabs/preview/loop.gif", "deliverables/04-video-text-recreated.gif": "examples/mac-studio-scroll-relay/preview/loop.gif", "deliverables/05-hero-recreated.gif": "examples/mac-studio-hero-transition/preview/loop.gif", "deliverables/06-parallax-recreated.gif": "examples/mac-studio-parallax-features/preview/loop.gif", "deliverables/07-gallery-recreated.gif": "examples/mac-studio-crossfade-gallery/preview/loop.gif"};
const exampleDir=id=>path.join(root,'examples',slugMap[id]);
function integratedPath(file){if(previewMap[file])return path.join(root,previewMap[file]);if(file.startsWith('deliverables/'))return null;const parts=file.split('/');if(parts[0]==='examples'&&slugMap[parts[1]])parts[1]=slugMap[parts[1]];return path.join(root,...parts);}
class Element {
  constructor(extra={}){Object.assign(this,{style:{},attrs:{},events:{},children:[],clientWidth:1188,clientHeight:761},extra);}
  addEventListener(k,f){(this.events[k]??=[]).push(f);}
  removeEventListener(k,f){this.events[k]=(this.events[k]||[]).filter(g=>g!==f);}
  setAttribute(k,v){this.attrs[k]=v;}
  appendChild(e){this.children.push(e);}
  focus(){this.focused=true;}
  fire(k,e={}){for(const f of this.events[k]||[])f(e);}
}
async function tabsRuntime(id,{width=1188,height=761,dpr=1}={}){
  const dir=exampleDir(id),scene=require(dir+'/scene.cjs');if(scene.ready)await scene.ready;
  const canvas=createCanvas(width*dpr,height*dpr),ctx=canvas.getContext('2d'),ids={};
  for(const k of ['stage','scene','tabs','replay','panel','status','panel-title','description','values','workspace-controls','dots','previous','next','mode-ai','mode-workspace'])ids[k]=new Element();
  ids.stage.clientWidth=width;ids.stage.clientHeight=height;ids.scene.getContext=()=>ctx;
  const media=new Element({matches:false}),win=new Element({MotionScene:scene,devicePixelRatio:dpr,matchMedia:()=>media});
  let now=0,serial=0;const queue=new Map();
  function LocalImage(){const image=new Image(),descriptor=Object.getOwnPropertyDescriptor(Image.prototype,'src');Object.defineProperty(image,'src',{set(value){descriptor.set.call(image,fs.readFileSync(path.join(dir,value)));}});return image;}
  const sandbox={window:win,document:{getElementById:k=>ids[k],createElement:tag=>tag==='canvas'?createCanvas(1,1):new Element()},Image:LocalImage,requestAnimationFrame:f=>(queue.set(++serial,f),serial),cancelAnimationFrame:i=>queue.delete(i),performance:{now:()=>now},Promise};
  vm.runInNewContext(fs.readFileSync(dir+'/motion.js','utf8'),sandbox);if(win.MOTION.ready)await win.MOTION.ready;
  return {canvas,ids,media,win,queue,advance(t){now=t;const jobs=[...queue.values()];queue.clear();jobs.forEach(f=>f(now));}};
}
function pixels(canvas,rect){return Buffer.from(canvas.getContext('2d').getImageData(...rect).data);}
async function test(name,fn){try{await fn();passed.push(name);console.log('PASS '+name);}catch(e){failures.push({name,message:e.message});console.error('FAIL '+name+': '+e.message);}}
async function interruption(id,mode='ai',size={width:1188,height:761,dpr:1}){
  const r=await tabsRuntime(id,size),m=r.win.MOTION,isStats=id==='03-stats',scene=require(path.join(exampleDir(id),'scene.cjs'));
  if(mode==='workspace')m.setMode(mode);
  const group=mode==='workspace'?r.ids.dots.children:r.ids.tabs.children;
  const start=isStats?2:0,first=isStats?0:1,third=isStats?4:2;
  const L=scene.layout(r.canvas.getContext('2d'),size.width,size.height,mode);
  const region=isStats?[0,L.headingY+1,size.width,(L.narrow?L.chartTop+L.row*2+76:721*L.scale)-L.headingY-3]:mode==='workspace'?[L.picture.x+28,L.picture.y+28,L.picture.w-56,L.picture.h-56]:[24,60,size.width-48,L.tabsY-72];
  const rect=region.map(v=>Math.floor(v*size.dpr));
  m.setTab(start);group[first].fire('click');r.advance(200);
  for(const [target,time] of [[third,280],[start,360],[first,440]]){
    const before=pixels(r.canvas,rect),stale=[...r.queue.values()][0];
    group[target].fire('click');assert.equal(Buffer.compare(pixels(r.canvas,rect),before),0,'new selection must preserve the currently visible content at t=0');
    if(stale)stale(10000);assert.equal(m.getState().tab,target,'cancelled callback cannot change selection');
    assert.equal(r.queue.size,1,'only the latest animation stays queued');r.advance(time);
  }
  const repeated=pixels(r.canvas,rect);group[first].fire('click');assert.equal(Buffer.compare(pixels(r.canvas,rect),repeated),0,'reselecting the active target must not restart or snap');
  r.advance(4000);assert.equal(m.getState().playing,false);
  const expected=createCanvas(size.width*size.dpr,size.height*size.dpr),expectedContext=expected.getContext('2d');expectedContext.setTransform(size.dpr,0,0,size.dpr,0,0);
  scene.render(expectedContext,size.width,size.height,0,{tab:first,previousTab:first,transitionProgress:1,mode});
  assert.equal(Buffer.compare(pixels(r.canvas,rect),pixels(expected,rect)),0,'interrupted animation settles on the normal final content');
  group[start].fire('click');r.advance(4080);r.media.matches=true;r.media.fire('change');assert.equal(m.getState().playing,false);assert.equal(r.queue.size,0);
  m.destroy();assert.equal(r.queue.size,0);
}
function scrollResize(id){
  const dir=exampleDir(id),scene=require(dir+'/scene.js'),surface=createCanvas(900,576),ids={};let scroll=0,serial=0;
  for(const id of ['seek','play','reset','repeat','phase','percent'])ids[id]=new Element();
  const canvas=new Element({getContext:()=>surface.getContext('2d'),getBoundingClientRect:()=>({width:900,height:576})});
  const track={offsetTop:0,offsetHeight:3500,getBoundingClientRect:()=>({top:-scroll})},mq=new Element({matches:false}),queue=new Map();
  const win=new Element({MotionScene:scene,devicePixelRatio:1,innerHeight:576,matchMedia:()=>mq,scrollTo:({top})=>{scroll=top}});
  const doc=new Element({querySelector:q=>q==='canvas'?canvas:track,getElementById:id=>ids[id],documentElement:{classList:{toggle(){}}},activeElement:{tagName:'BODY'},hidden:false});
  const box={window:win,document:doc,ResizeObserver:class{observe(){}disconnect(){}},requestAnimationFrame:f=>(queue.set(++serial,f),serial),cancelAnimationFrame:i=>queue.delete(i)};
  vm.runInNewContext(fs.readFileSync(dir+'/motion.js','utf8'),box);
  const m=win.MOTION,factor=id==='05-hero'?6.2:2.5,frame=t=>{const jobs=[...queue.values()];queue.clear();jobs.forEach(f=>f(t));};
  track.offsetHeight=factor*576;scroll=500;win.fire('scroll');win.innerHeight=900;track.offsetHeight=factor*900;canvas.getBoundingClientRect=()=>({width:1440,height:900});win.fire('resize');
  assert(Math.abs(m.getState().progress-500/(track.offsetHeight-900))<1e-12,'resize must recompute scroll mode against the new geometry');
  m.setProgress(.7);win.innerHeight=600;track.offsetHeight=factor*600;win.fire('resize');assert.equal(m.getState().progress,.7,'manual seek stays stable across resize');
  m.play();frame(1);frame(701);const before=m.getState().progress;win.fire('resize');assert.equal(m.getState().progress,before,'playback position stays stable across resize');m.destroy();assert.equal(queue.size,0);
}
async function preservation(){
  const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'qa/v012-preservation-baseline.json'))),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
  const adjustments=JSON.parse(fs.readFileSync(path.join(__dirname,'packaging-adjustments.json'))),adaptedSources=new Map();
  for(const record of adjustments.files){
    const packaged=fs.readFileSync(path.join(root,record.path));
    assert.equal(sha(packaged),record.packaged_sha256,record.path+' packaging bytes changed');
    if(record.replacements){
      let original=packaged.toString('utf8');
      for(const change of [...record.replacements].reverse()){
        assert.equal(original.split(change.new).length-1,change.occurrences,record.path+' packaging substitution count changed');
        original=original.split(change.new).join(change.old);
      }
      assert.equal(sha(Buffer.from(original)),record.original_sha256,record.path+' contains changes beyond the documented navigation substitutions');
    }
    if(record.baseline_path){
      assert.equal(baseline.protectedSources[record.baseline_path],record.original_sha256,record.path+' original baseline mismatch');
      adaptedSources.set(record.baseline_path,record.packaged_sha256);
    }
  }
  const encodingProof=JSON.parse(fs.readFileSync(path.join(__dirname,'qa/gif-encoding-equivalence.json'))),encodedMedia=new Map();
  for(const record of encodingProof.files){
    const baselinePath=Object.keys(previewMap).find(file=>previewMap[file]===record.path);
    assert(baselinePath,record.path+' is not a mapped original preview');
    assert.equal(baseline.media[baselinePath],record.original_encoded_sha256,record.path+' original media baseline mismatch');
    assert.equal(record.original_rgba_delay_sequence_sha256,record.replacement_rgba_delay_sequence_sha256,record.path+' decoded frame/timing proof differs');
    assert.equal(record.ffmpeg_original.framehash_sha256,record.ffmpeg_replacement.framehash_sha256,record.path+' independent decoder proof differs');
    assert(record.all_displayed_rgba_frames_equal&&record.all_per_frame_delays_equal&&record.loop_equivalent&&record.ffmpeg_all_rgba_hashes_dts_pts_durations_equal,record.path+' incomplete equivalence proof');
    assert.equal(record.frames.length,record.frame_count,record.path+' incomplete frame proof');
    assert.equal(fs.statSync(path.join(root,record.path)).size,record.replacement_encoded_bytes,record.path+' encoded size changed');
    encodedMedia.set(baselinePath,record.replacement_encoded_sha256);
  }
  const webPreview=JSON.parse(fs.readFileSync(path.join(__dirname,'qa/parallax-web-preview-compression.json')));
  const webOriginal=webPreview.original,webCurrent=webPreview.current,webBaselinePath='deliverables/06-parallax-recreated.gif';
  assert.equal(webOriginal.repo_path,previewMap[webBaselinePath]);
  assert.equal(webCurrent.repo_path,webOriginal.repo_path);
  assert.equal(webOriginal.encoded_sha256,baseline.media[webBaselinePath],'original parallax media baseline mismatch');
  assert.equal(webPreview.method.pixel_identical,false,'compressed web preview must not claim pixel identity');
  assert.equal(webPreview.verification.pixel_identity_claimed,false,'web preview is outside lossless equivalence claims');
  assert.equal(webOriginal.frame_count,120);assert.equal(webCurrent.frame_count,120);
  assert.equal(webOriginal.frames.length,120);assert.equal(webCurrent.frames.length,120);
  assert.equal(webOriginal.ffmpeg_decoded_frame_count,120);assert.equal(webCurrent.ffmpeg_decoded_frame_count,120);
  assert.deepEqual(webCurrent.per_frame_delays_ms,webOriginal.per_frame_delays_ms,'web preview frame timing changed');
  assert.equal(webCurrent.per_frame_delays_ms.length,120);
  for(const record of [webOriginal,webCurrent]){
    assert.deepEqual(record.frames.map(frame=>frame.duration_ms),record.per_frame_delays_ms,'web preview frame timing evidence is inconsistent');
    assert.equal(record.per_frame_delays_ms.reduce((sum,delay)=>sum+delay,0),record.total_duration_ms);
    assert.equal(record.ffmpeg_decode_errors,'');
  }
  assert.equal(webCurrent.total_duration_ms,webOriginal.total_duration_ms);assert.equal(webCurrent.total_duration_ms,8050);
  assert.equal(webCurrent.loop_count,webOriginal.loop_count);assert.equal(webCurrent.loop_count,0);
  const webBytes=fs.readFileSync(path.join(root,webCurrent.repo_path));
  assert.equal(webBytes.length,webCurrent.encoded_bytes);
  assert.deepEqual([webBytes.readUInt16LE(6),webBytes.readUInt16LE(8)],webCurrent.dimensions,'compressed preview dimensions changed');
  const webPreviewMedia=new Map([[webBaselinePath,webCurrent.encoded_sha256]]);
  let checkedMedia=0;const excludedPreviews=[];
  for(const [file,expected]of Object.entries({...baseline.media,...baseline.protectedSources})){
    const absolute=integratedPath(file);
    if(absolute===null){excludedPreviews.push(file);continue;} // Official comparisons/slow audit are outside this original-media package.
    assert(fs.existsSync(absolute),file+' is required in the integration');
    assert.equal(sha(fs.readFileSync(absolute)),adaptedSources.get(file)||encodedMedia.get(file)||webPreviewMedia.get(file)||expected,file+' bytes changed');if(file in baseline.media)checkedMedia++;
  }
  for(const row of baseline.normalRenderFrames){const scene=require(path.join(exampleDir(row.id),'scene.cjs'));if(scene.ready)await scene.ready;const canvas=createCanvas(row.width,row.height);scene.render(canvas.getContext('2d'),row.width,row.height,row.progress,row.options);assert.equal(sha(canvas.toBuffer('image/png')),row.sha256,row.id+' normal reference frame changed at '+row.progress);}
  console.log(`Verified ${baseline.normalRenderFrames.length} unchanged normal-render hashes and ${checkedMedia} packaged media files (${encodedMedia.size} lossless re-encodings, ${webPreviewMedia.size} compressed web preview); verified ${Object.keys(baseline.protectedSources).length} source records (${adaptedSources.size} exact packaging adaptations, remaining sources byte-identical)`);
  if(excludedPreviews.length)console.log(`Integration package: ${excludedPreviews.length} official-comparison/slow-audit GIFs intentionally excluded; all 8 mapped original media are required`);
}
(async()=>{
  await test('03-stats interrupted/reversed/repeated selections preserve content',()=>interruption('03-stats'));
  await test('07-gallery AI interrupted/reversed/repeated selections preserve content',()=>interruption('07-gallery'));
  await test('07-gallery workspace interruptions preserve content',()=>interruption('07-gallery','workspace'));
  const phone={width:390,height:800,dpr:2};
  await test('03-stats mobile DPR2 interrupted content',()=>interruption('03-stats','ai',phone));
  await test('07-gallery AI mobile DPR2 interrupted content',()=>interruption('07-gallery','ai',phone));
  await test('07-gallery workspace mobile DPR2 interrupted content',()=>interruption('07-gallery','workspace',phone));
  for(const id of ['05-hero','06-parallax'])await test(id+' scroll resize resynchronizes without disturbing manual/play',()=>scrollResize(id));
  await test('v0.1.1 normal pixels and documented source/media packaging',preservation);
  console.log(JSON.stringify({passed,failures,browserQA:'not run; offline DOM and Canvas regressions only'},null,2));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
