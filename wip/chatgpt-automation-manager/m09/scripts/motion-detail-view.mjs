import { paths } from "../src/icons.mjs";
import { filterTasks, scheduleLabel, nextRun } from "../src/model.mjs";
import { menuTransform, layoutProgress } from "../src/motion-spec.mjs";
import { templates } from "../src/view.mjs";
const W = 1280,
  H = 840,
  X = 256,
  CW = 768,
  TOP = 197,
  RH = 68;
const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const r = (x, y, w, h, fill = "#fff", rx = 0, stroke = "none") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
const txt = (
  x,
  y,
  s,
  size = 14,
  color = "#181818",
  weight = 400,
  anchor = "start",
) =>
  `<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;
const ico = (name, x, y, size = 16, color = "#858585") =>
  `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${name === "more" ? 3.5 : 1.65}" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name] || paths.clock}"/></svg>`;
const trunc = (s, w, fs = 12) =>
  s.length * fs * 0.49 > w
    ? s.slice(0, Math.floor(w / (fs * 0.49)) - 1) + "…"
    : s;
function rel(t, now) {
  const d = nextRun(t, now);
  if (!d) return "";
  const m = Math.max(1, Math.round((Date.parse(d) - now) / 60000));
  if (m < 60) return `Next run in ${m} min`;
  if (m < 1440) {
    const n = Math.round(m / 60);
    return `Next run in ${n} ${n === 1 ? "hour" : "hours"}`;
  }
  const n = Math.round(m / 1440);
  return `Next run in ${n} ${n === 1 ? "day" : "days"}`;
}
function spinner(x, y, time) {
  let parts = "";
  for (let i = 0; i < 28; i++)
    parts += `<path d="M${x + 8 + 6 * Math.sin((i / 28) * Math.PI * 2)} ${y + 8 - 6 * Math.cos((i / 28) * Math.PI * 2)} A6 6 0 0 1 ${x + 8 + 6 * Math.sin(((i + 1) / 28) * Math.PI * 2)} ${y + 8 - 6 * Math.cos(((i + 1) / 28) * Math.PI * 2)}" stroke="#888" stroke-width="1.5" fill="none" opacity="${(i + 1) / 28}"/>`;
  return `<g transform="rotate(${(time / 800) * 360},${x + 8},${y + 8})">${parts}</g>`;
}
function menuInfo(s) {
  if (!s.menu) return null;
  if (s.menu.kind === "create")
    return {
      x: 804,
      y: 199,
      w: 220,
      items: [
        ["Create with ChatGPT", "sun", false, true],
        ["Set up manually", "edit"],
      ],
    };
  if (s.menu.kind === "filter")
    return {
      x: 748,
      y: 199,
      w: 160,
      items: ["All", "Active", "Paused", "Completed"].map((t) => [
        t,
        null,
        false,
        false,
        t.toLowerCase() === s.filter,
      ]),
    };
  const tasks = filterTasks(s.tasks, s.filter, s.search),
    index = tasks.findIndex((t) => t.id === s.menu.id),
    t = tasks[index];
  if (!t) return null;
  return {
    x: 804,
    y: TOP + index * RH + 51,
    w: 220,
    items: [
      ["Run now", "play"],
      [
        t.status === "paused" ? "Resume" : "Pause",
        t.status === "paused" ? "play" : "pause",
      ],
      ["Delete", "trash", true],
    ],
  };
}
function drawMenu(s, ms, opening = true) {
  const m = menuInfo(s);
  if (!m) return "";
  const p = menuTransform(ms, opening),
    originX = m.x + m.w,
    originY = m.y;
  const h = m.items.length * 30 + 8;
  let out = `<g filter="url(#shadow)">${r(m.x, m.y, m.w, h, "#fff", 16, "#ededed")}</g>`;
  m.items.forEach(([label, icon, danger, disabled, checked], i) => {
    const y = m.y + 4 + i * 30;
    if (s.menuHover === i && !disabled) {
      const q = menuTransform(ms, true).opacity,
        scale = 0.98 + 0.02 * q;
      out += `<g transform="translate(${m.x + m.w / 2},${y + 15}) scale(${scale}) translate(${-m.x - m.w / 2},${-y - 15})">${r(m.x + 4, y, m.w - 8, 30, "#f2f2f2", 12)}</g>`;
    }
    if (icon)
      out += ico(
        icon,
        m.x + 12,
        y + 7,
        16,
        disabled ? "#aaa" : danger ? "#ce3131" : "#777",
      );
    out += txt(
      m.x + (icon ? 36 : 12),
      y + 20,
      label,
      12,
      disabled ? "#aaa" : danger ? "#ce3131" : "#181818",
    );
    if (checked) out += ico("check", m.x + m.w - 28, y + 7, 16);
  });
  return `<g opacity="${p.opacity}" transform="translate(${originX},${originY}) scale(${p.scale}) translate(${-originX},${-originY})">${out}</g>`;
}
export function motionSVG(
  scene,
  prev,
  {
    time,
    cursor,
    elapsed,
    menuAge = elapsed,
    outgoingMenu = null,
    layoutOrigin = null,
  },
) {
  const s = scene.state,
    tasks = filterTasks(s.tasks, s.filter, s.search),
    old = layoutOrigin
      ? filterTasks(
          layoutOrigin.state.tasks,
          layoutOrigin.state.filter,
          layoutOrigin.state.search,
        )
      : prev
        ? filterTasks(prev.state.tasks, prev.state.filter, prev.state.search)
        : tasks;
  const progress = 1;
  let out =
    txt(X, 90, "Scheduled tasks", 28, "#181818", 500) +
    txt(
      X,
      120,
      "Ask ChatGPT to schedule tasks, set reminders, or monitor for updates",
      14,
      "#858585",
    );
  out +=
    r(X, 153, 538, 40, "#f5f5f5", 10) +
    ico("search", X + 12, 165, 16) +
    txt(
      X + 38,
      178,
      s.search || "Search scheduled tasks",
      14,
      s.search ? "#181818" : "#8b8b8b",
    );
  if (s.search) out += ico("close", 768, 164, 18);
  out +=
    r(804, 155, 104, 36, "#fff", 18, "#e5e5e5") +
    ico("filter", 817, 165, 16) +
    txt(
      856,
      178,
      s.filter[0].toUpperCase() + s.filter.slice(1),
      12,
      "#181818",
      400,
      "middle",
    ) +
    ico("chevron", 887, 166, 13);
  out +=
    r(918, 155, 106, 36, "#181818", 18) +
    ico("plus", 930, 165, 16, "#fff") +
    txt(970, 178, "Create", 12, "#fff", 500, "middle") +
    `<path d="M995 162v22" stroke="#fff3"/>` +
    ico("chevron", 1005, 166, 13, "#fff");
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i],
      oldIndex = old.findIndex((v) => v.id === t.id),
      oldY = oldIndex < 0 ? TOP + i * RH : TOP + oldIndex * RH,
      baseY = TOP + i * RH,
      y = baseY + (oldY - baseY) * (1 - progress),
      hover = s.hover === t.id,
      menuOpen = s.menu?.kind === "task" && s.menu.id === t.id,
      running = t.runs.some((r) => r.status === "running"),
      opacity = t.status === "paused" && !hover ? 0.6 : 1;
    let row = "";
    if (hover) row += r(X, y, CW, 64, "#f5f5f5", 10);
    else if (i !== tasks.length - 1 && s.hover !== tasks[i + 1]?.id)
      row += `<path d="M${X + 12} ${y + 65}h${CW - 24}" stroke="#efefef"/>`;
    row +=
      txt(X + 40, y + 25, t.title, 14) +
      txt(
        X + 40,
        y + 45,
        trunc(
          scheduleLabel(t.schedule) +
            (running
              ? " · In progress"
              : t.status === "active"
                ? " · " + rel(t, s.now)
                : ""),
          CW - 106,
        ),
        12,
        "#858585",
      );
    if (running) row += spinner(X + 18, y + 24, time * 1000);
    else {
      if (s.statusHover === t.id)
        row += r(X + 12, y + 18, 28, 28, "#0000000d", 14);
      row += ico(
        s.statusHover === t.id
          ? t.status === "paused"
            ? "play"
            : "pause"
          : t.status === "paused"
            ? "play"
            : t.status === "completed"
              ? "check"
              : "clock",
        X + 18,
        y + 24,
        16,
      );
    }
    if (hover || menuOpen) row += ico("more", X + CW - 36, y + 24, 16);
    else if (t.runs.some((r) => r.unread))
      row += r(X + CW - 29, y + 30, 5, 5, "#4b91df", 3);
    out += `<g opacity="${opacity}">${row}</g>`;
  }
  if (s.filter === "all" && !s.search) {
    const finalY = TOP + tasks.length * RH + 36,
      previousY = TOP + old.length * RH + 36,
      sy = finalY + (previousY - finalY) * (1 - progress);
    out += txt(X + 8, sy, "Suggestions", 16, "#858585");
    templates.forEach((t, i) => {
      const y = sy + 16 + i * 64;
      out +=
        ico(t.icon, X + 18, y + 20, 16) +
        txt(X + 48, y + 23, t.title, 14) +
        txt(X + 48, y + 43, trunc(t.description, CW - 130), 12, "#858585");
    });
  }
  if (s.tooltip) {
    const width = s.tooltip.length * 7 + 24,
      x = s.tooltipX - width / 2,
      y = 175;
    out +=
      `<g filter="url(#shadow)">${r(x, y, width, 36, "#fff", 8, "#ebebeb")}</g>` +
      txt(s.tooltipX, y + 23, s.tooltip, 14, "#181818", 400, "middle");
  }
  if (outgoingMenu)
    out += drawMenu(outgoingMenu.state, outgoingMenu.elapsed, false);
  if (s.menu) out += drawMenu(s, menuAge, true);
  if (cursor)
    out += `<g transform="translate(${cursor[0]},${cursor[1]})" filter="url(#pointer)"><path d="M0 0v20l5-5 4 9 4-2-4-8h8Z" fill="#111" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><filter id="shadow" x="-20%" y="-40%" width="140%" height="190%"><feDropShadow dx="0" dy="5" stdDeviation="8" flood-opacity=".12"/></filter><filter id="pointer" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity=".25"/></filter></defs>${r(0, 0, W, H)}${out}</svg>`;
}
