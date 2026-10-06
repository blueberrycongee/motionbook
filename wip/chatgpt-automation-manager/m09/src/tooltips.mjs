/** Simple non-interactive tooltip path. Source default delay 200 ms, fixed-anchor offset 2 px. */
export class TooltipController {
  constructor(
    root,
    { delay = 200, setTimer = setTimeout, clearTimer = clearTimeout } = {},
  ) {
    this.root = root;
    this.delay = delay;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.target = null;
    this.timer = null;
    this.bubble = null;
    this.clicked = false;
  }
  hide() {
    if (this.timer != null) this.clearTimer(this.timer);
    this.timer = null;
    this.bubble?.remove();
    this.bubble = null;
  }
  enter(target, { keyboard = false } = {}) {
    if (this.target === target && (this.timer || this.bubble || this.clicked))
      return;
    this.hide();
    this.target = target;
    this.clicked = false;
    if (!target || target.disabled) return;
    const open = () => {
      this.timer = null;
      const text = target.getAttribute("data-tooltip");
      if (!text || !target.isConnected) return;
      const el = this.root.ownerDocument.createElement("div");
      el.className = "app-tooltip";
      el.setAttribute("role", "tooltip");
      el.textContent = text;
      this.root.ownerDocument.body.append(el);
      this.bubble = el;
      const a = target.getBoundingClientRect(),
        b = el.getBoundingClientRect(),
        w = this.root.ownerDocument.defaultView.innerWidth;
      el.style.left =
        Math.min(
          w - b.width - 8,
          Math.max(8, a.x + a.width / 2 - b.width / 2),
        ) + "px";
      el.style.top =
        (a.y - b.height - 2 < 8 ? a.bottom + 2 : a.y - b.height - 2) + "px";
    };
    if (keyboard) open();
    else this.timer = this.setTimer(open, this.delay);
  }
  leave() {
    this.hide();
    this.target = null;
    this.clicked = false;
  }
  bind() {
    this.root.addEventListener("pointerover", (e) => {
      if (e.pointerType === "touch") return;
      this.enter(e.target.closest("[data-tooltip]"));
    });
    this.root.addEventListener("pointerout", (e) => {
      if (!this.target?.contains(e.relatedTarget)) this.leave();
    });
    this.root.addEventListener("focusin", (e) => {
      if (e.target.matches?.(":focus-visible"))
        this.enter(e.target.closest("[data-tooltip]"), { keyboard: true });
    });
    this.root.addEventListener("focusout", () => this.leave());
    this.root.addEventListener("pointerdown", () => {
      this.hide();
      this.clicked = true;
    });
    this.root.ownerDocument.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.leave();
    });
    this.root.ownerDocument.defaultView.addEventListener("blur", () =>
      this.leave(),
    );
    return this;
  }
}
