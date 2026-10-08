// Tidy product film — every pixel is a pure function of time t (seconds).
// window.render(t) updates the DOM; no timers, no transitions, no real-time playback.
(() => {
const DURATION = 21.8;
const stage = document.getElementById('stage');

/* ───────────────────────── math & easing ───────────────────────── */
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
function bez(x1, y1, x2, y2) {
  return x => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let lo = 0, hi = 1, m = 0;
    for (let i = 0; i < 32; i++) {
      m = (lo + hi) / 2;
      const cx = 3 * (1 - m) * (1 - m) * m * x1 + 3 * (1 - m) * m * m * x2 + m * m * m;
      if (cx < x) lo = m; else hi = m;
    }
    return 3 * (1 - m) * (1 - m) * m * y1 + 3 * (1 - m) * m * m * y2 + m * m * m;
  };
}
const E = {
  lin: x => x,
  out: bez(.16, 1, .3, 1),        // expo-ish settle
  out2: bez(.22, .9, .3, 1),      // softer settle
  in: bez(.55, 0, .9, .45),
  inOut: bez(.65, 0, .3, 1),
  smooth: bez(.4, 0, .2, 1),
  pop: bez(.25, .95, .35, 1.1),   // gentle overshoot
  travel: bez(.5, 0, .15, 1),
};
const T = (t, a, b, e = E.out) => e(prog(t, a, b));
// damped spring step response (0 -> 1 with overshoot)
function spr(t, a, w = 22, z = .55) {
  const s = t - a; if (s <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * s) * (Math.cos(wd * s) + (z * w / wd) * Math.sin(wd * s));
}
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/* ───────────────────────── color helpers ───────────────────────── */
const hex2 = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgba = (h, a) => { const [r, g, b] = hex2(h); return `rgba(${r},${g},${b},${a})`; };
const mix = (a, b, t) => { const A = hex2(a), B = hex2(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`; };
const INK = '#14151A', GREEN = '#22B07D';
const TAGS = {
  Work:   { c: '#4F6BFF', fg: '#3450E6' },
  Health: { c: '#22B07D', fg: '#14855E' },
  Home:   { c: '#F29A2E', fg: '#B96C0A' },
  Urgent: { c: '#F0506E', fg: '#D2365A' },
};

/* ───────────────────────── DOM helpers ───────────────────────── */
function el(tag, cls, parent, css, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (css) Object.assign(e.style, css);
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}
const px = v => v + 'px';
const CHECK_SVG = (sw = 2.8, col = '#fff') => `<svg viewBox="0 0 26 26" fill="none"><path class="ck" d="M7.2 13.6l3.8 3.8 7.8-8.6" pathLength="1" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;

/* ───────────────────────── scene timeline (seconds) ───────────────────────── */
const TL = {
  composerOpen: 1.95, typeStart: 2.75, sendTap: 4.55, sheetClose: 4.62,
  newRow: 4.8,
  rowOpen: 6.15, healthTap: 7.2, urgentTap: 8.0, rowClose: 8.65,
  doneDent: 10.1, doneMia: 12.1,
  phoneMoveA: 13.4, phoneMoveB: 14.3,
  doneGroc: 14.55, flightsType: 15.65, flightsEnter: 16.75,
  circleA: 18.7, circleB: 19.45,
};
const SCENES = [0.5, 5.4, 9.3, 13.6, 18.7]; // text/segment boundaries

/* ───────────────────────── background ───────────────────────── */
const bg = el('div', 'abs', stage, { inset: 0, overflow: 'hidden' });
const PAL = [
  ['#FFD6BD', '#DCD2FF', '#FFEFC2'],
  ['#BFEBD9', '#C6DDFF', '#E6F4BD'],
  ['#FFE09E', '#FFC3D2', '#CFEFC8'],
  ['#C3DCFF', '#DACCFF', '#BDEFE4'],
];
const blobs = [0, 1, 2].map(() => el('div', 'abs', bg, { width: '1000px', height: '1000px', left: '-500px', top: '-500px', willChange: 'transform' }));
function updBg(t) {
  const bounds = [0, 5.4, 9.3, 13.6, 99];
  let i = 0; while (t >= bounds[i + 1]) i++;
  const k = clamp(i, 0, 3);
  // soft cross-fade into the next palette during the last 0.9s before a boundary
  const w = k < 3 ? T(t, bounds[k + 1] - .9, bounds[k + 1] + .3, E.smooth) : 0;
  const cur = PAL[k], nxt = PAL[Math.min(k + 1, 3)];
  const pos = [[220, 160], [1090, 640], [760, 260]];
  blobs.forEach((b, j) => {
    const col = mix(cur[j], nxt[j], w);
    const dx = Math.sin(t * .35 + j * 2.1) * 70, dy = Math.cos(t * .29 + j * 1.3) * 60;
    b.style.background = `radial-gradient(circle at 50% 50%, ${col} 0%, ${col.replace('rgb', 'rgba').replace(')', ',0.0)')} 62%)`;
    b.style.transform = `translate(${pos[j][0] + dx}px,${pos[j][1] + dy}px)`;
  });
}

/* ───────────────────────── left-hand copy ───────────────────────── */
const textDefs = [
  { k: 'Capture', n: '01', lines: ['Jot it down', 'in a <em>breath.</em>'], sub: 'One tap and one sentence. Tidy files the rest.', a: .55, b: 5.3, ac: '#F0703C' },
  { k: 'Organize', n: '02', lines: ['Label it,', '<em>lightly.</em>'], sub: 'Tags snap into place right where you are.', a: 5.6, b: 9.15, ac: '#16A06C' },
  { k: 'Finish', n: '03', lines: ['Done feels', '<em>good.</em>'], sub: 'A tiny burst of delight for every check.', a: 9.5, b: 13.2, ac: '#E19A0B' },
  { k: 'Sync', n: '04', lines: ['Everywhere, <em>instantly.</em>'], sub: 'Phone and laptop, always on the same page.', a: 14.3, b: 18.45, ac: '#4F6BFF', x: 680, y: 88, fs: 44, ss: 16, small: true },
];
const textObjs = textDefs.map(d => {
  const box = el('div', 'txt', stage, { left: px(d.x || 100), top: px(d.y || 238), display: 'none' });
  box.style.setProperty('--fs', px(d.fs || 62)); box.style.setProperty('--ac', d.ac); box.style.setProperty('--ss', px(d.ss || 19));
  const kick = el('div', 'kicker', box, null, `<i style="background:${d.ac}"></i>${d.n}&nbsp;&nbsp;/&nbsp;&nbsp;${d.k}`);
  const wrap = el('div', null, box, { marginTop: d.small ? '8px' : '16px' });
  const lines = d.lines.map(l => { const m = el('div', 'mask', wrap); return el('div', 'ln', m, null, l); });
  const sub = el('div', 'sub', box, d.small ? { marginTop: '12px', width: '540px' } : null, d.sub);
  return { d, box, kick, lines, sub };
});
function updText(t) {
  for (const o of textObjs) {
    const { a, b } = o.d;
    if (t < a - .05 || t > b + 1) { o.box.style.display = 'none'; continue; }
    o.box.style.display = 'block';
    const kin = T(t, a, a + .6), kout = T(t, b, b + .3, E.in);
    o.kick.style.opacity = kin * (1 - kout);
    o.kick.style.transform = `translateY(${(1 - kin) * 10 - kout * 10}px)`;
    o.lines.forEach((ln, j) => {
      const s = a + .06 + .1 * j, so = b + .06 * j;
      const pi = T(t, s, s + .9), po = T(t, so, so + .42, E.in);
      ln.style.transform = `translateY(${(1 - pi) * 108 - po * 108}px)`;
    });
    const sin = T(t, a + .4, a + 1.1), sout = T(t, b, b + .3, E.in);
    o.sub.style.opacity = sin * (1 - sout);
    o.sub.style.transform = `translateY(${(1 - sin) * 14 - sout * 8}px)`;
  }
}

/* vertical scene meter, far left */
const segs = [0, 1, 2, 3].map(i => {
  const tr = el('div', 'abs', stage, { left: '52px', top: px(292 + i * 42), width: '4px', height: '34px', borderRadius: '2px', background: 'rgba(20,21,26,.1)', overflow: 'hidden' });
  const f = el('div', 'abs', tr, { inset: 0, background: INK, transformOrigin: '50% 0' });
  return f;
});
const segWrap = segs[0].parentNode.parentNode;
function updSegs(t) {
  segs.forEach((f, i) => { f.style.transform = `scaleY(${T(t, SCENES[i], SCENES[i + 1], E.lin)})`; });
}

/* little brand mark, top-left */
const mark = el('div', 'abs', stage, { left: '100px', top: '52px', width: '34px', height: '34px', borderRadius: '10px', background: INK, boxShadow: '0 8px 16px -6px rgba(20,21,26,.45)' },
  `<svg viewBox="0 0 34 34" width="34" height="34" fill="none"><path class="mk" d="M9.5 17.5l5 5 10-11" pathLength="1" stroke="#3FE0A8" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`);
const markPath = mark.querySelector('.mk');
function updMark(t) {
  const p = spr(t, .15, 20, .6);
  mark.style.opacity = T(t, .1, .4);
  mark.style.transform = `scale(${lerp(.6, 1, p)})`;
  markPath.style.strokeDashoffset = 1 - T(t, .35, .85);
}

/* ───────────────────────── reusable bits ───────────────────────── */
// Digit roll: changes = [[t, value], ...] sorted; old value slides up, new rises in.
function makeRoll(parent, css) {
  const box = el('span', 'roll', parent, css);
  const a = el('span', 'r1', box), b = el('span', 'r2', box);
  return { box, a, b, last: '' };
}
function updRoll(r, changes, t, dur = .5) {
  let i = -1; for (let k = 0; k < changes.length; k++) if (changes[k][0] <= t) i = k;
  const cur = changes[Math.max(i, 0)][1], prev = i > 0 ? changes[i - 1][1] : cur;
  const p = i > 0 ? T(t, changes[i][0], changes[i][0] + dur, E.out) : 1;
  const key = prev + '|' + cur; if (key !== r.last) { r.a.textContent = prev; r.b.textContent = cur; r.last = key; }
  r.a.style.transform = `translateY(${-p * 100}%)`; r.a.style.opacity = 1 - p;
  r.b.style.transform = `translateY(${(1 - p) * 100}%)`; r.b.style.opacity = p;
}
const changesOf = (events, idx) => {
  const out = []; let last = null;
  events.forEach(e => { if (e[idx] !== last) { out.push([e[0], e[idx]]); last = e[idx]; } });
  return out;
};
function fracAt(events, t) {
  let v = events[0][1] / events[0][2];
  for (let i = 1; i < events.length; i++) {
    const nv = events[i][1] / events[i][2];
    const p = T(t, events[i][0], events[i][0] + .8, E.smooth);
    if (t >= events[i][0]) v = lerp(i > 0 ? events[i - 1][1] / events[i - 1][2] : nv, nv, p);
  }
  return v;
}
function makeRing(parent, left, top, size, stroke, fs, events) {
  const root = el('div', 'abs', parent, { left: px(left), top: px(top), width: px(size), height: px(size) });
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  root.innerHTML = `<svg width="${size}" height="${size}" style="transform:rotate(-90deg)"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#E7E3D9" stroke-width="${stroke}"/><circle class="arc" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${INK}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>`;
  const arc = root.querySelector('.arc');
  const lab = el('div', 'abs', root, { inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: px(fs), fontWeight: 700, letterSpacing: '-.02em' });
  const num = makeRoll(lab, { width: '0.62em' }); el('span', null, lab, { color: '#A29E94', margin: '0 1px' }, '/');
  const den = makeRoll(lab, { width: '0.62em' });
  const nc = changesOf(events, 1), dc = changesOf(events, 2);
  const times = events.map(e => e[0]).slice(1);
  return {
    root,
    update(t) {
      arc.style.strokeDashoffset = C * (1 - fracAt(events, t));
      updRoll(num, nc, t); updRoll(den, dc, t);
      let bump = 0;
      for (const te of times) bump = Math.max(bump, Math.sin(Math.PI * prog(t, te, te + .55)) * (t >= te && t < te + .55 ? 1 : 0));
      root.style.transform = `scale(${1 + .13 * bump})`;
    },
  };
}
// Sync badge: idle = green check, syncing = spinning arc.
function makeBadge(parent, left, top, size, intervals) {
  const root = el('div', 'abs', parent, { left: px(left), top: px(top), width: px(size), height: px(size) });
  root.innerHTML = `<svg viewBox="0 0 30 30" width="${size}" height="${size}" fill="none">
    <circle cx="15" cy="15" r="11" stroke="#E2DED4" stroke-width="2.4"/>
    <circle class="arc" cx="15" cy="15" r="11" stroke="#4F6BFF" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="22 70" style="transform-origin:15px 15px"/>
    <path class="ck" d="M9.8 15.6l3.6 3.6 6.8-7.6" pathLength="1" stroke="${GREEN}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1" stroke-dashoffset="0" style="transform-origin:15px 15px"/>
  </svg>`;
  const arc = root.querySelector('.arc'), ck = root.querySelector('.ck');
  return {
    root,
    update(t) {
      let s = 0, pop = 1, since = 9;
      for (const [a, b] of intervals) {
        s = Math.max(s, T(t, a, a + .15, E.lin) * (1 - T(t, b, b + .15, E.lin)));
        if (t > b) since = Math.min(since, t - b);
      }
      arc.style.opacity = s;
      arc.style.transform = `rotate(${(t * 560) % 360}deg)`;
      const last = intervals.filter(iv => t > iv[1]).slice(-1)[0];
      let draw = 1, sc = 1;
      if (s > .01) { draw = 0; }
      else if (last) { draw = T(t, last[1] + .05, last[1] + .4); sc = 1 + .5 * Math.sin(Math.PI * prog(t, last[1] + .1, last[1] + .5)) * .6; }
      ck.style.strokeDashoffset = 1 - draw;
      ck.style.transform = `scale(${sc})`;
      root.style.transform = `scale(${1 + (last ? .18 * Math.sin(Math.PI * prog(t, last[1], last[1] + .5)) : 0)})`;
    },
  };
}

/* ───────────────────────── task rows ───────────────────────── */
const VAR = {
  phone: { H: 72, gap: 10, cb: 26, cbL: 16, cbT: 23, tL: 56, tT: 14, tFs: 16, mT: 41, mFs: 12, pillFs: 11, EX: 82, chips: true },
  lap:   { H: 60, gap: 8,  cb: 22, cbL: 14, cbT: 19, tL: 48, tT: 10, tFs: 14.5, mT: 34, mFs: 11.5, pillFs: 10.5, EX: 0 },
};
const BURST_COLORS = ['#22B07D', '#4F6BFF', '#F29A2E', '#F0506E', '#FFC83D', '#7A5CFF'];
function makeRow(d, v, parent) {
  const V = VAR[v];
  const root = el('div', 'row', parent, { display: 'none' });
  const card = el('div', 'card', root, { height: px(V.H) });
  const stripe = el('div', 'stripe', card, { height: px(V.H - 32) });
  const cb = el('div', 'cb', card, { left: px(V.cbL), top: px(V.cbT), width: px(V.cb), height: px(V.cb) });
  const fill = el('div', 'cbfill', cb, null, CHECK_SVG(2.8)); const ck = fill.querySelector('.ck');
  const title = el('div', 'title', card, { left: px(V.tL), top: px(V.tT), fontSize: px(V.tFs) }, d.title);
  const strike = el('div', 'strike', title);
  const meta = el('div', 'meta', card, { left: px(V.tL), top: px(V.mT), fontSize: px(V.mFs) });
  const pills = (d.tags || []).map(tg => {
    const p = el('span', 'pill', meta, { fontSize: px(V.pillFs), padding: '2px 8px', background: rgba(TAGS[tg.n].c, .13), color: TAGS[tg.n].fg, marginRight: '0' }, `<b>${tg.n}</b>`);
    return { p, tg, w: 0 };
  });
  const time = el('span', 'time', meta, null, d.time);
  // burst layer
  const burst = el('div', 'burst', root, { left: px(V.cbL + V.cb / 2), top: px(V.cbT + V.cb / 2) });
  const ring = el('div', null, burst, { width: '10px', height: '10px', margin: '-5px 0 0 -5px', borderRadius: '50%', border: `2px solid ${GREEN}`, display: 'none' });
  const parts = Array.from({ length: 14 }, (_, i) => el('div', null, burst, { display: 'none', width: px(i % 3 === 0 ? 6 : 9), height: px(i % 3 === 0 ? 14 : 9), borderRadius: i % 3 === 1 ? '50%' : '2px', background: BURST_COLORS[i % BURST_COLORS.length] }));
  // tag chooser (phone only, row with chips)
  let chipEls = [];
  if (d.chips && V.chips) {
    el('div', 'abs', card, { left: '16px', right: '16px', top: px(V.H), height: '1px', background: 'rgba(20,21,26,.07)' });
    const lab = el('div', 'chiplabel', card, { top: px(V.H + 14) }, 'TAGS');
    const wrap = el('div', 'chips', card, { top: px(V.H + 32) });
    chipEls = ['Work', 'Health', 'Home', 'Urgent'].map(n => {
      const c = el('div', 'chip', wrap, { background: '#F2EFE8', color: '#5C594F' }, `<i style="background:${TAGS[n].c}"></i>${n}`);
      return { c, n, dot: c.querySelector('i') };
    });
    d._lab = lab; d._wrap = wrap;
  }
  const obj = { d, v, root, card, stripe, cb, fill, ck, title, strike, meta, pills, ring, parts, chipEls, tw: 0, g: 0 };
  obj.measure = () => {
    obj.tw = title.offsetWidth;
    pills.forEach(p => { p.w = p.p.scrollWidth; });
    if (chipEls.length) {
      const wl = d._wrap.offsetLeft;
      chipEls.forEach(c => { c.cx = wl + c.c.offsetLeft + c.c.offsetWidth / 2; });
    }
  };
  obj.geom = t => {
    let g = 1;
    if (d.appear != null) g = T(t, d.appear, d.appear + .7, E.pop);
    if (d.leave != null) g *= 1 - T(t, d.leave + .1, d.leave + .65, E.inOut);
    let ex = 0;
    if (d.chipsT) ex = V.EX * T(t, d.chipsT.open, d.chipsT.open + .55, E.out2) * (1 - T(t, d.chipsT.close, d.chipsT.close + .45, E.inOut));
    return { g, ex, h: (V.H + ex) * g, pitch: (V.H + ex + V.gap) * g };
  };
  obj.update = (t, y) => {
    const G = obj.geom(t);
    if (G.g <= .002) { root.style.display = 'none'; return; }
    root.style.display = 'block';
    // entrance
    let op = 1, ty = 0, sc = 1;
    if (d.appear != null) {
      const p = T(t, d.appear, d.appear + .55, E.out);
      op = T(t, d.appear + .05, d.appear + .4, E.lin); ty = (1 - p) * (v === 'lap' ? -6 : -18); sc = lerp(.94, 1, p);
    } else if (d.intro != null) {
      const p = T(t, d.intro, d.intro + .8, E.out);
      op = T(t, d.intro, d.intro + .45, E.lin); ty = (1 - p) * 26;
    }
    // press feedback on completion
    if (d.doneT != null) sc *= 1 - .025 * Math.sin(Math.PI * prog(t, d.doneT - .08, d.doneT + .3));
    // leave
    let tx = 0;
    if (d.leave != null) {
      const lp = T(t, d.leave, d.leave + .5, E.in);
      op *= 1 - lp; tx = lp * 80;
    }
    root.style.transform = `translate3d(${tx}px,${y + ty}px,0)`;
    root.style.opacity = op;
    card.style.height = px(Math.max(G.h, 0));
    card.style.transform = `scale(${sc})`;
    // glow for freshly created rows
    let sh = '0 1px 2px rgba(40,30,15,.06), 0 8px 18px -8px rgba(40,30,15,.12)';
    if (d.appear != null && d.glow) {
      const a = (1 - T(t, d.appear + .3, d.appear + 1.9, E.smooth)) * T(t, d.appear, d.appear + .3, E.lin);
      if (a > .01) sh += `, 0 0 0 2px ${rgba(d.glow, a * .85)}, 0 0 26px ${rgba(d.glow, a * .35)}`;
    }
    card.style.boxShadow = sh;
    // tags / stripe
    const first = d.tags && d.tags[0];
    if (first) {
      const sp = first.t < 0 ? 1 : spr(t, first.t, 20, .6);
      stripe.style.background = TAGS[first.n].c;
      stripe.style.transform = `scaleY(${clamp(sp, 0, 1.05)})`; stripe.style.opacity = first.t < 0 ? 1 : T(t, first.t, first.t + .15, E.lin);
    } else stripe.style.opacity = 0;
    obj.pills.forEach(P => {
      const st = P.tg.t;
      if (st < 0) { P.p.style.maxWidth = 'none'; P.p.style.marginRight = '6px'; return; }
      const e = T(t, st, st + .4, E.out), s = spr(t, st, 22, .55);
      P.p.style.maxWidth = px(P.w * e); P.p.style.opacity = T(t, st, st + .18, E.lin);
      P.p.style.marginRight = px(6 * e); P.p.style.transform = `scale(${lerp(.6, 1, clamp(s, 0, 1.2))})`;
      P.p.style.paddingLeft = P.p.style.paddingRight = px(8 * e);
    });
    // chips
    if (obj.chipEls.length) {
      const o = d.chipsT.open;
      obj.chipEls.forEach((c, i) => {
        const ent = T(t, o + .15 + .06 * i, o + .6 + .06 * i, E.out);
        const sel = d.chipSel[c.n];
        let sp = 0, bumpS = 0;
        if (sel != null) { sp = T(t, sel, sel + .22, E.out); bumpS = Math.sin(Math.PI * prog(t, sel, sel + .4)) * .1; }
        const col = TAGS[c.n];
        c.c.style.opacity = ent; c.c.style.transform = `translateY(${(1 - ent) * 10}px) scale(${1 + bumpS})`;
        c.c.style.background = mix('#F2EFE8', '#FFFFFF', 0) && sp > 0 ? mix('#F2EFE8', col.c, .16 * sp + 0) : '#F2EFE8';
        c.c.style.background = sp > 0 ? `color-mix(in srgb, ${col.c} ${Math.round(sp * 16)}%, #F2EFE8)` : '#F2EFE8';
        c.c.style.borderColor = sp > 0 ? rgba(col.c, .75 * sp) : 'transparent';
        c.c.style.color = sp > 0 ? mix('#5C594F', col.fg, sp) : '#5C594F';
      });
    }
    // completion
    const dt = d.doneT;
    if (dt != null && t >= dt - .01) {
      const f = spr(t, dt, 20, .6);
      fill.style.transform = `scale(${clamp(f, 0, 1.12)})`; fill.style.opacity = T(t, dt, dt + .06, E.lin);
      obj.ck.style.strokeDashoffset = 1 - T(t, dt + .08, dt + .38, E.out);
      title.style.color = mix('#1B1C22', '#A29E94', T(t, dt + .2, dt + .55, E.smooth));
      strike.style.width = px(obj.tw * T(t, dt + .22, dt + .6, E.smooth));
      card.style.background = mix('#FFFFFF', '#F4FBF8', T(t, dt, dt + .4, E.smooth));
      cb.style.borderColor = GREEN;
      // burst
      const bs = d.burst || 1, u = t - (dt + .06);
      if (u > 0 && u < .95) {
        ring.style.display = 'block';
        const rp = T(t, dt + .06, dt + .55, E.out);
        ring.style.transform = `scale(${lerp(1, 6.4 * bs, rp)})`; ring.style.opacity = (1 - rp) * .9;
        parts.forEach((p, i) => {
          const a = (i / parts.length) * Math.PI * 2 + rnd(i + 3) * .45 - .2;
          const sp = (62 + rnd(i) * 62) * bs, e = E.out(clamp(u / .62));
          const x = Math.cos(a) * sp * e, yy = Math.sin(a) * sp * e + 120 * u * u * bs;
          const life = 1 - prog(u, .4, .95);
          p.style.display = 'block'; p.style.opacity = life;
          p.style.transform = `translate(${x - 3}px,${yy - 3}px) rotate(${u * (rnd(i + 9) > .5 ? 420 : -420)}deg) scale(${.4 + .6 * (1 - prog(u, .3, .95))})`;
        });
      } else { ring.style.display = 'none'; parts.forEach(p => p.style.display = 'none'); }
    } else {
      fill.style.transform = 'scale(0)'; fill.style.opacity = 0; obj.ck.style.strokeDashoffset = 1;
    }
  };
  return obj;
}
function layoutY(rows, id, t) {
  let y = 0;
  for (const r of rows) { if (r.d.id === id) return y; y += r.geom(t).pitch; }
  return y;
}
function layoutRows(rows, t) {
  let y = 0;
  for (const r of rows) { r.update(t, y); y += r.geom(t).pitch; }
}

/* ───────────────────────── phone ───────────────────────── */
const phone = el('div', 'phone', stage);
el('div', 'bezel', phone);
// side keys
el('div', 'abs', phone, { left: '-3px', top: '170px', width: '4px', height: '56px', borderRadius: '2px 0 0 2px', background: '#2a2b33' });
el('div', 'abs', phone, { right: '-3px', top: '210px', width: '4px', height: '90px', borderRadius: '0 2px 2px 0', background: '#2a2b33' });
const scr = el('div', 'screen', phone);
el('div', 'island', scr);
el('div', 'abs', scr, { left: '30px', top: '15px', fontSize: '15px', fontWeight: 700, letterSpacing: '-.01em' }, '9:41');
el('div', 'abs', scr, { right: '28px', top: '17px' },
  `<svg width="64" height="14" viewBox="0 0 64 14" fill="#14151A"><rect x="0" y="8" width="3.2" height="5" rx="1"/><rect x="5" y="5.5" width="3.2" height="7.5" rx="1"/><rect x="10" y="3" width="3.2" height="10" rx="1"/><rect x="15" y="0.5" width="3.2" height="12.5" rx="1"/><path d="M30 12.2l3-3.6a4.3 4.3 0 0 0-6 0z M24.2 6.6a8.4 8.4 0 0 1 11.6 0l1.6-1.8a10.8 10.8 0 0 0-14.8 0z" /><rect x="42" y="1" width="21" height="11.5" rx="3.6" fill="none" stroke="#14151A" stroke-opacity=".45"/><rect x="43.7" y="2.7" width="15" height="8.1" rx="2.2"/></svg>`);
el('div', 'abs', scr, { left: '22px', top: '56px', fontSize: '33px', fontWeight: 700, letterSpacing: '-.04em' }, 'Today');
el('div', 'abs', scr, { left: '23px', top: '99px', fontSize: '13px', fontWeight: 500, color: '#8E8A80' }, 'Tuesday, 14 May');
const PH_EV = [[0, 2, 5], [TL.newRow, 2, 6], [TL.doneDent + .55, 3, 6], [TL.doneMia + .55, 4, 6], [TL.doneGroc + .55, 5, 6], [17.65, 5, 7]];
const phRing = makeRing(scr, 282, 54, 50, 4.5, 13, PH_EV);
const phBadge = makeBadge(scr, 236, 64, 30, [[14.55, 15.7], [17.5, 18.1]]);
const LIST_Y = 140;
const list = el('div', 'abs', scr, { left: '14px', top: px(LIST_Y), width: '326px', height: '600px' });

const PH_ROWS_DEF = [
  { id: 'new', title: 'Book flights for May', time: 'Today · 20:00', tags: [{ n: 'Home', t: -1 }], appear: 17.55, glow: '#4F6BFF', burst: .6 },
  { id: 'dent', title: 'Call the dentist', time: 'Today · 9:00', tags: [{ n: 'Health', t: TL.healthTap + .05 }, { n: 'Urgent', t: TL.urgentTap + .05 }],
    appear: TL.newRow, glow: '#F0703C', doneT: TL.doneDent, leave: TL.doneDent + .9, chips: true,
    chipsT: { open: TL.rowOpen, close: TL.rowClose }, chipSel: { Health: TL.healthTap, Urgent: TL.urgentTap } },
  { id: 'r1', title: 'Review design handoff', time: 'Today · 11:30', tags: [{ n: 'Work', t: -1 }], intro: .6 },
  { id: 'r2', title: 'Reply to Mia', time: 'Today · 13:00', tags: [{ n: 'Work', t: -1 }], intro: .72, doneT: TL.doneMia, leave: TL.doneMia + .85, burst: .7 },
  { id: 'r3', title: 'Pick up groceries', time: 'Today · 18:00', tags: [{ n: 'Home', t: -1 }], intro: .84, doneT: TL.doneGroc, leave: TL.doneGroc + .85, burst: .7 },
];
const phRows = PH_ROWS_DEF.map(d => makeRow(d, 'phone', list));

// FAB
const FAB = { x: 306, y: 600 };
const fab = el('div', 'fab', scr, { left: px(FAB.x - 28), top: px(FAB.y - 28) },
  `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M28 19v18M19 28h18"/></svg>`);
// scrim + composer
const scrim = el('div', 'abs', scr, { inset: 0, background: '#12100c', opacity: 0, display: 'none' });
const sheet = el('div', 'sheet', scr, { top: '742px' });
el('div', 'abs', sheet, { left: '147px', top: '10px', width: '60px', height: '5px', borderRadius: '3px', background: '#E3DFD5' });
el('div', 'abs', sheet, { left: '24px', top: '34px', fontSize: '12px', fontWeight: 700, letterSpacing: '.14em', color: '#A29E94' }, 'NEW TASK');
const SHEET_OPEN = 400;
const ph = el('div', 'abs', sheet, { left: '24px', top: '66px', fontSize: '25px', fontWeight: 600, letterSpacing: '-.025em', color: '#C2BEB3', whiteSpace: 'nowrap' }, 'What needs doing?');
const typed = el('div', 'abs', sheet, { left: '24px', top: '66px', fontSize: '25px', fontWeight: 600, letterSpacing: '-.025em', whiteSpace: 'nowrap', height: '32px', display: 'flex', alignItems: 'center' });
const TXT = 'Call the dentist';
const typeAt = []; { let tt = TL.typeStart; for (let i = 0; i < TXT.length; i++) { typeAt.push(tt); tt += .048 + .034 * rnd(i + 1) + (TXT[i] === ' ' ? .08 : 0) + (i === 3 ? .12 : 0); } }
const charEls = [...TXT].map(ch => el('span', null, typed, { whiteSpace: 'pre', display: 'none' }, ch));
const caret = el('span', null, typed, { display: 'inline-block', width: '2.5px', height: '28px', background: '#F0703C', marginLeft: '1px', borderRadius: '2px' });
const chipToday = el('div', 'chip', sheet, { position: 'absolute', left: '24px', top: '174px', background: '#F2EFE8', color: '#5C594F' }, '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#5C594F" stroke-width="1.6" stroke-linecap="round"><rect x="1.5" y="2.5" width="11" height="10" rx="2.5"/><path d="M1.5 6h11M4.5 1v3M9.5 1v3"/></svg>Today');
const chipTime = el('div', 'chip', sheet, { position: 'absolute', left: '104px', top: '174px', background: rgba('#F0703C', .13), color: '#C4501E', borderColor: rgba('#F0703C', .6) }, '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#C4501E" stroke-width="1.6" stroke-linecap="round"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v3l2 1.4"/></svg>9:00');
const sendBtn = el('div', 'abs', sheet, { left: '278px', top: '160px', width: '52px', height: '52px', borderRadius: '50%', background: '#F0703C', boxShadow: '0 10px 20px -6px rgba(240,112,60,.55)' },
  `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M26 34V18M18 25l8-8 8 8"/></svg>`);
const SEND = { x: 278 + 26, y: SHEET_OPEN + 160 + 26 };

// toast
const toast = el('div', 'toast', scr, { left: '18px', top: '594px', opacity: 0 },
  `<span style="display:flex;width:30px;height:30px;border-radius:50%;background:${GREEN};align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 26 26" fill="none"><path d="M6.5 13.5l4.5 4.5 8.5-9.5" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>On a roll — 3-day streak</span>`);

// cursor
const cursorWrap = el('div', 'abs', scr, { left: 0, top: 0, opacity: 0 });
const ripple = el('div', 'ripple', cursorWrap, { opacity: 0 });
const cursor = el('div', 'cursor', cursorWrap);

/* measure everything once fonts are ready, then build cursor path */
let CURSOR_KEYS = [];
const CUR_VIS = [[1.0, 5.0], [5.6, 9.05], [9.45, 12.55], [14.1, 15.4]];
function buildCursor() {
  const dent = phRows[1], r2 = phRows[3], r3 = phRows[4];
  const rowXY = (id, t, dx, dy) => ({ x: 14 + dx, y: LIST_Y + layoutY(phRows, id, t) + dy });
  const chip = (n) => dent.chipEls.find(c => c.n === n).cx;
  const chipY = LIST_Y + 72 + 32 + 15;
  const cbx = 16 + 13;
  CURSOR_KEYS = [
    { t: 1.1, x: 215, y: 505 },
    { t: TL.composerOpen, x: FAB.x, y: FAB.y, tap: 1 },
    { t: TL.sendTap, x: SEND.x, y: SEND.y, tap: 1 },
    { t: 5.7, x: 250, y: 330 },
    { t: 6.1, ...rowXY('dent', 6.1, 190, 36), tap: 1 },
    { t: TL.healthTap, x: 14 + chip('Health'), y: chipY, tap: 1 },
    { t: TL.urgentTap, x: 14 + chip('Urgent'), y: chipY, tap: 1 },
    { t: TL.rowClose, ...rowXY('dent', TL.rowClose, 210, 36), tap: 1 },
    { t: 9.5, x: 190, y: 360 },
    { t: TL.doneDent, ...rowXY('dent', TL.doneDent, 14 + cbx - 14, 36), tap: 1 },
    { t: TL.doneMia, ...rowXY('r2', TL.doneMia, cbx, 36), tap: 1 },
    { t: 14.15, x: 230, y: 330 },
    { t: TL.doneGroc, ...rowXY('r3', TL.doneGroc, cbx, 36), tap: 1 },
  ];
  CURSOR_KEYS.forEach(k => { if (k.x == null) k.x = 0; });
}
const moveE = bez(.45, 0, .15, 1);
function updCursor(t) {
  const K = CURSOR_KEYS; if (!K.length) return;
  let i = 0; while (i < K.length - 1 && K[i + 1].t <= t + 1e-9) i++;
  let x = K[i].x, y = K[i].y;
  if (i < K.length - 1) {
    const n = K[i + 1], gap = n.t - K[i].t - .12, dur = Math.min(.7, gap * .85), s = n.t - dur;
    if (t > s) {
      const p = moveE(clamp((t - s) / dur));
      // slight arc so the finger doesn't travel in a straight line
      const dx = n.x - x, dy = n.y - y, len = Math.hypot(dx, dy) || 1, arc = Math.min(40, len * .12) * Math.sin(Math.PI * p);
      x = lerp(x, n.x, p) + (-dy / len) * arc; y = lerp(y, n.y, p) + (dx / len) * arc;
    }
  }
  // tap state
  let press = 0, rp = 1, rip = null;
  for (const k of K) if (k.tap) {
    press = Math.max(press, 1 - Math.abs(clamp((t - (k.t - .02)) / .1, -1, 1)) * 0 - 0); // placeholder, overwritten below
  }
  press = 0;
  for (const k of K) if (k.tap) {
    const dn = prog(t, k.t - .09, k.t), up = prog(t, k.t + .02, k.t + .2);
    press = Math.max(press, dn * (1 - up));
    if (t >= k.t && t < k.t + .55) rip = prog(t, k.t, k.t + .55);
  }
  let vis = 0;
  for (const [a, b] of CUR_VIS) vis = Math.max(vis, T(t, a, a + .25, E.lin) * (1 - T(t, b - .25, b, E.lin)));
  cursorWrap.style.opacity = vis;
  cursorWrap.style.transform = `translate(${x}px,${y}px)`;
  cursor.style.transform = `scale(${1 - .3 * press})`;
  cursor.style.background = `rgba(20,21,26,${.14 + .12 * press})`;
  if (rip != null) { const e = E.out(rip); ripple.style.opacity = (1 - rip) * .7; ripple.style.transform = `scale(${lerp(.7, 2.3, e)})`; }
  else ripple.style.opacity = 0;
}

function updPhoneContent(t) {
  layoutRows(phRows, t);
  phRing.update(t); phBadge.update(t);
  // FAB
  const open = T(t, TL.composerOpen, TL.composerOpen + .3, E.out), close = T(t, TL.sheetClose + .35, TL.sheetClose + .45, E.lin);
  const hidden = open * (1 - close);
  const press = Math.sin(Math.PI * prog(t, TL.composerOpen - .1, TL.composerOpen + .25)) * .12;
  const back = spr(t, TL.sheetClose + .4, 20, .55);
  let fs = 1 - hidden;
  if (t > TL.sheetClose + .3) fs = clamp(back, 0, 1.15);
  fab.style.transform = `scale(${Math.max(fs - press, 0)}) rotate(${(1 - clamp(fs, 0, 1)) * 90}deg)`;
  // sheet
  const op = T(t, TL.composerOpen + .05, TL.composerOpen + .7, E.out), cl = T(t, TL.sheetClose, TL.sheetClose + .5, bez(.5, 0, .9, .5));
  const sp = op * (1 - cl);
  sheet.style.top = px(lerp(760, SHEET_OPEN, sp));
  scrim.style.display = sp > .001 ? 'block' : 'none'; scrim.style.opacity = .3 * sp;
  // typing
  let n = 0; typeAt.forEach(a => { if (t >= a) n++; });
  charEls.forEach((c, i) => {
    c.style.display = i < n ? 'inline' : 'none';
    if (i < n) { const a = prog(t, typeAt[i], typeAt[i] + .09); c.style.opacity = a; }
  });
  ph.style.opacity = 1 - T(t, typeAt[0], typeAt[0] + .1, E.lin);
  const typing = t < typeAt[typeAt.length - 1] + .3;
  caret.style.opacity = typing || t < TL.typeStart ? 1 : (Math.floor((t - 3.9) / .45) % 2 === 0 ? 1 : 0);
  if (t > TL.sheetClose) caret.style.opacity = 0;
  // chips pop
  const cp = spr(t, 3.95, 22, .55);
  chipTime.style.opacity = T(t, 3.95, 4.08, E.lin); chipTime.style.transform = `scale(${lerp(.6, 1, clamp(cp, 0, 1.2))})`;
  chipToday.style.opacity = T(t, 2.4, 2.8, E.lin);
  const sendOn = T(t, typeAt[0], typeAt[0] + .15, E.lin);
  const sendPress = Math.sin(Math.PI * prog(t, TL.sendTap - .1, TL.sendTap + .22)) * .14;
  sendBtn.style.opacity = lerp(.35, 1, sendOn);
  sendBtn.style.transform = `scale(${1 - sendPress})`;
  // toast
  const ta = 11.45, tb = 12.85;
  const ti = spr(t, ta, 20, .6), to = T(t, tb, tb + .35, E.in);
  toast.style.opacity = T(t, ta, ta + .15, E.lin) * (1 - to);
  toast.style.transform = `translateY(${(1 - clamp(ti, 0, 1.1)) * 36 + to * 14}px) scale(${lerp(.85, 1, clamp(ti, 0, 1.1))})`;
  updCursor(t);
}

function updPhone(t) {
  const m = T(t, TL.phoneMoveA, TL.phoneMoveB, E.inOut);
  const intro = T(t, .1, 1.25, E.out);
  const cam = 1 + .035 * T(t, 1.9, 2.9, E.smooth) * (1 - T(t, 4.9, 5.9, E.smooth));
  const cx = lerp(880, 340, m), scale = lerp(1, .82, m) * cam, top = lerp(62, 72, m);
  const yy = top + (1 - intro) * 150 + Math.sin(t * .9) * 2.5 * (1 - m);
  const tiltX = (1 - intro) * 14, tiltZ = (1 - intro) * -4;
  phone.style.opacity = T(t, .1, .5, E.lin);
  phone.style.transform = `translate3d(${cx - 186}px,${yy}px,0) perspective(1600px) rotateX(${tiltX}deg) rotateZ(${tiltZ}deg) scale(${scale})`;
  updPhoneContent(t);
}

/* ───────────────────────── laptop ───────────────────────── */
const LAP = { x: 680, y: 226 };
const laptop = el('div', 'laptop', stage, { left: px(LAP.x), top: px(LAP.y), opacity: 0 });
{ // titlebar
  const tb = el('div', 'abs', laptop, { left: 0, top: 0, right: 0, height: '38px', background: '#F6F4EE', borderBottom: '1px solid rgba(20,21,26,.06)' });
  ['#FF6B5E', '#FFBD3F', '#2ECC71'].forEach((c, i) => el('div', 'abs', tb, { left: px(16 + i * 18), top: '13px', width: '12px', height: '12px', borderRadius: '50%', background: c, opacity: .85 }));
  el('div', 'abs', tb, { left: 0, right: 0, top: '11px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#9A968C' }, 'Tidy');
}
const side = el('div', 'abs', laptop, { left: 0, top: '38px', width: '150px', bottom: 0, background: '#F3F0E9', borderRight: '1px solid rgba(20,21,26,.05)' });
el('div', 'nav', side, { top: '18px', background: '#fff', color: INK, boxShadow: '0 1px 2px rgba(40,30,15,.08)' }, '<i style="background:#14151A"></i>Today');
el('div', 'nav', side, { top: '52px' }, '<i style="background:#C9C5BA"></i>Upcoming');
el('div', 'nav', side, { top: '86px' }, '<i style="background:#C9C5BA"></i>Anytime');
el('div', 'abs', side, { left: '24px', top: '142px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.14em', color: '#A29E94' }, 'TAGS');
['Work', 'Health', 'Home', 'Urgent'].forEach((n, i) => el('div', 'nav', side, { top: px(162 + i * 30) }, `<i style="background:${TAGS[n].c}"></i>${n}`));
const main = el('div', 'abs', laptop, { left: '150px', top: '38px', right: 0, bottom: 0 });
el('div', 'abs', main, { left: '24px', top: '16px', fontSize: '24px', fontWeight: 700, letterSpacing: '-.035em' }, 'Today');
const LP_EV = [[0, 4, 6], [15.8, 5, 6], [TL.flightsEnter + .15, 5, 7]];
const lpRing = makeRing(main, 324, 12, 42, 4, 11, LP_EV);
const lpBadge = makeBadge(main, 282, 18, 28, [[15.6, 16.3], [16.75, 17.6]]);
const inputBox = el('div', 'abs', main, { left: '24px', right: '24px', top: '62px', height: '42px', borderRadius: '12px', background: '#fff', border: '1.5px solid rgba(20,21,26,.1)' });
const lpPh = el('div', 'abs', inputBox, { left: '14px', top: '10px', fontSize: '14px', fontWeight: 500, color: '#B4B0A6' }, 'Add a task…');
const lpTyped = el('div', 'abs', inputBox, { left: '14px', top: '0', height: '39px', display: 'flex', alignItems: 'center', fontSize: '14.5px', fontWeight: 600, letterSpacing: '-.01em' });
const FL = 'Book flights for May';
const flAt = []; { let tt = TL.flightsType; for (let i = 0; i < FL.length; i++) { flAt.push(tt); tt += .028 + .03 * rnd(i + 20); } }
const flEls = [...FL].map(c => el('span', null, lpTyped, { whiteSpace: 'pre', display: 'none' }, c));
const lpCaret = el('span', null, lpTyped, { display: 'inline-block', width: '2px', height: '18px', background: '#4F6BFF', marginLeft: '1px' });
const enterKey = el('div', 'abs', inputBox, { right: '10px', top: '8px', height: '22px', padding: '0 8px', borderRadius: '7px', background: '#F1EEE7', color: '#8E8A80', fontSize: '11px', fontWeight: 700, lineHeight: '22px' }, '↵ Enter');
const lpList = el('div', 'abs', main, { left: '24px', right: '24px', top: '120px', height: '230px' });
const LP_ROWS_DEF = [
  { id: 'lnew', title: 'Book flights for May', time: 'Today · 20:00', tags: [{ n: 'Home', t: -1 }], appear: TL.flightsEnter + .05, glow: '#4F6BFF' },
  { id: 'l1', title: 'Review design handoff', time: 'Today · 11:30', tags: [{ n: 'Work', t: -1 }] },
  { id: 'l3', title: 'Pick up groceries', time: 'Today · 18:00', tags: [{ n: 'Home', t: -1 }], doneT: 15.8, leave: 16.65, burst: .45 },
];
const lpRows = LP_ROWS_DEF.map(d => makeRow(d, 'lap', lpList));
function updLaptop(t) {
  const p = T(t, 13.95, 14.75, E.out);
  laptop.style.opacity = T(t, 13.95, 14.35, E.lin);
  laptop.style.transform = `translateY(${(1 - p) * 50}px) scale(${lerp(.95, 1, p)})`;
  if (t < 13.9) return;
  lpRing.update(t); lpBadge.update(t);
  let n = 0; flAt.forEach(a => { if (t >= a) n++; });
  const entered = t >= TL.flightsEnter;
  flEls.forEach((c, i) => { c.style.display = (i < n && !entered) ? 'inline' : 'none'; });
  const focus = t >= TL.flightsType - .3 && !entered;
  lpCaret.style.display = focus ? 'inline-block' : 'none';
  lpCaret.style.opacity = t < flAt[flAt.length - 1] + .2 ? 1 : (Math.floor((t - 16.9) / .4) % 2 === 0 ? 1 : 0);
  lpPh.style.opacity = (n === 0 && !entered) ? 1 : 0;
  inputBox.style.borderColor = focus ? rgba('#4F6BFF', .8) : 'rgba(20,21,26,.1)';
  inputBox.style.boxShadow = focus ? `0 0 0 4px ${rgba('#4F6BFF', .14)}` : 'none';
  const ek = T(t, flAt[flAt.length - 1], flAt[flAt.length - 1] + .2, E.lin) * (entered ? 0 : 1);
  enterKey.style.opacity = ek;
  enterKey.style.transform = `scale(${1 - .1 * Math.sin(Math.PI * prog(t, TL.flightsEnter - .1, TL.flightsEnter + .2))})`;
  layoutRows(lpRows, t);
}

/* ───────────────────────── sync packets (SVG overlay) ───────────────────────── */
const svg = el('div', 'abs', stage, { inset: 0, pointerEvents: 'none' });
const edgeA = () => { const r = phone.getBoundingClientRect(); return r.right + 2; };
const edgeB = () => laptop.getBoundingClientRect().left - 2;
const PACKETS = [
  { A: (y) => ({ x: edgeA(), y }), B: (y) => ({ x: edgeB(), y }), ay: 296, by: 482, t0: 15.0, t1: 15.65 },
  { A: (y) => ({ x: edgeB(), y }), B: (y) => ({ x: edgeA(), y }), ay: 414, by: 232, t0: 16.85, t1: 17.5 },
];
const ctr = e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
function updPackets(t) {
  let h = '';
  for (const pk of PACKETS) {
    if (t < pk.t0 - .2 || t > pk.t1 + .6) continue;
    const A = pk.A(pk.ay), B = pk.B(pk.by);
    const C = { x: (A.x + B.x) / 2, y: Math.min(A.y, B.y) - 70 };
    const P = u => ({ x: (1 - u) * (1 - u) * A.x + 2 * (1 - u) * u * C.x + u * u * B.x, y: (1 - u) * (1 - u) * A.y + 2 * (1 - u) * u * C.y + u * u * B.y });
    const d = `M${A.x},${A.y} Q${C.x},${C.y} ${B.x},${B.y}`;
    const env = T(t, pk.t0 - .2, pk.t0, E.lin) * (1 - T(t, pk.t1 + .05, pk.t1 + .4, E.lin));
    h += `<path d="${d}" fill="none" stroke="#4F6BFF" stroke-opacity="${.28 * env}" stroke-width="2" stroke-dasharray="1 8" stroke-linecap="round"/>`;
    const u = E.travel(prog(t, pk.t0, pk.t1));
    if (t >= pk.t0 && t <= pk.t1 + .05) {
      const L = .3, len = Math.min(u, L), off = -Math.max(u - L, 0);
      h += `<path d="${d}" pathLength="1" fill="none" stroke="#4F6BFF" stroke-opacity=".7" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${len} 2" stroke-dashoffset="${off}"/>`;
      const H = P(u);
      h += `<circle cx="${H.x}" cy="${H.y}" r="15" fill="#4F6BFF" fill-opacity=".18"/><circle cx="${H.x}" cy="${H.y}" r="7" fill="#4F6BFF"/><circle cx="${H.x - 1.5}" cy="${H.y - 1.5}" r="2.4" fill="#fff" fill-opacity=".85"/>`;
    }
    for (const [a, c] of [[pk.t0, A], [pk.t1, B]]) {
      const rp = prog(t, a, a + .5);
      if (rp > 0 && rp < 1) h += `<circle cx="${c.x}" cy="${c.y}" r="${lerp(12, 36, E.out(rp))}" fill="none" stroke="#4F6BFF" stroke-width="2.2" stroke-opacity="${(1 - rp) * .7}"/>`;
    }
  }
  svg.innerHTML = `<svg width="1280" height="720" viewBox="0 0 1280 720">${h}</svg>`;
}

/* ───────────────────────── outro ───────────────────────── */
const circMint = el('div', 'circle', stage, { background: '#3FE0A8', display: 'none' });
const circInk = el('div', 'circle', stage, { background: INK, display: 'none' });
const outro = el('div', 'logo', stage, { display: 'none' });
outro.innerHTML = '';
const glow = el('div', 'abs', outro, { left: '240px', top: '60px', width: '800px', height: '600px', background: 'radial-gradient(closest-side, rgba(63,224,168,.20), rgba(63,224,168,0))' });
const lockup = el('div', 'abs', outro, { left: 0, right: 0, top: '262px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
const icon = el('div', null, lockup, { width: '132px', height: '132px', borderRadius: '36px', background: 'linear-gradient(145deg,#5DF0BC,#22B07D)', boxShadow: '0 30px 60px -16px rgba(63,224,168,.5), inset 0 2px 0 rgba(255,255,255,.35)', flex: 'none', position: 'relative' },
  `<svg viewBox="0 0 132 132" width="132" height="132" fill="none"><path class="lg" d="M38 68l19 19 38-42" pathLength="1" stroke="${INK}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`);
const lgPath = icon.querySelector('.lg');
const iconRing = el('div', 'abs', icon, { inset: 0, borderRadius: '36px', border: '3px solid #5DF0BC', opacity: 0 });
const wordMask = el('div', 'wordmask', lockup, { width: '0px', marginLeft: '0px' });
const wordInner = el('div', null, wordMask, { display: 'inline-block', whiteSpace: 'nowrap' });
const letters = [...'Tidy'].map(c => el('span', null, wordInner, null, c));
const tag = el('div', 'abs', outro, { left: 0, right: 0, top: '446px', textAlign: 'center', fontSize: '26px', fontWeight: 500, letterSpacing: '.005em', color: 'rgba(255,255,255,.62)' }, 'Tasks, gently done.');
let wordW = 0;
function measureOutro() { outro.style.display = 'block'; wordMask.style.width = 'auto'; wordW = wordInner.offsetWidth + 6; wordMask.style.width = '0px'; outro.style.display = 'none'; }
let circleOrigin = null;
function updOutro(t) {
  if (t < TL.circleA) { circMint.style.display = circInk.style.display = outro.style.display = 'none'; return; }
  if (!circleOrigin) {
    // anchor the reveal on the sync badge so the check "becomes" the next scene
    circleOrigin = ctr(phBadge.root);
  }
  const o = circleOrigin, ease = bez(.7, 0, .2, 1);
  const pm = ease(prog(t, TL.circleA, TL.circleB - .1)), pi = ease(prog(t, TL.circleA + .1, TL.circleB));
  const S = 28;
  [[circMint, pm], [circInk, pi]].forEach(([c, p]) => {
    c.style.display = 'block'; c.style.left = px(o.x - 50); c.style.top = px(o.y - 50);
    c.style.transform = `scale(${lerp(.3, S, p)})`;
  });
  outro.style.display = t > TL.circleA + .45 ? 'block' : 'none';
  const t0 = 19.1;
  // glow breathes in
  glow.style.opacity = T(t, 19.2, 20.3, E.smooth);
  const ip = spr(t, t0, 18, .5);
  const slide = T(t, 19.6, 20.4, E.inOut);
  icon.style.transform = `scale(${lerp(.3, 1, clamp(ip, 0, 1.15)) * (1 + .012 * Math.sin(t * 2.2) * T(t, 20.4, 20.7, E.lin))})`;
  icon.style.opacity = T(t, t0, t0 + .08, E.lin);
  lgPath.style.strokeDashoffset = 1 - T(t, 19.4, 19.8, E.out);
  const rp = prog(t, 19.7, 20.25);
  iconRing.style.opacity = rp > 0 && rp < 1 ? (1 - rp) * .8 : 0; iconRing.style.transform = `scale(${lerp(1, 1.35, E.out(rp))})`;
  wordMask.style.width = px(wordW * slide); wordMask.style.marginLeft = px(34 * slide);
  letters.forEach((l, i) => {
    const s = 19.7 + i * .07, p = T(t, s, s + .7, E.out);
    l.style.transform = `translateY(${(1 - p) * 120}px)`; l.style.opacity = T(t, s, s + .2, E.lin);
  });
  const tg = T(t, 20.2, 20.85, E.out);
  tag.style.opacity = tg; tag.style.transform = `translateY(${(1 - tg) * 16}px)`;
}

/* ───────────────────────── master render ───────────────────────── */
function render(t) {
  updBg(t); updMark(t); updText(t); updSegs(t);
  updPhone(t); updLaptop(t); updPackets(t); updOutro(t);
}
window.render = render;
window.DURATION = DURATION;

(async () => {
  await document.fonts.ready;
  // make sure all weights are actually decoded before measuring
  for (const w of [500, 600, 700, 800]) await document.fonts.load(`${w} 20px Inter`);
  // measure rows with real layout
  phRows.forEach(r => { r.root.style.display = 'block'; });
  lpRows.forEach(r => { r.root.style.display = 'block'; });
  phRows.forEach(r => r.measure()); lpRows.forEach(r => r.measure());
  measureOutro();
  buildCursor();
  render(0);
  window.READY = true;
})();
})();
