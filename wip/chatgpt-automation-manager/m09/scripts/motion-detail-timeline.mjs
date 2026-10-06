import { Controller } from "../src/controller.mjs";
import { clone } from "../src/model.mjs";
export const MOTION_FPS = 60,
  MOTION_DURATION = 18;
export async function motionTimeline() {
  let n = 0;
  const c = new Controller({
    clock: () => Date.parse("2026-10-06T08:00:00Z"),
    id: () => `motion-${++n}`,
    delay: () => Promise.resolve(),
  });
  const scenes = [];
  const shot = (time, action, cursor, extra = {}) =>
    scenes.push({
      time,
      action,
      cursor,
      state: clone({ ...c.state, ...extra }),
    });
  shot(0, "rest", [800, 654]);
  shot(0.9, "leading status hover", [282, 225], {
    hover: "daily-brief",
    statusHover: "daily-brief",
  });
  shot(1.1, "status tooltip after source delay", [282, 225], {
    hover: "daily-brief",
    statusHover: "daily-brief",
    tooltip: "Active",
    tooltipX: 282,
  });
  await c.action("toggle", { id: "daily-brief" });
  c.state.toast = null;
  shot(1.8, "pause on leading control", [282, 225], {
    hover: "daily-brief",
    statusHover: "daily-brief",
  });
  await c.action("toggle", { id: "daily-brief" });
  c.state.toast = null;
  shot(2.8, "resume on leading control", [282, 225], {
    hover: "daily-brief",
    statusHover: "daily-brief",
  });
  shot(3.5, "row overflow reveal", [996, 225], { hover: "daily-brief" });
  shot(3.7, "overflow tooltip after source delay", [996, 225], {
    hover: "daily-brief",
    tooltip: "Scheduled task actions",
    tooltipX: 996,
  });
  await c.action("task-menu", { id: "daily-brief" });
  shot(4, "overflow entrance", [996, 225], { hover: "daily-brief" });
  shot(4.6, "menu highlight", [874, 272], {
    hover: "daily-brief",
    menuHover: 0,
  });
  const run = c.store.startRun("daily-brief");
  c.state.menu = null;
  shot(5.2, "run action and menu exit", [874, 272], { hover: "daily-brief" });
  c.store.completeRun("daily-brief", run.id);
  shot(6.4, "completed run unread marker", [741, 431]);
  await c.action("create-menu");
  shot(7, "split create dropdown", [1007, 176]);
  shot(7.8, "manual setup item hover", [914, 249], { menuHover: 1 });
  await c.action("outside");
  shot(8.6, "outside click dismissal", [707, 449]);
  await c.action("filter-menu");
  shot(9.2, "status filter entrance", [887, 177]);
  shot(9.8, "paused filter highlight", [879, 287], { menuHover: 2 });
  await c.action("filter", { filter: "paused" });
  shot(10.4, "filtered task rows", [879, 287]);
  await c.action("filter-menu");
  shot(11.3, "filter reopening", [887, 177]);
  shot(11.8, "all filter highlight", [878, 225], { menuHover: 0 });
  await c.action("filter", { filter: "all" });
  shot(12.2, "restored task rows", [878, 225]);
  c.field("search", "r");
  shot(13, "search typing r", [455, 177]);
  c.field("search", "re");
  shot(13.15, "search typing re", [455, 177]);
  c.field("search", "rev");
  shot(13.3, "search typing rev", [455, 177]);
  c.field("search", "revi");
  shot(13.45, "search typing revi", [455, 177]);
  c.field("search", "revie");
  shot(13.6, "search typing revie", [455, 177]);
  c.field("search", "review");
  shot(13.75, "search typing review", [455, 177]);
  shot(14.5, "search result hover", [996, 225], { hover: "weekly-review" });
  await c.action("task-menu", { id: "weekly-review" });
  shot(15, "second row menu entrance", [996, 225], { hover: "weekly-review" });
  await c.action("escape");
  shot(15.65, "escape menu dismissal", [996, 225], { hover: "weekly-review" });
  c.field("search", "");
  shot(16.3, "clear search", [782, 177]);
  shot(17.2, "settled final list", [799, 652]);
  return scenes;
}
