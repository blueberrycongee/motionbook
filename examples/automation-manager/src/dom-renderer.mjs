import { MOTION, layoutKeyframes, panelKeyframes } from "./motion-spec.mjs";
const key = (node) =>
  node.nodeType === 1
    ? node.getAttribute("data-key") ||
      node.id ||
      (node.getAttribute("name") ? "field:" + node.getAttribute("name") : null)
    : null;
const compatible = (a, b) =>
  a &&
  a.nodeType === b.nodeType &&
  (a.nodeType !== 1 || (a.tagName === b.tagName && key(a) === key(b)));
function attrs(node, next) {
  for (const attr of [...node.attributes])
    if (!next.hasAttribute(attr.name) && attr.name !== "style")
      node.removeAttribute(attr.name);
  for (const attr of [...next.attributes])
    if (node.getAttribute(attr.name) !== attr.value)
      node.setAttribute(attr.name, attr.value);
  if (node.tagName === "INPUT") {
    if (node.value !== next.value) node.value = next.value;
    node.checked = next.checked;
  }
  if (node.tagName === "TEXTAREA" && node.value !== next.textContent)
    node.value = next.textContent;
}
export class DomRenderer {
  constructor(
    root,
    { motion = true, schedule = (fn, ms) => setTimeout(fn, ms) } = {},
  ) {
    this.root = root;
    this.motion = motion;
    this.schedule = schedule;
    this.exiting = new WeakSet();
    this.removalGeneration = new WeakMap();
  }
  panelWidth() {
    return (
      Number.parseFloat(this.root.style.getPropertyValue("--panel")) || 600
    );
  }
  animatePanel(node, opening, from) {
    const width = this.panelWidth();
    const start =
      from ?? (opening ? 0 : node.getBoundingClientRect?.().width || width);
    node.getAnimations?.().forEach((animation) => animation.cancel());
    node.animate?.(panelKeyframes(width, opening, start), {
      duration: MOTION.panel.durationMs,
      easing: "linear",
      fill: opening ? "none" : "forwards",
    });
  }
  remove(node) {
    if (this.motion && node.nodeType === 1 && node.matches(".detail-panel")) {
      const generation = (this.removalGeneration.get(node) || 0) + 1;
      this.removalGeneration.set(node, generation);
      this.exiting.add(node);
      node.classList.add("exiting");
      node.setAttribute("inert", "");
      node.setAttribute("aria-hidden", "true");
      node.querySelector(".panel-frame")?.replaceChildren();
      this.animatePanel(node, false);
      this.schedule(() => {
        if (
          this.exiting.has(node) &&
          this.removalGeneration.get(node) === generation
        )
          node.remove();
      }, MOTION.panel.durationMs);
      return;
    }
    if (
      this.motion &&
      node.nodeType === 1 &&
      (node.matches(".popover") || node.matches(".modal-backdrop"))
    ) {
      this.exiting.add(node);
      node.classList.add("exiting");
      node.setAttribute("aria-hidden", "true");
      node.setAttribute("inert", "");
      this.schedule(() => {
        if (this.exiting.has(node)) node.remove();
      }, MOTION.menu.exitMs);
      return;
    }
    node.remove();
  }
  patch(node, next) {
    if (node.nodeType === 3) {
      if (node.nodeValue !== next.nodeValue) node.nodeValue = next.nodeValue;
      return;
    }
    if (node.nodeType !== 1) return;
    attrs(node, next);
    if (node.tagName !== "TEXTAREA") this.children(node, next);
    if (node.tagName === "SELECT") {
      const chosen = next.querySelector("option[selected]");
      if (chosen)
        for (const option of node.querySelectorAll("option"))
          option.selected = option.value === chosen.value;
    }
  }
  children(parent, nextParent) {
    let cursor = parent.firstChild;
    for (const next of [...nextParent.childNodes]) {
      while (cursor && this.exiting.has(cursor)) cursor = cursor.nextSibling;
      let existing = cursor;
      if (!compatible(existing, next)) {
        const k = key(next);
        existing = k
          ? [...parent.childNodes].find(
              (n) =>
                (!this.exiting.has(n) || n.matches?.(".detail-panel")) &&
                key(n) === k &&
                compatible(n, next),
            )
          : null;
        if (existing) {
          if (this.exiting.has(existing)) {
            const currentWidth = existing.getBoundingClientRect?.().width || 0;
            this.removalGeneration.set(
              existing,
              (this.removalGeneration.get(existing) || 0) + 1,
            );
            this.exiting.delete(existing);
            existing.classList.remove("exiting");
            existing.removeAttribute("inert");
            existing.removeAttribute("aria-hidden");
            this.animatePanel(existing, true, currentWidth);
          }
          parent.insertBefore(existing, cursor);
        } else {
          existing = next.cloneNode(true);
          parent.insertBefore(existing, cursor);
          if (this.motion && existing.matches?.(".detail-panel"))
            this.animatePanel(existing, true);
        }
      }
      this.patch(existing, next);
      cursor = existing.nextSibling;
    }
    while (cursor) {
      const next = cursor.nextSibling;
      if (!this.exiting.has(cursor)) this.remove(cursor);
      cursor = next;
    }
  }
  render(html) {
    const previous = new Map();
    const hadPanel = !!this.root.querySelector(".detail-panel:not(.exiting)");
    if (this.motion)
      for (const el of this.root.querySelectorAll("[data-layout]"))
        previous.set(key(el), el.getBoundingClientRect());
    const template = this.root.ownerDocument.createElement("template");
    template.innerHTML = html;
    this.children(this.root, template.content);
    if (
      this.motion &&
      hadPanel === !!this.root.querySelector(".detail-panel:not(.exiting)")
    )
      for (const el of this.root.querySelectorAll("[data-layout]")) {
        const before = previous.get(key(el));
        if (!before) continue;
        el.getAnimations?.().forEach((a) => a.cancel());
        const after = el.getBoundingClientRect(),
          dx = before.x - after.x,
          dy = before.y - after.y;
        if (Math.abs(dx) + Math.abs(dy) > 0.5 && el.animate) {
          el.animate(layoutKeyframes(dx, dy), {
            duration: MOTION.layout.durationMs,
            easing: "linear",
          });
        }
      }
  }
}
