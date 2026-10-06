import test from "node:test";
import assert from "node:assert/strict";
import {
  workTaskStatus,
  workTaskGroups,
  workVisibleTasks,
} from "../src/work-view-model.mjs";
const now = Date.parse("2026-10-06T12:00Z"),
  task = (id, fields = {}) => ({
    id,
    enabled: true,
    eventTriggered: false,
    nextRuns: ["2026-10-07T09:00Z"],
    updatedAt: "2026-10-05T13:00Z",
    ...fields,
  });
test("Work derives completed status from empty future runs except event triggers", () => {
  assert.equal(workTaskStatus(task("a", { nextRuns: [] })), "completed");
  assert.equal(
    workTaskStatus(task("b", { nextRuns: [], eventTriggered: true })),
    "active",
  );
});
test("Work Active view retains recently paused and completed tasks for one day", () => {
  const items = [
    task("active"),
    task("paused", { enabled: false }),
    task("completed", { nextRuns: [] }),
  ];
  assert.deepEqual(
    workVisibleTasks(items, "active", now).map((t) => t.id),
    ["active", "paused", "completed"],
  );
});
test("Work recent group excludes older inactive tasks but separate status views retain them", () => {
  const items = [
    task("old", { enabled: false, updatedAt: "2026-10-04T12:00Z" }),
  ];
  assert.deepEqual(workTaskGroups(items, now).recent, []);
  assert.equal(workVisibleTasks(items, "paused", now).length, 1);
});
test("local pause timestamp keeps just-paused Work rows visible before a server timestamp refresh", () => {
  const items = [
    task("paused", { enabled: false, updatedAt: "2026-10-01T12:00Z" }),
  ];
  assert.equal(workVisibleTasks(items, "active", now).length, 0);
  assert.equal(
    workVisibleTasks(items, "active", now, { paused: now }).length,
    1,
  );
});
