/* Original artwork. No Apple window captures, icons, wallpaper or implementation. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./motion.js'));
  else root.GenieScene = factory(root.GenieMotion);
})(typeof window !== 'undefined' ? window : globalThis, function (M) {
  'use strict';
  const FONT = 'Genie Sans';
  function round(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }
  function text(ctx, value, x, y, size = 14, color = '#263b40', weight = 400, align = 'left') {
    ctx.font = `${weight} ${size}px "${FONT}", Arial, sans-serif`;
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(value, x, y);
  }
  function line(ctx, points, color, width = 1) {
    ctx.beginPath(); ctx.moveTo(...points[0]); points.slice(1).forEach(p => ctx.lineTo(...p));
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  }
  function circle(ctx, x, y, r, fill, stroke) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = .75; ctx.stroke(); }
  }
  function folder(ctx, x, y, color = '#6f8787') {
    line(ctx, [[x, y + 10], [x, y], [x + 6, y], [x + 8, y + 3], [x + 16, y + 3], [x + 16, y + 12], [x, y + 12]], color, 1.2);
  }
  function landscape(ctx, x, y, w, h) {
    ctx.save(); round(ctx, x, y, w, h, 9); ctx.clip();
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#d0e5df'); g.addColorStop(.6, '#ede4c5'); g.addColorStop(1, '#eed6aa');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    circle(ctx, x + w * .76, y + h * .32, h * .17, '#f9f0d5');
    ctx.fillStyle = '#8caca1'; ctx.beginPath(); ctx.moveTo(x, y + h);
    ctx.bezierCurveTo(x + w * .12, y + h * .3, x + w * .43, y + h * .85, x + w * .6, y + h * .45);
    ctx.bezierCurveTo(x + w * .8, y + h * .07, x + w * .84, y + h * .7, x + w, y + h * .45);
    ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#47776c'; ctx.beginPath(); ctx.moveTo(x, y + h);
    ctx.bezierCurveTo(x + w * .28, y + h * 1.15, x + w * .28, y + h * .39, x + w * .51, y + h * .65);
    ctx.bezierCurveTo(x + w * .76, y + h * .98, x + w * .83, y + h * .67, x + w, y + h * .68);
    ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#bfd0ad'; ctx.lineWidth = 1.2; ctx.beginPath();
    ctx.moveTo(x + w * .35, y + h); ctx.bezierCurveTo(x + w * .4, y + h * .62, x + w * .56, y + h * .97, x + w * .62, y + h * .85); ctx.stroke();
    ctx.restore();
  }
  function windowTexture(ctx) {
    const { w, h } = M.WINDOW;
    ctx.clearRect(0, 0, w, h);
    ctx.save(); round(ctx, 0, 0, w, h, 13); ctx.clip();
    ctx.fillStyle = '#fbfcf8'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f0f3ef'; ctx.fillRect(0, 0, 167, h);
    ctx.fillStyle = '#f7f8f4'; ctx.fillRect(167, 0, w - 167, 48);
    line(ctx, [[167, 0], [167, h]], '#dce3db');
    circle(ctx, 22, 24, 5.5, '#ec8179', '#d76962');
    circle(ctx, 42, 24, 5.5, '#f0c662', '#d5ac4c');
    circle(ctx, 62, 24, 5.5, '#90bd85', '#79a76d');
    text(ctx, 'Field Notes', 205, 29, 13, '#4a5b55', 500);
    line(ctx, [[626, 22], [634, 22]], '#75847b', 1.5);
    line(ctx, [[652, 19], [652, 29]], '#75847b', 1.2);
    line(ctx, [[647, 24], [657, 24]], '#75847b', 1.2);
    text(ctx, 'LIBRARY', 22, 78, 9, '#89968b', 500);
    round(ctx, 12, 93, 143, 32, 6, '#dfe8dd'); folder(ctx, 24, 103, '#56755d');
    text(ctx, 'All notes', 50, 114, 11, '#365c42', 500); text(ctx, '12', 139, 114, 10, '#658469', 400, 'right');
    folder(ctx, 24, 143); text(ctx, 'Ideas', 50, 154, 11, '#718078');
    folder(ctx, 24, 183); text(ctx, 'Little details', 50, 194, 11, '#718078');
    folder(ctx, 24, 223); text(ctx, 'Someday', 50, 234, 11, '#718078');
    line(ctx, [[22, 276], [143, 276]], '#d9e1d7');
    text(ctx, 'A place for possibility.', 22, 300, 9, '#96a093');
    circle(ctx, 28, 364, 8, '#dbe7d3'); text(ctx, 'F', 28, 367, 9, '#54754e', 500, 'center');
    text(ctx, 'Personal', 44, 368, 10, '#6c7f68');
    text(ctx, 'THE ART OF GETTING OUT OF THE WAY', 201, 78, 9, '#85916e', 500);
    text(ctx, 'Ideas in motion.', 201, 118, 29, '#283f33', 500);
    landscape(ctx, 201, 141, 456, 129);
    text(ctx, 'Small details. Lasting impressions.', 201, 298, 15, '#435640', 500);
    text(ctx, 'A window becomes a memory, then finds its way back.', 201, 321, 10.5, '#7a8675');
    line(ctx, [[201, 343], [656, 343]], '#e3e8dd');
    circle(ctx, 205, 366, 3, '#a9ba91'); text(ctx, 'Saved just now', 216, 370, 9, '#8a9681');
    text(ctx, '01 / 12', 655, 370, 9, '#8a9681', 400, 'right');
    ctx.restore();
    round(ctx, .5, .5, w - 1, h - 1, 13, null, 'rgba(255,255,255,.8)');
  }
  function wallpaper(ctx) {
    const bg = ctx.createLinearGradient(0, 0, 1080, 680);
    bg.addColorStop(0, '#b8d4d8'); bg.addColorStop(.5, '#81b5b8'); bg.addColorStop(1, '#40878f');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, M.W, M.H);
    const glow = ctx.createRadialGradient(300, 60, 20, 350, 100, 700);
    glow.addColorStop(0, 'rgba(246,246,220,.75)'); glow.addColorStop(1, 'rgba(225,242,226,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, M.W, M.H);
    ctx.fillStyle = 'rgba(53,118,125,.2)'; ctx.beginPath(); ctx.moveTo(-50, 500);
    ctx.bezierCurveTo(140, 500, 108, 200, 515, 307); ctx.bezierCurveTo(810, 384, 816, 601, 1140, 400);
    ctx.lineTo(1140, 730); ctx.lineTo(-50, 730); ctx.fill();
    const dune = ctx.createLinearGradient(600, 400, 900, 720); dune.addColorStop(0, '#69a4a9'); dune.addColorStop(1, '#235d6b');
    ctx.fillStyle = dune; ctx.beginPath(); ctx.moveTo(-80, 590);
    ctx.bezierCurveTo(280, 310, 380, 721, 732, 415); ctx.bezierCurveTo(883, 272, 1031, 238, 1130, 170);
    ctx.lineTo(1130, 700); ctx.lineTo(-80, 700); ctx.fill();
    ctx.strokeStyle = 'rgba(216,243,226,.26)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-80, 590);
    ctx.bezierCurveTo(280, 310, 380, 721, 732, 415); ctx.bezierCurveTo(883, 272, 1031, 238, 1130, 170); ctx.stroke();
    ctx.fillStyle = 'rgba(237,248,239,.28)'; ctx.fillRect(0, 0, 1080, 30);
    ctx.save(); ctx.translate(26, 15); ctx.rotate(Math.PI / 4); round(ctx, -4, -4, 8, 8, 1, '#385e5b'); ctx.restore(); text(ctx, 'Field Notes', 49, 20, 11, '#2b4e4d', 500);
    ['File', 'Edit', 'View', 'Window'].forEach((t, i) => text(ctx, t, 145 + i * 46, 20, 10, '#355b5b'));
    text(ctx, 'Tue 9:41', 1057, 20, 10, '#355b5b', 500, 'right');
  }
  function appIcon(ctx, x, y, type, fill) {
    ctx.save(); ctx.shadowColor = 'rgba(17,52,55,.18)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2;
    round(ctx, x, y, 45, 45, 11, fill); ctx.restore();
    if (type === 'folder') {
      round(ctx, x + 8, y + 14, 29, 22, 3, '#c3eff0'); round(ctx, x + 8, y + 10, 14, 11, 3, '#c3eff0');
    } else if (type === 'compass') {
      circle(ctx, x + 22.5, y + 22.5, 16, '#eaf6f5');
      ctx.beginPath(); ctx.moveTo(x + 30, y + 12); ctx.lineTo(x + 24, y + 25); ctx.lineTo(x + 14, y + 34); ctx.lineTo(x + 20, y + 21); ctx.closePath(); ctx.fillStyle = '#5b8295'; ctx.fill();
      line(ctx, [[x + 30, y + 12], [x + 20, y + 21]], '#da8270', 2);
    } else if (type === 'notes') {
      round(ctx, x + 10, y + 8, 26, 30, 4, '#fff8d2');
      [17, 23, 29].forEach(v => line(ctx, [[x + 16, y + v], [x + 29, y + v]], '#c8b77b', 1.5));
    } else if (type === 'gallery') {
      landscape(ctx, x + 6, y + 7, 33, 31); circle(ctx, x + 28, y + 17, 4, '#f9e7b4');
    } else if (type === 'terminal') {
      line(ctx, [[x + 11, y + 14], [x + 18, y + 21], [x + 11, y + 28]], '#c7e6d6', 2);
      line(ctx, [[x + 22, y + 29], [x + 33, y + 29]], '#c7e6d6', 2);
    } else if (type === 'mail') {
      round(ctx, x + 7, y + 11, 31, 24, 4, '#e5f1f4');
      line(ctx, [[x + 8, y + 13], [x + 22.5, y + 24], [x + 37, y + 13]], '#77a6bd', 1.5);
    }
  }
  function dock(ctx, texture, progress, hover) {
    ctx.save(); ctx.shadowBlur = 22; ctx.shadowColor = 'rgba(19,58,64,.17)'; ctx.shadowOffsetY = 8;
    round(ctx, 281, 584, 548, 75, 20, 'rgba(228,245,233,.37)', 'rgba(249,255,249,.48)'); ctx.restore();
    const icons = [['folder', '#72b6c1'], ['compass', '#a0c5d0'], ['notes', '#e9cd75'], ['gallery', '#bed1b6'], ['mail', '#85b4c8'], ['terminal', '#3a6063']];
    icons.forEach(([type, color], i) => appIcon(ctx, 295 + i * 66, 597, type, color));
    circle(ctx, 449, 651, 2, '#456b64');
    line(ctx, [[707, 600], [707, 643]], 'rgba(61,102,98,.35)');
    round(ctx, 731, 593, 86, 57, 10, hover ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.1)');
    if (progress > .82) {
      ctx.save(); ctx.globalAlpha = M.smooth((progress - .82) / .18);
      ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(20,42,40,.2)'; ctx.shadowOffsetY = 2;
      ctx.drawImage(texture, M.TARGET.x, M.TARGET.y, M.TARGET.w, M.TARGET.h); ctx.restore();
    } else {
      round(ctx, 745, 604, 58, 31, 3, null, 'rgba(238,252,246,.33)');
      text(ctx, '↙', 774, 626, 17, 'rgba(233,250,240,.6)', 400, 'center');
    }
    if (hover) {
      round(ctx, 730, 552, 88, 24, 6, '#f2f7eb'); text(ctx, 'Field Notes', 774, 568, 10, '#38564c', 500, 'center');
    }
  }
  function pathOutline(ctx, points) {
    ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    for (let i = points.length - 1; i >= 0; i--) ctx.lineTo(points[i].x + points[i].w, points[i].y);
    ctx.closePath();
  }
  function warpedWindow(ctx, texture, progress, options = {}) {
    const p = M.clamp(progress), source = options.source || M.WINDOW, destination = options.destination || M.TARGET, clip = options.clip ?? M.DOCK_CLIP;
    if (p === 0) {
      ctx.save(); ctx.shadowColor = 'rgba(23,60,59,.27)'; ctx.shadowBlur = 37; ctx.shadowOffsetY = 18;
      ctx.drawImage(texture, source.x, source.y, source.w, source.h); ctx.restore(); return;
    }
    if (p >= 1) return;
    const edge = M.outline(p, 128, options);
    ctx.save(); ctx.beginPath(); ctx.rect(-10000, -10000, 30000, clip + 10000); ctx.clip();
    ctx.save(); pathOutline(ctx, edge); ctx.shadowColor = 'rgba(22,59,59,.22)'; ctx.shadowBlur = 24 * (1 - p); ctx.shadowOffsetY = 12 * (1 - p); ctx.fillStyle = '#f7f8ef'; ctx.fill(); ctx.restore();
    pathOutline(ctx, edge); ctx.clip();
    // 256 texture bands, overlapped by 0.55 output pixels to avoid seams.
    // The outer curved clip keeps overlapped rows inside a continuous silhouette.
    const strips = 256;
    for (let i = 0; i < strips; i++) {
      const a = M.row(p, i / strips, source, destination, options), b = M.row(p, (i + 1) / strips, source, destination, options), m = M.row(p, (i + .5) / strips, source, destination, options);
      if (a.y >= clip) break;
      const sy = i * texture.height / strips;
      const dh = b.y - a.y + .55;
      const sh = Math.min(texture.height - sy, texture.height / strips * dh / (b.y - a.y));
      ctx.drawImage(texture, 0, sy, texture.width, sh, m.x - .15, a.y, m.w + .3, dh);
    }
    ctx.restore();
  }
  function createRenderer(createCanvas) {
    const texture = createCanvas(M.WINDOW.w * 2, M.WINDOW.h * 2);
    const tx = texture.getContext('2d'); tx.scale(2, 2); windowTexture(tx);
    const background = createCanvas(M.W, M.H); wallpaper(background.getContext('2d'));
    function draw(ctx, progress = 0, options = {}) {
      ctx.clearRect(0, 0, M.W, M.H); ctx.drawImage(background, 0, 0);
      // The sheet travels behind the Dock; its source rows are occluded, not vertically scaled.
      warpedWindow(ctx, texture, progress, options);
      dock(ctx, texture, progress, !!options.hover);
      if (options.label) {
        round(ctx, 24, 633, 247, 27, 13.5, 'rgba(33,78,81,.42)');
        circle(ctx, 40, 646, 3, '#bfd6bd'); text(ctx, options.label, 52, 650, 9, '#f0f6ea', 500);
      }
    }
    return { draw, texture };
  }
  return { createRenderer, windowTexture, wallpaper, warpedWindow };
});
