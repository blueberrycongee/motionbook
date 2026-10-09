export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const progress = (time, start, end) => end <= start ? Number(time >= end) : clamp((time - start) / (end - start));
const smooth = value => value * value * (3 - 2 * value);
const mix = (a, b, t) => a + (b - a) * t;

export function interpolateTrack(track, seconds) {
  if (seconds <= track[0][0]) return track[0].slice(1);
  if (seconds >= track.at(-1)[0]) return track.at(-1).slice(1);
  const index = track.findIndex((key, i) => i < track.length - 1 && seconds < track[i + 1][0]);
  const a = track[index], b = track[index + 1], span = b[0] - a[0];
  const t = (seconds - a[0]) / span;
  function slope(i, dimension) {
    const first = Math.max(0, i - 1), last = Math.min(track.length - 1, i + 1);
    if (first === i || last === i) return (track[last][dimension] - track[first][dimension]) / (track[last][0] - track[first][0]);
    const h0 = track[i][0] - track[first][0], h1 = track[last][0] - track[i][0];
    const v0 = (track[i][dimension] - track[first][dimension]) / h0, v1 = (track[last][dimension] - track[i][dimension]) / h1;
    if (v0 * v1 <= 0) return 0;
    const w0 = 2 * h1 + h0, w1 = h1 + 2 * h0;
    return (w0 + w1) / (w0 / v0 + w1 / v1);
  }
  return a.slice(1).map((value, i) => {
    const d = i + 1;
    return (2 * t ** 3 - 3 * t ** 2 + 1) * value + (t ** 3 - 2 * t ** 2 + t) * span * slope(index, d)
      + (-2 * t ** 3 + 3 * t ** 2) * b[d] + (t ** 3 - t ** 2) * span * slope(index + 1, d);
  });
}

export function createLayout(config, measure) {
  return config.scenes.map(scene => {
    const ascent = Math.max(...scene.lines.map(line => measure(line).ascent));
    const baseline = scene.inkTop + ascent;
    let index = 0;
    const words = scene.lines.flatMap((line, row) => {
      const tokens = line.split(' ');
      const lineMetrics = measure(line);
      const referenceLine = scene.lineInkBounds?.[row];
      const factor = config.width / 560;
      const scaleY = referenceLine ? (referenceLine[1] - referenceLine[0]) * factor / (lineMetrics.ascent + lineMetrics.descent) : 1;
      const y = referenceLine ? referenceLine[1] * factor - lineMetrics.descent * scaleY : baseline + row * config.lineHeight;
      return tokens.map((text, column) => {
        const wordIndex = index++;
        const prefix = tokens.slice(0, column).join(' ') + (column ? ' ' : '');
        const metrics = measure(text);
        const bounds = scene.wordInkBounds?.[wordIndex];
        const scaleX = bounds ? (bounds[1] - bounds[0]) * factor / (metrics.left + metrics.right) : 1;
        const x = bounds ? bounds[0] * factor + metrics.left * scaleX : scene.left + measure(prefix).width;
        return { text, x, y, scaleX, scaleY, width: metrics.width * scaleX, row, cue: scene.cues[wordIndex], revealDuration: scene.revealDurations?.[wordIndex] ?? scene.revealDuration, whiteAt: scene.whiteAt?.[wordIndex] };
      });
    });
    if (index !== scene.cues.length || scene.cues.some((cue, i) => !Number.isFinite(cue) || (i && cue <= scene.cues[i - 1]))) {
      throw new Error(`${scene.id}: provide one increasing cue per word`);
    }
    return { ...scene, words };
  });
}

function dotAt(scene, time, config) {
  const [x, y, radius] = interpolateTrack(scene.dotTrack, time);
  const factor = config.width / 560;
  const tint = smooth(progress(time, ...scene.dotTint));
  return { x: x * factor, y: y * factor, radius: radius * factor, alpha: 1, color: scene.accent.map(channel => mix(255, channel, tint)) };
}

export function sampleTimeline(config, layout, seconds, { reducedMotion = false } = {}) {
  if (!Number.isFinite(seconds)) throw new TypeError('Timeline time must be finite');
  const time = clamp(seconds, 0, config.duration);
  if (reducedMotion) {
    const scene = layout.at(-1);
    return { time, scenes: [{ id: scene.id, alpha: 1, words: scene.words.map(word => ({ ...word, alpha: 1, color: [255, 255, 255] })), dot: { x: 0, y: 0, radius: 0, alpha: 0 } }] };
  }
  return {
    time,
    scenes: layout.map(scene => ({
      id: scene.id,
      alpha: 1 - smooth(progress(time, ...scene.fade)),
      words: scene.words.map(word => {
        const revealEnd = word.cue + word.revealDuration;
        const colorProgress = smooth(progress(time, revealEnd, word.whiteAt ?? revealEnd));
        return { ...word, alpha: smooth(progress(time, word.cue, revealEnd)), color: scene.accent.map(channel => mix(channel, 255, colorProgress)) };
      }),
      dot: dotAt(scene, time, config),
    })),
  };
}

export function createPlayback(duration, { reducedMotion = false } = {}) {
  let elapsed = 0;
  let anchor = 0;
  let playing = false;
  let reduced = reducedMotion;
  const sample = now => {
    if (playing) {
      elapsed = clamp((now - anchor) / 1000, 0, duration);
      if (elapsed === duration) playing = false;
    }
    return { time: elapsed, playing, reducedMotion: reduced };
  };
  return {
    sample,
    play(now) {
      if (reduced) return sample(now);
      if (!playing) {
        if (elapsed === duration) elapsed = 0;
        anchor = now - elapsed * 1000;
        playing = true;
      }
      return sample(now);
    },
    pause(now) { sample(now); playing = false; return sample(now); },
    seek(seconds, now) {
      if (!Number.isFinite(seconds)) throw new TypeError('Seek time must be finite');
      elapsed = clamp(seconds, 0, duration);
      anchor = now - elapsed * 1000;
      if (elapsed === duration) playing = false;
      return sample(now);
    },
    replay(now) { elapsed = 0; anchor = now; playing = !reduced; return sample(now); },
    setReducedMotion(value, now) { sample(now); reduced = Boolean(value); if (reduced) playing = false; return sample(now); },
  };
}
