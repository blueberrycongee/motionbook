import test from "node:test";
import assert from "node:assert/strict";
import {
  clampPanelWidth,
  panelKeyWidth,
  panelMaximum,
} from "../src/panel-size.mjs";
import { panelKeyframes } from "../src/motion-spec.mjs";
test("native regular pane defaults to 600 and reserves 352 pixels for main", () => {
  assert.equal(clampPanelWidth(NaN, 1280), 600);
  assert.equal(panelMaximum(1280), 928);
  assert.equal(clampPanelWidth(100, 1280), 320);
  assert.equal(clampPanelWidth(1000, 1280), 928);
});
test("left-edge divider has source 10px arrows and Home/End limits", () => {
  assert.equal(panelKeyWidth(600, "ArrowLeft", 1280), 610);
  assert.equal(panelKeyWidth(600, "ArrowRight", 1280), 590);
  assert.equal(panelKeyWidth(600, "Home", 1280), 320);
  assert.equal(panelKeyWidth(600, "End", 1280), 928);
  assert.equal(panelKeyWidth(600, "a", 1280), null);
});
test("pane animates its width using clamped source progress", () => {
  const opening = panelKeyframes(600),
    closing = panelKeyframes(600, false);
  assert.equal(opening[0].width, "0px");
  assert.equal(opening.at(-1).width, "600px");
  assert.equal(closing[0].width, "600px");
  assert.equal(closing.at(-1).width, "0px");
  assert.ok(
    opening.every(
      (x) => parseFloat(x.width) >= 0 && parseFloat(x.width) <= 600,
    ),
  );
});
test("a reversed pane begins at its measured in-flight width", () => {
  const frames = panelKeyframes(600, true, 214);
  assert.equal(frames[0].width, "214px");
  assert.equal(frames.at(-1).width, "600px");
});
