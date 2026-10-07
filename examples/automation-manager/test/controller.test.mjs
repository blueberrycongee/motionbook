import test from "node:test";
import assert from "node:assert/strict";
import { Controller } from "../src/controller.mjs";
import { view } from "../src/view.mjs";
import { toRRule, fromRRule } from "../src/rrule.mjs";
const NOW = Date.parse("2026-10-06T08:00:00Z");
function create(delay = () => Promise.resolve()) {
  let n = 0;
  return new Controller({ clock: () => NOW, id: () => `test-${++n}`, delay });
}
test("full creation, editing, schedule, pause/resume, history and deletion workflow", async () => {
  const c = create();
  await c.action("new");
  c.field("title", "Take a walk");
  c.field("prompt", "Remind me to go outside.");
  c.field("frequency", "weekly");
  await c.action("day", { day: "0" });
  c.field("time", "18:30");
  c.field("timeZone", "Asia/Shanghai");
  await c.action("save");
  const id = c.state.selected;
  assert.ok(c.store.get(id));
  assert.equal(c.store.get(id).schedule.timeZone, "Asia/Shanghai");
  c.field("title", "Evening walk");
  await c.action("save");
  await c.action("toggle");
  assert.equal(c.store.get(id).status, "paused");
  await c.action("toggle");
  await c.action("run");
  assert.equal(c.store.get(id).runs[0].status, "completed");
  await c.action("result", { run: c.store.get(id).runs[0].id });
  assert.ok(view(c.state).includes("Your scheduled update is ready"));
  await c.action("back-result");
  await c.action("delete");
  assert.equal(c.state.modal.kind, "delete");
  await c.action("modal-close");
  assert.ok(c.store.get(id));
  await c.action("delete");
  await c.action("confirm-delete");
  assert.equal(c.store.get(id), null);
  assert.equal(c.state.draft, null);
});
test("dirty navigation waits for explicit discard; Escape first dismisses menu", async () => {
  const c = create();
  await c.action("select", { id: "daily-brief" });
  c.field("title", "Unsaved");
  await c.action("select", { id: "weekly-review" });
  assert.equal(c.state.modal.kind, "discard");
  assert.equal(c.state.selected, "daily-brief");
  await c.action("modal-close");
  assert.equal(c.state.draft.title, "Unsaved");
  await c.action("close");
  await c.action("discard");
  assert.equal(c.state.draft, null);
  assert.equal(c.store.get("daily-brief").title, "Daily brief");
  await c.action("filter-menu");
  await c.action("escape");
  assert.equal(c.state.menu, null);
});
test("Cancel reverts an existing draft without deleting the task", async () => {
  const c = create();
  await c.action("select", { id: "daily-brief" });
  c.field("prompt", "Draft");
  await c.action("cancel");
  assert.equal(c.state.dirty, false);
  assert.notEqual(c.state.draft.prompt, "Draft");
  assert.equal(c.state.selected, "daily-brief");
});
test("Save and run now first commits the current draft", async () => {
  const c = create();
  await c.action("select", { id: "daily-brief" });
  c.field("title", "Saved before run");
  await c.action("run");
  assert.equal(c.store.get("daily-brief").runs[0].title, "Saved before run");
  assert.equal(c.state.dirty, false);
});
test("in-flight save cannot recreate deleted task or overwrite newer navigation", async () => {
  let resolve;
  const c = create(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  await c.action("select", { id: "daily-brief" });
  c.field("title", "Late write");
  const pending = c.save();
  c.close();
  resolve();
  assert.equal(await pending, false);
  assert.equal(c.store.get("daily-brief").title, "Daily brief");
  assert.equal(c.state.draft, null);
});
test("invalid fields remain editable with inline errors", async () => {
  const c = create();
  await c.action("new");
  await c.action("save");
  assert.ok(c.state.errors.title);
  assert.ok(c.state.errors.prompt);
  assert.equal(c.store.tasks.length, 3);
  assert.match(view(c.state), /role="alert"/);
});
test("filter and empty search state are rendered", async () => {
  const c = create();
  await c.action("filter", { filter: "paused" });
  assert.match(view(c.state), /Evening reading/);
  assert.ok(!view(c.state).includes("Daily brief"));
  c.field("search", "zz-no-match");
  assert.match(view(c.state), /No scheduled tasks found/);
});
test("advanced schedule editor validates and applies a supported rule", async () => {
  const c = create();
  await c.action("select", { id: "daily-brief" });
  await c.action("advanced");
  c.field("rrule", "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=10;BYMINUTE=30");
  await c.action("save-rule");
  assert.equal(c.state.modal, null);
  assert.deepEqual(c.state.draft.schedule.days, [1, 3, 5]);
  assert.equal(c.state.draft.schedule.time, "10:30");
  await c.action("advanced");
  c.field("rrule", "RRULE:FREQ=INVALID");
  await c.action("save-rule");
  assert.ok(c.state.ruleError);
});
test("RRULE round trip retains supported dates and time; unsupported rules are explicit", () => {
  const c = create();
  const schedule = c.store.tasks[0].schedule;
  const s = fromRRule(toRRule(schedule), schedule);
  assert.deepEqual(s.days, [1, 2, 3, 4, 5]);
  assert.equal(s.time, "09:00");
  assert.throws(
    () => fromRRule("RRULE:FREQ=MONTHLY;BYSETPOS=1", schedule),
    /does not support/,
  );
});
test("share snapshot omits run history, IDs and other private state", () => {
  const c = create();
  const snap = c.shareSnapshot("daily-brief");
  assert.equal(snap.title, "Daily brief");
  assert.equal(snap.runs, undefined);
  assert.equal(snap.id, undefined);
  snap.schedule.time = "13:00";
  assert.equal(c.store.tasks[0].schedule.time, "09:00");
});
test("view escapes all user-authored text", () => {
  const c = create();
  c.store.tasks[0].title = "<img src=x onerror=alert(1)>";
  const html = view(c.state);
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&lt;img"));
});
test("discarding an old draft retains the specific chosen template", async () => {
  const c = create();
  await c.action("select", { id: "daily-brief" });
  c.field("title", "Unsaved");
  await c.action("template", { template: "weekly" });
  assert.equal(c.state.modal.kind, "discard");
  await c.action("discard");
  assert.equal(c.state.draft.title, "Weekly review");
  assert.equal(c.state.draft.schedule.frequency, "weekly");
});
test("delete confirmation can dismiss outside, but pending deletion blocks dismissal and repeat submit", async () => {
  const waits = [];
  const c = new Controller({
    delay: () => new Promise((resolve) => waits.push(resolve)),
  });
  await c.action("delete", { id: "reading" });
  await c.action("backdrop");
  assert.equal(c.state.modal, null);
  await c.action("delete", { id: "reading" });
  const first = c.action("confirm-delete", { id: "reading" });
  assert.equal(c.state.deleting, true);
  await c.action("escape");
  await c.action("modal-close");
  await c.action("confirm-delete", { id: "reading" });
  assert.equal(waits.length, 1);
  assert.equal(c.state.modal.kind, "delete");
  waits.shift()();
  await first;
  assert.equal(c.store.get("reading"), null);
  assert.equal(c.state.modal, null);
  assert.equal(c.state.deleting, false);
});
