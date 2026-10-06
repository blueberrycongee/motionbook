'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../src/motion.js');
const S = require('../src/scene.js');
const R = require('../tools/render.cjs');

test('rational source timelines preserve integer PTS without assuming rounded 30 fps', () => {
  const frames = R.timeline(10 * 1001 / 30000, 40 * 1001 / 30000, { fps: '30000/1001', timeBase: '1/30000' });
  assert.equal(frames.length, 30); assert.equal(frames[0].pts, 10010); assert.equal(frames.at(-1).pts, 39039);
  for (let n = 1; n < frames.length; n++) assert.equal(frames[n].pts - frames[n - 1].pts, 1001);
  R.validateFrames(frames);
  assert.throws(() => R.timeline(1, 1), /Invalid/);
  assert.throws(() => R.validateFrames([{ ...frames[0], time: 42 }]), /PTS\/time mismatch/);
});

test('the shared scene has deterministic offline raster pixels and declared source bounds', async () => {
  const t = M.referenceSpec.start + .5 * (M.referenceSpec.end - M.referenceSpec.start);
  const raster = () => R.sharp(Buffer.from(S.render(M.referenceAt(t)))).png().toBuffer();
  const first = await raster(), second = await raster();
  assert.deepEqual(first, second);
  const info = await R.sharp(first).metadata();
  assert.equal(info.width, M.referenceSpec.width); assert.equal(info.height, M.referenceSpec.height);
});

test('authored text is escaped before it enters the SVG scene', () => {
  const state = M.referenceAt(M.referenceSpec.start);
  state.lines[0].text = '<script>alert("test")</script> & original';
  const svg = S.render(state);
  assert.doesNotMatch(svg, /<script>/);
  assert.match(svg, /&lt;script&gt;alert\(&quot;test&quot;\)&lt;\/script&gt; &amp; original/);
});

test('final preview manifest binds the current scene, controller, assets, and output bytes', t => {
  const file = path.join(R.ROOT, 'preview/render-manifest.json');
  if (!fs.existsSync(file)) { t.skip('Preview has not been rendered yet; this is not a media pass'); return; }
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.deepEqual(manifest.core, R.coreHashes(), 'Core or assets changed after export; rebuild media');
  assert.equal(manifest.harness['tools/render.cjs'], R.sha256(path.join(R.ROOT, 'tools/render.cjs')));
  assert.deepEqual(manifest.referenceSpec, M.referenceSpec);
  for (const [name, hash] of Object.entries(manifest.outputs))
    assert.equal(R.sha256(path.join(R.ROOT, 'preview', name)), hash, name);
  assert.match(manifest.source?.sha256 || '', /^[a-f0-9]{64}$/, 'Export must be bound to the independently acquired source');
  assert.equal(manifest.source.sha256, M.referenceSpec.sourceSha256);
  R.validateFrames(manifest.frames);
  assert.equal(manifest.timing.playbackRate, 1);
  assert.equal(manifest.timing.frameCount, manifest.frames.length);
  assert.equal(manifest.timing.mp4.decodedFrameCount, manifest.frames.length);
  assert.equal(manifest.timing.gif.decodedFrameCount, manifest.frames.length);
  assert.equal(manifest.timing.mp4.audioStreams, 0); assert.equal(manifest.timing.gif.audioStreams, 0);
  assert.ok(Math.abs(manifest.timing.gifQuantization.durationErrorSeconds) <= .020001);
  assert.ok(manifest.timing.gifQuantization.maximumFrameBoundaryErrorSeconds <= .015001);
});
