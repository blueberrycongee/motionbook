#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('./build-comparison.cjs'),R=require('./render.cjs');
const rows=C.normalizeMeasurements({timeBase:'1/30000',frames:[{pts:1001,time:1001/30000,lines:[{line_id:'A1',x_px:10,y_top_px:20,width_px:30,height_px:10,bottom_proxy_px:30},{line_id:'A2',x_px:10,y_top_px:50,width_px:20,height_px:10,accepted:false}]}]});
assert.equal(rows.length,2);assert.equal(rows[0].geometry.id,'A1');assert.equal(rows[0].geometry.bottom,30);assert.equal(rows[1].accepted,false);
const geometry=C.geometryReport(rows,{referenceAt:()=>({lines:[{id:'A1',x:10,y:22,w:30,h:10},{id:'A2',x:10,y:50,w:20,h:10}]})});
assert.equal(geometry.rows[0].residual.y,2);assert.equal(geometry.rows[0].residual.bottom,2);assert.equal(geometry.rows[1].residual.y,null);assert.equal(geometry.statistics.all.fields.y.count,1);
assert.equal(C.rectangleIoU({x:0,y:0,w:10,h:10},{x:0,y:0,w:10,h:10}),1);assert.equal(C.rectangleIoU({x:0,y:0,w:10,h:10},{x:20,y:0,w:10,h:10}),0);
const safe=C.geometricSvg(100,100,[{id:'A1',x:10,y:20,w:30,h:10,text:'DO NOT RETAIN THIS CONTENT'}]);assert.ok(!safe.includes('DO NOT RETAIN'));assert.ok(safe.includes('A1'));
const report={passed:true,tests:['Nested measurement frame normalization','Rejected observations retained with null residuals','Ink-box bottom is distinguished from baseline','Exact rectangle IoU','Original text fields excluded from geometric SVG'],harnessSha256:R.sha256(path.join(__dirname,'build-comparison.cjs')),testSha256:R.sha256(__filename)};
fs.mkdirSync(path.join(R.ROOT,'validation'),{recursive:true});fs.writeFileSync(path.join(R.ROOT,'validation/comparison-harness-tests.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
