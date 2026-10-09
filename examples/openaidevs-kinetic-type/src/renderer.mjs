import { createLayout, sampleTimeline } from './timeline.mjs';

export function createRenderer(canvas, config) {
  const ctx = canvas.getContext('2d');
  ctx.font = config.font;
  const layout = createLayout(config, text => {
    const metrics = ctx.measureText(text);
    return { width: metrics.width, ascent: metrics.actualBoundingBoxAscent, descent: metrics.actualBoundingBoxDescent, left: metrics.actualBoundingBoxLeft, right: metrics.actualBoundingBoxRight };
  });
  const color = channels => `rgb(${channels.map(value => Math.round(value)).join(' ')})`;
  function draw(seconds, options) {
    const state = sampleTimeline(config, layout, seconds, options);
    ctx.setTransform(canvas.width / config.width, 0, 0, canvas.height / config.height, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, config.width, config.height);
    ctx.font = config.font;
    ctx.textBaseline = 'alphabetic';
    for (const scene of state.scenes) {
      if (!scene.alpha) continue;
      for (const word of scene.words) {
        if (!word.alpha) continue;
        ctx.globalAlpha = scene.alpha * word.alpha;
        ctx.fillStyle = color(word.color);
        ctx.save();
        ctx.translate(word.x, word.y);
        ctx.scale(word.scaleX, word.scaleY);
        ctx.fillText(word.text, 0, 0);
        ctx.restore();
      }
      const dot = scene.dot;
      if (dot.radius > 0 && dot.alpha > 0) {
        ctx.globalAlpha = scene.alpha * dot.alpha;
        ctx.fillStyle = color(dot.color);
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    return state;
  }
  return { draw, layout };
}
