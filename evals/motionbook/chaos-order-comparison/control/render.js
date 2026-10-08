// Deterministic frame renderer: node render.js [--frames 0,150,300] [--workers 4] [--no-encode]
// Renders index.html at t = frame / 30 for every frame, then encodes video.mp4 and video.gif.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const FPS = 30, W = 1280, H = 720;
const here = __dirname;
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const only = opt('--frames', null);
const workers = parseInt(opt('--workers', '4'), 10);
const outDir = path.join(here, only ? 'preview' : 'frames');

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const url = 'file://' + path.join(here, 'index.html');
  const pages = [];
  for (let i = 0; i < workers; i++) {
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    page.on('pageerror', (e) => { console.error(e); process.exit(1); });
    await page.goto(url);
    await page.evaluate(() => window.ready);
    pages.push(page);
  }
  const duration = await pages[0].evaluate(() => window.DURATION);
  const total = Math.round(duration * FPS);
  const list = only ? only.split(',').map(Number) : [...Array(total).keys()];
  let next = 0, done = 0;
  const t0 = Date.now();
  await Promise.all(pages.map(async (page) => {
    while (next < list.length) {
      const f = list[next++];
      const data = await page.evaluate((f) => {
        window.renderFrame(f / 30, f);
        return document.getElementById('c').toDataURL('image/png');
      }, f);
      fs.writeFileSync(path.join(outDir, `f${String(f).padStart(4, '0')}.png`), Buffer.from(data.split(',')[1], 'base64'));
      if (++done % 60 === 0) console.log(`${done}/${list.length} frames  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
  }));
  await browser.close();
  if (only || args.includes('--no-encode')) return;

  const ff = (a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: 'inherit', cwd: here });
  ff(['-framerate', String(FPS), '-i', 'frames/f%04d.png', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', 'video.mp4']);
  ff(['-i', 'video.mp4', '-vf', 'fps=15,scale=640:-1:flags=lanczos,hqdn3d=3:3:8:8,palettegen=max_colors=160:stats_mode=full', 'palette.png']);
  ff(['-i', 'video.mp4', '-i', 'palette.png', '-lavfi',
    'fps=15,scale=640:-1:flags=lanczos,hqdn3d=3:3:8:8[v];[v][1:v]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle', 'video.gif']);
  fs.unlinkSync(path.join(here, 'palette.png'));
  console.log('wrote video.mp4 and video.gif');
})();
