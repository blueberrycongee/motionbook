import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlayback } from '../src/timeline.mjs';

test('pause and resume preserve elapsed animation time', () => {
  const player = createPlayback(14);
  player.play(1000);
  assert.equal(player.pause(2200).time, 1.2);
  assert.equal(player.sample(20000).time, 1.2);
  player.play(30000);
  assert.equal(player.sample(30300).time, 1.5);
});

test('rapid replay replaces the epoch and repeated play does not reset it', () => {
  const player = createPlayback(14);
  player.replay(1000);
  player.replay(1500);
  player.replay(1800);
  player.play(1850);
  assert.equal(player.sample(2000).time, .2);
});

test('seek clamps and end stops playback; play after end restarts', () => {
  const player = createPlayback(14);
  player.play(0);
  assert.equal(player.seek(-2, 500).time, 0);
  assert.deepEqual(player.seek(20, 600), { time: 14, playing: false, reducedMotion: false });
  player.play(900);
  assert.equal(player.sample(1000).time, .1);
  assert.throws(() => player.seek(Infinity, 1000), /finite/);
});

test('preference changes cancel playback and never automatically resume it', () => {
  const player = createPlayback(14);
  player.play(0);
  player.setReducedMotion(true, 1500);
  assert.equal(player.play(2000).playing, false);
  assert.equal(player.replay(3000).playing, false);
  player.setReducedMotion(false, 4000);
  assert.equal(player.sample(5000).playing, false);
  assert.equal(player.play(6000).playing, true);
});
