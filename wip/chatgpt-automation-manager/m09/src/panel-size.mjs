/** Native regular-pane contract. Storage and user resizing belong to this independent demo. */
export const PANEL = {
  defaultWidth: 600,
  minimum: 320,
  mainMinimum: 352,
  keyboardStep: 10,
};
export const panelMaximum = (viewport) =>
  Math.max(PANEL.minimum, viewport - PANEL.mainMinimum);
export function clampPanelWidth(width, viewport) {
  const value = Number.isFinite(width) ? width : PANEL.defaultWidth;
  return Math.max(PANEL.minimum, Math.min(value, panelMaximum(viewport)));
}
export function panelKeyWidth(current, key, viewport) {
  const next =
    key === "ArrowLeft"
      ? current + 10
      : key === "ArrowRight"
        ? current - 10
        : key === "Home"
          ? 320
          : key === "End"
            ? panelMaximum(viewport)
            : null;
  return next === null ? null : clampPanelWidth(next, viewport);
}
export class PanelSizer {
  constructor(
    root,
    {
      storage = null,
      viewport = () => root.ownerDocument.defaultView.innerWidth || 1280,
    } = {},
  ) {
    this.root = root;
    this.storage = storage;
    this.viewport = viewport;
    let saved;
    try {
      saved = Number(storage?.getItem("scheduled-study-panel-width"));
    } catch {}
    this.width = clampPanelWidth(saved > 0 ? saved : 600, viewport());
    this.apply();
  }
  apply() {
    this.width = clampPanelWidth(this.width, this.viewport());
    this.root.style.setProperty("--panel", `${this.width}px`);
    const handle = this.root.querySelector(".panel-resizer");
    if (handle) {
      handle.setAttribute("aria-valuenow", String(this.width));
      handle.setAttribute("aria-valuemin", "320");
      handle.setAttribute(
        "aria-valuemax",
        String(panelMaximum(this.viewport())),
      );
    }
  }
  set(width, persist = false) {
    this.width = clampPanelWidth(width, this.viewport());
    this.apply();
    if (persist)
      try {
        this.storage?.setItem(
          "scheduled-study-panel-width",
          String(this.width),
        );
      } catch {}
  }
  bind() {
    const root = this.root,
      win = root.ownerDocument.defaultView;
    root.addEventListener("pointerdown", (e) => {
      if (!e.target.closest(".panel-resizer")) return;
      e.preventDefault();
      this.drag = { x: e.clientX, width: this.width, id: e.pointerId };
      e.target.setPointerCapture?.(e.pointerId);
      root.classList.add("resizing-panel");
    });
    win.addEventListener("pointermove", (e) => {
      if (this.drag?.id !== e.pointerId) return;
      this.set(this.drag.width + this.drag.x - e.clientX);
    });
    const end = (e) => {
      if (this.drag?.id !== e.pointerId) return;
      this.drag = null;
      root.classList.remove("resizing-panel");
      this.set(this.width, true);
    };
    win.addEventListener("pointerup", end);
    win.addEventListener("pointercancel", end);
    root.addEventListener("keydown", (e) => {
      if (!e.target.closest(".panel-resizer")) return;
      const width = panelKeyWidth(this.width, e.key, this.viewport());
      if (width === null) return;
      e.preventDefault();
      e.stopPropagation();
      this.set(width, true);
    });
    root.addEventListener("dblclick", (e) => {
      if (e.target.closest(".panel-resizer")) this.set(600, true);
    });
    win.addEventListener("resize", () => this.apply());
    return this;
  }
}
