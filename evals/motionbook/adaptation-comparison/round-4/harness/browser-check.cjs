#!/usr/bin/env node
'use strict';
// Independent common acceptance runner. Inputs: briefs + submissions only.
// No application code is changed. All interaction uses browser input, except
// the explicitly labelled synthetic IME event test and DOM observations.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.ARTIFACT_DIR || path.join(ROOT, 'evidence'));
fs.mkdirSync(OUT, { recursive: true });
const report = {
  startedAt: new Date().toISOString(),
  methodology: 'Common behavioral checks; no universal grade. Independent cases reload. Actual browser input except explicitly synthetic IME events. Screenshots and continuous per-configuration Playwright video are evidence, not a visual quality score.',
  limits: ['Synthetic IME events do not validate a native OS IME.', 'Computed motion checks do not establish subjective motion quality.', 'Tab visibility checks and focus screenshots are not a complete accessibility audit.'],
  environment: { node: process.version, platform: process.platform, arch: process.arch, playwright: require('playwright/package.json').version, ci: Boolean(process.env.CI), githubSHA: process.env.GITHUB_SHA || null },
  studies: [], fatalErrors: []
};
const adapters = {
  A: { kind: 'composer', toggle: '#toggle', user: '.message.user', reply: '.message.assistant' },
  C: { kind: 'composer', toggle: '#toggle', user: '.user-message', reply: '.exchange > .message' },
  E: { kind: 'composer', toggle: '#expand', user: '.message.user', reply: '.message.assistant' },
  B: { kind: 'tags', panel: '#popover', chips: '#chips', option: '.option' },
  D: { kind: 'tags', panel: '#panel', chips: '#selected', option: '.row' },
  F: { kind: 'tags', panel: '#panel', chips: '#chips', option: '.row' }
};
const clean = s => s.replace(/[^a-z0-9-]+/gi, '-');
const save = () => fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(report, null, 2));
const server = http.createServer((req, res) => {
  let file;
  try { file = path.resolve(ROOT, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname)); }
  catch { res.writeHead(400).end(); return; }
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream');
    res.end(data);
  });
});
let browser;
async function main() {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
  report.environment.browser = await browser.version();
  for (const id of ['A', 'B', 'C', 'D', 'E', 'F']) {
    const source = path.join(ROOT, 'submissions', id, 'index.html');
    const study = { id, kind: adapters[id].kind, source: path.relative(ROOT, source), configurations: [] };
    report.studies.push(study);
    if (!fs.existsSync(source)) { study.error = 'Missing index.html'; save(); continue; }
    study.briefSHA256 = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, 'briefs', `${study.kind === 'composer' ? 'composer' : 'tags'}.md`))).digest('hex');
    study.sourceSHA256 = crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');
    for (const width of [960, 390]) for (const reducedMotion of ['no-preference', 'reduce']) {
      const name = `${id}-${width}-${reducedMotion}`;
      const dir = path.join(OUT, name); fs.mkdirSync(dir, { recursive: true });
      const result = { viewport: { width, height: 720 }, reducedMotion, checks: [], screenshots: [], consoleErrors: [], pageErrors: [], externalRequests: [] };
      study.configurations.push(result);
      let context, page, configurationDeadline; const videos = [];
      try {
        context = await browser.newContext({ viewport: result.viewport, reducedMotion, recordVideo: { dir, size: result.viewport } });
        configurationDeadline = setTimeout(() => { result.configurationError = 'Configuration deadline exceeded'; context.close().catch(() => {}); }, Number(process.env.CONFIG_TIMEOUT_MS) || 90000);
        await context.route('**/*', route => {
          if (new URL(route.request().url()).origin !== origin) { result.externalRequests.push(route.request().url()); return route.abort(); }
          return route.continue();
        });
        const newPage = async () => {
          const p = await context.newPage(); p.setDefaultTimeout(3500); p.setDefaultNavigationTimeout(10000);
          if (p.video()) videos.push(p.video());
          p.on('pageerror', e => result.pageErrors.push(e.message));
          p.on('console', m => { if (m.type() === 'error') result.consoleErrors.push(m.text()); });
          return p;
        };
        page = await newPage();
        let serial = 0;
        const shot = async label => {
          const filename = `${String(++serial).padStart(2, '0')}-${clean(label)}.png`;
          await page.screenshot({ path: path.join(dir, filename), fullPage: false, timeout: 5000 });
          result.screenshots.push(path.relative(OUT, path.join(dir, filename)));
        };
        const check = async (label, run) => {
          const started = Date.now(); let timedOut = false; const currentPage = page;
          // Close the timed-out page to cancel pending work; never abandon a live Promise.race.
          const deadline = setTimeout(() => { timedOut = true; currentPage.close().catch(() => {}); }, 25000);
          try { const observations = await run(); assert(!timedOut, 'Whole-case 25-second deadline exceeded'); result.checks.push({ name: label, status: 'passed', elapsedMs: Date.now() - started, ...(observations ? { observations } : {}) }); }
          catch (e) {
            result.checks.push({ name: label, status: 'failed', elapsedMs: Date.now() - started, error: timedOut ? 'Whole-case 25-second deadline exceeded: ' + e.message : e.message, stack: e.stack });
            try { await shot(`failure-${label}`); } catch (s) { result.checks.at(-1).screenshotError = s.message; }
          }
          finally { clearTimeout(deadline); if (timedOut) page = await newPage(); }
          save();
        };
        const reset = async () => { await page.goto(`${origin}/submissions/${id}/index.html`); await page.waitForTimeout(400); };
        const focusVisible = async (requireIndicator = false) => {
          const state = await page.evaluate(() => {
            const e = document.activeElement;
            const visible = n => { const r = n.getBoundingClientRect(), c = getComputedStyle(n); return !!(r.width && r.height) && c.visibility !== 'hidden' && c.display !== 'none' && Number(c.opacity) > 0 && !n.closest('[hidden],[inert],[aria-hidden="true"]'); };
            const label = e.closest('label');
            const painted = visible(e) ? e : label && visible(label) ? label : null;
            const candidates = [e, ...(label ? [label, ...label.querySelectorAll('*')] : [])];
            const indicator = candidates.filter(visible).some(n => { const c = getComputedStyle(n); return (parseFloat(c.outlineWidth) > 0 && c.outlineStyle !== 'none'); });
            return { tag: e.tagName, id: e.id, text: e.getAttribute('aria-label') || e.textContent.slice(0, 60), visible: Boolean(painted), visibleAssociatedLabel: painted === label && !!label, documentFocus: e === document.body || e === document.documentElement, indicator };
          });
          assert(state.visible || state.documentFocus, `Focus stranded on hidden control: ${JSON.stringify(state)}`);
          if (requireIndicator) assert(!state.documentFocus && state.indicator, `No visible outline focus indicator: ${JSON.stringify(state)}`);
          return state;
        };
        const layout = async () => {
          const data = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
          assert(data.document <= data.viewport + 1, `Horizontal overflow: ${JSON.stringify(data)}`); return data;
        };
        const motion = async () => {
          if (reducedMotion !== 'reduce') return { applicable: false };
          const moving = await page.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.getClientRects().length).flatMap(e => {
            const c = getComputedStyle(e), values = [c.animationDuration, c.transitionDuration].flatMap(x => x.split(',').map(y => parseFloat(y) * (y.trim().endsWith('ms') ? 1 : 1000)));
            return Math.max(...values) > 50 ? [{ tag: e.tagName, id: e.id, durationMs: Math.max(...values) }] : [];
          }));
          assert.equal(moving.length, 0, `Reduced-motion visible durations exceed 50ms: ${JSON.stringify(moving)}`); return { visibleDurationsAbove50ms: moving };
        };
        const a = adapters[id];
        await check('initial layout and screenshot', async () => { await reset(); const data = await layout(); await shot('initial'); return data; });
        if (a.kind === 'composer') {
          const draft = () => page.locator('#draft');
          const toggle = () => page.locator(a.toggle);
          const messages = () => page.locator(a.user);
          const expanded = async expected => assert.equal(await toggle().getAttribute('aria-expanded'), String(expected));
          const type = async text => { await draft().click(); await draft().pressSequentially(text); };
          await check('fixture document', async () => { await reset(); assert.equal(await page.getByRole('heading', { name: 'Field notes', exact: true }).count(), 1); assert(await page.getByText('A quiet place to collect what matters.', { exact: true }).isVisible()); });
          await check('typing expands; collapse Escape outside and reopen preserve draft', async () => {
            await reset(); const initial = await page.locator('#composer').boundingBox(); await type('A draft to preserve'); await expanded(true); await page.waitForTimeout(400);
            assert((await page.locator('#composer').boundingBox()).height > initial.height + 5, 'Typing did not visibly expand composer'); await shot('draft-expanded');
            const expandedHeight = (await page.locator('#composer').boundingBox()).height; await toggle().click(); await expanded(false); await page.waitForTimeout(400); assert((await page.locator('#composer').boundingBox()).height < expandedHeight - 5, 'Explicit collapse did not reduce height'); assert.equal(await draft().inputValue(), 'A draft to preserve');
            await toggle().click(); await expanded(true); assert.equal(await draft().inputValue(), 'A draft to preserve');
            await draft().press('Escape'); await expanded(false); assert.equal(await draft().inputValue(), 'A draft to preserve'); await focusVisible(); await shot('escape-focus');
            await toggle().click(); await page.getByRole('heading', { name: 'Field notes', exact: true }).click(); await expanded(false); assert.equal(await draft().inputValue(), 'A draft to preserve');
            await draft().click(); await expanded(true); assert.equal(await draft().inputValue(), 'A draft to preserve'); await layout(); await motion();
          });
          await check('Shift Enter inserts newline without sending; Enter sends exactly once', async () => {
            await reset(); await type('First line'); await draft().press('Shift+Enter'); await draft().pressSequentially('Second line');
            assert.equal(await draft().inputValue(), 'First line\nSecond line'); assert.equal(await messages().count(), 0); await shot('multiline');
            await draft().press('Enter'); await page.waitForTimeout(650); assert.equal(await messages().count(), 1); assert((await messages().innerText()).includes('First line\nSecond line')); assert(await messages().isVisible());
            assert.equal(await draft().inputValue(), ''); assert.equal(await page.locator(a.reply).count(), 1); assert(await page.locator(a.reply).isVisible());
            assert.match(await page.getByRole('log').innerText(), /local|simulat/i); await shot('sent-local-reply');
            await draft().press('Enter'); await page.waitForTimeout(400); assert.equal(await messages().count(), 1, 'Empty Enter created another message');
          });
          await check('click send exactly once; whitespace empty send does nothing', async () => {
            await reset(); await type('Clicked message'); await page.getByRole('button', { name: 'Send message', exact: true }).click(); await page.waitForTimeout(650); assert.equal(await messages().count(), 1);
            await type('   '); await draft().press('Enter'); const send = page.getByRole('button', { name: 'Send message', exact: true }); const nativeDisabled = await send.evaluate(e => e.disabled); if (!nativeDisabled) { const box = await send.boundingBox(); assert(box, 'Empty-send control has no visible click target'); await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); }
            await page.waitForTimeout(400); assert.equal(await messages().count(), 1); return { emptyButtonNativeDisabled: nativeDisabled, emptyClickAttempted: !nativeDisabled, emptyButtonAriaDisabled: await send.getAttribute('aria-disabled') };
          });
          await check('synthetic IME composition suppresses Enter; commit then Enter sends', async () => {
            await reset(); await type('入力');
            await draft().dispatchEvent('compositionstart', { data: '' });
            await draft().dispatchEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 229, isComposing: true, bubbles: true });
            await page.waitForTimeout(400); assert.equal(await messages().count(), 0); assert.equal(await draft().inputValue(), '入力');
            await draft().dispatchEvent('compositionend', { data: '入力' }); await draft().press('Enter'); await page.waitForTimeout(400); assert.equal(await messages().count(), 1);
            return { inputMethod: 'Synthetic DOM composition and key events; not native IME verification' };
          });
          await check('keyboard expand collapse and visible focus traversal', async () => {
            await reset(); await toggle().focus(); await toggle().press('Enter'); await expanded(true); await draft().press('Escape'); await expanded(false); await focusVisible(true); await shot('keyboard-focus');
            const states = []; for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); states.push(await focusVisible()); } return states;
          });
        } else {
          const trigger = () => page.getByRole('button', { name: 'Labels', exact: true });
          const search = () => page.getByRole('textbox', { name: 'Search labels', exact: true });
          const nameInput = () => page.getByRole('textbox', { name: 'Label name', exact: true });
          const offer = () => page.getByRole('button', { name: /^Create / });
          const panel = () => page.locator(a.panel);
          const chips = () => page.locator(a.chips);
          const outside = () => id === 'F' ? page.locator('.caption') : page.getByRole('heading').first();
          const open = async () => { await trigger().click(); assert(await search().isVisible()); };
          const searchFor = async query => { await search().fill(''); await search().pressSequentially(query); };
          const createView = async query => { await searchFor(query); await offer().click(); assert(await nameInput().isVisible()); };
          await check('open search and initial labels', async () => {
            await reset(); await open(); for (const label of ['Design', 'Research', 'Personal']) assert(await panel().locator('#rows').getByText(label, { exact: true }).isVisible());
            await searchFor('Res'); assert(await panel().locator('#rows').getByText('Research', { exact: true }).isVisible()); assert.equal(await panel().locator('#rows').getByText('Design', { exact: true }).count(), 0); await shot('filtered'); await layout(); await motion();
          });
          await check('selection persists after Escape and reopening', async () => {
            await reset(); await open(); await panel().locator('#rows').getByText('Personal', { exact: true }).click(); await search().press('Escape'); assert(!(await panel().isVisible())); assert(await trigger().evaluate(e => e === document.activeElement));
            assert.equal(await chips().getByText('Personal', { exact: true }).count(), 1); assert(await chips().getByText('Personal', { exact: true }).isVisible()); await shot('selected-closed'); await open();
            const selected = panel().locator(a.option).filter({ has: page.getByText('Personal', { exact: true }) });
            if (await selected.locator('input[type=checkbox]').count()) assert(await selected.locator('input').isChecked()); else assert.equal(await selected.getAttribute('aria-pressed'), 'true');
            await shot('selected-reopened');
          });
          await check('nested Back and Escape retain query without creating', async () => {
            await reset(); await open(); await createView('Quiet draft'); await nameInput().fill('Edited draft'); await shot('nested-create');
            await page.getByRole('button', { name: 'Back', exact: true }).first().click(); assert.equal(await search().inputValue(), 'Quiet draft'); assert.equal(await chips().getByText('Edited draft', { exact: true }).count(), 0);
            await offer().click(); await nameInput().press('Escape'); assert(await search().isVisible()); assert.equal(await search().inputValue(), 'Quiet draft'); assert.equal(await chips().getByText('Quiet draft', { exact: true }).count(), 0);
            await search().press('Escape'); assert(!(await panel().isVisible())); assert(await trigger().evaluate(e => e === document.activeElement)); await shot('nested-escaped-focus');
            await page.waitForTimeout(400); await open(); for (const aborted of ['Edited draft', 'Quiet draft']) { await searchFor(aborted); assert.equal(await panel().locator('#rows').getByText(aborted, { exact: true }).count(), 0, 'Back/Escape created an unselected label'); assert(await offer().isVisible()); }
          });
          await check('editable name color Create selects exactly once and returns to picker', async () => {
            await reset(); await open(); await createView('Quiet original'); await nameInput().fill('Quiet final');
            const radios = panel().getByRole('radio'); assert((await radios.count()) >= 2, 'No usable color choice'); await radios.nth(1).locator('..').click(); assert(await radios.nth(1).isChecked()); const chosenColor = await radios.nth(1).locator('..').locator('.dot, i').first().evaluate(e => getComputedStyle(e).backgroundColor);
            await page.getByRole('button', { name: /^(Create|Create label)$/ }).click(); assert(await search().isVisible()); assert.equal(await chips().getByText('Quiet final', { exact: true }).count(), 1); assert(await chips().getByText('Quiet final', { exact: true }).isVisible());
            const createdColor = await chips().getByText('Quiet final', { exact: true }).locator('..').locator('.dot').evaluate(e => getComputedStyle(e).backgroundColor); assert.equal(createdColor, chosenColor, 'Created chip did not retain selected color');
            await searchFor('Quiet final'); assert.equal(await offer().count(), 0, 'Exact match incorrectly offers new creation'); assert.equal(await panel().locator('#rows').getByText('Quiet final', { exact: true }).count(), 1);
            await search().press('Escape'); await open(); assert.equal(await chips().getByText('Quiet final', { exact: true }).count(), 1); assert(await chips().getByText('Quiet final', { exact: true }).isVisible()); await shot('created-reopened'); await layout();
          });
          await check('outside click closes picker and nested creation without invisible focus', async () => {
            await reset(); await open(); await outside().click(); assert(!(await panel().isVisible())); await focusVisible();
            await open(); await createView('Outside draft'); await outside().click(); assert(!(await panel().isVisible())); await focusVisible(); await shot('outside-dismiss');
          });
          await check('rapid trigger switching and nested escape leaves usable focus', async () => {
            await reset(); for (let i = 0; i < 10; i++) await trigger().click({ delay: 0 });
            await page.waitForTimeout(400); assert.equal(await trigger().getAttribute('aria-expanded'), 'false'); assert(!(await panel().isVisible())); await focusVisible();
            for (let i = 0; i < 3; i++) { await open(); await createView('Rapid draft'); await page.getByRole('button', { name: 'Back', exact: true }).first().click(); await offer().click(); await nameInput().press('Escape'); await search().press('Escape'); } await open(); assert(await search().isVisible()); await focusVisible(); await shot('rapid-reopened');
          });
          await check('keyboard selection color and creation submit', async () => {
            await reset(); await trigger().focus(); await trigger().press('Space'); assert(await search().isVisible());
            await searchFor('Personal'); await search().press('Tab'); await page.keyboard.press('Space');
            assert.equal(await chips().getByText('Personal', { exact: true }).count(), 1);
            await searchFor('Keyboard created'); await offer().focus(); await page.keyboard.press('Enter'); assert(await nameInput().isVisible());
            await nameInput().fill('Keyboard final'); const radio = panel().getByRole('radio').first(); await radio.focus(); await page.keyboard.press('Space'); assert(await radio.isChecked()); await focusVisible(true); await shot('keyboard-color-focus');
            const submit = page.getByRole('button', { name: /^(Create|Create label)$/ }); await submit.focus(); await page.keyboard.press('Enter'); assert(await search().isVisible()); assert.equal(await chips().getByText('Keyboard final', { exact: true }).count(), 1);
          });
          await check('keyboard activation creation Back and focus traversal', async () => {
            await reset(); await trigger().focus(); await trigger().press('Enter'); assert(await search().isVisible()); await searchFor('Keyboard label'); await offer().focus(); await offer().press('Enter'); assert(await nameInput().isVisible());
            await page.getByRole('button', { name: 'Back', exact: true }).first().focus(); await page.keyboard.press('Enter'); assert.equal(await search().inputValue(), 'Keyboard label');
            await search().press('Escape'); await focusVisible(true); await shot('keyboard-focus'); const states = []; for (let i = 0; i < 10; i++) { await page.keyboard.press('Tab'); states.push(await focusVisible()); } return states;
          });
        }
        await check('reduced motion and final responsive bounds', async () => ({ motion: await motion(), layout: await layout() }));
        await check('no application exceptions or external requests', async () => { assert.deepEqual(result.pageErrors, []); assert.deepEqual(result.externalRequests, []); });
      } catch (e) { result.configurationError = e.stack || e.message; }
      finally {
        clearTimeout(configurationDeadline);
        if (context) {
          try { await context.close(); result.videos = []; for (const video of videos) result.videos.push(path.relative(OUT, await video.path())); }
          catch (e) { result.videoError = e.message; }
        }
        save();
      }
    }
  }
}
main().catch(e => { report.fatalErrors.push(e.stack || e.message); }).finally(async () => {
  if (browser) await browser.close().catch(e => report.fatalErrors.push(e.message));
  server.close(); report.finishedAt = new Date().toISOString(); save();
  const failures = report.studies.flatMap(s => s.configurations.flatMap(c => c.checks.filter(x => x.status === 'failed'))).length;
  console.log(JSON.stringify({ results: path.join(OUT, 'results.json'), failedChecks: failures, fatalErrors: report.fatalErrors.length }));
  if (failures || report.fatalErrors.length || report.studies.some(s => s.error || s.configurations.some(c => c.configurationError || c.videoError))) process.exitCode = 1;
});
