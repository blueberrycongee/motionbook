#!/usr/bin/env node
'use strict';
/** Evaluates preserved even-frame model in memory without overwriting the final model. */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),R=require('./render.cjs'),C=require('./build-comparison.cjs');
function main(){
 const flags=R.args(process.argv.slice(2)),modelFile=path.resolve(flags.model||path.join(R.ROOT,'validation/historical-even-calibration-data.js')),observationFile=path.resolve(flags.observations||path.join(R.ROOT,'validation/observations.json')),motionFile=path.join(R.ROOT,'src/motion.js'),out=path.resolve(flags.out||path.join(R.ROOT,'validation/historical-temporal-holdout.json'));
 const data=require(modelFile),historicalModule=new Module(motionFile);historicalModule.filename=motionFile;historicalModule.paths=Module._nodeModulePaths(path.dirname(motionFile));const originalRequire=historicalModule.require.bind(historicalModule);historicalModule.require=id=>id==='./calibration-data.js'?data:originalRequire(id);historicalModule._compile(fs.readFileSync(motionFile,'utf8'),motionFile);const motion=historicalModule.exports;
 const doc=JSON.parse(fs.readFileSync(observationFile,'utf8')),report=C.geometryReport(C.normalizeMeasurements(doc),motion,data);
 report.role='Historical within-sequence odd-frame holdout diagnostic of the earlier even-only model. This is NOT independent validation of the final all-point reconstruction.';
 report.binding={calibrationSha256:R.sha256(modelFile),motionSha256:R.sha256(motionFile),observationsSha256:R.sha256(observationFile),evaluationHarnessSha256:R.sha256(path.join(__dirname,'build-comparison.cjs')),evaluatorSha256:R.sha256(__filename)};
 report.finding='Large outgoing-block endpoint errors occur where the final accepted odd sample follows the last even calibration knot and the sparse model clamps. All original observations and errors are retained.';
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({out,binding:report.binding,holdoutY:report.statistics.temporal_holdout?.fields.y},null,2));
}
main();
