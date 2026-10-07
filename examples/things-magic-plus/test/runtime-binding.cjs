'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// A maintenance record preserves historical render provenance instead of claiming
// that old GIF/MP4 bytes were newly rendered from an updated input adapter.
module.exports = function assertRuntimeBinding(R, manifest, motion, scene) {
  if (!manifest.runtimeMaintenance) {
    assert.deepEqual(manifest.core, R.coreHashes());
    return;
  }
  const binding = manifest.runtimeMaintenance;
  assert.equal(binding.mediaRerendered, false);
  assert.equal(binding.evidence, '../validation/runtime-maintenance.json');
  const file = path.join(R.ROOT, 'preview', binding.evidence);
  assert.equal(R.sha256(file), binding.evidenceSha256);
  const evidence = JSON.parse(fs.readFileSync(file));
  assert.equal(evidence.schemaVersion, 1);
  assert.equal(evidence.mediaRerendered, false);
  assert.deepEqual(evidence.renderedCore, manifest.core, 'historical rendering provenance is preserved');
  assert.deepEqual(evidence.currentCore, R.coreHashes(), 'current runtime must match the reviewed revision');
  const changed = Object.keys({...evidence.renderedCore, ...evidence.currentCore}).sort()
    .filter(file => evidence.renderedCore[file] !== evidence.currentCore[file])
    .map(file => ({file, renderedSha256:evidence.renderedCore[file], currentSha256:evidence.currentCore[file]}));
  assert.deepEqual(evidence.changedCore, changed);
  assert.deepEqual(evidence.preservedOutputs, manifest.outputs);
  for (const [name, hash] of Object.entries(evidence.preservedOutputs)) {
    assert.equal(R.sha256(path.join(R.ROOT, 'preview', name)), hash, name + ' bytes remain unchanged');
  }
  assert.deepEqual(evidence.referenceFrames.map(frame => frame.time), manifest.frames.map(frame => frame.time));
  assert.equal(evidence.verification.referenceFramesCompared, manifest.frames.length);
  for (const frame of evidence.referenceFrames) {
    const svg = scene.render(motion.referenceAt(frame.time), {device:false});
    assert.equal(crypto.createHash('sha256').update(svg).digest('hex'), frame.sha256,
      'reference SVG changed at source time ' + frame.time);
  }
};
