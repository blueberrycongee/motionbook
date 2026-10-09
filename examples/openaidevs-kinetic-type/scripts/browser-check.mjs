import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { serve } from './server.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const output = new URL('../preview/', import.meta.url);
await mkdir(output, { recursive: true });
const { server, url } = await serve();
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH || undefined });
const checks = [], errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url);
  await page.waitForFunction(() => window.motionStudy?.ready);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const paused = await page.evaluate(() => motionStudy.state().time);
  await page.waitForTimeout(160);
  assert.equal(await page.evaluate(() => motionStudy.state().time), paused);
  checks.push('real control pauses the RAF timeline');
  await page.locator('#time').focus();
  await page.keyboard.press('End');
  assert.equal(await page.evaluate(() => motionStudy.state().time), 14);
  await page.getByRole('button', { name: 'Replay', exact: true }).first().click();
  await page.waitForTimeout(160);
  assert.ok(await page.evaluate(() => motionStudy.state().playing && motionStudy.state().time < 1));
  checks.push('keyboard seek reaches the end; Replay restarts');
  await page.evaluate(() => { for (let i = 0; i < 20; i++) motionStudy.replay(); });
  await page.waitForTimeout(140);
  const replayTime = await page.evaluate(() => motionStudy.state().time);
  assert.ok(replayTime > .08 && replayTime < .8);
  checks.push('rapid replay remains one elapsed-time clock');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => motionStudy.state().reducedMotion);
  assert.equal(await page.evaluate(() => motionStudy.state().playing), false);
  assert.equal(await page.locator('#play').isDisabled(), true);
  await page.screenshot({ path: new URL('reduced-motion.png', output).pathname });
  checks.push('emulated reduced-motion preference cancels playback and shows static CTA');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => !motionStudy.state().reducedMotion);
  assert.equal(await page.evaluate(() => motionStudy.state().playing), false);
  await page.setViewportSize({ width: 390, height: 700 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  checks.push('390px viewport has no horizontal overflow');
  const stage = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  stage.on('pageerror', error => errors.push(error.message));
  await stage.goto(url + '/?capture');
  await stage.waitForFunction(() => window.motionStudy?.ready);
  const ink = await stage.evaluate(() => {
    const ctx = document.querySelector('canvas').getContext('2d');
    motionStudy.seek(1.39);
    const pixels = ctx.getImageData(350, 400, 400, 130).data;
    let white = 0;
    for (let i = 0; i < pixels.length; i += 4) if (pixels[i] > 240 && pixels[i + 1] > 240 && pixels[i + 2] > 240) white++;
    return white;
  });
  assert.ok(ink > 1500, `Previously settled words must remain visible; found ${ink} white pixels`);
  checks.push('settled words remain visible while the next word reveals');
  const samples = [['opening', .583], ['orange', 1.39], ['return', 1.82], ['standard', 3.2], ['purple', 5.10], ['ultrafast', 6.2], ['cta-reveal', 8.9], ['cta', 10], ['fade', 13.6], ['black', 13.9]];
  for (const [name, time] of samples) {
    await stage.evaluate(t => motionStudy.seek(t), time);
    await stage.screenshot({ path: new URL(`${name}.png`, output).pathname });
  }
  const ending = await stage.evaluate(() => {
    const c = document.querySelector('canvas');
    const rgba = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    for (let i = 0; i < rgba.length; i += 4) if (rgba[i] || rgba[i + 1] || rgba[i + 2]) return false;
    return true;
  });
  assert.equal(ending, true);
  assert.equal(await stage.evaluate(() => document.fonts.check(motionStudy.config.font)), true);
  checks.push('local font loaded; final hold is genuinely black; ten browser keyframes captured');
  assert.deepEqual(errors, []);
  await mkdir(new URL('../validation/', import.meta.url), { recursive: true });
  await writeFile(new URL('../validation/browser.json', import.meta.url), JSON.stringify({ passed: true, browser: await browser.version(), checks, pageErrors: errors, referencePixelsLocallyAvailable: false, visualAcceptance: 'pending cloud comparison' }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, checks }, null, 2));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
