import { Controller } from "../src/controller.mjs";
import { clone } from "../src/model.mjs";
export const NATIVE_FPS = 60,
  NATIVE_DURATION = 34;
export async function nativeTimeline() {
  let n = 0;
  const c = new Controller({
      clock: () => Date.parse("2026-10-06T08:00Z"),
      id: () => `native-${++n}`,
      delay: () => Promise.resolve(),
      setTimer: () => 1,
      clearTimer: () => {},
    }),
    scenes = [];
  const shot = (time, action, cursor, extra = {}) => {
    c.state.toast = null;
    scenes.push({
      time,
      action,
      cursor,
      state: clone({ ...c.state, ...extra }),
    });
  };
  shot(0, "list", [760, 630]);
  shot(0.7, "cloud row hover", [507, 285], { hover: "daily-brief" });
  await c.action("select", { id: "daily-brief" });
  shot(1.1, "native shell opens cloud detail", [480, 285]);
  for (let i = 1; i <= 6; i++) {
    c.field("title", "Daily briefing".slice(0, 8 + i));
    shot(2 + i * 0.1, "edit cloud name", [875, 66]);
  }
  await c.action("select-menu", {
    field: "frequency",
    value: "weekdays",
    options: JSON.stringify([
      ["hourly", "Hourly"],
      ["daily", "Daily"],
      ["weekdays", "Weekdays"],
      ["weekly", "Weekly"],
      ["monthly", "Monthly"],
      ["custom", "Custom"],
    ]),
    x: 1020,
    y: 341,
  });
  shot(3.2, "cloud repeat menu", [1230, 317]);
  shot(3.8, "weekly highlight", [1110, 452], { menuHover: 3 });
  await c.action("select-option", { field: "frequency", value: "weekly" });
  shot(4.3, "cloud weekly schedule", [1110, 452]);
  await c.action("day", { day: "1" });
  shot(4.8, "choose weekday", [890, 365]);
  const saved = c.save();
  shot(5.5, "cloud explicit save pending", [1220, 812]);
  await saved;
  shot(5.8, "cloud save completed", [1220, 812]);
  await c.action("close");
  shot(6.5, "cloud detail closes", [1247, 22]);
  await c.action("filter", { filter: "all" });
  shot(7.0, "show all tasks", [332, 234]);
  await c.action("select", { id: "reading" });
  shot(7.4, "local task detail opens", [510, 421]);
  c.field("title", "Evening reading time");
  shot(8.7, "local rename without save footer", [898, 66]);
  await c.flushAutoSave();
  shot(9.3, "600 ms local autosave settled", [898, 66]);
  await c.action("select-menu", {
    field: "reasoning",
    value: "medium",
    options: JSON.stringify([
      ["low", "Low"],
      ["medium", "Medium"],
      ["high", "High"],
    ]),
    x: 1030,
    y: 369,
  });
  shot(10, "local model reasoning dropdown", [1230, 350]);
  shot(10.45, "high reasoning highlight", [1130, 452], { menuHover: 2 });
  await c.action("select-option", { field: "reasoning", value: "high" });
  shot(10.8, "reasoning selected", [1130, 452]);
  await c.flushAutoSave();
  shot(11.4, "local setting autosaved", [1130, 452]);
  await c.action("task-menu", { id: "reading", origin: "panel" });
  shot(12, "panel action menu", [1208, 23]);
  const run = c.store.startRun("reading");
  c.state.menu = null;
  shot(12.8, "run started", [1110, 60]);
  c.store.completeRun("reading", run.id);
  c.state.draft = clone(c.store.get("reading"));
  shot(13.9, "local previous run available", [1028, 690]);
  await c.action("result", { run: run.id });
  shot(14.6, "open local simulated run", [981, 681]);
  await c.action("back-result");
  shot(16, "back to task", [733, 65]);
  await c.action("close");
  shot(16.7, "local detail closes", [1247, 22]);
  await c.action("create-menu");
  shot(17.5, "split create menu", [1258, 23]);
  shot(18, "manual setup highlight", [1160, 86], { menuHover: 1 });
  await c.action("new");
  shot(18.4, "manual creation", [1160, 86]);
  c.field("title", "Plan tomorrow");
  shot(19.2, "new name input", [901, 65]);
  c.field("prompt", "Help me choose three priorities for tomorrow.");
  shot(19.9, "new prompt input", [943, 119]);
  await c.action("select-menu", {
    field: "frequency",
    value: "daily",
    options: JSON.stringify([
      ["hourly", "Hourly"],
      ["daily", "Daily"],
      ["weekdays", "Weekdays"],
      ["weekly", "Weekly"],
      ["custom", "Custom"],
    ]),
    x: 1020,
    y: 507,
  });
  shot(20.6, "new task repeat menu", [1220, 486]);
  await c.action("select-option", { field: "frequency", value: "weekdays" });
  c.field("time", "18:00");
  shot(21.4, "new task schedule complete", [1130, 526]);
  const create = c.save();
  shot(22.1, "create pending", [1220, 812]);
  await create;
  const createdId = c.state.selected;
  shot(22.4, "created local task", [1220, 812]);
  await c.action("close");
  shot(23.2, "created task in list", [1247, 22]);
  const id = createdId;
  await c.action("task-menu", { id });
  shot(24, "new task overflow", [978, 288], { hover: id });
  await c.action("toggle", { id });
  shot(24.7, "pause created task", [872, 358], { hover: id });
  await c.action("task-menu", { id });
  shot(25.4, "paused menu", [978, 288], { hover: id });
  await c.action("delete", { id });
  shot(26.2, "delete confirmation", [872, 392]);
  await c.action("modal-close");
  shot(27.1, "cancel deletion", [570, 470]);
  await c.action("delete", { id });
  shot(27.8, "reopen delete confirmation", [978, 288]);
  await c.action("confirm-delete", { id });
  shot(28.5, "confirmed local deletion", [732, 470]);
  await c.action("filter-menu");
  shot(29.2, "filter menu", [332, 234]);
  await c.action("filter", { filter: "paused" });
  shot(29.9, "paused filter", [356, 330]);
  await c.action("filter", { filter: "all" });
  c.field("search", "review");
  shot(30.9, "search existing task", [459, 175]);
  c.field("search", "");
  shot(32, "cleared search", [982, 174]);
  shot(33, "final settled list", [765, 645]);
  return scenes;
}
