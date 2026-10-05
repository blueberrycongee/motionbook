const assert=require('node:assert/strict');
const {ease,interpolate,createModel}=require('./motion.js');
assert.equal(ease(0),0);assert.equal(ease(1),1);assert.equal(ease(-1),0);assert.equal(ease(2),1);
let previous=0;for(let t=0;t<=1;t+=.001){const value=ease(t);assert(value>=previous);assert(value<=1);previous=value;}
assert.equal(interpolate(0,1,1),1);assert.equal(interpolate(1,0,1),0);assert.equal(interpolate(.4,.9,0),.4);
const m=createModel(4);assert.deepEqual(m.targets(),[0,0,0,0]);m.hover(0);assert.equal(m.active,0);m.leave(0);assert.equal(m.active,-1);
m.toggle(2);m.leave(2);assert.equal(m.active,2);assert.equal(m.pinned,2);m.toggle(2);assert.equal(m.active,-1);
m.toggle(2);m.hover(3);assert.equal(m.pinned,-1);assert.deepEqual(m.targets(),[0,0,0,1]);m.leave(2);assert.equal(m.active,3);
assert.equal(m.activate(4),false);assert.equal(m.activate(-2),false);assert.equal(m.toggle(-1),false);assert.equal(m.activate(NaN),false);
m.reset();assert.deepEqual(m.targets(),[0,0,0,0]);assert.throws(()=>createModel(0),RangeError);
console.log('PASS: easing / interpolation / hover / touch-toggle / interruption / bounds assertions');
