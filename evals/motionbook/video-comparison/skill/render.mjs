// One-command renderer: node render.mjs   (env: DSF=2 SUB=4 SHUTTER=.5 WORKERS=4 KEEP=1)
// Frames are rendered from the pure function render(t) with headless Chromium; SUB sub-frames per output frame
// are averaged by ffmpeg (tmix) to give real motion blur (SHUTTER = fraction of the frame interval, .5 = 180 degrees). Then H.264 mp4 + GIF are encoded.
import { createRequire } from 'module';
import path from 'path'; import url from 'url'; import fs from 'fs'; import { execFileSync } from 'child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(url.fileURLToPath(import.meta.url));
const FPS = 30, DUR = 20, FRAMES = FPS * DUR;
const DSF = Number(process.env.DSF || 2), SUB = Number(process.env.SUB || 4), SHUTTER = Number(process.env.SHUTTER || .5), WORKERS = Number(process.env.WORKERS || 4);
const dir = path.join(here, 'build/frames');
fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });

const total = FRAMES * SUB;
const timeOf = i => { const k = Math.floor(i / SUB), j = i % SUB; return k / FPS + ((j + .5) / SUB - .5) * SHUTTER / FPS; };
const browser = await chromium.launch();
const t0 = Date.now();
let next = 0, done = 0;
async function worker() {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: DSF });
  page.on('pageerror', e => { console.error('page error:', e.message); process.exit(1); });
  await page.goto('file://' + path.join(here, 'src/index.html'));
  await page.evaluate(() => document.fonts.ready);
  for (;;) {
    const i = next++; if (i >= total) break;
    await page.evaluate(t => render(t), timeOf(i));
    await page.screenshot({ path: path.join(dir, String(i).padStart(5, '0') + '.png') });
    if (++done % 120 === 0) console.log(`${done}/${total} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
}
await Promise.all(Array.from({ length: WORKERS }, worker));
await browser.close();

const ff = (...a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: 'inherit' });
const mp4 = path.join(here, 'video.mp4'), gif = path.join(here, 'video.gif');
// average SUB sub-frames per output frame, keep the last of each group (window covers exactly one frame)
ff('-framerate', String(FPS * SUB), '-i', path.join(dir, '%05d.png'),
  '-vf', `scale=1280:720:flags=lanczos,tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB)`,
  '-r', String(FPS), '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4);
ff('-i', mp4, '-vf', 'fps=15,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=200:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle', '-loop', '0', gif);
if (!process.env.KEEP) fs.rmSync(dir, { recursive: true, force: true });
console.log('done in', ((Date.now() - t0) / 1000).toFixed(0), 's');
