import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let parseHTML;
try {
  ({ parseHTML } = require("linkedom"));
} catch {}
const domTest = parseHTML ? test : test.skip;
domTest(
  "actual browser adapter wires create, input and menu events without replacing focused nodes",
  async () => {
    const { window, document } = parseHTML(
      '<html><head></head><body><div id="app"></div></body></html>',
    );
    const restore = new Map();
    const set = (key, value) => {
      restore.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, {
        value,
        writable: true,
        configurable: true,
      });
    };
    set("window", window);
    set("document", document);
    set("location", new URL("http://localhost/?demo"));
    set("CSS", { escape: (x) => x });
    set("matchMedia", () => ({ matches: true }));
    set("requestAnimationFrame", (fn) => setTimeout(fn, 0));
    try {
      await import("../src/app.mjs?dom-test");
      const root = document.getElementById("app");
      root
        .querySelector("[data-action=new]")
        .dispatchEvent(
          new window.Event("click", { bubbles: true, cancelable: true }),
        );
      await Promise.resolve();
      const title = root.querySelector("[name=title]"),
        panel = root.querySelector(".detail-panel");
      assert.ok(title);
      title.value = "From event";
      title.dispatchEvent(new window.Event("input", { bubbles: true }));
      assert.equal(window.scheduledDemo.state.draft.title, "From event");
      assert.equal(root.querySelector("[name=title]"), title);
      assert.equal(root.querySelector(".detail-panel"), panel);
      assert.equal(root.querySelector("[data-action=create-menu]"), null);
      window.scheduledDemo.close();
      root
        .querySelector("[data-action=create-menu]")
        .dispatchEvent(
          new window.Event("click", { bubbles: true, cancelable: true }),
        );
      await Promise.resolve();
      assert.ok(root.querySelector(".create-popover"));
      assert.match(
        root.querySelector(".create-popover").textContent,
        /Set up manually/,
      );
      assert.equal(root.querySelector("[data-action=guided]").disabled, true);
    } finally {
      for (const [key, descriptor] of restore) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    }
  },
);
