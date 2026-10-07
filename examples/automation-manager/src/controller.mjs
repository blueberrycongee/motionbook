import {
  TaskStore,
  defaultSchedule,
  seedTasks,
  clone,
  isoDay,
  zonedParts,
  validateTask,
} from "./model.mjs";
import { toRRule, fromRRule } from "./rrule.mjs";
export class Controller {
  constructor({
    clock = () => Date.now(),
    storage = null,
    id,
    delay = (ms) => new Promise((r) => setTimeout(r, ms)),
    zone = "UTC",
    setTimer = setTimeout,
    clearTimer = clearTimeout,
  } = {}) {
    this.clock = clock;
    this.delay = delay;
    this.zone = zone;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.draftRevision = 0;
    this.autoTimer = null;
    this.autoPending = null;
    this.store = new TaskStore({
      tasks: seedTasks(clock()),
      clock,
      storage,
      id,
    });
    this.store.restore();
    this.state = {
      tasks: this.store.tasks,
      now: clock(),
      filter: "active",
      search: "",
      selected: null,
      draft: null,
      dirty: false,
      menu: null,
      modal: null,
      errors: {},
      toast: null,
      saving: false,
      deleting: false,
      autoSaving: false,
      result: null,
      historyLimit: 25,
      rule: "",
      ruleError: null,
      copied: false,
      zones: [
        ...new Set([
          zone,
          "UTC",
          "America/Los_Angeles",
          "America/New_York",
          "Europe/London",
          "Europe/Paris",
          "Asia/Shanghai",
          "Asia/Tokyo",
          "Asia/Kolkata",
          "Australia/Sydney",
        ]),
      ],
    };
    this.onChange = () => {};
    this.store.subscribe(() => {
      this.state.tasks = this.store.tasks;
      this.emit();
    });
  }
  emit() {
    this.state.now = this.clock();
    this.onChange(this.state);
  }
  toast(text) {
    this.state.toast = text;
    this.emit();
  }
  close() {
    if (this.autoTimer != null) this.clearTimer(this.autoTimer);
    this.autoTimer = null;
    this.saveToken = (this.saveToken || 0) + 1;
    this.state.saving = false;
    Object.assign(this.state, {
      selected: null,
      draft: null,
      dirty: false,
      errors: {},
      menu: null,
      modal: null,
      result: null,
    });
    this.emit();
  }
  navigate(action) {
    const navigationToken = (this.navigationToken =
      (this.navigationToken || 0) + 1);
    if (
      this.state.dirty &&
      this.state.selected &&
      this.state.draft?.executor === "local" &&
      Object.keys(
        validateTask(this.state.draft, this.clock(), { allowPastOnce: true }),
      ).length === 0
    ) {
      return this.flushAutoSave().then((ok) => {
        if (navigationToken !== this.navigationToken) return false;
        if (ok) this.performNavigation(action);
        else {
          this.state.modal = { kind: "discard", next: action };
          this.emit();
        }
        return ok;
      });
    }
    if (this.state.dirty) {
      this.state.modal = { kind: "discard", next: action };
      this.emit();
      return false;
    }
    this.performNavigation(action);
    return true;
  }
  performNavigation(action) {
    this.saveToken = (this.saveToken || 0) + 1;
    this.state.saving = false;
    this.state.modal = null;
    this.state.menu = null;
    this.state.errors = {};
    this.state.result = null;
    this.state.historyLimit = 25;
    if (action.type === "close") {
      this.close();
      return;
    }
    if (action.type === "template") {
      this.performNavigation({ type: "new" });
      this.applyTemplate(action.template);
      return;
    }
    if (action.type === "new") {
      this.state.selected = null;
      this.state.draft = {
        title: "",
        prompt: "",
        schedule: defaultSchedule(this.clock(), this.zone),
        notifications: "important",
        executor: "local",
        project: "none",
        model: "default",
        reasoning: "medium",
        runTarget: "new",
      };
      this.state.dirty = false;
    }
    if (action.type === "select") {
      const t = this.store.get(action.id);
      if (!t) {
        this.close();
        return;
      }
      this.state.selected = t.id;
      this.state.draft = clone(t);
      this.state.dirty = false;
    }
    this.emit();
  }
  field(name, value) {
    if (this.state.saving) {
      this.emit();
      return;
    }
    if (name === "search") {
      this.state.search = value;
      this.emit();
      return;
    }
    if (name === "rrule") {
      this.state.rule = value;
      return;
    }
    const d = this.state.draft;
    if (!d) return;
    if (
      [
        "title",
        "prompt",
        "notifications",
        "executor",
        "project",
        "model",
        "reasoning",
        "runTarget",
      ].includes(name)
    )
      d[name] = value;
    else if (name === "weekday") d.schedule.days = [Number(value)];
    else if (name === "endMode")
      d.schedule.endDate =
        value === "never"
          ? null
          : isoDay(
              zonedParts(this.clock() + 30 * 86400000, d.schedule.timeZone),
            );
    else if (["interval", "month", "dayOfMonth"].includes(name))
      d.schedule[name] = Number(value);
    else d.schedule[name] = value;
    this.state.errors = {};
    this.state.dirty = true;
    if (
      !this.state.selected &&
      (d.schedule.frequency === "once" || d.schedule.endDate)
    )
      d.executor = "cloud";
    this.draftRevision++;
    this.queueAutoSave();
    this.emit();
  }
  queueAutoSave() {
    if (this.autoTimer != null) this.clearTimer(this.autoTimer);
    this.autoTimer = null;
    if (!this.state.selected || this.state.draft?.executor !== "local") return;
    this.autoTimer = this.setTimer(() => {
      this.autoTimer = null;
      void this.flushAutoSave();
    }, 600);
    this.autoTimer?.unref?.();
  }
  async flushAutoSave() {
    if (this.autoTimer != null) this.clearTimer(this.autoTimer);
    this.autoTimer = null;
    if (this.autoPending) {
      await this.autoPending;
      if (this.state.dirty) return this.flushAutoSave();
      return true;
    }
    const selected = this.state.selected,
      draft = this.state.draft;
    if (!selected || draft?.executor !== "local" || !this.state.dirty)
      return true;
    const errors = validateTask(draft, this.clock(), { allowPastOnce: true });
    if (Object.keys(errors).length) {
      this.state.errors = errors;
      this.emit();
      return false;
    }
    const snapshot = clone(draft),
      revision = this.draftRevision;
    this.state.autoSaving = true;
    this.emit();
    this.autoPending = (async () => {
      await this.delay(120);
      if (!this.store.get(selected)) return false;
      const result = this.store.save(snapshot);
      if (
        result.ok &&
        this.state.selected === selected &&
        this.draftRevision === revision
      ) {
        this.state.draft = clone(result.task);
        this.state.dirty = false;
        this.state.errors = {};
      }
      return result.ok;
    })();
    const ok = await this.autoPending;
    this.autoPending = null;
    this.state.autoSaving = false;
    if (this.state.dirty && this.state.selected === selected)
      this.queueAutoSave();
    this.emit();
    return ok;
  }
  async save({ quiet = false } = {}) {
    if (!this.state.draft || this.state.saving) return false;
    const token = (this.saveToken = (this.saveToken || 0) + 1);
    const draft = clone(this.state.draft),
      selected = this.state.selected;
    this.state.saving = true;
    this.emit();
    await this.delay(180);
    if (token !== this.saveToken) return false;
    if (selected && !this.store.get(selected)) {
      this.close();
      return false;
    }
    const result = this.store.save(draft);
    this.state.saving = false;
    if (!result.ok) {
      this.state.errors = result.errors;
      this.emit();
      return false;
    }
    const wasNew = !this.state.selected;
    this.state.selected = result.task.id;
    this.state.draft = clone(result.task);
    this.state.dirty = false;
    this.state.errors = {};
    if (!quiet)
      this.state.toast =
        this.store.storageError ||
        (wasNew ? "Scheduled task created" : "Changes saved");
    this.emit();
    return true;
  }
  async run(id) {
    if (this.state.saving) return;
    if (
      this.state.selected === id &&
      this.state.dirty &&
      !(await this.save({ quiet: true }))
    )
      return;
    const run = this.store.startRun(id);
    if (!run) return;
    this.state.menu = null;
    this.state.toast = "Task started";
    this.emit();
    if (this.pendingRuns?.has(run.id)) return;
    this.pendingRuns ??= new Set();
    this.pendingRuns.add(run.id);
    await this.delay(1100);
    this.store.completeRun(id, run.id);
    this.pendingRuns.delete(run.id);
    if (this.state.selected === id && !this.state.dirty)
      this.state.draft = clone(this.store.get(id));
    if (this.store.get(id)) this.state.toast = "Task completed";
    this.emit();
  }
  async action(type, data = {}) {
    const s = this.state,
      id = data.id || s.selected;
    switch (type) {
      case "new":
        return this.navigate({ type: "new" });
      case "select":
      case "edit":
        if (id === s.selected && !s.result) {
          s.menu = null;
          this.emit();
          return;
        }
        return this.navigate({ type: "select", id });
      case "close":
        return this.navigate({ type: "close" });
      case "cancel":
        if (!s.selected) return this.navigate({ type: "close" });
        s.draft = clone(this.store.get(s.selected));
        s.dirty = false;
        s.errors = {};
        break;
      case "discard": {
        const next = s.modal?.next || { type: "close" };
        s.dirty = false;
        this.performNavigation(next);
        return;
      }
      case "modal-close":
        if (s.deleting) return;
        s.modal = null;
        s.ruleError = null;
        break;
      case "backdrop":
        if (!s.deleting) {
          s.modal = null;
          this.emit();
        }
        return;
      case "save":
        return this.save();
      case "run":
        return this.run(id);
      case "day":
        if (s.draft) {
          const days = s.draft.schedule.days,
            n = Number(data.day);
          s.draft.schedule.days = days.includes(n)
            ? days.filter((d) => d !== n)
            : [...days, n].sort((a, b) => a - b);
          s.dirty = true;
          this.draftRevision++;
          this.queueAutoSave();
          s.errors = {};
        }
        break;
      case "toggle": {
        const t = this.store.get(id);
        if (t) {
          this.store.setStatus(id, t.status === "paused" ? "active" : "paused");
          if (s.selected === id && s.draft) s.draft.status = t.status;
          s.toast = t.status === "paused" ? "Task paused" : "Task resumed";
        }
        s.menu = null;
        break;
      }
      case "delete":
        s.modal = { kind: "delete", id };
        s.menu = null;
        break;
      case "confirm-delete":
        if (s.deleting) return;
        s.deleting = true;
        this.emit();
        await this.delay(180);
        this.store.delete(id);
        s.deleting = false;
        if (s.selected === id) this.close();
        s.modal = null;
        s.toast = "Scheduled task deleted";
        break;
      case "task-menu":
        s.menu =
          s.menu?.kind === "task" && s.menu.id === id
            ? null
            : { kind: "task", id, origin: data.origin || "row" };
        break;
      case "select-menu": {
        let options;
        try {
          options = JSON.parse(data.options);
        } catch {
          return;
        }
        if (!Array.isArray(options)) return;
        s.menu =
          s.menu?.kind === "select" && s.menu.field === data.field
            ? null
            : {
                kind: "select",
                field: data.field,
                value: data.value,
                options,
                x: Number(data.x),
                y: Number(data.y),
              };
        break;
      }
      case "select-option":
        this.field(data.field, data.value);
        s.menu = null;
        break;
      case "create-menu":
        s.menu = s.menu?.kind === "create" ? null : { kind: "create" };
        break;
      case "filter-menu":
        s.menu = s.menu?.kind === "filter" ? null : { kind: "filter" };
        break;
      case "filter":
        s.filter = data.filter;
        s.menu = null;
        break;
      case "clear-search":
        s.search = "";
        break;
      case "outside":
        s.menu = null;
        break;
      case "advanced":
        s.rule = toRRule(s.draft.schedule);
        s.ruleError = null;
        s.modal = { kind: "advanced" };
        break;
      case "save-rule":
        try {
          s.draft.schedule = fromRRule(s.rule, s.draft.schedule);
          s.dirty = true;
          this.draftRevision++;
          this.queueAutoSave();
          s.modal = null;
          s.errors = {};
        } catch (error) {
          s.ruleError = error.message;
        }
        break;
      case "result": {
        s.result = data.run;
        this.store.markRead(s.selected, data.run);
        break;
      }
      case "back-result":
        s.result = null;
        break;
      case "more-runs":
        s.historyLimit += 25;
        break;
      case "share":
        s.menu = null;
        s.copied = false;
        s.modal = { kind: "share", id };
        break;
      case "template":
        return this.navigate({ type: "template", template: data.template });
      case "escape":
        if (s.deleting) return;
        if (s.menu) s.menu = null;
        else if (s.modal) s.modal = null;
        else return this.navigate({ type: "close" });
        break;
      default:
        return;
    }
    this.emit();
  }
  applyTemplate(kind) {
    const s = this.state,
      d = s.draft;
    if (kind === "weekly") {
      d.title = "Weekly review";
      d.prompt =
        "Help me reflect on this week and prepare a short plan for the next one.";
      d.schedule.frequency = "weekly";
      d.schedule.days = [5];
      d.schedule.time = "16:00";
    } else if (kind === "monitor") {
      d.title = "Follow-up monitor";
      d.prompt =
        "Review recent updates and remind me about commitments that need attention.";
      d.schedule.time = "10:00";
    } else {
      d.title = "Daily brief";
      d.prompt =
        "Summarize my day, the important news, and the priorities worth focusing on.";
      d.schedule.frequency = "weekdays";
    }
    s.dirty = true;
    this.emit();
  }
  shareSnapshot(id) {
    const t = this.store.get(id);
    return t
      ? {
          title: t.title,
          prompt: t.prompt,
          schedule: clone(t.schedule),
          notifications: t.notifications || "important",
        }
      : null;
  }
}
