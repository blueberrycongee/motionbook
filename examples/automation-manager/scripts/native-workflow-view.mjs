import { ALIGN, pageGeometry, paneGeometry, regularGeometry } from "../src/alignment-spec.mjs";
import { paths } from "../src/icons.mjs";
import { filterTasks, scheduleLabel, nextRun } from "../src/model.mjs";
import { menuTransform, layoutProgress } from "../src/motion-spec.mjs";
import { templates, availableTemplates } from "../src/view.mjs";
const W = 1280,
  H = 840,
  RH = 68;
let X = 256, CW = 768, TOP = 256, REG = regularGeometry();
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
      x: REG.main - 8 - 220,
      y: 41,
      w: 220,
      items: [
        ["Create with ChatGPT", "sun", false, true],
        ["Set up manually", "edit"],
      ],
    };
  if (s.menu.kind === "filter")
    return {
      x: REG.filterX,
      y: REG.navigationTop + 32,
      w: 160,
      items: ["All", "Active", "Paused", "Completed"].map((t) => [
        t,
        null,
        false,
        false,
        t.toLowerCase() === s.filter,
      ]),
    };
  if (s.menu.kind === "select") return null;
  if (s.menu.origin === "panel") {
    const t = s.tasks.find((t) => t.id === s.menu.id);
    return {
      x: 1044,
      y: 40,
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
  const tasks = filterTasks(s.tasks, s.filter, s.search),
    index = tasks.findIndex((t) => t.id === s.menu.id),
    t = tasks[index];
  if (!t) return null;
  return {
    x: X + CW - 220,
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
export function nativeSVG(
  scene,
  prev,
  {
    time,
    cursor,
    elapsed,
    menuAge = elapsed,
    outgoingMenu = null,
    layoutOrigin = null,
    paneWidth = 0,
    panelState = null,
    panelFrameWidth = 600,
  },
) {
  const geometry = regularGeometry(W, paneWidth, !!scene.state.draft);
  REG = geometry; TOP = geometry.listTop;
  CW = geometry.width;
  X = geometry.left;
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
  let out = "";
  if (!s.draft) out += txt(geometry.headingX, geometry.headingBaseline, "Scheduled tasks", 28, "#181818", 500) + txt(geometry.headingX, geometry.subtitleBaseline, "Ask ChatGPT to schedule tasks, set reminders, or monitor for updates", 14, "#858585");
  const searchY=geometry.searchTop;
  out += r(X,searchY,CW,40,"#f5f5f5",10)+ico("search",X+12,searchY+12,16)+txt(X+38,searchY+25,s.search||"Search scheduled tasks",14,s.search?"#181818":"#8b8b8b");
  if(s.search)out+=ico("close",X+CW-28,searchY+11,18);
  const fx=geometry.filterX,fy=geometry.navigationTop;
  out+=r(fx,fy,104,28,"#fff",14,"#e5e5e5")+ico("filter",fx+9,fy+6,16)+txt(fx+51,fy+19,s.filter[0].toUpperCase()+s.filter.slice(1),12,"#181818",400,"middle")+ico("chevron",fx+82,fy+7,13);
  if(!(s.draft&&!s.selected)){
    const cx=geometry.createX,cy=geometry.createY;
    out+=r(cx,cy,106,28,"#181818",14)+ico("plus",cx+10,cy+6,16,"#fff")+txt(cx+51,cy+19,"Create",12,"#fff",500,"middle")+`<path d="M${cx+78} ${cy+4}v20" stroke="#fff3"/>`+ico("chevron",cx+84,cy+7,13,"#fff");
  }
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
    if (hover || s.selected === t.id)
      row += r(X, y, CW, 64, s.selected === t.id ? "#f0f0f0" : "#f5f5f5", 10);
    else if (i !== tasks.length - 1 && s.hover !== tasks[i + 1]?.id)
      row += `<path d="M${X + 12} ${y + 65}h${CW - 24}" stroke="#efefef"/>`;
    row +=
      txt(X + 40, y + 29, trunc(t.title, CW - 106, 14), 14) +
      txt(
        X + 40,
        y + 48,
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
    if (running) row += spinner(X + 14, y + 16, time * 1000);
    else {
      if (s.statusHover === t.id)
        row += r(X + 12, y + 14, 20, 20, "#0000000d", 6);
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
        X + 14,
        y + 16,
        16,
      );
    }
    if (hover || menuOpen) row += ico("more", X + CW - 34, y + 24, 16);
    else if (t.runs.some((r) => r.unread))
      row += r(X + CW - 29, y + 30, 5, 5, "#4b91df", 3);
    out += `<g opacity="${opacity}">${row}</g>`;
  }
  if (s.filter === "all" && !s.search) {
    const finalY = TOP + tasks.length * RH + 36,
      previousY = TOP + old.length * RH + 36,
      sy = finalY + (previousY - finalY) * (1 - progress);
    out += txt(X + 8, sy, "Suggestions", 16, "#858585");
    availableTemplates(s).forEach((t, i) => {
      const y = sy + 16 + i * 64;
      out +=
        ico(t.icon, X + 14, y + 16, 16) +
        `<text x="${X + 40}" y="${y + 29}" font-family="Arial,sans-serif" font-size="14" fill="#181818"><tspan>${esc(t.title)}</tspan><tspan dx="8" fill="#858585">${esc(t.time)}</tspan></text>` +
        txt(X + 40, y + 48, trunc(t.description, CW - 130), 12, "#858585");
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
  if (paneWidth > 0)
    out += drawNativePanel(panelState || s, W - paneWidth, panelFrameWidth, H);
  if (s.modal) out += drawModal(s);
  if (outgoingMenu)
    out += drawMenu(outgoingMenu.state, outgoingMenu.elapsed, false);
  if (s.menu?.kind === "select") out += drawFieldMenu(s, menuAge);
  else if (s.menu) out += drawMenu(s, menuAge, true);
  if (cursor)
    out += `<g transform="translate(${cursor[0]},${cursor[1]})" filter="url(#pointer)"><path d="M0 0v20l5-5 4 9 4-2-4-8h8Z" fill="#111" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><filter id="shadow" x="-20%" y="-40%" width="140%" height="190%"><feDropShadow dx="0" dy="5" stdDeviation="8" flood-opacity=".12"/></filter><filter id="pointer" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity=".25"/></filter></defs>${r(0, 0, W, H)}${out}</svg>`;
}
function wrap(s, width, size = 14) {
  const lines = [];
  let line = "";
  for (const word of s.split(/\s+/)) {
    if ((line + " " + word).length * size * 0.5 > width && line) {
      lines.push(line);
      line = word;
    } else line += (line ? " " : "") + word;
  }
  if (line) lines.push(line);
  return lines;
}
function drawNativePanel(s, x, w, h) {
  if (!s?.draft)
    return (
      r(x, 0, w, h, "#fff") + `<path d="M${x + 0.5} 0v${h}" stroke="#e7e7e7"/>`
    );
  const d = s.draft,
    t = s.tasks.find((t) => t.id === s.selected),
    local = d.executor === "local",
    isNew = !t,
    run = s.result && t?.runs.find((r) => r.id === s.result),
    scroll = s.panelScroll || 0;
  let out =
    r(x, 0, w, h, "#fff") + `<path d="M${x + 0.5} 0v${h}" stroke="#e7e7e7"/>`;
  out += txt(
    x + 16,
    29,
    isNew
      ? "New"
      : run
        ? "Scheduled run"
        : t.status === "active"
          ? "Active"
          : t.status === "paused"
            ? "Paused"
            : "Completed",
    12,
    t?.status === "paused" ? "#909090" : "#4b91df",
    500,
  );
  if (!isNew && !run) out += ico("more", x + w - 80, 15, 16);
  out += ico("close", x + w - 40, 15, 16);
  const pg = paneGeometry(x + w, w, h);
  const px = pg.bodyLeft,
    cw = pg.bodyWidth;
  let body = "";
  if (run) {
    body +=
      ico("back", px, 58, 16) +
      txt(px + 22, 71, "Back", 12, "#858585") +
      txt(px, 116, t.title, 20, "#181818", 500) +
      txt(
        px,
        143,
        new Date(run.createdAt).toISOString().slice(0, 16).replace("T", " "),
        12,
        "#858585",
      );
    wrap(run.content || "Running…", cw, 14).forEach(
      (line, i) => (body += txt(px, 188 + i * 23, line, 14, "#515151")),
    );
  } else {
    let y = 66;
    body += txt(
      px,
      62,
      d.title || "Name",
      16,
      d.title ? "#181818" : "#aaa",
      500,
    );
    y += 24;
    const promptLines = wrap(
        d.prompt || "Describe what ChatGPT should do",
        cw - 34,
      ),
      ph = Math.max(64, promptLines.length * 22.75 + 32) + 2;
    body += r(px, y, cw, ph, "#fff", 16, "#e5e5e5");
    promptLines.forEach(
      (line, i) =>
        (body += txt(
          px + 17,
          y + 33 + i * 22.75,
          line,
          14,
          d.prompt ? "#181818" : "#aaa",
        )),
    );
    y += ph + 24;
    const group = (heading, rows) => {
      body += txt(px + 4, y + 21, heading, 14, "#858585");
      y += 32;
      body += r(px, y, cw, rows.length * 40 + 2, "#fafafa", 16, "#e5e5e5");
      rows.forEach(([label, value, select = true], i) => {
        if (i)
          body += `<path d="M${px} ${y + i * 40}h${cw}" stroke="#f0f0f0"/>`;
        body += txt(px + 17, y + i * 40 + 26, label, 14);
        if (select === "days") {
          [1, 2, 3, 4, 5, 6, 0].forEach((day, j) => {
            const dx = px + cw - 240 + j * 32,
              chosen = value.includes(day);
            body +=
              r(
                dx,
                y + i * 40 + 6,
                28,
                28,
                chosen ? "#202020" : "#f3f3f3",
                14,
              ) +
              txt(
                dx + 14,
                y + i * 40 + 24,
                ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][day],
                12,
                chosen ? "#fff" : "#6b6b6b",
                400,
                "middle",
              );
          });
        } else {
          body += txt(
            px + cw - (select ? 38 : 17),
            y + i * 40 + 26,
            value,
            14,
            select ? "#181818" : "#858585",
            400,
            "end",
          );
          if (select) body += ico("chevron", px + cw - 30, y + i * 40 + 13, 14);
        }
      });
      y += rows.length * 40 + 26;
    };
    const detailRows = [];
    if (isNew) detailRows.push(["Runs on", local ? "This device" : "Cloud"]);
    if (local)
      detailRows.push(
        [
          "Runs in",
          d.runTarget === "persistent"
            ? "New chat for this task"
            : "New chat each run",
        ],
        ["Project", d.project === "sample" ? "Design system" : "None"],
        ["Model", "Default"],
        [
          "Reasoning",
          (d.reasoning || "medium")[0].toUpperCase() +
            (d.reasoning || "medium").slice(1),
        ],
      );
    else if (!isNew) detailRows.push(["Runs on", "Cloud", false]);
    group("Details", detailRows);
    const q = d.schedule,
      labels = {
        hourly: "Hourly",
        daily: "Daily",
        weekdays: "Weekdays",
        weekly: "Weekly",
        monthly: "Monthly",
        yearly: "Yearly",
        once: "Once",
        custom: "Custom",
      },
      freq = [["Repeat", labels[q.frequency]]];
    if (q.frequency === "weekly")
      freq.push(
        local && q.days.length <= 1
          ? [
              "On",
              [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ][q.days[0] || 0],
            ]
          : ["On", q.days, "days"],
      );
    if (q.frequency === "hourly") freq.push(["Every", `${q.interval} hours`]);
    const [hr, min] = q.time.split(":").map(Number);
    freq.push([
      "Time",
      `${hr % 12 || 12}:${String(min).padStart(2, "0")} ${hr >= 12 ? "PM" : "AM"}`,
    ]);
    if (local) freq.push(["Notifications", "Important updates"]);
    if (!local && q.frequency !== "once")
      freq.push(["End repeat", q.endDate ? "On date" : "Never"]);
    group("Frequency", freq);
    if (!local) {
      body +=
        txt(px + 16, y, "Time zone", 14, "#858585") +
        txt(px + cw - 16, y, q.timeZone, 14, "#858585", 400, "end");
      y += 40;
    }
    if (t && local) {
      body += txt(px + 4, y + 16, "Previous runs", 14, "#858585");
      y += 35;
      if (!t.runs.length)
        body += txt(px + 4, y + 20, "No runs yet", 12, "#aaa");
      for (const run of t.runs.slice(0, 4)) {
        body +=
          ico("check", px + 10, y + 12, 16) +
          txt(px + 38, y + 18, trunc(run.title, cw - 65), 12) +
          txt(
            px + 38,
            y + 37,
            new Date(run.createdAt)
              .toISOString()
              .slice(0, 16)
              .replace("T", " "),
            11,
            "#999",
          );
        y += 55;
      }
    }
  }
  out += `<svg x="${x}" y="46" width="${w}" height="${h - 46 - (isNew || (!local && s.dirty) ? 69 : 0)}" viewBox="${x} ${46 + scroll} ${w} ${h - 46 - (isNew || (!local && s.dirty) ? 69 : 0)}">${body}</svg>`;
  if (isNew || (!local && s.dirty)) {
    out +=
      r(x, h - 69, w, 69, "#fff") +
      `<path d="M${x} ${h - 69}h${w}" stroke="#ebebeb"/>` +
      r(x + w - 132, h - 48, 52, 28, "#fff", 8, "#e5e5e5") +
      txt(x + w - 106, h - 29, "Cancel", 12, "#181818", 500, "middle") +
      r(x + w - 72, h - 48, 52, 28, "#181818", 8);
    out += s.saving
      ? spinner(x + w - 65, h - 39, s.now)
      : txt(
          x + w - 46,
          h - 29,
          isNew ? "Create" : "Save",
          12,
          "#fff",
          500,
          "middle",
        );
  }
  return out;
}
function drawFieldMenu(s, age) {
  const m = s.menu,
    w = 220,
    h = m.options.length * 30 + 8,
    p = menuTransform(age);
  let out = `<g filter="url(#shadow)">${r(m.x, m.y, w, h, "#fff", 16, "#ededed")}</g>`;
  m.options.forEach(([value, label], i) => {
    if (s.menuHover === i)
      out += r(m.x + 4, m.y + 4 + i * 30, w - 8, 30, "#f2f2f2", 12);
    out += txt(m.x + 12, m.y + 24 + i * 30, label, 12);
    if (String(value) === String(m.value))
      out += ico("check", m.x + w - 28, m.y + 11 + i * 30, 16);
  });
  return `<g opacity="${p.opacity}" transform="translate(${m.x + w},${m.y}) scale(${p.scale}) translate(${-m.x - w},${-m.y})">${out}</g>`;
}
function drawModal(s) {
  const m = s.modal,
    x = 420,
    y = 298,
    w = 440,
    h = 210;
  const title =
      m.kind === "delete"
        ? `Delete ${s.tasks.find((t) => t.id === m.id)?.title}?`
        : "Discard changes?",
    description =
      m.kind === "delete"
        ? "This will permanently delete the scheduled task and stop future runs"
        : "Your unsaved changes will be lost.";
  let out =
    r(0, 0, 1280, 840, "#00000033") +
    `<g filter="url(#shadow)">${r(x, y, w, h, "#fff", 20, "#e9e9e9")}</g>` +
    ico("close", x + w - 31, y + 16, 16) +
    txt(x + 26, y + 42, title, 20, "#181818", 500);
  wrap(description, w - 52).forEach(
    (line, i) => (out += txt(x + 26, y + 76 + i * 22, line, 14, "#777")),
  );
  out +=
    r(x + 112, y + 148, 80, 36, "#fff", 18, "#e5e5e5") +
    txt(x + 152, y + 172, "Cancel", 13, "#181818", 500, "middle") +
    r(x + 202, y + 148, 212, 36, "#db3633", 18) +
    txt(
      x + 308,
      y + 172,
      m.kind === "delete" ? "Delete scheduled task" : "Discard changes",
      13,
      "#fff",
      500,
      "middle",
    );
  return out;
}
