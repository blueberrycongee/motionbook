import test from "node:test";
import assert from "node:assert/strict";
import {
  ALIGN,
  pageGeometry,
  paneGeometry,
  alignmentCss,
} from "../src/alignment-spec.mjs";
import { nativeSVG } from "../scripts/native-workflow-view.mjs";
import { Controller } from "../src/controller.mjs";
test("768 maximum includes the two 20px gutters at desktop widths", () => {
  for (const viewport of [960, 1280, 1600]) {
    const p = pageGeometry(viewport);
    assert.equal(p.width, 728);
    assert.equal(p.outerWidth, 768);
    assert.equal(p.left, (viewport - 768) / 2 + 20);
    assert.equal(p.headingX, p.left + 8);
    assert.equal(p.titleX, p.left + 40);
    assert.equal(p.statusCenterX, p.left + 22);
    assert.equal(p.dividerRight, p.right - 12);
  }
});
test("narrow main panes retain 20px gutters without double subtraction", () => {
  for (const viewport of [960, 1280, 1600])
    for (const pane of [320, 520, 600]) {
      const p = pageGeometry(viewport, pane);
      assert.equal(p.width, Math.min(768, viewport - pane) - 40);
      assert.ok(p.titleX < p.right);
      assert.equal(p.statusCenterY, 24);
      assert.equal(p.actionCenterY, 32);
    }
});
test("panel border, form border and paddings define distinct label/value rails", () => {
  const p = paneGeometry(1280, 600);
  assert.equal(p.bodyLeft, 701);
  assert.equal(p.bodyRight, 1260);
  assert.equal(p.labelLeft, 718);
  assert.equal(p.valueRight, 1243);
  assert.equal(p.footerTop, 771);
  assert.equal(p.buttonTop, 792);
  assert.equal(p.buttonBottom, 820);
  assert.equal(p.buttonRight, 1260);
});
test("DOM stylesheet variables and offline geometry share the same source constants", () => {
  assert.match(alignmentCss(), /--page-outer-max:768px/);
  assert.match(alignmentCss(), /--row-icon-top:14px/);
  const c = new Controller({ clock: () => Date.parse("2026-10-06T08:00Z") });
  const s = { state: c.state };
  const svg = nativeSVG(s, s, { time: 0, elapsed: 0, paneWidth: 0 });
  assert.match(svg, /<text x="284" y="90"/);
  assert.match(svg, /<text x="316" y="285"/);
  assert.equal(ALIGN.footerPadding, 20);
});
