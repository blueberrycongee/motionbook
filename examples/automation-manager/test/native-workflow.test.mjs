import test from "node:test";
import assert from "node:assert/strict";
import {
  nativeTimeline,
  NATIVE_DURATION,
  NATIVE_FPS,
} from "../scripts/native-workflow-timeline.mjs";
test("full native workflow creates, pauses, cancels deletion, then deletes the actual new task", async () => {
  const scenes = await nativeTimeline();
  const created = scenes.find((s) => s.action === "created local task"),
    id = created.state.selected;
  assert.ok(id);
  assert.ok(
    scenes
      .find((s) => s.action === "cancel deletion")
      .state.tasks.some((t) => t.id === id),
  );
  assert.ok(
    !scenes
      .find((s) => s.action === "confirmed local deletion")
      .state.tasks.some((t) => t.id === id),
  );
  assert.equal(scenes.at(-1).state.tasks.length, 3);
  assert.equal(scenes.at(-1).state.draft, null);
  assert.equal(scenes.at(-1).state.modal, null);
  assert.equal(scenes.at(-1).state.menu, null);
  assert.equal(NATIVE_DURATION * NATIVE_FPS, 2040);
});
test("native source profile excludes yearly and one-time from normal Repeat choices", async () => {
  const { Controller } = await import("../src/controller.mjs"),
    { view } = await import("../src/view.mjs");
  const c = new Controller();
  await c.action("select", { id: "reading" });
  const html = view(c.state);
  assert.ok(!html.includes("&quot;yearly&quot;"));
  assert.ok(!html.includes("&quot;once&quot;"));
  assert.ok(!html.includes("End repeat"));
  await c.action("select", { id: "daily-brief" });
  assert.match(view(c.state), /End repeat/);
});
