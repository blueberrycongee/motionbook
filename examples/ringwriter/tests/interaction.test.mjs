import test from 'node:test';import assert from 'node:assert/strict';import {createInteraction,frameAt} from '../src/interaction.mjs';
test('native timestamp lookup preserves variable intervals and clamps bounds',()=>{const p=[0,.016667,.05,.066667];assert.equal(frameAt(-1,p),0);assert.equal(frameAt(.02,p),1);assert.equal(frameAt(.05,p),2);assert.equal(frameAt(3,p),3);assert.throws(()=>frameAt(NaN,p));});
test('hold, release and cancellation retain their supplied pose anchors',()=>{const m=createInteraction(),a={rings:[]},b={rings:[1]};m.move(300,500);assert.equal(m.press(4,a),true);assert.equal(m.press(4.1,b),false);assert.equal(m.state(4).frame,208);assert.equal(m.state(5).label,'RELEASE');assert.equal(m.state(99).frame,361);assert.equal(m.state(5).anchor,a);assert.equal(m.release(6,b),true);assert.equal(m.state(6).frame,362);assert.equal(m.state(9).frame,485);assert.equal(m.state(9).anchor,b);assert.equal(m.cancel(10,b),false);m.press(11,a);assert.equal(m.cancel(12,b),true);});
test('replay restarts cleanly and authored closure reaches black before wrapping',()=>{const m=createInteraction();m.replay(30);assert.equal(m.state(30).frame,0);assert.ok(m.state(39.299).opacity<.001);assert.equal(m.state(39.301).frame,0);assert.equal(m.state(39.301).opacity,1);m.move(-50,9000);assert.deepEqual(m.pointer,{x:0,y:1728});assert.throws(()=>m.move(Infinity,0));assert.throws(()=>m.press(NaN,{}));});

test('pointer interaction takes ownership of replay and preserves the selected ready pose',()=>{const m=createInteraction(),a={frame:112,rings:[]};m.move(100,200);assert.equal(m.interact(1,a),true);assert.equal(m.mode,'idle');assert.equal(m.state(2).frame,112);assert.equal(m.state(2).anchor,a);assert.equal(m.state(2).label,'CLICK & HOLD');assert.equal(m.interact(3,{frame:300}),false);m.press(4,a);assert.equal(m.mode,'held');m.replay(5);assert.equal(m.mode,'replay');});

test('recorded replay selects every rounded native PTS and closes on a blank hold',async()=>{
 const {replayState}=await import('../src/interaction.mjs');
 for(let frame=0;frame<486;frame++){
  const seconds=Number((frame/60).toFixed(6));
  assert.equal(replayState(seconds).frame,frame,`native frame ${frame}`);
  assert.equal(replayState(seconds).opacity,1);
 }
 for(let frame=552;frame<558;frame++)assert.equal(replayState(frame/60).opacity,0);
 assert.equal(replayState(9.3).frame,0);
 assert.throws(()=>replayState(Infinity));
});
