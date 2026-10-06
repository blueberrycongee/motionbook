import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import {
  nativeTimeline as motionTimeline,
  NATIVE_DURATION as MOTION_DURATION,
  NATIVE_FPS as MOTION_FPS,
} from "./native-workflow-timeline.mjs";
import { nativeSVG as motionSVG } from "./native-workflow-view.mjs";
import { MOTION, menuTransform, layoutProgress } from "../src/motion-spec.mjs";
const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require("sharp");
} catch {
  sharp = require(process.env.NODE_PATH + "/sharp");
}
const out = new URL("../artifacts/native-workflow/", import.meta.url).pathname,
  frames = path.join(out, "frames");
await fs.mkdir(frames, { recursive: true });
const scenes = await motionTimeline();
const fingerprint = (s) =>
  s.menu ? JSON.stringify([s.menu.kind, s.menu.id]) : "";
let sceneIndex = 0,
  menuAt = 0,
  lastMenu = "",
  outgoing = null,
  paneAt = -1,
  paneOpen = false,
  lastPanelState = null;
const trace = [];
const baseCache = new Map();
const pointer = await sharp(
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="32"><defs><filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity=".25"/></filter></defs><path d="M2 2v20l5-5 4 9 4-2-4-8h8Z" fill="#111" stroke="#fff" stroke-width="1.2" stroke-linejoin="round" filter="url(#s)"/></svg>',
  ),
)
  .png()
  .toBuffer();
for (let i = 0; i < MOTION_DURATION * MOTION_FPS; i++) {
  const t = i / MOTION_FPS;
  while (sceneIndex + 1 < scenes.length && scenes[sceneIndex + 1].time <= t)
    sceneIndex++;
  const scene = scenes[sceneIndex],
    prev = scenes[Math.max(0, sceneIndex - 1)],
    menu = fingerprint(scene.state);
  const nextPaneOpen = !!scene.state.draft;
  if (nextPaneOpen !== paneOpen) {
    paneOpen = nextPaneOpen;
    paneAt = scene.time;
  }
  if (scene.state.draft) lastPanelState = scene.state;
  const paneProgress = Math.max(
    0,
    Math.min(1, layoutProgress((t - paneAt) * 1000)),
  );
  const paneWidth = 600 * (paneOpen ? paneProgress : 1 - paneProgress);
  if (menu !== lastMenu) {
    if (lastMenu) outgoing = { state: prev.state, start: scene.time };
    menuAt = scene.time;
    lastMenu = menu;
  }
  const next = scenes[sceneIndex + 1];
  let cursor = scene.cursor;
  if (next && t > next.time - 0.45) {
    const p = Math.max(0, Math.min(1, (t - next.time + 0.45) / 0.45)),
      q = p * p * (3 - 2 * p);
    cursor = [
      scene.cursor[0] + (next.cursor[0] - scene.cursor[0]) * q,
      scene.cursor[1] + (next.cursor[1] - scene.cursor[1]) * q,
    ];
  }
  const outgoingMenu =
    outgoing && (t - outgoing.start) * 1000 < MOTION.menu.exitMs
      ? { state: outgoing.state, elapsed: (t - outgoing.start) * 1000 }
      : null;
  const elapsed = (t - scene.time) * 1000,
    menuAge = (t - menuAt) * 1000;
  const svg = motionSVG(scene, prev, {
    time: t,
    cursor: null,
    elapsed,
    menuAge,
    outgoingMenu,
    paneWidth,
    panelState: paneOpen ? lastPanelState : {},
  });
  if (!process.env.REPAIR_ONLY_MODAL || scene.state.modal) {
    let base = baseCache.get(svg);
    if (baseCache.size > 100) baseCache.clear();
    if (!base) {
      base = await sharp(Buffer.from(svg)).png().toBuffer();
      baseCache.set(svg, base);
    }
    await sharp(base)
      .composite([
        {
          input: pointer,
          left: Math.round(cursor[0]) - 2,
          top: Math.round(cursor[1]) - 2,
        },
      ])
      .png()
      .toFile(path.join(frames, String(i).padStart(5, "0") + ".png"));
    if ([0, 100, 230, 270, 530, 780, 900, 1260, 1360, 1580].includes(i))
      await sharp(Buffer.from(svg))
        .png()
        .toFile(path.join(out, `detail-${i}.png`));
  }
  trace.push({
    frame: i,
    time: t,
    action: scene.action,
    menu: menu ? menuTransform(menuAge) : null,
    paneWidth,
    exit: outgoingMenu ? menuTransform(outgoingMenu.elapsed, false) : null,
  });
  if (i % 180 === 0)
    console.log(`Motion frames ${i}/${MOTION_DURATION * MOTION_FPS}`);
}
await fs.writeFile(
  path.join(out, "motion-trace.json"),
  JSON.stringify({
    fps: MOTION_FPS,
    duration: MOTION_DURATION,
    renderMethod:
      "offline; user-confirmed native Automation manager, shared shell/menu animation contracts and local state simulation",
    sourceSpringSamples: [0, 50, 100, 150, 200, 250, 300, 400, 500].map((t) => [
      t,
      layoutProgress(t),
    ]),
    frames: trace,
  }) + "\n",
);
const ff = (args) => {
  const x = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", "-y", ...args],
    { stdio: "inherit" },
  );
  if (x.status !== 0)
    throw Error(`Encoding failed: status=${x.status}, signal=${x.signal}`);
};
ff([
  "-framerate",
  String(MOTION_FPS),
  "-i",
  path.join(frames, "%05d.png"),
  "-c:v",
  "libx264",
  "-preset",
  "medium",
  "-crf",
  "17",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  path.join(out, "native-automation-workflow-60fps.mp4"),
]);
ff([
  "-filter_threads",
  "1",
  "-framerate",
  String(MOTION_FPS),
  "-i",
  path.join(frames, "%05d.png"),
  "-vf",
  "fps=50,palettegen=stats_mode=diff:max_colors=128",
  "-frames:v",
  "1",
  path.join(out, "palette.png"),
]);
ff([
  "-filter_complex_threads",
  "1",
  "-framerate",
  String(MOTION_FPS),
  "-i",
  path.join(frames, "%05d.png"),
  "-i",
  path.join(out, "palette.png"),
  "-lavfi",
  "fps=50[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3",
  "-loop",
  "0",
  path.join(out, "native-automation-workflow.gif"),
]);
console.log("Completed 60 fps MP4 and 50 fps GIF");
