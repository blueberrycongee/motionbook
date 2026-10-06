import { icon } from "./icons.mjs";
import { filterTasks, scheduleLabel, nextRun, DAY_NAMES } from "./model.mjs";
export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const btn = (action, label, ico, extra = "") =>
  `<button class="icon-button" data-action="${action}" aria-label="${esc(label)}" data-tooltip="${esc(label)}" ${extra}>${icon(ico)}</button>`;
const option = (value, label, current) =>
  `<option value="${value}" ${value === current ? "selected" : ""}>${label}</option>`;
const row = (label, control) =>
  `<div class="setting-row"><span>${label}</span>${control}</div>`;
const select = (name, options, value) => {
  const label = options.find((option) => option[0] === value)?.[1] || value;
  return `<span class="select-wrap"><button type="button" class="select-trigger" data-action="select-menu" data-field="${name}" data-options="${esc(JSON.stringify(options))}" data-value="${esc(value)}" aria-label="${name === "frequency" ? "Repeat" : name}" aria-haspopup="menu"><span>${esc(label)}</span>${icon("chevron", 16)}</button></span>`;
};
const timeOptions = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4),
    minute = (i % 4) * 15;
  return [
    `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`,
  ];
});
const timeControl = (value) =>
  `<span class="time-input"><input type="time" name="time" aria-label="Time" value="${esc(value)}"><button type="button" data-action="select-menu" data-field="time" data-options="${esc(JSON.stringify(timeOptions))}" data-value="${esc(value)}" aria-label="Choose time" aria-haspopup="menu">${icon("chevron", 14)}</button></span>`;
const error = (s, key) =>
  s.errors?.[key]
    ? `<span class="field-error" role="alert">${esc(s.errors[key])}</span>`
    : "";
export const templates = [
  {
    key: "daily",
    title: "Daily brief",
    prompt:
      "Summarize my day, the important news, and the priorities worth focusing on.",
    description: "Start each weekday with a focused plan for the day",
    icon: "sun",
    time: "Weekdays, 9:00 AM",
  },
  {
    key: "weekly",
    title: "Weekly review",
    prompt:
      "Help me reflect on this week and prepare a short plan for the next one.",
    description: "Reflect on your recent work and plan the week ahead",
    icon: "review",
    time: "Fridays, 4:00 PM",
  },
  {
    key: "monitor",
    title: "Follow-up monitor",
    prompt:
      "Review recent updates and remind me about commitments that need attention.",
    description: "Keep track of important updates and upcoming commitments",
    icon: "monitor",
    time: "Every day, 10:00 AM",
  },
];
export const availableTemplates = (s) =>
  templates.filter(
    (template) =>
      !s.tasks.some(
        (task) =>
          task.title === template.title && task.prompt === template.prompt,
      ),
  );
function runDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}
function relativeRun(task, now) {
  const stamp = nextRun(task, now);
  if (!stamp) return "";
  const minutes = Math.max(1, Math.round((Date.parse(stamp) - now) / 60000));
  return minutes < 60
    ? `Next run in ${minutes} min`
    : minutes < 1440
      ? `Next run in ${Math.round(minutes / 60)} hours`
      : `Next run in ${Math.round(minutes / 1440)} days`;
}
function taskRow(t, s) {
  const running = t.runs.some((r) => r.status === "running");
  const sub =
    t.status === "completed" ? "Completed" : scheduleLabel(t.schedule);
  const next = t.status === "active" ? relativeRun(t, s.now) : "";
  const statusAction = t.status === "paused" ? "Resume" : "Pause";
  return `<div class="task-row ${s.selected === t.id ? "selected" : ""} ${s.hover === t.id ? "demo-hover" : ""} ${t.status === "paused" ? "paused-row" : ""} ${s.menu?.id === t.id ? "menu-open" : ""}" data-key="task-${esc(t.id)}" role="listitem" data-id="${esc(t.id)}"><button class="row-main" data-action="select" data-id="${esc(t.id)}" aria-label="${esc(t.title)}"><span class="row-copy"><span class="row-title">${esc(t.title)}</span><span class="row-subtitle">${esc(sub)}${running ? " · In progress" : next ? " · " + esc(next) : ""}</span></span></button><button class="leading-status ${running ? "running" : ""}" data-action="toggle" data-id="${esc(t.id)}" aria-label="${statusAction}" data-tooltip="${t.status === "paused" ? "Paused" : "Active"}" ${running || t.status === "completed" ? "disabled" : ""}><span class="status-rest">${running ? '<span class="spinner"></span>' : icon(t.status === "paused" ? "play" : t.status === "completed" ? "check" : "clock", 16)}</span><span class="status-hover">${icon(t.status === "paused" ? "play" : "pause", 16)}</span></button>${t.runs.some((r) => r.unread) ? '<i class="row-unread unread-dot"></i>' : ""}<div class="row-actions">${btn("task-menu", "Scheduled task actions", "more", `data-id="${esc(t.id)}" aria-expanded="${s.menu?.id === t.id}"`)}</div>${s.menu?.kind === "task" && s.menu.id === t.id && s.menu.origin !== "panel" ? taskMenu(t, s) : ""}</div>`;
}
function taskMenu(t, s) {
  const isPanel = s.menu?.origin === "panel";
  const actions = [
    "run",
    ...(t.status === "completed" ? [] : ["toggle"]),
    ...(isPanel && t.executor !== "local" && t.status !== "completed"
      ? ["share"]
      : []),
    "delete",
  ];
  return `<div class="popover task-popover" data-key="task-menu-${esc(t.id)}" role="menu">${actions.map((action) => `<button role="menuitem" class="menu-item ${action === "delete" ? "danger" : ""}" data-action="${action}" data-id="${esc(t.id)}" ${action === "run" && t.runs.some((r) => r.status === "running") ? "disabled" : ""}>${icon(action === "run" ? "play" : action === "toggle" ? (t.status === "paused" ? "play" : "pause") : action === "delete" ? "trash" : "link", 16)}${action === "toggle" ? (t.status === "paused" ? "Resume" : "Pause") : { run: s.dirty && s.selected === t.id ? "Save and run now" : "Run now", share: "Share", delete: "Delete" }[action]}</button>`).join("")}</div>`;
}
function schedule(s) {
  const d = s.draft;
  const q = d.schedule;
  const week = ["weekly", "custom"].includes(q.frequency);
  const local = d.executor === "local";
  const frequencyOptions = [
    ["hourly", "Hourly"],
    ["daily", "Daily"],
    ["weekdays", "Weekdays"],
    ["weekly", "Weekly"],
    ...(!local ? [["monthly", "Monthly"]] : []),
    ["custom", "Custom"],
  ];
  return `<section class="panel-section"><h3>Frequency</h3><div class="settings-card">${row(
    "Repeat",
    select("frequency", frequencyOptions, q.frequency),
  )}${q.frequency === "once" ? row("Date", `<input aria-label="Date" name="date" type="date" value="${q.date}">`) : ""}${q.frequency === "hourly" ? row("Every", `<span class="inline-control"><input name="interval" type="number" min="1" max="24" aria-label="Interval hours" value="${q.interval}"><span>hours</span></span>`) : ""}${
    week && local && q.frequency === "weekly" && q.days.length <= 1
      ? row(
          "On",
          select(
            "weekday",
            [1, 2, 3, 4, 5, 6, 0].map((i) => [String(i), DAY_NAMES[i]]),
            String(q.days[0] ?? 1),
          ),
        )
      : week
        ? `<div class="days-block"><span>On</span><div class="day-buttons" role="group" aria-label="Days of the week">${[1, 2, 3, 4, 5, 6, 0].map((n) => `<button type="button" data-action="day" data-day="${n}" aria-label="${DAY_NAMES[n]}" aria-pressed="${q.days.includes(n)}" class="day-button ${q.days.includes(n) ? "chosen" : ""}">${DAY_NAMES[n].slice(0, 2)}</button>`).join("")}</div></div>`
        : ""
  }${
    q.frequency === "yearly"
      ? row(
          "Month",
          select(
            "month",
            Array.from({ length: 12 }, (_, i) => [
              String(i + 1),
              new Date(2026, i, 1).toLocaleString("en", { month: "long" }),
            ]),
            String(q.month),
          ),
        )
      : ""
  }${["monthly", "yearly"].includes(q.frequency) ? row("On", `<span class="inline-control"><span>Day</span><input name="dayOfMonth" type="number" min="1" max="31" aria-label="Day of the month" value="${q.dayOfMonth}"></span>`) : ""}${row(q.frequency === "hourly" ? "Start time" : "Time", timeControl(q.time))}${
    local
      ? row(
          "Notifications",
          select(
            "notifications",
            [
              ["important", "Important updates"],
              ["all", "All runs"],
              ["failed", "Failed runs only"],
            ],
            d.notifications || "important",
          ),
        )
      : ""
  }</div>${error(s, "date")}${error(s, "days")}${error(s, "time")}${
    !local && q.frequency !== "once"
      ? `<div class="settings-card end-card">${row(
          "End repeat",
          select(
            "endMode",
            [
              ["never", "Never"],
              ["date", "On date"],
            ],
            q.endDate ? "date" : "never",
          ),
        )}${q.endDate ? row("End date", `<input type="date" name="endDate" aria-label="End date" value="${q.endDate}">`) : ""}</div>${error(s, "endDate")}`
      : ""
  }${q.frequency === "custom" ? '<button class="text-button advanced" data-action="advanced">Edit schedule rule</button>' : ""}</section>`;
}
function details(s, isNew) {
  const d = s.draft,
    local = d.executor === "local";
  let rows = "";
  if (isNew)
    rows += row(
      "Runs on",
      select(
        "executor",
        [
          ["local", "This device"],
          ["cloud", "Cloud"],
        ],
        d.executor || "local",
      ),
    );
  if (local) {
    rows += row(
      "Runs in",
      select(
        "runTarget",
        [
          ["new", "New chat each run"],
          ["persistent", "New chat for this task"],
        ],
        d.runTarget || "new",
      ),
    );

    rows += row(
      "Project",
      select(
        "project",
        [
          ["none", "None"],
          ["sample", "Design system"],
        ],
        d.project || "none",
      ),
    );
    rows += row(
      "Model",
      select("model", [["default", "Default"]], d.model || "default"),
    );
    rows += row(
      "Reasoning",
      select(
        "reasoning",
        [
          ["low", "Low"],
          ["medium", "Medium"],
          ["high", "High"],
        ],
        d.reasoning || "medium",
      ),
    );
  } else if (!isNew)
    rows += row(
      "Runs on",
      `<span class="muted icon-label">${icon("cloud", 16)} Cloud</span>`,
    );
  return `<section class="panel-section native-details"><h3>Details</h3><div class="settings-card">${rows}</div></section>`;
}
function history(t, s) {
  if (t.executor !== "local" && !t.teamId) return "";
  return `<section class="panel-section history"><h3>Previous runs <span>${t.runs.length || ""}</span></h3>${
    t.runs.length
      ? `<div class="history-list">${t.runs
          .slice(0, s.historyLimit)
          .map(
            (r) =>
              `<button class="history-row" type="button" data-action="result" data-run="${esc(r.id)}"><span class="history-icon ${r.status}">${r.status === "running" ? '<span class="spinner"></span>' : icon(r.status === "failed" ? "close" : "check", 16)}</span><span><strong>${r.status === "running" ? "Run in progress" : r.status === "failed" ? "Could not complete task" : esc(r.title)}</strong><small>${runDate(r.createdAt)}</small></span>${r.unread ? '<i class="unread-dot"></i>' : icon("chevron", 16)}</button>`,
          )
          .join(
            "",
          )}</div>${t.runs.length > s.historyLimit ? '<button class="text-button" data-action="more-runs">Load more</button>' : ""}`
      : '<p class="empty-history">No runs yet</p>'
  }</section>`;
}
function panel(s) {
  if (!s.draft) return "";
  const d = s.draft,
    t = s.tasks.find((t) => t.id === s.selected),
    isNew = !t,
    local = d.executor === "local",
    status = t?.status || "active",
    run = s.result && t?.runs.find((r) => r.id === s.result);
  return `<aside data-key="detail-panel" class="detail-panel native-automation-panel ${local ? "local-task" : "cloud-task"}" aria-label="${isNew ? "New scheduled task" : "Scheduled task details"}"><div class="panel-resizer" role="separator" aria-orientation="vertical" aria-label="Resize workspace panes" tabindex="0"></div><div class="panel-frame"><div class="panel-toolbar"><span class="status-label ${status}">${isNew ? "New" : run ? "Scheduled run" : status === "active" ? "Active" : status === "paused" ? "Paused" : "Completed"}</span><div class="toolbar-actions">${!isNew && !run ? btn("task-menu", "Scheduled task actions", "more", `data-id="${esc(d.id)}" data-origin="panel"`) : ""}${btn("close", "Close scheduled task details", "close")}</div>${!isNew && s.menu?.kind === "task" && s.menu.id === d.id && s.menu.origin === "panel" ? taskMenu(t, s) : ""}</div>${run ? `<div class="panel-body"><button class="text-button" data-action="back-result">${icon("back", 17)} Back</button><h2 class="result-title">${esc(t.title)}</h2><div class="result-date">${runDate(run.createdAt)}</div><div class="run-content">${esc(run.content || "Running…")}</div></div>` : `<div class="panel-body"><textarea class="title-input" name="title" aria-label="Scheduled task title" placeholder="Name" maxlength="120" rows="1">${esc(d.title)}</textarea>${error(s, "title")}<form id="task-form" class="native-prompt" novalidate><textarea name="prompt" aria-label="Prompt" placeholder="Describe what ChatGPT should do" rows="2">${esc(d.prompt)}</textarea>${error(s, "prompt")}</form>${details(s, isNew)}${schedule(s)}${!local ? `<div class="settings-card native-timezone">${row("Time zone", `<span class="muted timezone-value">${esc(d.schedule.timeZone.replaceAll("_", " "))}</span>`)}</div>` : ""}${!isNew ? history(t, s) : ""}</div>${isNew || (!local && s.dirty) ? `<div class="panel-footer"><button class="button secondary" data-action="cancel">Cancel</button><button class="button primary" data-action="save" ${s.saving ? "disabled" : ""}>${s.saving ? '<span class="spinner"></span>' : isNew ? "Create" : "Save"}</button></div>` : ""}`}</div></aside>`;
}
function modal(s) {
  const m = s.modal;
  if (!m) return "";
  let content = "";
  if (m.kind === "delete") {
    const t = s.tasks.find((t) => t.id === m.id);
    content = `<h2>Delete ${esc(t?.title)}?</h2><p>This will permanently delete the scheduled task and stop future runs</p><div class="modal-actions"><button class="button secondary" data-action="modal-close">Cancel</button><button class="button destructive" data-action="confirm-delete" data-id="${esc(m.id)}" ${s.deleting ? "disabled" : ""}>${s.deleting ? '<span class="spinner"></span>' : "Delete scheduled task"}</button></div>`;
  } else if (m.kind === "discard") {
    content =
      '<h2>Discard changes?</h2><p>Your unsaved changes will be lost.</p><div class="modal-actions"><button class="button secondary" data-action="modal-close">Keep editing</button><button class="button primary" data-action="discard">Discard changes</button></div>';
  } else if (m.kind === "advanced") {
    content = `<h2>Edit schedule rule</h2><p>Use an RRULE to define a custom schedule.</p><label class="rule-label" for="rrule">RRULE</label><textarea id="rrule" name="rrule" rows="4" spellcheck="false">${esc(s.rule)}</textarea>${s.ruleError ? `<p class="field-error" role="alert">${esc(s.ruleError)}</p>` : ""}<div class="modal-actions"><button class="button secondary" data-action="modal-close">Cancel</button><button class="button primary" data-action="save-rule">Save</button></div>`;
  } else if (m.kind === "share") {
    const t = s.tasks.find((t) => t.id === m.id);
    content = `<h2>Share task</h2><div class="share-summary"><strong>${esc(t?.title)}</strong><p>${esc(t?.prompt)}</p><span>${esc(scheduleLabel(t.schedule))} · ${esc(t.schedule.timeZone)}</span></div><p>A copy includes the task instructions, schedule, and time zone. Previous results stay private.</p><div class="modal-actions"><button class="button secondary" data-action="modal-close">Cancel</button><button class="button primary" data-action="copy-share" data-id="${esc(m.id)}">${s.copied ? "Copied" : "Copy link"}</button></div>`;
  }
  if (s.deleting)
    content = content.replace(
      'data-action="modal-close"',
      'data-action="modal-close" disabled',
    );
  return `<div class="modal-backdrop" data-key="modal-backdrop" data-action="backdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="${m.kind === "delete" ? "Delete scheduled task" : m.kind === "share" ? "Share task" : m.kind === "discard" ? "Discard changes" : "Edit schedule rule"}" tabindex="-1">${!s.deleting ? '<button class="icon-button modal-close" data-action="modal-close" aria-label="Close dialog">' + icon("close", 16) + "</button>" : ""}${content}</div></div>`;
}
function fieldMenu(s) {
  const m = s.menu;
  if (m?.kind !== "select") return "";
  return `<div class="popover field-popover" data-key="field-menu-${esc(m.field)}" role="menu" style="left:${Number(m.x) || 0}px;top:${Number(m.y) || 0}px"><div class="field-menu-scroll">${m.options.map(([value, label]) => `<button type="button" role="menuitemradio" aria-checked="${String(value) === String(m.value)}" class="menu-item" data-action="select-option" data-field="${esc(m.field)}" data-value="${esc(value)}"><span>${esc(label)}</span>${String(value) === String(m.value) ? icon("check", 16) : ""}</button>`).join("")}</div></div>`;
}

const regularSearch = s => `<div class="search-box">${icon("search", 18)}<input id="search" aria-label="Search scheduled tasks" placeholder="Search scheduled tasks" value="${esc(s.search)}">${s.search ? btn("clear-search", "Clear search", "close") : ""}</div>`;
const regularFilter = s => `<div class="filter-wrap"><button class="button filter-button" data-action="filter-menu" aria-expanded="${s.menu?.kind === "filter"}">${icon("filter", 16)}<span>${s.filter[0].toUpperCase() + s.filter.slice(1)}</span>${icon("chevron", 14)}</button>${s.menu?.kind === "filter" ? `<div class="popover filter-popover" data-key="filter-popover" role="menu">${["all", "active", "paused", "completed"].map((f) => `<button class="menu-item" data-action="filter" data-filter="${f}" role="menuitemradio" aria-checked="${f === s.filter}">${f[0].toUpperCase() + f.slice(1)}${f === s.filter ? icon("check", 16) : ""}</button>`).join("")}</div>` : ""}</div>`;
const regularCreate = s => `<div class="create-wrap"><div class="split-button"><button class="button primary create-button" data-action="new">${icon("plus", 16)} Create</button><button class="create-options" data-action="create-menu" aria-label="Create scheduled task options" aria-expanded="${s.menu?.kind === "create"}">${icon("chevron", 14)}</button></div>${s.menu?.kind === "create" ? `<div class="popover create-popover" data-key="create-popover" role="menu"><button role="menuitem" class="menu-item" data-action="guided" disabled title="Requires a ChatGPT conversation">${icon("sun", 16)} Create with ChatGPT</button><button role="menuitem" class="menu-item" data-action="new">${icon("edit", 16)} Set up manually</button></div>` : ""}</div>`;
export function view(s) {
  const tasks = filterTasks(s.tasks, s.filter, s.search);
  return `<div data-key="app-shell" ${s.modal ? 'inert aria-hidden="true"' : ""} class="app-shell ${s.draft ? "has-panel" : ""}"><main class="main-page regular-profile" data-key="main-page" data-scheduled-tasks-main><div class="application-toolbar" data-key="application-toolbar" aria-label="Task toolbar">${s.draft ? `<nav class="toolbar-navigation" aria-label="Scheduled task status">${regularFilter(s)}</nav>` : ""}<div class="application-actions">${s.draft && !s.selected ? "" : regularCreate(s)}</div></div><div class="page-content" data-key="page-content"><header class="page-heading ${s.draft ? "sr-only" : ""}" data-key="page-heading"><div><h1>Scheduled tasks</h1>${s.draft ? "" : "<p>Ask ChatGPT to schedule tasks, set reminders, or monitor for updates</p>"}</div></header><div class="search-toolbar" data-key="search-toolbar">${regularSearch(s)}</div><div class="page-body" data-key="page-body" data-layout>${s.draft ? "" : `<nav class="page-navigation" data-key="page-navigation" aria-label="Scheduled task status">${regularFilter(s)}</nav>`}<div class="task-list" data-automation-list role="list" aria-label="Scheduled tasks">${tasks.map((t) => taskRow(t, s)).join("")}${!tasks.length ? `<div class="empty-state">${icon(s.search ? "search" : "clock", 28)}<h2>${s.search ? "No scheduled tasks found" : s.filter === "all" ? "Create your first scheduled task" : `No ${s.filter} tasks`}</h2><p>${s.search ? "Try another name or change the filter." : "Set a task to run at the right moment."}</p></div>` : ""}</div>${
    s.filter === "all" && !s.search
      ? `<section class="suggestions"><h2>Suggestions</h2>${availableTemplates(
          s,
        )
          .map(
            (t) =>
              `<button class="suggestion-row" data-action="template" data-template="${t.key}"><span class="suggestion-icon">${icon(t.icon)}<span>${icon("plus")}</span></span><span class="row-copy"><span class="row-title"><span class="suggestion-name">${t.title}</span><span class="suggestion-cadence">${t.time}</span></span><span class="row-subtitle">${t.description}</span></span></button>`,
          )
          .join("")}</section>`
      : ""
  }</div></div></main>${panel(s)}</div>${fieldMenu(s)}${modal(s)}${s.toast ? `<div class="toast" data-key="toast" role="status">${icon("check", 18)}${esc(s.toast)}</div>` : ""}`;
}
