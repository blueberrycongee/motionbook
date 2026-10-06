'use strict';
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process'), crypto = require('node:crypto');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const M = require('./src/motion.js'), Scene = require('./src/scene.js');
const out = path.join(__dirname, 'preview');
fs.mkdirSync(out, { recursive: true });
GlobalFonts.registerFromPath(path.join(__dirname, 'assets/Inter-Regular.ttf'), 'Genie Sans');
GlobalFonts.registerFromPath(path.join(__dirname, 'assets/Inter-Medium.ttf'), 'Genie Sans');
const renderer = Scene.createRenderer(createCanvas), c = createCanvas(M.W, M.H), ctx = c.getContext('2d');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const fps = 60;
const slow = process.argv.includes('--slow');
const spec = M.previewSpec(slow);
const name = slow ? 'slow-motion' : 'loop';
const sources = ['src/calibration-data.js', 'src/calibrated.js', 'src/motion.js', 'src/scene.js'].map(p => ({ path: p, sha256: sha(fs.readFileSync(path.join(__dirname, p))) }));
(async () => {
  for (const [name, p] of [['open', 0], ['bend', .30], ['flow', .57], ['dock', 1]]) {
    renderer.draw(ctx, p); fs.writeFileSync(path.join(out, name + '.png'), await c.encode('png'));
  }
  if (process.argv.includes('--stills')) return;
  const video = path.join(out, name + '.mp4');
  const ff = cp.spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${M.W}x${M.H}`, '-r', String(fps), '-i', 'pipe:0', '-an', '-c:v', 'libx264', '-threads', '2', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', video], { stdio: ['pipe', 'inherit', 'inherit'] });
  const ended = new Promise((resolve, reject) => { ff.once('error', reject); ff.once('exit', code => code ? reject(new Error('ffmpeg exited ' + code)) : resolve()); });
  const bindings = [];
  for (let frame = 0; frame < spec.loop * fps; frame++) {
    const t = frame / fps, pose = M.timeline(t, slow); renderer.draw(ctx, pose.progress, { label: pose.label, direction: pose.direction });
    const pixels = ctx.getImageData(0, 0, M.W, M.H).data;
    const bytes = Buffer.from(pixels.buffer, pixels.byteOffset, pixels.byteLength);
    bindings.push({ frame, seconds: t, progress: pose.progress, rgba_sha256: sha(bytes) });
    if (!ff.stdin.write(bytes)) await new Promise(resolve => ff.stdin.once('drain', resolve));
    if (frame % 60 === 0) console.log(`Rendered ${frame}/${spec.loop * fps}`);
  }
  ff.stdin.end(); await ended;
  const palette = path.join(out, 'palette.png');
  cp.execFileSync('ffmpeg', ['-y', '-v', 'error', '-threads', '2', '-filter_threads', '1', '-i', video, '-vf', 'fps=50,scale=864:-1:flags=lanczos,palettegen=stats_mode=diff', '-frames:v', '1', palette]);
  cp.execFileSync('ffmpeg', ['-y', '-v', 'error', '-threads', '2', '-filter_complex_threads', '1', '-i', video, '-i', palette, '-lavfi', 'fps=50,scale=864:-1:flags=lanczos[v];[v][1:v]paletteuse=dither=bayer:bayer_scale=3', '-loop', '0', path.join(out, name + '.gif')]);
  fs.unlinkSync(palette);
  for (const source of sources) if (source.sha256 !== sha(fs.readFileSync(path.join(__dirname, source.path)))) throw new Error('Source changed during render');
  const metadata = { renderer: '@napi-rs/canvas 0.1.100; the same scene and geometry as the browser, not a screen recording', width: M.W, height: M.H, fps, frames: bindings.length, seconds: spec.loop, transition_seconds: spec.duration, restore_seconds: spec.restoreDuration, playback_speed: spec.speed, timing: "same advanceProgress() clock as browser runtime", sources, loop_seam_identical: bindings[0].rgba_sha256 === bindings.at(-1).rgba_sha256, mp4_sha256: sha(fs.readFileSync(video)), gif_sha256: sha(fs.readFileSync(path.join(out, name + '.gif'))) };
  fs.writeFileSync(path.join(out, slow ? 'slow-motion.json' : 'preview.json'), JSON.stringify(metadata, null, 2) + '\n');
  fs.writeFileSync(path.join(out, slow ? 'slow-motion-bindings.json' : 'frame-bindings.json'), JSON.stringify(bindings, null, 2) + '\n');
  console.log('Preview complete');
})().catch(error => { console.error(error); process.exitCode = 1; });
