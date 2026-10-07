import test from "node:test";
import assert from "node:assert/strict";
import { Controller } from "../src/controller.mjs";
import { view } from "../src/view.mjs";
function setup() {
  let callback, delay;
  const c = new Controller({
    clock: () => Date.parse("2026-10-06T08:00Z"),
    delay: () => Promise.resolve(),
    setTimer: (fn, ms) => {
      callback = fn;
      delay = ms;
      return 1;
    },
    clearTimer: () => {
      callback = null;
    },
  });
  return {
    c,
    getDelay: () => delay,
    fire: async () => {
      const fn = callback;
      fn?.();
      if (c.autoPending) await c.autoPending;
      await Promise.resolve();
    },
  };
}
test("native local valid edits autosave after the observed 600 ms debounce", async () => {
  const { c, getDelay, fire } = setup();
  await c.action("select", { id: "reading" });
  assert.equal(c.state.draft.executor, "local");
  c.field("title", "Read a chapter");
  assert.equal(getDelay(), 600);
  assert.equal(c.store.get("reading").title, "Evening reading");
  await fire();
  assert.equal(c.store.get("reading").title, "Read a chapter");
  assert.equal(c.state.dirty, false);
  assert.ok(!view(c.state).includes('class="panel-footer"'));
});
test("switching away flushes valid local edits instead of asking to discard", async () => {
  const { c } = setup();
  await c.action("select", { id: "reading" });
  c.field("title", "Saved before switching");
  await c.action("select", { id: "daily-brief" });
  assert.equal(c.store.get("reading").title, "Saved before switching");
  assert.equal(c.state.selected, "daily-brief");
  assert.equal(c.state.modal, null);
});
test("invalid local draft does not autosave and still guards navigation", async () => {
  const { c, fire } = setup();
  await c.action("select", { id: "reading" });
  c.field("title", "");
  await fire();
  assert.equal(c.store.get("reading").title, "Evening reading");
  await c.action("close");
  assert.equal(c.state.modal.kind, "discard");
});
test("cloud tasks keep explicit Save/Cancel and do not schedule local autosave", async () => {
  const { c, getDelay } = setup();
  await c.action("select", { id: "daily-brief" });
  c.field("title", "Cloud draft");
  assert.equal(getDelay(), undefined);
  assert.equal(c.store.get("daily-brief").title, "Daily brief");
  assert.match(view(c.state), /class="panel-footer"/);
});
test("new native task starts local but one-time scheduling selects cloud", async () => {
  const { c } = setup();
  await c.action("new");
  assert.equal(c.state.draft.executor, "local");
  c.field("frequency", "once");
  assert.equal(c.state.draft.executor, "cloud");
});
test("weekday buttons and custom RRULE edits also queue local autosave", async () => {
  const { c, getDelay, fire } = setup();
  await c.action("select", { id: "reading" });
  await c.action("day", { day: "1" });
  assert.equal(getDelay(), 600);
  await fire();
  assert.deepEqual(
    c.store.get("reading").schedule.days,
    c.state.draft.schedule.days,
  );
  await c.action("advanced");
  c.field("rrule", "FREQ=DAILY;BYHOUR=20;BYMINUTE=15");
  await c.action("save-rule");
  await fire();
  assert.equal(c.store.get("reading").schedule.time, "20:15");
});
test("an in-flight local autosave does not overwrite newer typing", async () => {
  const waits = [];
  const c = new Controller({
    clock: () => Date.parse("2026-10-06T08:00Z"),
    delay: () => new Promise((resolve) => waits.push(resolve)),
    setTimer: () => 1,
    clearTimer: () => {},
  });
  await c.action("select", { id: "reading" });
  c.field("title", "First");
  const pending = c.flushAutoSave();
  c.field("title", "Second");
  waits.shift()();
  await pending;
  assert.equal(c.state.draft.title, "Second");
  assert.equal(c.state.dirty, true);
  const last = c.flushAutoSave();
  waits.shift()();
  await last;
  assert.equal(c.store.get("reading").title, "Second");
  assert.equal(c.state.dirty, false);
});
