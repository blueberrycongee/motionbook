import test from "node:test";
import assert from "node:assert/strict";
import { nativeScheduledBranch as route } from "../src/branch-selector.mjs";
test("native true selector uses landing and false selector uses automations layout", () => {
  assert.equal(route({ feature3085093835: true }).view, "ScheduledLanding");
  assert.equal(
    route({ feature3085093835: false }).view,
    "AutomationsLayoutPage",
  );
});
test("native compiled platform path never selects browser-only ScheduledTasksPage", () => {
  for (const modern of [false, true])
    for (const config of [false, true])
      for (const view of [null, "manage"])
        assert.notEqual(
          route({ feature3085093835: modern, feature4283773748: config, view })
            .view,
          "ScheduledTasksPage",
        );
});
test("manage/shared routes bypass landing and old URL redirects when enabled", () => {
  assert.equal(
    route({ feature3085093835: true, view: "manage" }).view,
    "AutomationsLayoutPage",
  );
  assert.equal(
    route({ feature3085093835: true, sharedTask: true }).view,
    "AutomationsLayoutPage",
  );
  assert.equal(
    route({ feature3085093835: true, path: "/automations" }).redirect,
    "/scheduled",
  );
});
test("unsupported auth suppresses modern selector; configuration flag remains independent", () => {
  const value = route({
    feature3085093835: true,
    unsupportedAuth: true,
    feature4283773748: true,
  });
  assert.equal(value.view, "AutomationsLayoutPage");
  assert.equal(value.configuration, true);
});
test("unknown account evaluations are not confused with shipped fallback", () => {
  const value = route();
  assert.equal(value.view, "unresolved");
  assert.equal(value.shippedMissingEvaluationFallback, "AutomationsLayoutPage");
});
import {
  platformGuardForInspectedBuild,
  sourceFeatureSelector,
  browserOnlyWrappedSubexpression,
} from "../src/branch-selector.mjs";
test("compiled platform guard rejects browser-only props and accepts electron props", () => {
  assert.equal(platformGuardForInspectedBuild({ browser: true }), false);
  assert.equal(
    platformGuardForInspectedBuild({ chromeExtension: true }),
    false,
  );
  assert.equal(platformGuardForInspectedBuild({ extension: true }), false);
  assert.equal(platformGuardForInspectedBuild({ electron: true }), true);
  assert.equal(
    platformGuardForInspectedBuild({ browser: true, electron: true }),
    true,
  );
});
test("source feature selector excludes only unsupported-auth denial after gate is true", () => {
  const states = [
    { status: "allowed" },
    { status: "loading" },
    { status: "denied", reason: "not-entitled" },
    { status: "denied", reason: "unsupported-auth" },
  ];
  for (const gate of [false, true])
    for (const auth of states)
      assert.equal(
        sourceFeatureSelector(gate, auth),
        gate && auth.reason !== "unsupported-auth",
      );
});
test("source redirects /automations before evaluating capability denial or loading", () => {
  assert.equal(
    route({
      feature3085093835: true,
      path: "/automations",
      localCapability: false,
      cloudCapability: false,
    }).view,
    "redirect",
  );
  assert.equal(
    route({
      feature3085093835: true,
      localCapability: false,
      cloudCapability: false,
    }).view,
    "unavailable",
  );
  assert.equal(
    route({
      feature3085093835: false,
      localCapability: false,
      cloudCapability: false,
      capabilitiesLoading: true,
    }).view,
    "loading",
  );
});
test("browser-only inner logic is distinct and does not contaminate native selection", () => {
  for (const mode of ["work", "codex"])
    for (const configuration of [false, true])
      for (const creating of [false, true]) {
        const expected =
          mode === "work" && (!creating || configuration)
            ? "ScheduledTasksPage"
            : "AutomationsLayoutPage";
        assert.equal(
          browserOnlyWrappedSubexpression({ mode, configuration, creating })
            .view,
          expected,
        );
        assert.equal(
          route({
            feature3085093835: false,
            feature4283773748: configuration,
            creating,
          }).view,
          "AutomationsLayoutPage",
        );
      }
  assert.equal(
    browserOnlyWrappedSubexpression({ mode: "codex", sharedTask: true }).view,
    "ScheduledTasksPage",
  );
});
test("native normal/manage/shared combinations match the stable selector truth table", () => {
  let cases = 0;
  for (const gate of [false, true])
    for (const unsupportedAuth of [false, true])
      for (const view of [null, "manage"])
        for (const sharedTask of [false, true])
          for (const shareDialog of [false, true]) {
            const expected =
              gate &&
              !unsupportedAuth &&
              view !== "manage" &&
              !sharedTask &&
              !shareDialog
                ? "ScheduledLanding"
                : "AutomationsLayoutPage";
            assert.equal(
              route({
                feature3085093835: gate,
                unsupportedAuth,
                view,
                sharedTask,
                shareDialog,
              }).view,
              expected,
            );
            cases++;
          }
  assert.equal(cases, 32);
});
