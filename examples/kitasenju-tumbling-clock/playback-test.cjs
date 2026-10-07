'use strict';
const assert = require('node:assert/strict');
const {createController} = require('./playback.js');
let tests = 0;
function test(name, fn) { fn(); tests++; console.log('PASS ' + name); }
test('play, pause and resume preserve exact phase', () => {
  const p = createController(); p.play(0); p.tick(100); assert.equal(p.snapshot().time,.1); p.pause(100); p.tick(200); assert.equal(p.snapshot().time,.1); p.play(200); p.tick(300); assert.equal(p.snapshot().time,.2);
});
test('repeated replay has one deterministic origin', () => {
  const p = createController(); for (let i=0;i<20;i++){p.replay(i*1000); p.tick(i*1000+100); assert.equal(p.snapshot().time,.1);}
});
test('hidden time is excluded and resume does not jump', () => {
  const p=createController();p.play(0);p.tick(100);p.setHidden(true,100);p.tick(9000);p.setHidden(false,9000);p.tick(9100);assert.equal(p.snapshot().time,.2);
});
test('reduced motion starts static and never autoplays',()=>{
  const p=createController({reducedMotion:true});p.play(0);p.tick(100);assert.equal(p.snapshot().time,0);p.replay(100);assert.equal(p.snapshot().playing,false);p.setReducedMotion(false,200);assert.equal(p.snapshot().playing,false);p.play(200);p.tick(300);assert.equal(p.snapshot().time,.1);p.setReducedMotion(true,300);assert.equal(p.snapshot().playing,false);
});
test('seek clamps finite endpoints; speed is explicit',()=>{
  const p=createController({duration:2});p.seek(-2);assert.equal(p.snapshot().time,0);p.seek(5);assert.equal(p.snapshot().time,2);p.seek(.5,100);p.setSpeed(2,100);p.play(100);p.tick(200);assert.equal(p.snapshot().time,.7);
});
test('loop seam and multiple repeated updates are bounded',()=>{
  const p=createController({duration:.2});p.play(0);p.tick(100);p.tick(200);assert.equal(p.snapshot().time,0);assert.equal(p.snapshot().loops,1);p.tick(200);assert.equal(p.snapshot().time,0);
});
test('clock regression and suspension gaps do not corrupt state',()=>{
  const p=createController();p.play(100);p.tick(90);assert.equal(p.snapshot().time,0);p.tick(10000);assert.equal(p.snapshot().time,.25);
});
test('all numeric and boolean entry points reject malformed input',()=>{
  for(const x of [NaN,Infinity,-Infinity,'1',null]){assert.throws(()=>createController({duration:x}));const p=createController();assert.throws(()=>p.tick(x));assert.throws(()=>p.seek(x));assert.throws(()=>p.setSpeed(x));}
  const p=createController();assert.throws(()=>p.setSpeed(.1));assert.throws(()=>p.setSpeed(3));assert.throws(()=>p.setHidden(1));assert.throws(()=>p.setReducedMotion('true'));assert.throws(()=>createController({duration:0}));
});
console.log(JSON.stringify({testsPassed:tests}));
