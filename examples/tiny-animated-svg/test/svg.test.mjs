import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { svgAt, PERIOD } from '../src/build.mjs';

test('standalone SVG has no external media or script',()=>{
 const s=svgAt(); assert.ok(Buffer.byteLength(s)<3072);assert.ok(!/<script|<image|<foreignObject|http[s]?:\/\/(?!www.w3.org)/i.test(s));
 for(const match of s.matchAll(/(?:url\(#|href="#)([^)"]+)/g)) assert.ok(s.includes(`id="${match[1]}"`),`missing ${match[1]}`);
});
test('SMIL loops the diagonal stripe every 4.4 seconds',()=>{
 assert.ok(svgAt().includes('dur="4.4s" repeatCount="indefinite" additive="sum"'));
 assert.equal(svgAt(0),svgAt(PERIOD)); assert.notEqual(svgAt(0),svgAt(PERIOD/2)); assert.ok(!svgAt(1).includes('animateTransform'));
});
test('effect-only page includes an accessible reduced-motion still',()=>{
 const h=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.ok(h.includes('prefers-reduced-motion:reduce'));assert.ok(h.includes('preview/still.svg'));assert.ok(!/<h[1-6]|<p>|<button|<script/i.test(h));
});
