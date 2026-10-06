'use strict';
const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..'),observed=require('../validation/observations.json'),highlights=require('../validation/highlight-observations.json'),fields=require('../validation/highlight-field-fit.json'),metrics=require('../validation/authored-text-metrics.json');
const texts={'A1':'Let this line rise','A2':'into focus,','A3':'then let the page','A4':'go','B1':'One line','B2':'moves into view','B3':'and holds focus','B4':'for a moment','C1':'Keep a little room','C2':'between the lines','C3':'to breathe','D1':'Let it rest','D2':'one step at a time'};
const source=observed.source,spec={width:source.crop.width,height:source.crop.height,start:source.start,end:source.endExclusive,fps:source.fps,timeBase:source.timeBase,sourceSha256:source.sha256,sourceUrl:source.url,crop:source.crop,versionLabel:source.versionLimit};
const lerp=(a,b,t)=>a+(b-a)*t;
function sample(a,t,key){if(t<=a[0].t)return a[0][key];for(let i=1;i<a.length;i++)if(t<=a[i].t)return lerp(a[i-1][key],a[i][key],(t-a[i-1].t)/(a[i].t-a[i-1].t));return a.at(-1)[key];}
// Relative softness/gain are image fits; base alpha is a chosen reconstruction parameter.
const looks={
 A:[{t:16,blur:0,gain:1},{t:17.450767,blur:0,gain:1},{t:17.550867,blur:2,gain:.684},{t:17.6176,blur:3.25,gain:.352},{t:17.684333,blur:3.25,gain:.233},{t:18,blur:3.25,gain:.12}],
 B:[{t:16,blur:2.25,gain:.52},{t:17.350667,blur:2.25,gain:.52},{t:17.484133,blur:2.25,gain:1.03},{t:17.550867,blur:1,gain:1},{t:17.684333,blur:0,gain:1},{t:21,blur:0,gain:1}],
 C:[{t:16,blur:3.25,gain:.55},{t:17.55,blur:3.25,gain:.55},{t:18.15,blur:2.25,gain:.65},{t:21,blur:2.25,gain:.65}],
 D:[{t:16,blur:4,gain:.40},{t:17.62,blur:4,gain:.40},{t:18.3,blur:3.25,gain:.48},{t:21,blur:3.25,gain:.48}]
};
// Monotone least-squares representatives remove subpixel fit reversals inside stated
// measurement uncertainty. No moving average or arbitrary velocity cap is applied.
function isotonic(values){const blocks=[];for(let i=0;i<values.length;i++){blocks.push({sum:values[i],n:1,start:i,end:i});while(blocks.length>1&&blocks.at(-2).sum/blocks.at(-2).n>blocks.at(-1).sum/blocks.at(-1).n){const b=blocks.pop(),a=blocks.pop();blocks.push({sum:a.sum+b.sum,n:a.n+b.n,start:a.start,end:b.end});}}const out=[];for(const b of blocks)for(let i=b.start;i<=b.end;i++)out[i]=b.sum/b.n;return out;}
function fieldTrack(id){
 const meta=fields.lines[id];if(!meta)return null;
 const raw=fields.samples.filter(s=>s.line===id),valid=raw.filter(s=>s.front50!==null),centers=isotonic(valid.map(s=>s.front50)),adjusted=new Map(valid.map((s,i)=>[s.frame,centers[i]]));
 const left=meta.inkSpanEdges[0],width=meta.inkSpanEdges[1]-left,settled=valid.filter(s=>s.state==='measured'&&s.gain>=.95).map(s=>s.feather).sort((a,b)=>a-b),fallback=settled.length?settled[Math.floor(settled.length/2)]:22;
 let last={sourceFront50:left-fallback/2,sourceFeather:fallback,sourceGain:0,highlight:0,highlightFeather:fallback/width,highlightGain:0};
 const samples=raw.map(s=>{let p;
  if(s.front50!==null){const center=adjusted.get(s.frame),f=s.feather,g=Math.max(0,Math.min(1,s.gain));p={sourceFront50:center,sourceFeather:f,sourceGain:g,highlight:Math.max(0,Math.min(1,(center+f/2-left)/(width+f))),highlightFeather:f/width,highlightGain:g};}
  else if(s.state==='complete'){p={sourceFront50:left+width+fallback/2,sourceFeather:fallback,sourceGain:1,highlight:1,highlightFeather:fallback/width,highlightGain:1};}
  else if(s.state==='below_detection'){p={sourceFront50:left-fallback/2,sourceFeather:fallback,sourceGain:0,highlight:0,highlightFeather:fallback/width,highlightGain:0};}
  else p={...last}; // Blur/motion and occlusion are not additional highlight observations.
  last=p;return{t:s.pts/30000,...p,sourceFieldState:s.state};
 });
 return{left,width,samples,maximumMonotoneAdjustmentPx:Math.max(...valid.map(s=>Math.abs(adjusted.get(s.frame)-s.front50)))};
}
const tracks=observed.tracks.map(track=>{
 const accepted=track.samples.filter(s=>s.accepted),cal=process.argv.includes('--even-only')?accepted.filter(s=>s.split==='calibration'):accepted,block=track.block_id,index=Number(track.id.slice(1));
 const recovered=fieldTrack(track.id);
 const h=highlights.samples.filter(s=>s.block===block&&s.rows?.some(r=>r.row===index)).map(s=>({t:s.source_pts,front:s.rows.find(r=>r.row===index).front_fraction}));
 // Keep the last completed A front through occlusion; incoming B remains dark until first observed front.
 const events=[...new Set([spec.start,spec.end,...looks[block].map(s=>s.t),...(recovered?recovered.samples:h).map(s=>s.t)].filter(t=>t>=spec.start&&t<=spec.end))].sort((a,b)=>a-b);
 const appearance=events.map(t=>{const gain=sample(looks[block],t,'gain');return{t,opacity:Math.min(1,.50*gain),litOpacity:block==='A'?gain:1,blur:sample(looks[block],t,'blur'),highlight:track.id==='A1'||track.id==='A2'?1:0,...(recovered?Object.fromEntries(['sourceFront50','sourceFeather','sourceGain','highlight','highlightFeather','highlightGain'].map(k=>[k,sample(recovered.samples,t,k)])): {})};});
 return{id:track.id,block,textMetrics:metrics.rows[track.id],sourceInkLeft:recovered?.left,sourceInkWidth:recovered?.width,maximumMonotoneAdjustmentPx:recovered?.maximumMonotoneAdjustmentPx,text:texts[track.id],fontSize:36,weight:700,geometryMeaning:'Template rectangle with padding; not exact original or substituted glyph bounds',samples:cal.map(s=>({t:s.t,x:s.x,y:s.y,w:s.w,h:s.h,sourceFrame:s.source_frame_index})),appearance,active:block==='A'||block==='B'?[{begin:block==='A'?spec.start:17.5175,end:block==='A'?17.684333:spec.end+1}]:[],visible:{begin:spec.start,end:accepted.at(-1).t+source.nativeFrameIntervalSeconds},appearanceEvidence:block==='A'||block==='B'?'Native per-frame normalized brightness-field fit with onset gain and feather; relative softness and estimated base alpha':'Qualitative depth ordering; blur/alpha numerical choices are supplemental'};
});
const output={spec,tracks,fit:{method:process.argv.includes('--even-only')?'Piecewise linear interpolation using even source-frame geometry only':'Final native-frame replay uses all accepted observations; same-knot residual is fit, not independent accuracy',calibrationFrames:[...new Set(tracks.flatMap(t=>t.samples.map(s=>s.sourceFrame)))],holdout:process.argv.includes('--even-only')?'Odd source frames are withheld; adjacent temporal holdout from same clip':'No final geometric holdout remains. Historical even-only model and odd-frame residuals retained separately; endpoint failure motivated all-point final replay'},appearanceLimit:'Highlight is reconstructed from grayscale brightness fields with censored endpoint uncertainty; native states are sampled at every original PTS. Monotone least-squares removes subpixel center reversals within uncertainty. Linear interpolation between source frames is a reconstruction choice, not recovered native timing. No TTML/per-word audio times. Relative Gaussian and base alpha remain image-fit/model parameters.'};
fs.writeFileSync(path.join(root,'src/calibration-data.js'),`(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.LyricsCalibration=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){return ${JSON.stringify(output)};});\n`);
console.log(JSON.stringify({tracks:tracks.length,calibrationSamples:tracks.reduce((n,t)=>n+t.samples.length,0),start:spec.start,end:spec.end}));
