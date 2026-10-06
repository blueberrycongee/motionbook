#!/usr/bin/env node
'use strict';
/** Copyright-safe geometric comparison. Source pixels, glyphs, lyrics and audio are never read or retained.
 * The source video is probed for its native presentation timestamps only.
 */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const R=require('./render.cjs');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const finite=(...vs)=>vs.find(Number.isFinite);
const isHoldout=s=>s==='holdout'||s==='temporal_holdout';
function summary(values){const a=values.filter(Number.isFinite),b=a.map(Math.abs).sort((x,y)=>x-y);return{count:a.length,mae:a.length?b.reduce((s,x)=>s+x,0)/a.length:null,rmse:a.length?Math.sqrt(a.reduce((s,x)=>s+x*x,0)/a.length):null,maxAbsolute:b.at(-1)??null,p95Absolute:b.length?b[Math.ceil(b.length*.95)-1]:null};}
function box(line){return {id:String(line.line_id??line.lineId??line.id),x:finite(line.x_px,line.x),y:finite(line.y_top_px,line.y_px,line.y),w:finite(line.width_px,line.width,line.w),h:finite(line.height_px,line.height,line.h),bottom:finite(line.bottom_proxy_px,line.bottom),opacity:finite(line.opacity),scale:finite(line.scale),highlight:finite(line.highlight)};}
function normalizeMeasurements(doc){
  const records=doc.measurements||doc.frames||doc.rows||doc.observations||doc.samples;
  if(!Array.isArray(records)||!records.length)throw new Error('Measurements need nonempty frames, rows or observations');
  const clock=R.rational(doc.source?.timeBase||doc.source?.time_base||doc.timeBase||'1/30000');
  return records.flatMap(row=>{
    const pts=Number(row.pts??row.source_pts),time=Number(row.time??row.source_time??row.sourceTime??pts*clock.numerator/clock.denominator);
    const lines=row.lines||[row];
    return lines.map(line=>({...row,...line,pts,time,split:line.split||row.split||'unspecified',geometry:box(line),accepted:line.accepted!==false&&line.manual_valid!==false&&line.valid!==false&&line.visible!==false&&line.visible_and_validated!==false&&row.accepted!==false}));
  });
}
function predictedGeometry(state,id){
  const l=state.lines.find(l=>String(l.id??l.line_id)===id);if(!l||l.visible===false)return null;
  const g=box(l);if(Number.isFinite(g.y)&&Number.isFinite(g.h))g.bottom=g.y+g.h;return g;
}
function geometryReport(rows,motion,calibrationOverride){
  const fields=['x','y','w','h','bottom','opacity','scale','highlight'];
  const calibrationPath=path.join(R.ROOT,'src/calibration-data.js');
  const calibration=calibrationOverride??(fs.existsSync(calibrationPath)?require(calibrationPath):null);
  const results=rows.map(row=>{
    const predicted=predictedGeometry(motion.referenceAt(row.time),row.geometry.id),observed=row.geometry;
    const residual=Object.fromEntries(fields.map(k=>[k,row.accepted&&Number.isFinite(observed[k])&&Number.isFinite(predicted?.[k])?predicted[k]-observed[k]:null]));
    const track=calibration?.tracks?.find(t=>String(t.id)===row.geometry.id);
    const usedAsKnot=track?track.samples.some(s=>Math.abs(s.t-row.time)<1e-6):null;
    return{pts:row.pts,time:row.time,lineId:row.geometry.id,split:row.split,historicalSplit:row.historical_split??null,accepted:row.accepted,uncertaintyPx:row.uncertaintyPx??row.uncertainty_px??row.position_uncertainty_px??null,normalizedCorrelation:row.normalized_correlation??row.correlation??row.confidence??null,observed,predicted,residual,usedAsKnot};
  });
  const splits=['all',...new Set(results.map(r=>r.split))];
  const statistics=Object.fromEntries(splits.map(split=>[split,{observations:results.filter(r=>split==='all'||r.split===split).length,fields:Object.fromEntries(fields.map(k=>[k,summary(results.filter(r=>split==='all'||r.split===split).map(r=>r.residual[k]))]))}]));
  const byLine=Object.fromEntries([...new Set(results.map(r=>r.lineId))].map(id=>[id,Object.fromEntries(fields.map(k=>[k,summary(results.filter(r=>r.lineId===id).map(r=>r.residual[k]))]))]));
  const leaked=results.filter(r=>isHoldout(r.split)&&r.usedAsKnot===true).map(r=>({pts:r.pts,lineId:r.lineId}));
  if(leaked.length)throw new Error(`Holdout observations were used as calibration knots: ${JSON.stringify(leaked)}`);
  return{evaluation:results.some(r=>isHoldout(r.split))?'Residuals reported separately for measured fitting and withheld observations':'All-point reconstruction residuals; no independent held-out validation is claimed',method:'Evaluate the exact shared motion core at each original source PTS, subtract measured padded-template geometry; rejected observations remain present with null residuals',units:{x:'px',y:'px',w:'px',h:'px',bottom:'px; template bottom proxy, not a typographic baseline',opacity:'unitless',scale:'unitless',highlight:'unitless'},fixedConstraints:{x:'Fixed manual template x; not independently remeasured per frame',w:'Fixed manual template width; not dynamic glyph ink width',h:'Fixed manual template height; not dynamic glyph ink height',bottom:'y plus fixed h; duplicates vertical displacement rather than independently locating a font baseline'},splitValidation:{holdoutObservations:results.filter(r=>isHoldout(r.split)).length,holdoutUsedAsKnots:leaked,calibrationAvailable:!!calibration},statistics,byLine,rows:results};
}
function frameRows(rows,pts){return rows.filter(r=>r.pts===pts&&r.accepted);}
function geometricSvg(width,height,boxes,{color='#8edcfc',labels=true}={}){
  let content='';
  for(const b of boxes){
    if(![b.x,b.y,b.w,b.h].every(Number.isFinite)||b.w<=0||b.h<=0)continue;
    content+=`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="1" fill="${color}" fill-opacity=".30" stroke="${color}" stroke-width="1.5"/><path d="M${b.x} ${b.y+b.h}h${b.w}" stroke="${color}" stroke-width="2"/>`;
    if(labels)content+=`<text x="${Math.max(4,b.x)}" y="${b.y-5}" fill="${color}" font-family="sans-serif" font-size="11">${esc(b.id)}</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><clipPath id="screen"><rect width="${width}" height="${height}"/></clipPath></defs><rect width="${width}" height="${height}" fill="#171923"/><g clip-path="url(#screen)">${content}</g></svg>`;
}
function rectangleIoU(a,b){
  if(!a||!b||![a.x,a.y,a.w,a.h,b.x,b.y,b.w,b.h].every(Number.isFinite))return null;
  const w=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)),h=Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)),intersection=w*h,union=a.w*a.h+b.w*b.h-intersection;
  return union>0?intersection/union:null;
}
function pixelDifference(a,b){if(a.length!==b.length)throw new Error('Raster bounds differ');let sum=0;for(let i=0;i<a.length;i++)sum+=Math.abs(a[i]-b[i]);return sum/a.length;}
function writeCSV(file,rows){const fields=[...new Set(rows.flatMap(Object.keys))],cell=v=>v===null||v===undefined?'':typeof v==='string'?JSON.stringify(v):String(v);fs.writeFileSync(file,[fields.join(','),...rows.map(r=>fields.map(f=>cell(r[f])).join(','))].join('\n')+'\n');}
function digestFiles(dir){return Object.fromEntries(R.walk(dir).filter(f=>!f.endsWith('comparison-manifest.json')).map(f=>[path.relative(dir,f),R.sha256(f)]));}
function selectKeyframes(frames,doc){const times=doc.keyframeTimes||doc.keyframes?.map(f=>typeof f==='number'?f:f.time)||Array.from({length:12},(_,i)=>frames[Math.round(i*(frames.length-1)/11)].time);return [...new Set(times.map(t=>frames.reduce((a,b)=>Math.abs(a.time-t)<=Math.abs(b.time-t)?a:b)))].sort((a,b)=>a.pts-b.pts);}
async function contactSheet(selected,pairDir,destination,pairWidth,pairHeight){const cols=3,cellW=Math.min(480,pairWidth),cellH=Math.round(pairHeight*cellW/pairWidth),gap=12,width=cols*(cellW+gap)+gap,height=Math.ceil(selected.length/cols)*(cellH+gap)+gap;const composite=[];for(let i=0;i<selected.length;i++)composite.push({input:await R.sharp(path.join(pairDir,selected[i].file)).resize(cellW,cellH).png().toBuffer(),left:gap+(i%cols)*(cellW+gap),top:gap+Math.floor(i/cols)*(cellH+gap)});await R.sharp({create:{width,height,channels:3,background:'#10121b'}}).composite(composite).png().toFile(destination);}
async function main(){
  const flags=R.args(process.argv.slice(2));if(!flags.source||!flags.measurements||!flags.out)throw new Error('Usage: node tools/build-comparison.cjs --source VIDEO --measurements JSON --out DIR');
  const source=path.resolve(flags.source),measurement=path.resolve(flags.measurements),out=path.resolve(flags.out),doc=JSON.parse(fs.readFileSync(measurement,'utf8')),core=R.loadCore();
  const rows=normalizeMeasurements(doc);if(rows.some(r=>!/^[A-Za-z0-9_-]{1,24}$/.test(r.geometry.id)||!Number.isInteger(r.pts)||!Number.isFinite(r.time)))throw new Error('Measurements require anonymous line IDs, exact integer source PTS, and finite time');const start=Number(flags.start??core.spec.start),end=Number(flags.end??core.spec.end),timeline=R.sourceTimeline(source,start,end),frames=timeline.frames;
  const expectedHash=doc.source?.sha256??doc.sourceSha256;if(expectedHash&&expectedHash!==timeline.source.sha256)throw new Error('Source hash does not match measurements');
  const expectedClock=doc.source?.timeBase??doc.source?.time_base??doc.timeBase;if(expectedClock&&expectedClock!==frames[0].timeBase)throw new Error('Measurement clock differs from original source clock');
  const width=core.width,height=core.height;if(!width||!height)throw new Error('Shared core must declare viewport width/height');
  const pairWidth=(width*2+48+1)&~1,pairHeight=(height+106+1)&~1;
  const before=R.coreHashes(),geometry=geometryReport(rows,core.motion),temp=fs.mkdtempSync(path.join(os.tmpdir(),'lyrics-safe-comparison-')),pairDir=path.join(temp,'pairs');
  fs.mkdirSync(pairDir,{recursive:true});fs.mkdirSync(out,{recursive:true});
  try{
    const hashes=[],pixels=[],coverage=[];
    for(const f of frames){
      const observed=frameRows(rows,f.pts).map(r=>r.geometry),state=core.motion.referenceAt(f.time),predicted=observed.map(b=>predictedGeometry(state,b.id)).filter(Boolean);
      const left=Buffer.from(geometricSvg(width,height,observed,{color:'#8edcfc'})),right=Buffer.from(geometricSvg(width,height,predicted,{color:'#ffcf93'}));
      const [leftPng,rightPng]=await Promise.all([R.sharp(left).png().toBuffer(),R.sharp(right).png().toBuffer()]);
      const monoA=await R.sharp(Buffer.from(geometricSvg(width,height,observed,{color:'#ffffff',labels:false}))).removeAlpha().raw().toBuffer(),monoB=await R.sharp(Buffer.from(geometricSvg(width,height,predicted,{color:'#ffffff',labels:false}))).removeAlpha().raw().toBuffer();
      pixels.push({pts:f.pts,time:f.time,observedLines:observed.length,geometricRasterMAE:observed.length?pixelDifference(monoA,monoB):null,meanBoxIoU:observed.length?observed.map(a=>rectangleIoU(a,predicted.find(b=>b.id===a.id))).filter(Number.isFinite).reduce((s,n)=>s+n,0)/observed.length:null});
      coverage.push({pts:f.pts,measuredLines:observed.length});
      const labels=`<svg xmlns="http://www.w3.org/2000/svg" width="${pairWidth}" height="${pairHeight}"><rect width="100%" height="100%" fill="#10121b"/><g font-family="sans-serif" fill="#f4f5fa"><text x="16" y="23" font-size="15">Source measured geometry</text><text x="${width+32}" y="23" font-size="15">Shared model geometry</text><text x="16" y="${height+66}" font-size="12">Original PTS ${f.pts} · ${f.time.toFixed(6)} s · native 1×</text><text x="16" y="${height+86}" font-size="11">Geometric proxy only · no source pixels, lyrics or audio · ${observed.length} observed lines</text></g></svg>`;
      const destination=path.join(pairDir,f.file);await R.sharp(Buffer.from(labels)).composite([{input:leftPng,left:16,top:36},{input:rightPng,left:width+32,top:36}]).png().toFile(destination);
      hashes.push({pts:f.pts,sourceGeometryRasterSha256:R.bufferHash(leftPng),replicaGeometryRasterSha256:R.bufferHash(rightPng),pairRasterSha256:R.sha256(destination)});
    }
    const media=R.encodeSequence(pairDir,path.join(out,'source-vs-replica-geometry'),{fps:timeline.fps,timeBase:frames[0].timeBase,width:pairWidth,height:pairHeight,frameCount:frames.length});
    const keyframes=selectKeyframes(frames,doc),keyDir=path.join(out,'paired-keyframes');fs.mkdirSync(keyDir,{recursive:true});for(const f of keyframes)fs.copyFileSync(path.join(pairDir,f.file),path.join(keyDir,`${f.pts}.png`));
    await contactSheet(keyframes,pairDir,path.join(out,'paired-keyframes.png'),pairWidth,pairHeight);
    fs.writeFileSync(path.join(out,'geometry-residuals.json'),JSON.stringify(geometry,null,2)+'\n');
    writeCSV(path.join(out,'geometry-residuals.csv'),geometry.rows.map(r=>({pts:r.pts,time:r.time,lineId:r.lineId,split:r.split,accepted:r.accepted,...Object.fromEntries(Object.entries(r.residual).map(([k,v])=>[k+'Residual',v]))})));
    writeCSV(path.join(out,'geometric-raster-differences.csv'),pixels);
    const after=R.coreHashes();if(JSON.stringify(before)!==JSON.stringify(after))throw new Error('Shared core changed during comparison; rerun stable revision');
    const report={schemaVersion:1,comparisonKind:'Copyright-safe geometric proxy, measured source boxes versus exact shared motion-core boxes; no source imagery or lyric text is included',source:{sha256:timeline.source.sha256,width:timeline.source.stream.width,height:timeline.source.stream.height,timeBase:frames[0].timeBase,frameRate:timeline.fps,crop:doc.crop??doc.source?.crop??null},measurement:{sha256:R.sha256(measurement),protocol:doc.protocol??doc.method??null},core:after,harness:{'tools/render.cjs':R.sha256(path.join(__dirname,'render.cjs')),'tools/build-comparison.cjs':R.sha256(__filename)},timing:R.timingManifest(frames,media),frames:frames.map((f,i)=>({...f,...hashes[i]})),coverage:{sourceFrames:frames.length,framesWithMeasurements:coverage.filter(r=>r.measuredLines>0).length,minimumMeasuredLines:Math.min(...coverage.map(r=>r.measuredLines)),rows:coverage},keyframes:keyframes.map(f=>({pts:f.pts,time:f.time,file:`paired-keyframes/${f.pts}.png`})),evaluation:geometry.evaluation,geometry:geometry.statistics,geometryByLine:geometry.byLine,splitValidation:geometry.splitValidation,pixels:{method:'Both panels re-rendered from boxes using identical colors before per-channel RGB MAE; this is geometric proxy error, not source-image or perceptual similarity',meanFrameMAE:summary(pixels.map(p=>p.geometricRasterMAE)).mae},limitations:['Source panel is a neutral geometric proxy. It preserves only independently recorded positions and box dimensions, not the original Apple typography, UI, blur, colors or lyric text.','Only lines observed at the exact frame PTS are drawn and compared. Empty source panels indicate unavailable measurements, never a perfect match.','Template-box bottom is a proxy, not an identified font baseline. Template x, width and height are fixed seeds; their zero residuals do not establish independent accuracy.','Offline media verifies deterministic shared-core output and native timing, not browser appearance, event wiring or native Apple implementation.','Replacement original prose has different glyph widths; the normal UI preview is not a song-lyric facsimile.','Residuals to calibration knots are reconstruction residuals; independent accuracy requires separate withheld data.','GIF time is rounded to centiseconds; silent MP4 preserves the source frame cadence.'],copyright:'No source video, source raster, readable song lyrics, original album artwork or audio is copied into these deliverables.',outputs:{}};
    fs.writeFileSync(path.join(out,'COMPARISON.md'),`# Lyrics line-motion comparison\n\nThis is a geometric comparison, not a copy of the source clip. Left: observed padded template boxes. Right: the shared reconstruction evaluated at the same original presentation timestamp. The line identifiers are anonymous and the source pixels are never used.\n\n- Native rate: ${timeline.fps} fps; playback 1×\n- Original source clock: ${frames[0].timeBase}\n- Frames: ${frames.length}; duration ${report.timing.durationSeconds.toFixed(6)} seconds\n- First / last source PTS: ${frames[0].pts} / ${frames.at(-1).pts}\n- GIF duration error: ${report.timing.gifQuantization.durationErrorSeconds.toFixed(6)} seconds\n- Measured frame coverage: ${report.coverage.framesWithMeasurements}/${frames.length}\n- ${geometry.evaluation}\n\n## Inspect\n\nUse source-vs-replica-geometry.mp4 or .gif at normal speed, then inspect paired-keyframes.png. geometry-residuals.json and CSV retain every observation, including rejected rows with null errors. geometric-raster-differences.csv reports same-style rectangle diagnostics, not visual accuracy of the original app. comparison-manifest.json binds source, measurement, core, harness, frame and output hashes.\n\n## Limits\n\n${report.limitations.map(s=>'- '+s).join('\n')}\n\n${report.copyright}\n`);
    report.outputs=digestFiles(out);fs.writeFileSync(path.join(out,'comparison-manifest.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({out,frames:frames.length,coverage:report.coverage.framesWithMeasurements,geometry:geometry.statistics},null,2));
  }finally{if(!flags['keep-frames'])fs.rmSync(temp,{recursive:true,force:true});else console.log('Kept geometric frame cache: '+temp);}
}
module.exports={box,summary,normalizeMeasurements,predictedGeometry,geometryReport,geometricSvg,rectangleIoU,pixelDifference,writeCSV,digestFiles,selectKeyframes};
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
