import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { buildTimeline, FPS, DURATION } from "./demo-timeline.mjs";
import { renderSVG } from "./svg-view.mjs";
const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require("sharp");
} catch {
  sharp = require(process.env.NODE_PATH + "/sharp");
}
const root = new URL("..", import.meta.url).pathname;
const output = path.join(root, "artifacts");
const frames = path.join(output, "frames");
await fs.mkdir(frames, { recursive: true });
const scenes = await buildTimeline();
await fs.writeFile(
  path.join(output, "workflow-trace.json"),
  JSON.stringify(
    {
      kind: "independent-offline-state-render",
      fps: FPS,
      duration: DURATION,
      scenes: scenes.map((x) => ({
        time: x.time,
        interaction: x.label,
        tasks: x.state.tasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          runs: t.runs.length,
        })),
        selected: x.state.selected,
        dirty: x.state.dirty,
      })),
    },
    null,
    2,
  ) + "\n",
);
const ease = (t) => t * t * (3 - 2 * t);
let last = 0;
for (let frame = 0; frame < DURATION * FPS; frame++) {
  const time = frame / FPS;
  while (last + 1 < scenes.length && scenes[last + 1].time <= time) last++;
  const scene = scenes[last],
    prev = scenes[Math.max(0, last - 1)];
  const next = scenes[last + 1];
  let cursor = scene.cursor;
  if (next && time > next.time - 0.55) {
    const k = ease(Math.max(0, Math.min(1, (time - next.time + 0.55) / 0.55)));
    cursor = [
      scene.cursor[0] + (next.cursor[0] - scene.cursor[0]) * k,
      scene.cursor[1] + (next.cursor[1] - scene.cursor[1]) * k,
    ];
  }
  const panelPhase =
    scene.state.draft && !prev.state.draft
      ? ease(Math.min(1, (time - scene.time) / 0.26))
      : 1;
  const svg = renderSVG(scene.state, { time, cursor, panelPhase });
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(frames, String(frame).padStart(5, "0") + ".png"));
  if (
    [
      0,
      Math.round(3.6 * FPS),
      Math.round(13.7 * FPS),
      Math.round(23.7 * FPS),
      Math.round(29.5 * FPS),
    ].includes(frame)
  )
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(output, `view-${frame}.png`));
  if (frame % 75 === 0) console.log(`Rendered ${frame}/${DURATION * FPS}`);
}
const ff = (args) => {
  const p = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", "-y", ...args],
    { stdio: "inherit" },
  );
  if (p.status) throw Error("ffmpeg failed");
};
ff([
  "-framerate",
  String(FPS),
  "-i",
  path.join(frames, "%05d.png"),
  "-c:v",
  "libx264",
  "-preset",
  "slow",
  "-crf",
  "18",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  path.join(output, "scheduled-workflow.mp4"),
]);
ff([
  "-framerate",
  String(FPS),
  "-i",
  path.join(frames, "%05d.png"),
  "-filter_complex",
  "[0:v]split[a][b];[a]palettegen=stats_mode=diff:max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3",
  "-loop",
  "0",
  path.join(output, "scheduled-workflow.gif"),
]);
console.log("Rendered offline previews");
