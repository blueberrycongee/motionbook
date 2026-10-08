// One-command render:  node render.js
// Preview stills only:  node render.js --stills 0,4,9.5,14.7
// Frames are captured from headless Chromium one deterministic t at a time,
// then encoded with ffmpeg into video.mp4 and video.gif (all paths relative to this file).
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const here = (...p) => path.join(__dirname, ...p);
const FPS = 30, DURATION = 21;

(async () => {
  const stillsArg = process.argv.indexOf('--stills');
  const stills = stillsArg > 0 ? process.argv[stillsArg + 1].split(',').map(Number) : null;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.goto('file://' + here('index.html'));
  await page.waitForFunction(() => window.sceneReady === true, null, { timeout: 120000 });

  const shoot = async (t, file, opts) => {
    await page.evaluate(([t, opts]) => window.renderFrame(t, opts), [t, opts || { material: true }]);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1280, height: 720 } });
  };

  if (stills) {
    fs.mkdirSync(here('stills'), { recursive: true });
    for (const t of stills) await shoot(t, here('stills', `t${t.toFixed(2)}.png`));
    await browser.close();
    return;
  }

  const dir = here('frames');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir);
  const total = FPS * DURATION;
  for (let f = 0; f < total; f++) {
    await shoot(f / FPS, path.join(dir, String(f).padStart(4, '0') + '.png'));
    if (f % 60 === 0) process.stdout.write(`frame ${f}/${total}\n`);
  }
  // GIF pass: 15 fps, same timeline, flat paper (no grain/vignette) for a small, band-free GIF.
  const gdir = here('frames-gif');
  fs.rmSync(gdir, { recursive: true, force: true });
  fs.mkdirSync(gdir);
  for (let f = 0; f < 15 * DURATION; f++) await shoot(f / 15, path.join(gdir, String(f).padStart(4, '0') + '.png'), { material: false });
  await browser.close();

  const ff = args => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit', cwd: __dirname });
  ff(['-framerate', String(FPS), '-i', 'frames/%04d.png',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', 'video.mp4']);
  execFileSync('python3', ['gif_palette.py', 'frames-gif/palette.png'], { stdio: 'inherit', cwd: __dirname });
  ff(['-framerate', '15', '-i', 'frames-gif/%04d.png', '-i', 'frames-gif/palette.png',
    '-lavfi', '[0]scale=640:-1:flags=lanczos[s];[s][1]paletteuse=dither=none:diff_mode=rectangle',
    'video.gif']);
  console.log('done: video.mp4, video.gif');
})();
