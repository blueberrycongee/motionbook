import test from 'node:test';
import assert from 'node:assert/strict';
import { renderFrame, stateAt } from './scene.mjs';

test('normal label changes at activation and followed state persists', () => {
  assert.equal(stateAt(.49999).label, 'Follow studio');
  for (const t of [.5, .85, 1.4, 2.1, 4.5, 6]) {
    assert.equal(stateAt(t).label, 'Following');
    assert.equal(stateAt(t).activationCount, 1);
  }
});
test('duplicate activation is idempotent and never restarts the flourish', () => {
  for (const t of [.5, .84, .85, .86, 1.39999]) {
    const actual = stateAt(t, 'interrupted');
    assert.equal(actual.activationCount, 1);
    assert.equal(actual.activatedAt, .5);
    assert.equal(actual.bellAngle, stateAt(t, 'normal').bellAngle);
    assert.equal(renderFrame(t, {scenario:'interrupted'}), renderFrame(t, {scenario:'normal'}));
  }
});
test('undo cancels pending visual feedback, subsequent activation starts cleanly', () => {
  for (const t of [1.4, 1.5, 2, 2.09999]) {
    const s = stateAt(t, 'interrupted');
    assert.equal(s.followed, false);
    assert.equal(s.label, 'Follow studio');
    assert.equal(s.decorative, false);
    assert.equal(s.bellAngle, 0);
    assert.equal(s.activatedAt, null);
    assert.match(renderFrame(t,{scenario:'interrupted'}), /id="confirmation-particles" aria-hidden="true"><\/g>/);
  }
  const s = stateAt(2.1, 'interrupted');
  assert.equal(s.followed, true);
  assert.equal(s.activatedAt, 2.1);
  assert.equal(s.activationCount, 2);
  assert.equal(s.age, 0);
});
test('both scenarios fully settle with identical frames through the ending', () => {
  for (const scenario of ['normal', 'interrupted']) {
    assert.equal(stateAt(4.5, scenario).decorative, false);
    assert.equal(stateAt(4.5, scenario).bellAngle, 0);
    assert.equal(renderFrame(4.5, {scenario}), renderFrame(6, {scenario}));
  }
  assert.equal(renderFrame(2.15), renderFrame(6));
});
test('reduced motion keeps all business states with no oscillation or particles', () => {
  for (const scenario of ['normal','interrupted']) {
    for (const t of [0,.2,.499,.5,.7,.85,1.3999,1.4,2.0999,2.1,2.4,4.5,6]) {
      const plain = stateAt(t,scenario), reduced = stateAt(t,scenario,true);
      for (const prop of ['followed','label','activatedAt','activationCount']) assert.equal(reduced[prop],plain[prop]);
      assert.equal(reduced.bellAngle,0);
      assert.equal(reduced.decorative,false);
      assert.equal(reduced.cue,0);
      assert.match(renderFrame(t,{scenario,reducedMotion:true}),/id="confirmation-particles" aria-hidden="true"><\/g>/);
    }
  }
});
test('renderer is deterministic, pure in call order, finite and self-contained', () => {
  for (const scenario of ['normal','interrupted']) {
    for (const reducedMotion of [false,true]) {
      for (let i=0; i<=600; i++) {
        const t=i/100, options={scenario,reducedMotion};
        const svg=renderFrame(t,options);
        renderFrame(6-t,options);
        assert.equal(renderFrame(t,options),svg);
        assert.doesNotMatch(svg,/NaN|Infinity|<image\b|<script\b|<foreignObject\b|<animate\b|<set\b|href=|url\(https?:/);
        assert.match(svg,/viewBox="0 0 800 600"/);
      }
    }
  }
});
test('defaults and output dimensions preserve the design coordinate system', () => {
  assert.equal(renderFrame(),renderFrame(0,{width:800,height:600,scenario:'normal',reducedMotion:false}));
  assert.match(renderFrame(1,{width:1200,height:900}),/width="1200" height="900" viewBox="0 0 800 600"/);
  assert.throws(()=>renderFrame(NaN),/finite/);
  assert.throws(()=>renderFrame(1,{width:0}),/positive/);
});
