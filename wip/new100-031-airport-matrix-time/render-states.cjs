'use strict';
// Offline source-state snapshots only. These are not browser or source-video evidence.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const S = require('./scene');
sharp.concurrency(1);
const states = [
  { name: 'settled-dark', options: {} },
  { name: 'search-keyboard', options: { search: true, query: 'san', activeIndex: 0 } },
  { name: 'appearance-light', options: { light: true, controls: true, city: 'San Francisco' } },
  { name: 'search-empty', options: { search: true, query: 'missing-city' } }
];
(async () => {
  const directory = path.join(__dirname, 'evidence');
  fs.mkdirSync(directory, { recursive: true });
  const thumbnails = [];
  for (const [index, state] of states.entries()) {
    const png = await sharp(Buffer.from(S.svg(2, state.options))).png().toBuffer();
    fs.writeFileSync(path.join(directory, `${state.name}.png`), png);
    thumbnails.push({ input: await sharp(png).resize(864, 540).toBuffer(), left: index % 2 * 864, top: Math.floor(index / 2) * 540 });
  }
  await sharp({ create: { width: 1728, height: 1080, channels: 3, background: '#171717' } }).composite(thumbnails).png().toFile(path.join(directory, 'authored-states.png'));
  console.log('Four authored offline SVG states rendered. No reference comparison performed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
