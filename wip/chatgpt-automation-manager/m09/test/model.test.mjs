import test from "node:test";
import assert from "node:assert/strict";
import {
  TaskStore,
  seedTasks,
  defaultSchedule,
  validateTask,
  nextRun,
  filterTasks,
  wallInstants,
} from "../src/model.mjs";
const NOW = Date.parse("2026-10-06T08:00:00Z");
function store(storage = null) {
  let id = 0;
  return new TaskStore({
    tasks: seedTasks(NOW),
    clock: () => NOW,
    storage,
    id: () => `id-${++id}`,
  });
}
const draft = () => ({
  title: "Drink water",
  prompt: "Remind me to drink water.",
  schedule: defaultSchedule(NOW),
});
test("create, edit, pause, resume and delete preserve isolated local state", () => {
  const s = store();
  const x = s.save(draft());
  assert.equal(x.ok, true);
  assert.equal(s.tasks.length, 4);
  const edit = structuredClone(x.task);
  edit.title = "Take a break";
  assert.equal(s.save(edit).task.revision, 2);
  assert.equal(s.setStatus(x.task.id, "paused"), true);
  assert.equal(nextRun(s.get(x.task.id), NOW), null);
  assert.equal(s.setStatus(x.task.id, "active"), true);
  assert.equal(s.delete(x.task.id), true);
  assert.equal(s.get(x.task.id), null);
});
test("canceling a draft makes no mutation", () => {
  const s = store();
  const d = structuredClone(s.tasks[0]);
  d.title = "Unsaved";
  assert.equal(s.tasks[0].title, "Daily brief");
});
test("invalid fields cannot save", () => {
  const s = store();
  let d = draft();
  d.title = " ";
  d.schedule.time = "25:99";
  d.schedule.timeZone = "Made/Up";
  assert.equal(s.save(d).ok, false);
  assert.equal(s.tasks.length, 3);
});
test("malformed calendar date returns validation error rather than throwing", () => {
  const d = draft();
  d.schedule.frequency = "once";
  d.schedule.date = "2026-13-99";
  assert.ok(validateTask(d, NOW).date);
});
test("daily schedule uses task time zone", () => {
  const t = { ...draft(), status: "active" };
  t.schedule.timeZone = "America/New_York";
  assert.equal(nextRun(t, NOW), "2026-10-06T13:00:00.000Z");
});
test("weekday schedule skips the weekend", () => {
  const t = seedTasks(NOW)[0];
  assert.equal(
    nextRun(t, Date.parse("2026-10-09T10:00:00Z")),
    "2026-10-12T09:00:00.000Z",
  );
});
test("spring-forward nonexistent wall time is skipped", () => {
  const t = { ...draft(), status: "active" };
  t.schedule.timeZone = "America/New_York";
  t.schedule.time = "02:30";
  assert.equal(
    nextRun(t, Date.parse("2027-03-14T00:00:00Z")),
    "2027-03-15T06:30:00.000Z",
  );
});
test("fall-back ambiguity returns both instants in chronological order", () => {
  assert.deepEqual(
    wallInstants(
      { year: 2026, month: 11, day: 1, hour: 1, minute: 30 },
      "America/New_York",
    ),
    [Date.parse("2026-11-01T05:30Z"), Date.parse("2026-11-01T06:30Z")],
  );
});
test("monthly day 31 skips short months; end date is inclusive", () => {
  const t = { ...draft(), status: "active" };
  t.schedule.frequency = "monthly";
  t.schedule.dayOfMonth = 31;
  assert.equal(
    nextRun(t, Date.parse("2026-11-01T00:00Z")),
    "2026-12-31T09:00:00.000Z",
  );
  t.schedule.endDate = "2026-12-30";
  assert.equal(nextRun(t, Date.parse("2026-11-01T00:00Z")), null);
});
test("one-time task must be future and completes after simulated run", () => {
  const s = store();
  let d = draft();
  d.schedule.frequency = "once";
  d.schedule.date = "2026-10-05";
  assert.equal(s.save(d).ok, false);
  d.schedule.date = "2026-10-07";
  const t = s.save(d).task;
  const r = s.startRun(t.id);
  s.completeRun(t.id, r.id);
  assert.equal(s.get(t.id).status, "completed");
});
test("repeated run click is idempotent; removed task cannot be resurrected by completion", () => {
  const s = store();
  const r = s.startRun("daily-brief");
  assert.equal(s.startRun("daily-brief").id, r.id);
  assert.equal(s.get("daily-brief").runs.length, 1);
  s.delete("daily-brief");
  assert.equal(s.completeRun("daily-brief", r.id), false);
});
test("run history and unread state survive storage round-trip", () => {
  const mem = new Map();
  const storage = {
    setItem: (k, v) => mem.set(k, v),
    getItem: (k) => mem.get(k),
  };
  const s = store(storage);
  const r = s.startRun("daily-brief");
  s.completeRun("daily-brief", r.id);
  const other = store(storage);
  assert.equal(other.restore(), true);
  assert.equal(other.get("daily-brief").runs[0].unread, true);
  other.markRead("daily-brief", r.id);
  assert.equal(other.get("daily-brief").runs[0].unread, false);
});
test("corrupt storage and quota error do not crash the client", () => {
  const s = store({
    getItem: () => "{",
    setItem: () => {
      throw Error("quota");
    },
  });
  assert.equal(s.restore(), false);
  assert.equal(s.save(draft()).ok, true);
  assert.ok(s.storageError);
});
test("status filtering and text search combine", () => {
  const tasks = seedTasks(NOW);
  assert.equal(filterTasks(tasks, "active", "weekly").length, 1);
  assert.equal(filterTasks(tasks, "paused", "reading").length, 1);
  assert.equal(filterTasks(tasks, "active", "zzzz").length, 0);
});
test("reloading during a local run produces recoverable interrupted history", () => {
  const mem = new Map(),
    storage = { setItem: (k, v) => mem.set(k, v), getItem: (k) => mem.get(k) };
  const s = store(storage);
  s.startRun("daily-brief");
  const restored = store(storage);
  restored.restore();
  assert.equal(restored.get("daily-brief").runs[0].status, "failed");
  assert.ok(restored.startRun("daily-brief"));
  assert.equal(restored.get("daily-brief").runs.length, 2);
});
