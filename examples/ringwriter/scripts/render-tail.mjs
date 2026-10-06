import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createScene, offsetPose} from '../src/scene.mjs';
import {replayState} from '../src/interaction.mjs';
const require = createRequire(import.meta.url);
const {createCanvas, Path2D} = require('@napi-rs/canvas');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = process.argv[2];
if (!destination) throw new Error('Provide a directory for the authored closure frames.');
const asset = JSON.parse(fs.readFileSync(path.join(root, 'data/motion.json')));
asset.marks = new Uint8Array(fs.readFileSync(path.join(root, 'data/motion.bin')));
const canvas = createCanvas(1728, 1728), context = canvas.getContext('2d');
const draw = createScene(Path2D, createCanvas);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
fs.mkdirSync(destination, {recursive: true});
const frames = [];
for (let frame = 486; frame < 558; frame++) {
  const time = frame / 60, state = replayState(time);
  draw(context, asset, offsetPose(asset, state));
  const png = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(destination, `${String(frame).padStart(3, '0')}.png`), png);
  frames.push({frame, time, opacity: state.opacity,
    rgba: hash(context.getImageData(0, 0, 1728, 1728).data), png: hash(png)});
  if (frame % 4 === 0 && global.gc) global.gc();
}
fs.writeFileSync(path.join(destination, 'tail-bindings.json'), JSON.stringify({
  description: 'Authored closure after the 486 original poses. Fade to the original background, then hold blank before looping.',
  scene: hash(fs.readFileSync(path.join(root, 'src/scene.mjs'))),
  interaction: hash(fs.readFileSync(path.join(root, 'src/interaction.mjs'))), frames
}, null, 2));
console.log(`Rendered ${frames.length} authored closure frames.`);
