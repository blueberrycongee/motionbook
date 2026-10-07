import { alignmentCss } from "./alignment-spec.mjs";
import { PanelSizer } from "./panel-size.mjs";
import { Controller } from "./controller.mjs";
import { view } from "./view.mjs";
import { DomRenderer } from "./dom-renderer.mjs";
import { motionCss } from "./motion-spec.mjs";
import { TooltipController } from "./tooltips.mjs";
import { validateTask, defaultSchedule } from "./model.mjs";
const root = document.getElementById("app");
const motionStyle = document.createElement("style");
motionStyle.textContent = motionCss() + alignmentCss();
document.head.append(motionStyle);
new TooltipController(root).bind();
const renderer = new DomRenderer(root, {
  motion: !matchMedia("(prefers-reduced-motion: reduce)").matches,
});
let panelSizer;
let storage = null;
try {
  storage = localStorage;
} catch {}
panelSizer = new PanelSizer(root, { storage }).bind();
const demo = new URLSearchParams(location.search).has("demo");
const controller = new Controller({
  storage: demo ? null : storage,
  zone: demo ? "UTC" : Intl.DateTimeFormat().resolvedOptions().timeZone,
  clock: demo ? () => Date.parse("2026-10-06T08:00:00Z") : () => Date.now(),
});
let toastTimer,
  previousToast,
  previousModal,
  previousPanelKey,
  modalReturnFocus,
  lastMenuTrigger,
  previousMenu;
function render(state) {
  const active = document.activeElement;
  const focus = active?.id
    ? { selector: "#" + CSS.escape(active.id) }
    : active?.name
      ? { selector: `[name="${CSS.escape(active.name)}"]` }
      : null;
  if (focus) {
    try {
      focus.start = active.selectionStart;
      focus.end = active.selectionEnd;
    } catch {}
  }
  const panelKey = `${state.selected || "new"}:${state.result || "editor"}`;
  const scroll =
    panelKey === previousPanelKey
      ? root.querySelector(".panel-body")?.scrollTop || 0
      : 0;
  if (state.modal && !previousModal) modalReturnFocus = active;
  renderer.render(view(state));
  panelSizer.apply();
  if (state.menu?.kind === "select" && state.menu !== previousMenu)
    root
      .querySelector(".field-popover [aria-checked=true]")
      ?.scrollIntoView?.({ block: "nearest" });
  const panel = root.querySelector(".panel-body");
  if (panel) panel.scrollTop = scroll;
  if (focus) {
    const el = root.querySelector(focus.selector);
    el?.focus({ preventScroll: true });
    if (el && focus.start != null) {
      try {
        el.setSelectionRange(focus.start, focus.end);
      } catch {}
    }
  }
  if (state.modal && !previousModal) root.querySelector(".modal")?.focus();
  if (!state.modal && previousModal && modalReturnFocus?.isConnected)
    modalReturnFocus.focus?.({ preventScroll: true });
  if (
    !state.menu &&
    previousMenu &&
    lastMenuTrigger?.isConnected &&
    active?.closest?.(".popover")
  )
    lastMenuTrigger.focus?.({ preventScroll: true });
  previousMenu = state.menu;
  previousPanelKey = panelKey;
  previousModal = state.modal?.kind || null;
  if (state.toast && state.toast !== previousToast) {
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      controller.state.toast = null;
      controller.emit();
    }, 2300);
  }
  previousToast = state.toast;
}
controller.onChange = render;
render(controller.state);
root.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-action]");
  if (!b) {
    if (controller.state.menu && !e.target.closest(".popover"))
      controller.action("outside");
    return;
  }
  if (b.disabled) return;
  const action = b.dataset.action;
  if (action === "backdrop" && e.target !== b) return;
  if (
    ["task-menu", "filter-menu", "create-menu", "select-menu"].includes(action)
  )
    lastMenuTrigger = b;
  e.preventDefault();
  if (action === "copy-share") {
    const snapshot = controller.shareSnapshot(b.dataset.id);
    if (!snapshot) return;
    const data = btoa(unescape(encodeURIComponent(JSON.stringify(snapshot))));
    const url = new URL(location.href);
    url.hash = "task=" + data;
    try {
      await navigator.clipboard.writeText(url.href);
      controller.state.copied = true;
      controller.emit();
    } catch {
      controller.toast("Could not copy link");
    }
    return;
  }
  let actionData = b.dataset;
  if (action === "select-menu") {
    const rect = b.getBoundingClientRect();
    let count = 4;
    try {
      count = JSON.parse(b.dataset.options).length;
    } catch {}
    const height = Math.min(272, count * 30 + 8);
    actionData = {
      ...b.dataset,
      x: Math.max(8, Math.min(innerWidth - 228, rect.right - 220)),
      y:
        rect.bottom + height + 4 > innerHeight
          ? Math.max(8, rect.top - height - 4)
          : rect.bottom + 4,
    };
  }
  await controller.action(action, actionData);
  if (action === "new" && controller.state.draft && !controller.state.selected)
    root.querySelector("[name=title]")?.focus();
});
root.addEventListener("pointerdown", (e) => {
  if (
    e.defaultPrevented ||
    controller.state.modal ||
    controller.state.menu ||
    !controller.state.draft
  )
    return;
  const main = e.target.closest("[data-scheduled-tasks-main]");
  if (
    main &&
    !e.target.closest("[data-automation-list],.list-toolbar,.application-toolbar,.search-toolbar,.page-navigation,.suggestions")
  )
    controller.action("close");
});
window.addEventListener("beforeunload", (e) => {
  if (controller.state.dirty) {
    e.preventDefault();
    e.returnValue = "";
  }
});
root.addEventListener("input", (e) => {
  if (e.target.id === "search") controller.field("search", e.target.value);
  else if (e.target.name && e.target.tagName !== "SELECT")
    controller.field(e.target.name, e.target.value);
});
root.addEventListener("change", (e) => {
  if (e.target.tagName === "SELECT")
    controller.field(e.target.name, e.target.value);
});
root.addEventListener("submit", (e) => {
  e.preventDefault();
  controller.save();
});
document.addEventListener("keydown", (e) => {
  if (e.defaultPrevented) return;
  if (e.key === "Escape") {
    e.preventDefault();
    controller.action("escape");
  }
  if ((e.metaKey || e.ctrlKey) && e.key === "s" && controller.state.draft) {
    e.preventDefault();
    controller.save();
  }
  const modal = root.querySelector(".modal");
  if (e.key === "Tab" && modal) {
    const items = [
      ...modal.querySelectorAll("button,input,textarea,select"),
    ].filter((x) => !x.disabled);
    if (!items.length) return;
    const first = items[0],
      last = items.at(-1);
    if (
      e.shiftKey &&
      (document.activeElement === first || document.activeElement === modal)
    ) {
      e.preventDefault();
      last.focus();
    } else if (
      !e.shiftKey &&
      (document.activeElement === last || document.activeElement === modal)
    ) {
      e.preventDefault();
      first.focus();
    }
  }
  const menu = root.querySelector(".popover:not(.exiting)");
  if (menu && ["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
    e.preventDefault();
    const items = [...menu.querySelectorAll("button")].filter(
      (x) => !x.disabled,
    );
    const i = items.indexOf(document.activeElement);
    items[
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? items.length - 1
          : i < 0
            ? e.key === "ArrowDown"
              ? 0
              : items.length - 1
            : (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) %
              items.length
    ]?.focus();
  }
});
if (location.hash.startsWith("#task=")) {
  try {
    if (location.hash.length > 18000) throw Error("Invalid shared task");
    const shared = JSON.parse(
      decodeURIComponent(escape(atob(location.hash.slice(6)))),
    );
    const draft = {
      title: String(shared.title || ""),
      prompt: String(shared.prompt || ""),
      schedule: { ...defaultSchedule(), ...shared.schedule },
      notifications: "important",
    };
    if (Object.keys(validateTask(draft)).length)
      throw Error("Invalid shared task");
    controller.performNavigation({ type: "new" });
    controller.state.draft = draft;
    controller.state.dirty = true;
    controller.emit();
  } catch {
    controller.toast("This shared task could not be opened");
  }
}
if (demo) window.scheduledDemo = controller;
