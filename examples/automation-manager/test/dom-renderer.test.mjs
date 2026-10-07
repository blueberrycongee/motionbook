import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { DomRenderer } from "../src/dom-renderer.mjs";
import { view } from "../src/view.mjs";
import { Controller } from "../src/controller.mjs";
const require = createRequire(import.meta.url);
let parseHTML;
try {
  ({ parseHTML } = require("linkedom"));
} catch {}
const domTest = parseHTML ? test : test.skip;
function setup() {
  const { document } = parseHTML(
    '<html><body><div id="app"></div></body></html>',
  );
  const root = document.getElementById("app");
  const c = new Controller({
    clock: () => Date.parse("2026-10-06"),
    delay: () => Promise.resolve(),
  });
  const r = new DomRenderer(root, { motion: false });
  c.onChange = () => r.render(view(c.state));
  r.render(view(c.state));
  return { document, root, c, r };
}
domTest(
  "typing preserves panel, textarea and sibling row DOM identities",
  async () => {
    const { root, c } = setup();
    await c.action("select", { id: "daily-brief" });
    const panel = root.querySelector(".detail-panel"),
      title = root.querySelector("[name=title]"),
      prompt = root.querySelector("[name=prompt]"),
      row = root.querySelector('[data-key="task-daily-brief"]');
    c.field("title", "Daily update");
    c.field("prompt", "Edited instructions");
    assert.equal(root.querySelector(".detail-panel"), panel);
    assert.equal(root.querySelector("[name=title]"), title);
    assert.equal(root.querySelector("[name=prompt]"), prompt);
    assert.equal(root.querySelector('[data-key="task-daily-brief"]'), row);
    assert.equal(title.value, "Daily update");
    assert.equal(prompt.value, "Edited instructions");
  },
);
domTest("modal and menu are keyed separately from the app shell", async () => {
  const { root, c } = setup();
  const shell = root.querySelector(".app-shell");
  await c.action("task-menu", { id: "daily-brief" });
  assert.equal(root.querySelectorAll("[role=menu]").length, 1);
  await c.action("delete", { id: "daily-brief" });
  assert.equal(root.querySelectorAll("[role=menu]").length, 0);
  assert.ok(root.querySelector("[role=dialog]"));
  assert.equal(root.querySelector(".app-shell"), shell);
  await c.action("modal-close");
  assert.equal(root.querySelector("[role=dialog]"), null);
});
domTest("delete and filter preserve surviving keyed task rows", async () => {
  const { root, c } = setup();
  const weekly = root.querySelector('[data-key="task-weekly-review"]');
  await c.action("delete", { id: "daily-brief" });
  await c.action("confirm-delete", { id: "daily-brief" });
  assert.equal(root.querySelector('[data-key="task-weekly-review"]'), weekly);
  await c.action("filter", { filter: "active" });
  assert.equal(root.querySelector('[data-key="task-weekly-review"]'), weekly);
});
domTest(
  "read-only cloud timezone and exact row action scope are rendered",
  async () => {
    const { root, c } = setup();
    await c.action("select", { id: "daily-brief" });
    assert.equal(root.querySelector("select[name=timeZone]"), null);
    assert.match(root.querySelector(".timezone-value").textContent, /UTC/);
    await c.action("task-menu", { id: "daily-brief" });
    const labels = [...root.querySelectorAll("[role=menuitem]")].map((x) =>
      x.textContent.trim(),
    );
    assert.deepEqual(labels, ["Run now", "Pause", "Delete"]);
  },
);
domTest(
  "custom schedule dropdown preserves editor nodes and selects checked option",
  async () => {
    const { root, c } = setup();
    await c.action("select", { id: "reading" });
    const prompt = root.querySelector("[name=prompt]"),
      trigger = root.querySelector("[data-field=frequency]");
    await c.action("select-menu", { ...trigger.dataset, x: "500", y: "400" });
    assert.ok(root.querySelector(".field-popover"));
    assert.ok(root.querySelector("[role=menuitemradio][aria-checked=true]"));
    await c.action("select-option", { field: "frequency", value: "weekly" });
    assert.equal(c.state.draft.schedule.frequency, "weekly");
    assert.equal(root.querySelector(".field-popover"), null);
    assert.equal(root.querySelector("[name=prompt]"), prompt);
  },
);
domTest(
  "pane close clears outlet contents but retains animated shell for 500 ms",
  async () => {
    const { root, c, r } = setup();
    await c.action("select", { id: "reading" });
    const pane = root.querySelector(".detail-panel");
    const animations = [];
    pane.animate = (frames, options) => animations.push({ frames, options });
    const cleanup = [];
    r.motion = true;
    r.schedule = (fn, ms) => cleanup.push({ fn, ms });
    await c.action("close");
    assert.ok(root.querySelector(".detail-panel.exiting"));
    assert.equal(pane.querySelector(".panel-frame").childNodes.length, 0);
    assert.equal(animations.at(-1).options.duration, 500);
    assert.equal(cleanup.at(-1).ms, 500);
    cleanup.at(-1).fn();
    assert.equal(root.querySelector(".detail-panel"), null);
  },
);
domTest(
  "native suggestions exclude exact existing name and prompt matches",
  async () => {
    const { root, c } = setup();
    await c.action("filter", { filter: "all" });
    const names = [
      ...root.querySelectorAll(".suggestion-row .suggestion-name"),
    ].map((x) => x.textContent);
    assert.deepEqual(names, ["Follow-up monitor"]);
  },
);
domTest(
  "rapid close/reopen/close cancels the stale unmount and reverses from current width",
  async () => {
    const { root, c, r } = setup();
    await c.action("select", { id: "reading" });
    const pane = root.querySelector(".detail-panel"),
      animations = [],
      timers = [];
    pane.getBoundingClientRect = () => ({ width: 214, x: 1066, y: 0 });
    pane.animate = (frames, options) => animations.push({ frames, options });
    r.motion = true;
    r.schedule = (fn, ms) => timers.push({ fn, ms });
    await c.action("close");
    await c.action("select", { id: "reading" });
    assert.equal(root.querySelector(".detail-panel"), pane);
    assert.equal(animations.at(-1).frames[0].width, "214px");
    await c.action("close");
    timers[0].fn();
    assert.ok(root.querySelector(".detail-panel"));
    timers.at(-1).fn();
    assert.equal(root.querySelector(".detail-panel"), null);
  },
);
domTest(
  "motion-enabled first pane mount has a defined zero-width starting state",
  async () => {
    const { root, c, r } = setup();
    root.querySelector("[data-layout]").getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      width: 768,
      height: 800,
    });
    r.motion = true;
    await c.action("select", { id: "reading" });
    assert.ok(root.querySelector(".detail-panel"));
    assert.equal(
      root.querySelector(".detail-panel").classList.contains("exiting"),
      false,
    );
  },
);
