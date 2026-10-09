import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { serve } from './server.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const output = new URL('../.capture/', import.meta.url);
await mkdir(output, { recursive: true });
const { server, url } = await serve();
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH || undefined });
try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    recordVideo: { dir: output.pathname, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url + '/?capture');
  await page.waitForFunction(() => window.motionStudy?.ready);
  await page.evaluate(() => {
    const marker = document.createElement('div');
    marker.id = 'recording-sync';
    marker.style.cssText = 'position:fixed;left:0;top:0;width:16px;height:16px;background:#f0f';
    document.body.append(marker);
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => { document.querySelector('#recording-sync').remove(); motionStudy.replay(); });
  await page.waitForFunction(() => motionStudy.state().time === 14 && !motionStudy.state().playing, null, { timeout: 20000 });
  await page.waitForTimeout(250);
  const runtime = await page.evaluate(() => ({ frameTimes: motionStudy.frameTimes, finalState: motionStudy.state() }));
  if (errors.length) throw Error(errors.join('\n'));
  const video = page.video();
  await context.close();
  await video.saveAs(new URL('live.webm', output).pathname);
  await writeFile(new URL('runtime.json', output), JSON.stringify({ kind: 'continuous real-time browser video', viewport: [1280, 720], browser: await browser.version(), ...runtime, pageErrors: errors }, null, 2) + '\n');
  console.log(`Recorded live browser playback to ${output.pathname}live.webm (${runtime.frameTimes.length} RAF samples)`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
