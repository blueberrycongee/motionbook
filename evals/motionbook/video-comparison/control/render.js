// Deterministic frame renderer: loads index.html, calls render(t) for every frame, screenshots it.
// usage: node render.js                 -> all frames into ./frames
//        node render.js --times 1,2.5   -> preview PNGs into ./preview
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const FPS = 30, WORKERS = 4;
const args = process.argv.slice(2);
const ti = args.indexOf('--times');
(async () => {
  const browser = await chromium.launch();
  const url = 'file://' + path.join(__dirname, 'index.html');
  const mk = async () => {
    const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })).newPage();
    page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exitCode = 1; });
    await page.goto(url);
    await page.waitForFunction('window.READY === true');
    return page;
  };
  if (ti >= 0) {
    const out = path.join(__dirname, 'preview'); fs.mkdirSync(out, { recursive: true });
    const page = await mk();
    for (const s of args[ti + 1].split(',')) {
      await page.evaluate(t => window.render(t), parseFloat(s));
      await page.screenshot({ path: path.join(out, `t_${parseFloat(s).toFixed(2)}.png`) });
    }
    await browser.close(); return;
  }
  const probe = await mk();
  const dur = await probe.evaluate('window.DURATION');
  const N = Math.round(dur * FPS);
  const out = path.join(__dirname, 'frames');
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out);
  const pages = [probe]; for (let i = 1; i < WORKERS; i++) pages.push(await mk());
  await Promise.all(pages.map(async (page, w) => {
    for (let f = w; f < N; f += WORKERS) {
      await page.evaluate(t => window.render(t), f / FPS);
      await page.screenshot({ path: path.join(out, String(f).padStart(5, '0') + '.png') });
    }
  }));
  console.log(`rendered ${N} frames (${dur}s @ ${FPS}fps)`);
  await browser.close();
})();
