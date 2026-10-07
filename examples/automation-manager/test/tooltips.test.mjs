import test from "node:test";
import assert from "node:assert/strict";
import { TooltipController } from "../src/tooltips.mjs";
test("source default tooltip delay is 200ms and leaving cancels pending reveal", () => {
  let delay, fn, cancelled;
  const tooltip = new TooltipController(
    {},
    {
      setTimer: (cb, ms) => {
        fn = cb;
        delay = ms;
        return 42;
      },
      clearTimer: (id) => {
        cancelled = id;
      },
    },
  );
  const target = { disabled: false };
  tooltip.enter(target);
  assert.equal(delay, 200);
  assert.equal(typeof fn, "function");
  tooltip.leave();
  assert.equal(cancelled, 42);
  assert.equal(tooltip.target, null);
});
test("click suppression prevents a tooltip from reappearing on the same trigger", () => {
  let calls = 0;
  const t = new TooltipController(
      {},
      { setTimer: () => ++calls, clearTimer: () => {} },
    ),
    target = { disabled: false };
  t.enter(target);
  t.hide();
  t.clicked = true;
  t.enter(target);
  assert.equal(calls, 1);
  t.leave();
  t.enter(target);
  assert.equal(calls, 2);
});
