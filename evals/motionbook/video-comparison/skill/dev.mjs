import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import path from 'path'; import url from 'url'; import fs from 'fs';
const here = path.dirname(url.fileURLToPath(import.meta.url));
const times = process.argv.slice(2).map(Number);
const dsf = Number(process.env.DSF || 1);
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: dsf });
pg.on('console', m => console.log('[page]', m.text())); pg.on('pageerror', e => console.log('[err]', e.message));
await pg.goto('file://' + path.join(here, 'src/index.html')); await pg.evaluate(() => document.fonts.ready);
fs.mkdirSync(path.join(here, 'build/dev'), { recursive: true });
for (const t of times) { await pg.evaluate(t => render(t), t); await pg.screenshot({ path: path.join(here, `build/dev/t${t.toFixed(2)}.png`) }); }
await b.close();
