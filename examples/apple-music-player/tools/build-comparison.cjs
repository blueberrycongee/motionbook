#!/usr/bin/env node
'use strict';
/** Builds private, local critical comparison media. Never copies source footage into the repository. */
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const R=require('./render.cjs');
const CROP={x:744,y:74,width:432,height:934};
const escapeXml=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function summary(values) {
  const good=values.filter(Number.isFinite);
  if(!good.length) return {count:0,mae:null,rmse:null,maxAbsolute:null,p95Absolute:null};
  const abs=good.map(Math.abs).sort((a,b)=>a-b);
  return {count:good.length,mae:abs.reduce((a,b)=>a+b,0)/good.length,
    rmse:Math.sqrt(good.reduce((a,b)=>a+b*b,0)/good.length),maxAbsolute:abs.at(-1),p95Absolute:abs[Math.ceil(abs.length*.95)-1]};
}
function pixelDifference(source,replica) {
  if(source.length!==replica.length) throw new Error('Pixel buffer lengths differ');
  let sum=0,sq=0;
  for(let i=0;i<source.length;i++){const d=Math.abs(source[i]-replica[i]);sum+=d;sq+=d*d;}
  return {meanAbsoluteRGB:sum/source.length,rootMeanSquareRGB:Math.sqrt(sq/source.length),units:'8-bit RGB levels, 0–255; smaller is closer, not an accuracy percentage'};
}
function normalizeMeasurements(document) {
  const rows=document.measurements || document.frames || document.rows || [];
  if(!Array.isArray(rows) || !rows.length) throw new Error('Measurement JSON has no rows');
  return rows.map(row=>({...row,pts:Number(row.pts),time:Number(row.time ?? row.sourceTime ?? (row.pts/30000)),split:row.split||'unspecified'}));
}
function observedGeometry(row) {
  const a=row.cover||row.album||{};
  const card=row.card||{};
  return {
    coverX:a.x,coverY:a.y,coverWidth:a.width??a.w??a.size,coverHeight:a.height??a.h??a.size,
    cardX:card.x,cardY:card.y??row.sheetTop,cardWidth:card.width??card.w,
    // Source card.h describes visible/occluded extent, not the reconstructed hidden sheet's height.
    backgroundScale:row.background?.scale,backgroundTop:row.background?.top,
  };
}
function predictedGeometry(state) {
  const a=state.cover||{},c=state.card||{};
  return {coverX:a.x,coverY:a.y,coverWidth:a.size,coverHeight:a.size,
    cardX:c.x,cardY:c.y,cardWidth:c.w,backgroundScale:state.background?.scale,backgroundTop:state.background?.ty};
}
function geometryReport(rows,motion) {
  const fields=Object.keys(predictedGeometry({}));
  const predictions=rows.map(row=>{
    const observed=observedGeometry(row),predicted=predictedGeometry(motion.referenceAt(row.time));
    const residual=Object.fromEntries(fields.map(k=>[k,Number.isFinite(observed[k])&&Number.isFinite(predicted[k])?predicted[k]-observed[k]:null]));
    return {pts:row.pts,time:row.time,split:row.split,originalSplit:row.originalSplit??null,phase:row.phase??null,
      uncertaintyPx:row.uncertaintyPx??null,sheetTopUncertaintyPx:row.sheetTopUncertaintyPx??null,backgroundScaleUncertainty:row.background?.uncertaintyScale??null,
      observedVisibleCardHeight:row.card?.h??null,observed,predicted,residual};
  });
  const splits=['all',...new Set(rows.map(r=>r.split))];
  const statistics=Object.fromEntries(splits.map(split=>{
    const subset=predictions.filter(r=>split==='all'||r.split===split);
    return [split,{frames:subset.length,fields:Object.fromEntries(fields.map(k=>[k,summary(subset.map(r=>r.residual[k]))]))}];
  }));
  const phaseStatistics=Object.fromEntries([...new Set(predictions.map(r=>r.phase))].map(phase=>[phase,
    Object.fromEntries(splits.map(split=>{const subset=predictions.filter(r=>r.phase===phase&&(split==='all'||r.split===split));
      return [split,{frames:subset.length,fields:Object.fromEntries(fields.map(k=>[k,summary(subset.map(r=>r.residual[k]))]))}];}))]));
  const samples=motion.data?.samples;
  const holdouts=rows.filter(row=>row.split==='holdout');
  const leaked=samples?holdouts.filter(row=>samples.some(sample=>Math.abs(sample.t-row.time)<1e-6)).map(row=>row.pts):null;
  return {evaluation:holdouts.length?'Model evaluated on explicitly labeled fit, anchor and withheld rows':'All-point reconstruction residuals only; no independent holdout rows in this final model',
    splitValidation:{holdoutRows:holdouts.length,holdoutRowsUsedAsKnots:leaked,verified:!!samples},
    fixedConstraints:{cardX:'Fixed at zero by crop alignment, not an independent error estimate',cardWidth:'Fixed at 432 by crop alignment, not an independent error estimate',coverHeight:'Same measured square-cover size as coverWidth; not an independent dimension'},
    excluded:'Card height is excluded: the source measurement is visible extent, including occlusion, while state.card.h extends beyond the screen. Background scale uses dimensionless residuals; all other fields use pixels.',
    method:'Shared referenceAt evaluated at each original presentation timestamp, minus observed screen-pixel geometry. All supplied rows retained; null means unobservable, never perfect agreement.',
    caveat:'These are residuals to measurements, not error against unknown Apple motion parameters. Fit rows are calibration data. Holdout labels must come from the measurement protocol.',statistics,phaseStatistics,rows:predictions};
}
async function pairedFrame(sourcePath,replicaPath,destination,frame) {
  const w=896,h=1002;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#15171d"/><g fill="#ffffff" font-family="Inter, sans-serif" font-size="16"><text x="8" y="24">Apple reference</text><text x="456" y="24">Shared SVG reconstruction · offline</text><text x="8" y="984">Source PTS ${frame.pts}/30000 · ${frame.time.toFixed(6)} s · 1× speed</text></g></svg>`;
  await R.sharp(Buffer.from(svg)).composite([{input:sourcePath,left:8,top:36},{input:replicaPath,left:456,top:36}]).png().toFile(destination);
}
function selectKeyframes(frames,document) {
  const requested=document.keyframeTimes||document.keyframes?.map(k=>typeof k==='number'?k:k.time)||
    [542.208333333,542.3418,542.4419,542.575366667,542.775566667,544.110233333,545.478266667,546.112233333,546.412533333,546.479266667,546.579366667,546.8463];
  const selected=[];
  for(const time of requested) {
    const nearest=frames.reduce((a,b)=>Math.abs(a.time-time)<=Math.abs(b.time-time)?a:b);
    if(!selected.includes(nearest))selected.push(nearest);
  }
  if(selected.length<8) for(let i=0;i<12;i++){
    const frame=frames[Math.round(i*(frames.length-1)/11)];if(!selected.includes(frame))selected.push(frame);
  }
  return selected.sort((a,b)=>a.pts-b.pts).slice(0,12);
}
async function contactSheet(selected,pairedDir,destination) {
  const cols=3,cellW=448,cellH=501,gap=12;
  const height=Math.ceil(selected.length/cols)*(cellH+gap)+gap,width=cols*(cellW+gap)+gap;
  const inputs=await Promise.all(selected.map(async(frame,i)=>({input:await R.sharp(path.join(pairedDir,frame.file)).resize(cellW,cellH).png().toBuffer(),left:gap+(i%cols)*(cellW+gap),top:gap+Math.floor(i/cols)*(cellH+gap)})));
  await R.sharp({create:{width,height,channels:3,background:'#252832'}}).composite(inputs).png().toFile(destination);
}
function extractSource(source,frames,out,crop) {
  fs.mkdirSync(out,{recursive:true});
  const f=frames[0],l=frames.at(-1);
  R.run('ffmpeg',['-hide_banner','-loglevel','error','-y','-threads','1','-filter_threads','1',
    '-ss',String(Math.max(0,f.time-3)),'-t',String(l.time-Math.max(0,f.time-3)+.1),'-copyts','-i',source,
    '-vf',`select='between(pts,${f.pts},${l.pts})',crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`,
    '-fps_mode','passthrough','-start_number','0',path.join(out,'%06d.png')]);
  const count=fs.readdirSync(out).filter(x=>/^\d{6}\.png$/.test(x)).length;
  if(count!==frames.length)throw new Error(`Source extraction returned ${count} frames; expected ${frames.length}. Source PTS alignment needs review.`);
}
function csvCell(value){return typeof value==='string'?JSON.stringify(value):value??'';}
function writeCSV(file,rows){const fields=[...new Set(rows.flatMap(Object.keys))];fs.writeFileSync(file,[fields.join(','),...rows.map(r=>fields.map(k=>csvCell(r[k])).join(','))].join('\n')+'\n');}
function digestFiles(dir){return Object.fromEntries(R.walk(dir).filter(p=>!p.endsWith('comparison-manifest.json')).map(p=>[path.relative(dir,p),R.sha256(p)]));}
async function main(){
  const flags=R.args(process.argv.slice(2));
  if(!flags.source||!flags.measurements||!flags.out)throw new Error('Usage: node tools/build-comparison.cjs --source VIDEO --measurements JSON --out OUTSIDE_REPO [--source-frames DIR]');
  const source=path.resolve(flags.source),measurementFile=path.resolve(flags.measurements),out=path.resolve(flags.out);
  // Source material is for local critical comparison only, never included in the example/repository.
  const repository=path.resolve(R.ROOT,'../..');
  if(out===repository||out.startsWith(repository+path.sep))throw new Error('Comparison output must be outside the repository (copyright source snippet)');
  const document=JSON.parse(fs.readFileSync(measurementFile,'utf8'));
  const sourceHash=R.sha256(source), expected=document.source?.sha256??document.sourceSha256;
  const sourceInfo=R.probe(source).streams[0];
  if(sourceInfo.time_base!=='1/30000'||sourceInfo.r_frame_rate!=='30000/1001')throw new Error('Unexpected source clock; derive a new PTS mapping before comparing');
  if(expected&&sourceHash!==expected)throw new Error('Source hash does not match measurement provenance');
  const {motion,scene}=R.loadCore();
  const frames=R.timeline(Number(flags.start??motion.referenceSpec.start),Number(flags.end??motion.referenceSpec.end));
  const crop=document.crop||document.source?.crop||CROP;
  if(crop.width!==R.WIDTH||crop.height!==R.HEIGHT)throw new Error('Source crop differs from shared SVG viewport');
  const before=R.coreHashes();
  fs.mkdirSync(out,{recursive:true});
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'apple-music-comparison-'));
  const sourceDir=path.join(temp,'source'),replicaDir=path.join(temp,'replica'),pairDir=path.join(temp,'pairs');
  try{
    if(flags['source-frames']){
      fs.mkdirSync(sourceDir,{recursive:true});
      for(const f of frames){const file=path.join(path.resolve(flags['source-frames']),`${String(f.pts).padStart(10,'0')}.png`);fs.copyFileSync(file,path.join(sourceDir,f.file));}
    }else extractSource(source,frames,sourceDir,crop);
    await R.renderSequence({frames,out:replicaDir,motion,scene});
    fs.mkdirSync(pairDir,{recursive:true});
    const pixels=[];
    for(const f of frames){
      const sourcePath=path.join(sourceDir,f.file),replicaPath=path.join(replicaDir,f.file);
      const [a,b]=await Promise.all([R.sharp(sourcePath).removeAlpha().raw().toBuffer(),R.sharp(replicaPath).removeAlpha().raw().toBuffer()]);
      pixels.push({pts:f.pts,time:f.time,...pixelDifference(a,b)});
      await pairedFrame(sourcePath,replicaPath,path.join(pairDir,f.file),f);
    }
    const media=R.encodeSequence(pairDir,path.join(out,'source-vs-reconstruction'),{width:896,height:1002});
    const replicaMedia=R.encodeSequence(replicaDir,path.join(out,'reconstruction'));
    const keyframes=selectKeyframes(frames,document),keyframeDir=path.join(out,'paired-keyframes');
    fs.mkdirSync(keyframeDir,{recursive:true});
    for(const name of fs.readdirSync(keyframeDir))if(/^\d+\.png$/.test(name))fs.unlinkSync(path.join(keyframeDir,name));
    for(const f of keyframes)fs.copyFileSync(path.join(pairDir,f.file),path.join(keyframeDir,`${f.pts}.png`));
    await contactSheet(keyframes,pairDir,path.join(out,'paired-keyframes.png'));
    const geometry=geometryReport(normalizeMeasurements(document),motion);
    if(geometry.splitValidation.holdoutRowsUsedAsKnots?.length)throw new Error('Holdout timestamps occur in calibration knots; cannot label this independent holdout validation: '+geometry.splitValidation.holdoutRowsUsedAsKnots.join(','));
    fs.writeFileSync(path.join(out,'geometry-residuals.json'),JSON.stringify(geometry,null,2)+'\n');
    writeCSV(path.join(out,'geometry-residuals.csv'),geometry.rows.map(r=>({pts:r.pts,time:r.time,split:r.split,originalSplit:r.originalSplit,phase:r.phase,...Object.fromEntries(Object.entries(r.residual).map(([k,v])=>[k+(k==='backgroundScale'?'ResidualRatio':'ResidualPx'),v]))})));
    writeCSV(path.join(out,'pixel-differences.csv'),pixels);
    const after=R.coreHashes();
    if(JSON.stringify(before)!==JSON.stringify(after))throw new Error('Shared core changed during rendering; rerun against a stable revision');
    let historicalHoldout=null;
    if(flags['holdout-report']){
      if(!flags['withheld-model'])throw new Error('--holdout-report requires --withheld-model for provenance');
      const historicalFile=path.resolve(flags['holdout-report']),modelFile=path.resolve(flags['withheld-model']);
      const historical=JSON.parse(fs.readFileSync(historicalFile,'utf8'));
      const modelHash=R.sha256(modelFile);
      if(historical.binding?.calibrationSha256&&historical.binding.calibrationSha256!==modelHash)throw new Error('Historical model hash does not match historical report');
      const historicalMotionFile=path.resolve(flags['withheld-motion']||path.join(path.dirname(modelFile),'withheld-motion.js'));
      let historicalMotionHash=null;
      if(fs.existsSync(historicalMotionFile)){
        historicalMotionHash=R.sha256(historicalMotionFile);
        if(historical.binding?.motionSha256&&historical.binding.motionSha256!==historicalMotionHash)throw new Error('Historical motion hash does not match historical report');
        fs.copyFileSync(historicalMotionFile,path.join(out,'historical-withheld-motion.js'));
      }
      fs.copyFileSync(historicalFile,path.join(out,'historical-holdout-geometry.json'));
      fs.copyFileSync(modelFile,path.join(out,'historical-withheld-calibration.json'));
      historicalHoldout={role:'Historical withheld-data diagnostic of the earlier sparse model, not independent validation of the final all-point reconstruction',
        reportSha256:R.sha256(historicalFile),modelSha256:modelHash,motionSha256:historicalMotionHash,statistics:historical.statistics,splitValidation:historical.splitValidation,provenance:historical.provenance??historical.binding??null};
    }
    const report={schemaVersion:1,source:{sha256:sourceHash,width:sourceInfo.width,height:sourceInfo.height,crop,frameRate:'30000/1001',timeBase:'1/30000'},
      measurement:{sha256:R.sha256(measurementFile),protocol:document.protocol??document.method??null},core:after,
      harness:{'tools/render.cjs':R.sha256(path.join(__dirname,'render.cjs')),'tools/build-comparison.cjs':R.sha256(__filename)},
      renderer:{method:'Offline shared SVG scene → librsvg/sharp; not browser QA',versions:require('sharp').versions,node:process.version},
      timing:R.timingManifest(frames,media),reconstructionTiming:R.timingManifest(frames,replicaMedia),
      frames:frames.map(f=>({...f,sourceRasterSha256:R.sha256(path.join(sourceDir,f.file)),replicaRasterSha256:R.sha256(path.join(replicaDir,f.file))})),
      keyframes:keyframes.map(f=>({pts:f.pts,time:f.time,file:`paired-keyframes/${f.pts}.png`})),
      evaluation:geometry.evaluation,historicalHoldout,geometry:geometry.statistics,geometryByPhase:geometry.phaseStatistics,splitValidation:geometry.splitValidation,pixels:{frameCount:pixels.length,meanOfFrameMAE:pixels.reduce((a,b)=>a+b.meanAbsoluteRGB,0)/pixels.length,
        method:'Unmasked whole-screen RGB difference at every clip frame. Sensitive to replacement artwork, typeface, video compression and rasterization. Diagnostic only; no claim of perceptual accuracy.'},
      limitations:['Shared SVG offline rendering does not verify browser rendering, event wiring, touch latency or interaction behavior.',
        'Geometry residuals compare reconstructed positions with observed pixels, not Apple implementation parameters or unknown ground truth.',
        'Original artwork and system fonts may differ. Pixel differences include those differences.',
        'GIF timestamps are centisecond-quantized. MP4 retains exact 30000/1001 timing.'],
      copyright:'Short source crop retained outside the repository solely for local comparison and criticism; no source footage is published.',
      outputs:digestFiles(out)};
    fs.writeFileSync(path.join(out,'comparison-manifest.json'),JSON.stringify(report,null,2)+'\n');
    fs.writeFileSync(path.join(out,'COMPARISON.md'),`# Apple Music motion comparison\n\nOffline rendering of the shared SVG scene, aligned to original source presentation timestamps. This is not browser QA.\n\n- Source SHA-256: ${sourceHash}\n- Crop: ${crop.x}, ${crop.y}, ${crop.width} × ${crop.height}\n- Native cadence: 30000/1001 fps; time base 1/30000\n- ${frames.length} frames, ${report.timing.durationSeconds.toFixed(6)} s, playback 1×\n- First/last source PTS: ${frames[0].pts} / ${frames.at(-1).pts}\n- GIF duration rounding error: ${report.timing.gifQuantization.durationErrorSeconds.toFixed(6)} s\n- Paired landmark images: ${keyframes.length}\n- Measured geometry rows: ${geometry.rows.length}; all supplied rows retained\n- Final evaluation: ${geometry.evaluation}\n${historicalHoldout?'- Historical held-out model/report retained separately; their validation does not apply to the final all-point model.\n':''}\n## How to inspect\n\nWatch source-vs-reconstruction.mp4 at normal speed, then inspect paired-keyframes.png. geometry-residuals.json and CSV contain signed residuals for every measured row, broken down by fit/holdout labels and by motion phase so steady holds do not hide transition errors. Null residuals mean unobserved. Card height is excluded because its visible measured extent differs from the hidden sheet model; background-scale errors are dimensionless. pixel-differences.csv covers every rendered frame. comparison-manifest.json binds source, measurement and final shared-core hashes to these files.\n\n## Limits\n\n${report.limitations.map(s=>'- '+s).join('\n')}\n\nNo percentage similarity or perfect-match claim is made. Pixel MAE is an unmasked diagnostic, not a perceptual score. Fit residuals are not independent validation; holdout labels are taken from the documented measurement protocol.\n\n${report.copyright}\n`);
    // Include the explanation in the final hash binding, after writing it.
    report.outputs=digestFiles(out);fs.writeFileSync(path.join(out,'comparison-manifest.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({out,frames:frames.length,geometry:geometry.statistics,pixelFrameMAE:report.pixels.meanOfFrameMAE},null,2));
  }finally{if(!flags['keep-frames'])fs.rmSync(temp,{recursive:true,force:true});else console.log('Kept frame cache: '+temp);}
}
module.exports={summary,pixelDifference,normalizeMeasurements,observedGeometry,predictedGeometry,geometryReport,selectKeyframes,extractSource,pairedFrame,contactSheet};
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
