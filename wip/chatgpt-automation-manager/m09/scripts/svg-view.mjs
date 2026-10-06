import { paths } from "../src/icons.mjs";
import { scheduleLabel, filterTasks } from "../src/model.mjs";
import { templates } from "../src/view.mjs";
const W = 1280,
  H = 840;
const C = {
  text: "#181818",
  muted: "#858585",
  border: "#e5e5e5",
  subtle: "#f5f5f5",
  blue: "#4b91df",
};
const e = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const r = (x, y, w, h, fill = "#fff", radius = 0, stroke = "none") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;
const text = (
  x,
  y,
  s,
  size = 14,
  color = C.text,
  weight = 400,
  anchor = "start",
) =>
  `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${e(s)}</text>`;
const line = (x, y, w, color = C.border) =>
  `<path d="M${x} ${y}h${w}" stroke="${color}"/>`;
const icon = (name, x, y, size = 20, color = C.muted) =>
  `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${name === "more" ? 3.5 : 1.65}" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name] || paths.clock}"/></svg>`;
const truncate = (s, width, size = 14) => {
  const max = Math.floor(width / (size * 0.51));
  return s.length > max ? s.slice(0, Math.max(0, max - 1)) + "…" : s;
};
function wrap(s, width, size = 14) {
  const words = s.split(/\s+/),
    lines = [];
  let row = "";
  for (const word of words) {
    if ((row + " " + word).length * size * 0.5 > width && row) {
      lines.push(row);
      row = word;
    } else row += (row ? " " : "") + word;
  }
  if (row) lines.push(row);
  return lines;
}
const wrapped = (x, y, s, width, size = 14, color = C.text, lineHeight = 22) =>
  wrap(s, width, size)
    .map((v, i) => text(x, y + i * lineHeight, v, size, color))
    .join("");
function button(x, y, w, label, { primary = false, danger = false, ico } = {}) {
  return (
    r(
      x,
      y,
      w,
      36,
      danger ? "#db3633" : primary ? "#181818" : "#fff",
      18,
      primary || danger ? "none" : C.border,
    ) +
    (ico ? icon(ico, x + 13, y + 10, 16, primary ? "#fff" : C.text) : "") +
    text(
      x + w / 2 + (ico ? 9 : 0),
      y + 23,
      label,
      13,
      primary || danger ? "#fff" : C.text,
      500,
      "middle",
    )
  );
}
function menu(x, y, items, w = 170) {
  return (
    `<g filter="url(#shadow)">${r(x, y, w, items.length * 37 + 10, "#fff", 13, "#ededed")}</g>` +
    items
      .map((it, i) => {
        const [label, ico, danger] = Array.isArray(it) ? it : [it];
        return (
          (ico
            ? icon(
                ico,
                x + 14,
                y + 15 + i * 37,
                17,
                danger ? "#ce3131" : C.muted,
              )
            : "") +
          text(
            x + (ico ? 42 : 15),
            y + 29 + i * 37,
            label,
            13,
            danger ? "#ce3131" : C.text,
          )
        );
      })
      .join("")
  );
}
function taskMenu(s, id, x, y) {
  const t = s.tasks.find((t) => t.id === id);
  if (!t) return "";
  return menu(
    x,
    y,
    [
      ["Run now", "play"],
      ["Edit", "edit"],
      [
        t.status === "paused" ? "Resume" : "Pause",
        t.status === "paused" ? "play" : "pause",
      ],
      ["Share", "link"],
      ["Delete", "trash", true],
    ],
    177,
  );
}
function list(s, panel) {
  const main = W - (panel ? 440 : 0),
    width = Math.min(1000, main - (panel ? 64 : 112)),
    x = (main - width) / 2;
  let o =
    text(x, 104, "Scheduled tasks", 29, C.text, 550) +
    text(
      x,
      137,
      "Ask ChatGPT to schedule tasks, set reminders, or monitor for updates",
      15,
      C.muted,
    );
  const y = 164,
    searchW = width - 213;
  o +=
    r(x, y, searchW, 42, C.subtle, 11) +
    icon("search", x + 12, y + 12, 18) +
    text(x + 40, y + 26, s.search || "Search scheduled tasks", 14, C.muted);
  const fx = x + searchW + 10;
  o +=
    button(fx, y + 3, 90, s.filter[0].toUpperCase() + s.filter.slice(1), {
      ico: "filter",
    }) + icon("chevron", fx + 70, y + 14, 13);
  o += button(x + width - 102, y + 3, 102, "Create", {
    primary: true,
    ico: "plus",
  });
  const rows = filterTasks(s.tasks, s.filter, s.search);
  let ry = 225;
  for (const t of rows) {
    const selected = s.selected === t.id,
      hover = s.hover === t.id;
    const running = t.runs.some((r) => r.status === "running");
    if (selected || hover)
      o += r(x, ry - 9, width, 80, selected ? "#f0f0f0" : "#f6f6f6", 11);
    o += icon(
      running
        ? "clock"
        : t.status === "paused"
          ? "pause"
          : t.status === "completed"
            ? "check"
            : "clock",
      x + 16,
      ry + 18,
      20,
    );
    const copyw = width - (panel ? 75 : 285);
    o +=
      text(x + 54, ry + 20, truncate(t.title, copyw), 14) +
      text(x + 54, ry + 43, truncate(t.prompt, copyw, 13), 13, C.muted);
    if (t.runs.some((r) => r.unread))
      o += r(
        x + 56 + Math.min(t.title.length * 7, copyw),
        ry + 13,
        5,
        5,
        C.blue,
        3,
      );
    if (hover) {
      o +=
        r(
          x + width - 117,
          ry + 11,
          106,
          35,
          selected ? "#f0f0f0" : "#f6f6f6",
          8,
        ) +
        icon("play", x + width - 111, ry + 19, 18) +
        icon(
          t.status === "paused" ? "play" : "pause",
          x + width - 77,
          ry + 19,
          18,
        ) +
        icon("more", x + width - 43, ry + 19, 18);
    } else if (!panel)
      o += text(
        x + width - 14,
        ry + 29,
        running
          ? "In progress"
          : t.status === "paused"
            ? "Paused"
            : t.status === "completed"
              ? "Completed"
              : scheduleLabel(t.schedule),
        12,
        C.muted,
        400,
        "end",
      );
    if (
      s.menu?.kind === "task" &&
      s.menu.id === t.id &&
      s.menu.origin !== "panel"
    )
      s._rowMenu = { id: t.id, x: x + width - 186, y: ry + 49 };
    ry += 83;
  }
  if (!rows.length)
    o +=
      icon("search", main / 2 - 14, 300, 28) +
      text(
        main / 2,
        359,
        "No scheduled tasks found",
        16,
        C.muted,
        500,
        "middle",
      ) +
      text(
        main / 2,
        389,
        "Try another name or change the filter.",
        13,
        C.muted,
        400,
        "middle",
      );
  if (s.filter === "all" && !s.search) {
    ry += 21;
    o += line(x, ry, width, "#ededed");
    ry += 40;
    o += text(x + 12, ry, "Suggestions", 15, C.muted);
    ry += 29;
    for (const t of templates) {
      o +=
        icon(t.icon, x + 16, ry + 15, 20) +
        text(x + 54, ry + 19, t.title, 14) +
        text(
          x + 54,
          ry + 42,
          truncate(t.description, width - (panel ? 74 : 278), 13),
          13,
          C.muted,
        );
      if (!panel)
        o += text(x + width - 14, ry + 29, t.time, 12, C.muted, 400, "end");
      ry += 78;
    }
  }
  if (s.menu?.kind === "filter")
    o += menu(fx, y + 47, ["All", "Active", "Paused", "Completed"], 160);
  return o;
}
function settings(x, y, w, rows) {
  let out = r(x, y, w, rows.length * 48, "#fff", 14, C.border);
  for (let i = 0; i < rows.length; i++) {
    const [label, value, chevron] = rows[i];
    if (i) out += line(x, y + i * 48, w, "#f0f0f0");
    out += text(x + 15, y + i * 48 + 29, label, 13);
    out += text(
      x + w - (chevron ? 35 : 15),
      y + i * 48 + 29,
      truncate(value, w - 120, 13),
      13,
      C.muted,
      400,
      "end",
    );
    if (chevron) out += icon("chevron", x + w - 29, y + i * 48 + 18, 14);
  }
  return out;
}
function detail(s, phase) {
  const d = s.draft;
  if (!d) return "";
  const px = 840,
    bodyX = 865,
    bw = 390;
  const t = s.tasks.find((t) => t.id === s.selected);
  const status = t?.status || "active";
  const run = s.result && t?.runs.find((r) => r.id === s.result);
  const panelOffset = (1 - phase) * 32;
  let o = r(px, 0, 440, H) + `<path d="M${px} 0v${H}" stroke="#e7e7e7"/>`;
  o += text(
    px + 22,
    38,
    !t
      ? "New scheduled task"
      : run
        ? "Scheduled run"
        : status[0].toUpperCase() + status.slice(1),
    13,
    status === "active" ? C.blue : C.muted,
    500,
  );
  if (t && !run)
    o +=
      icon("more", 1162, 23, 20) +
      icon(status === "paused" ? "play" : "pause", 1200, 23, 20);
  o += icon("close", 1241, 23, 20);
  let b = "";
  if (run) {
    b +=
      icon("back", bodyX, 78, 16) +
      text(bodyX + 24, 91, "Back", 12, C.muted) +
      text(bodyX, 142, t.title, 23, C.text, 550) +
      text(bodyX, 170, "Oct 6, 8:00 AM", 12, "#999");
    const paras = (run.content || "Running…").split("\n\n");
    let y = 215;
    for (const p of paras) {
      b += wrapped(bodyX, y, p, bw, 14, "#515151", 24);
      y += wrap(p, bw, 14).length * 24 + 18;
    }
  } else {
    let y = 94;
    b += text(
      bodyX,
      y,
      d.title || "Name your task",
      23,
      d.title ? C.text : "#aaa",
      550,
    );
    y += 50;
    b += text(bodyX, y, "PROMPT", 12, "#929292", 500);
    y += 17;
    b +=
      r(bodyX, y, bw, 106, "#fff", 14, "#e1e1e1") +
      wrapped(
        bodyX + 15,
        y + 28,
        d.prompt || "Describe what ChatGPT should do",
        bw - 30,
        14,
        d.prompt ? C.text : "#aaa",
        22,
      );
    y += 141;
    b += text(bodyX, y, "FREQUENCY", 12, "#929292", 500);
    y += 17;
    const freqLabel = {
      once: "Once",
      hourly: "Hourly",
      daily: "Daily",
      weekdays: "Weekdays",
      weekly: "Weekly",
      monthly: "Monthly",
      yearly: "Yearly",
      custom: "Custom",
    }[d.schedule.frequency];
    let rows = [["Repeat", freqLabel, true]];
    if (d.schedule.frequency === "once")
      rows.push(["Date", d.schedule.date, false]);
    if (["weekly", "custom"].includes(d.schedule.frequency))
      rows.push([
        "On",
        d.schedule.days
          .map((i) => ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][i])
          .join("   "),
        false,
      ]);
    rows.push([
      "Time",
      `${+d.schedule.time.slice(0, 2) % 12 || 12}:${d.schedule.time.slice(3)} ${+d.schedule.time.slice(0, 2) >= 12 ? "PM" : "AM"}`,
      false,
    ]);
    b += settings(bodyX, y, bw, rows);
    s._frequencyPos = { x: bodyX + bw - 162, y: y + 39 };
    y += rows.length * 48 + 12;
    if (d.schedule.frequency !== "once") {
      const ends = [["Until", d.schedule.endDate ? "On date" : "Never", true]];
      if (d.schedule.endDate)
        ends.push(["End date", d.schedule.endDate, false]);
      b += settings(bodyX, y, bw, ends);
      y += ends.length * 48 + 21;
    }
    b += text(bodyX, y, "Edit schedule rule", 12, C.muted);
    y += 40;
    b += text(bodyX, y, "DETAILS", 12, "#929292", 500);
    y += 17;
    b += settings(bodyX, y, bw, [
      ["Time zone", d.schedule.timeZone.replaceAll("_", " "), true],
      ["Runs in", "Cloud", false],
      ["Notifications", "Important updates", true],
    ]);
    y += 183;
    if (t) {
      b += text(bodyX, y, "PREVIOUS RUNS", 12, "#929292", 500);
      y += 20;
      if (!t.runs.length) b += text(bodyX, y + 21, "No runs yet", 13, "#aaa");
      else
        for (const r of t.runs) {
          b +=
            icon(
              r.status === "running" ? "clock" : "check",
              bodyX + 7,
              y + 15,
              16,
            ) +
            text(
              bodyX + 37,
              y + 20,
              r.status === "running" ? "Run in progress" : r.title,
              12,
            ) +
            text(bodyX + 37, y + 40, "Oct 6, 8:00 AM", 11, "#999");
          if (r.unread) b += rRect(bodyX + bw - 16, y + 20);
          y += 61;
        }
    }
    if (s.previewSelect === "frequency") {
      const pos = s._frequencyPos;
      b += menu(
        pos.x,
        pos.y,
        [
          "Once",
          "Hourly",
          "Daily",
          "Weekdays",
          "Weekly",
          "Monthly",
          "Yearly",
          "Custom",
        ],
        162,
      );
    }
  }
  o += `<g clip-path="url(#bodyclip)"><g transform="translate(0,${-(s.panelScroll || 0)})">${b}</g></g>`;
  if (!run) {
    o += r(px, H - 67, 440, 67) + line(px, H - 67, 440, "#ebebeb");
    if (!t || s.dirty)
      o +=
        button(1101, H - 52, 72, "Cancel") +
        button(1182, H - 52, 74, !t ? "Create" : "Save", { primary: true });
    else
      o += button(
        1150,
        H - 52,
        106,
        t.runs.some((r) => r.status === "running") ? "Running…" : "Run now",
        { ico: "play" },
      );
  }
  if (s.menu?.kind === "task" && s.menu.origin === "panel")
    o += taskMenu(s, t.id, 1030, 53);
  return `<g opacity="${phase}" transform="translate(${panelOffset},0)">${o}</g>`;
}
const rRect = (x, y) => r(x, y, 5, 5, C.blue, 3);
function modal(s) {
  const m = s.modal;
  if (!m) return "";
  const x = 420,
    y = 298,
    w = 440;
  let o =
    r(0, 0, W, H, "#00000033") +
    `<g filter="url(#modalshadow)">${r(x, y, w, 242, "#fff", 20)}</g>`;
  if (m.kind === "delete") {
    const task = s.tasks.find((t) => t.id === m.id);
    o +=
      text(x + 26, y + 43, `Delete ${task?.title}?`, 20, C.text, 550) +
      wrapped(
        x + 26,
        y + 80,
        "This will permanently delete the scheduled task and stop future runs.",
        w - 52,
        14,
        "#777",
        22,
      ) +
      button(x + 132, y + 172, 75, "Cancel") +
      button(x + 216, y + 172, 198, "Delete scheduled task", { danger: true });
  }
  return o;
}
export function renderSVG(
  input,
  { time = 0, cursor = [0, 0], panelPhase = 1 } = {},
) {
  const s = structuredClone(input);
  let body = list(s, !!s.draft) + detail(s, panelPhase);
  if (s._rowMenu)
    body += taskMenu(s, s._rowMenu.id, s._rowMenu.x, s._rowMenu.y);
  body += modal(s);
  if (s.toast) {
    const w = s.toast.length * 6.6 + 64,
      x = (W - w) / 2;
    body +=
      `<g filter="url(#shadow)">${r(x, H - 72, w, 43, "#222", 13)}</g>` +
      icon("check", x + 16, H - 59, 18, "#fff") +
      text(x + 45, H - 45, s.toast, 13, "#fff");
  }
  body += `<g transform="translate(${cursor[0]},${cursor[1]})" filter="url(#cursorShadow)"><path d="M0 0v20l5-5 4 9 4-2-4-8h8Z" fill="#111" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><filter id="shadow" x="-30%" y="-50%" width="160%" height="220%"><feDropShadow dx="0" dy="4" stdDeviation="7" flood-opacity=".13"/></filter><filter id="modalshadow" x="-20%" y="-50%" width="140%" height="200%"><feDropShadow dx="0" dy="14" stdDeviation="22" flood-opacity=".17"/></filter><filter id="cursorShadow" x="-100%" y="-100%" width="300%" height="300%"><feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity=".2"/></filter><clipPath id="bodyclip"><rect x="840" y="64" width="440" height="709"/></clipPath></defs>${r(0, 0, W, H)}${body}</svg>`;
}
