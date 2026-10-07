import { Controller } from "../src/controller.mjs";
import { clone } from "../src/model.mjs";
export const WIDTH = 1280,
  HEIGHT = 840,
  DURATION = 35,
  FPS = 15;
export async function buildTimeline() {
  let n = 0;
  const c = new Controller({
    clock: () => Date.parse("2026-10-06T08:00:00Z"),
    id: () => `demo-${++n}`,
    delay: () => Promise.resolve(),
  });
  const scenes = [];
  const at = (time, label, position = [1170, 730], extra = {}) =>
    scenes.push({
      time,
      label,
      cursor: position,
      state: clone({ ...c.state, ...extra }),
    });
  at(0, "list", [900, 620]);
  c.state.hover = "daily-brief";
  at(1.3, "hover row", [1060, 253]);
  await c.action("select", { id: "daily-brief" });
  at(2.4, "open details", [485, 251]);
  at(3.6, "review schedule", [1155, 392]);
  c.field("time", "08:30");
  at(4.5, "edit time", [1130, 392]);
  c.field("timeZone", "America/New_York");
  at(5.5, "change time zone", [1120, 580]);
  await c.action("save");
  at(6.5, "save changes", [1212, 806]);
  await c.action("close");
  c.state.hover = null;
  at(7.5, "return to list", [1242, 32]);
  c.state.toast = null;
  await c.action("new");
  at(8.5, "create task", [1095, 183]);
  c.field("title", "Evening walk");
  at(9.25, "name task", [1017, 87]);
  c.field(
    "prompt",
    "Remind me to take a twenty-minute walk and get some fresh air.",
  );
  at(10.0, "write instructions", [1047, 208]);
  at(10.9, "choose repeat", [1140, 343], { previewSelect: "frequency" });
  c.field("frequency", "weekdays");
  at(11.8, "set weekdays", [1140, 498]);
  c.field("time", "18:30");
  at(12.7, "set evening time", [1133, 392]);
  c.field("endMode", "date");
  c.field("endDate", "2026-11-05");
  at(13.7, "set end date", [1140, 498]);
  await c.action("save");
  const id = c.state.selected;
  at(14.8, "create confirmed", [1203, 806]);
  await c.action("close");
  c.state.hover = id;
  at(15.8, "inspect new task", [1242, 32]);
  c.state.toast = null;
  await c.action("task-menu", { id });
  at(16.7, "open row actions", [1105, 252]);
  await c.action("toggle", { id });
  at(17.6, "pause task", [1040, 377]);
  await c.action("filter-menu");
  at(18.4, "open status filter", [992, 184]);
  await c.action("filter", { filter: "paused" });
  at(19.2, "filter paused", [957, 314]);
  c.state.hover = id;
  at(20.0, "hover paused task", [1065, 253]);
  await c.action("toggle", { id });
  await c.action("filter", { filter: "all" });
  at(20.8, "resume task", [1068, 253]);
  await c.action("select", { id });
  c.state.toast = null;
  at(21.6, "reopen task", [453, 251]);
  const run = c.store.startRun(id);
  at(22.4, "run in progress", [1197, 806]);
  c.store.completeRun(id, run.id);
  c.state.draft = clone(c.store.get(id));
  at(23.7, "review run history", [1120, 580], { panelScroll: 250 });
  await c.action("result", { run: run.id });
  at(25.0, "open run result", [1069, 580]);
  await c.action("back-result");
  at(27.4, "return to task", [899, 81], { panelScroll: 250 });
  await c.action("close");
  c.state.hover = id;
  await c.action("task-menu", { id });
  at(28.6, "delete menu", [1106, 252]);
  await c.action("delete", { id });
  at(29.5, "delete confirmation", [1058, 451]);
  await c.action("modal-close");
  at(30.6, "cancel delete", [590, 488]);
  await c.action("delete", { id });
  at(31.6, "confirm again", [1090, 252]);
  await c.action("confirm-delete", { id });
  at(32.7, "delete confirmed", [737, 488]);
  c.state.hover = null;
  c.state.toast = null;
  at(34.0, "final list", [972, 659]);
  return scenes;
}
