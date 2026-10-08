// Tidy — product film. One pure function render(t) draws the whole frame.
// Design notes live in ../NOTES.md. Reference ideas (rewritten, no code copied) come from Motionbook:
//   task-card-gesture-stack (staggered blur-in text, exit tilt + next-card promotion),
//   nested-tag-creation (shape morph from a chip to a picker, dot-matrix loader -> check),
//   chatgpt-dot-send (composer text flies to its destination with squash + slight overshoot, list yields).
(function () {
  const { clamp, lerp, P, E, mix, rgba, rnd, el, tf, reveal } = A;
  const BRAND = '#5b5bf0', GREEN = '#1fa971', INK = '#17181c', MUTE = '#8b8a85';
  const TAGS = { Work: '#5b5bf0', Health: '#1fa971', Home: '#e8920f', Errands: '#2b8fe6' };
  const DUR = 20;

  // ---------------------------------------------------------------- timeline (seconds)
  const T = {
    fabTap: 1.15, typeStart: 2.0, sendTap: 3.95, flight: 4.0,
    tagTap: 5.8, selHealth: 7.0, selErrands: 7.75, closeTap: 8.35,
    syncOn: 14.7, packets: 14.95, lands: 15.65, syncDone: 16.5, endStart: 17.05,
  };
  const COMP = { new: { t: 9.95, sp: 1 }, a: { t: 11.55, sp: .7 }, b: { t: 12.4, sp: .6 }, c: { t: 13.0, sp: .6 } };
  const TEXT = 'Book dentist Friday';
  const charT = []; { let c = T.typeStart; for (let i = 0; i < TEXT.length; i++) { c += .05 + .035 * rnd(i) + (i === 12 ? .28 : 0); charT.push(c); } }
  const FRIDAY_T = charT[charT.length - 1] + .08;

  const TAPS = [
    { t: T.fabTap, x: 306, y: 630 }, { t: T.sendTap, x: 308, y: 622 },
    { t: T.tagTap, x: 164, y: 219 }, { t: T.selHealth, x: 226, y: 366 }, { t: T.selErrands, x: 226, y: 446 },
    { t: T.closeTap, x: 250, y: 566 },
    { t: COMP.new.t, x: 48, y: 203 }, { t: COMP.a.t, x: 48, y: 203 }, { t: COMP.b.t, x: 48, y: 203 }, { t: COMP.c.t, x: 48, y: 203 },
  ];

  // camera: s = zoom, (fx,fy) phone point pinned to screen point (sx,sy). Each key eases from the previous one.
  const CAM = [
    { t: 0, s: .9, fx: 180, fy: 340, sx: 880, sy: 360 },
    { t: 1.8, s: .98, fx: 180, fy: 340, sx: 880, sy: 360, e: E.out },
    { t: 4.45, s: .98, fx: 180, fy: 340, sx: 880, sy: 360 },
    { t: 5.65, s: 1.5, fx: 180, fy: 300, sx: 880, sy: 360, e: E.cam },
    { t: 8.75, s: 1.5, fx: 180, fy: 300, sx: 880, sy: 360 },
    { t: 9.75, s: 1.25, fx: 180, fy: 330, sx: 880, sy: 360, e: E.cam },
    { t: 14.0, s: 1.25, fx: 180, fy: 330, sx: 880, sy: 360 },
    { t: 15.5, s: .8, fx: 180, fy: 340, sx: 574, sy: 422, e: E.camSoft },
  ];
  function camAt(t) {
    if (t >= CAM[CAM.length - 1].t) return CAM[CAM.length - 1];
    let i = 1; while (CAM[i].t < t) i++;
    const a = CAM[i - 1], b = CAM[i], p = (CAM[i].e || (x => x))(P(t, a.t, b.t - a.t));
    return { s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), p)), fx: lerp(a.fx, b.fx, p), fy: lerp(a.fy, b.fy, p), sx: lerp(a.sx, b.sx, p), sy: lerp(a.sy, b.sy, p) };
  }

  // ---------------------------------------------------------------- icons
  const ic = (d, w = 2, extra = '') => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}${extra}</svg>`;
  const ICON = {
    plus: ic('<path d="M12 5v14M5 12h14"/>', 2.4),
    up: ic('<path d="M12 19V5M6 11l6-6 6 6"/>', 2.4),
    cal: ic('<rect x="4" y="5.5" width="16" height="14.5" rx="3.5"/><path d="M4 10.5h16M8.5 3.5v4M15.5 3.5v4"/>', 1.9),
    tag: ic('<path d="M4 12.2V5.4A1.4 1.4 0 0 1 5.4 4h6.8a1.4 1.4 0 0 1 1 .4l6.4 6.4a1.4 1.4 0 0 1 0 2l-6.4 6.4a1.4 1.4 0 0 1-2 0L4.4 13.2a1.4 1.4 0 0 1-.4-1z"/><circle cx="8.6" cy="8.6" r="1.2" fill="currentColor"/>', 1.9),
    search: ic('<circle cx="11" cy="11" r="6.2"/><path d="M16 16l4 4"/>', 2),
  };
  const CHECKP = 'M8.2 14.6 L12.2 18.4 L19.8 9.6';

  // ---------------------------------------------------------------- static DOM
  const stage = document.getElementById('stage');
  const blob1 = el(stage, 'abs', 'width:900px;height:900px;margin:-450px 0 0 -450px;border-radius:50%;background:radial-gradient(closest-side,rgba(91,91,240,.17),rgba(91,91,240,0))');
  const blob2 = el(stage, 'abs', 'width:800px;height:800px;margin:-400px 0 0 -400px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,170,90,.18),rgba(255,170,90,0))');

  // captions (screen space)
  const CAPS = [
    { eb: '01 — CAPTURE', l: ['Capture it', 'in a breath.'], a: .55, b: 4.45 },
    { eb: '02 — ORGANISE', l: ['Sort it', 'with a tap.'], a: 5.15, b: 8.75 },
    { eb: '03 — FINISH', l: ['Finish it with', 'a flourish.'], a: 9.55, b: 14.0 },
    { eb: '04 — SYNC', l: ['Always', 'in sync.'], a: 14.55, b: 16.95 },
  ];
  CAPS.forEach(c => {
    c.root = el(stage, 'cap', 'top:262px');
    c.eb_ = el(c.root, 'eb', '', c.eb);
    c.lns = c.l.map(s => el(c.root, 'ln', '', s));
  });
  const chap = el(stage, 'abs', 'left:88px;top:640px;width:200px;height:4px');
  const CH = [[.4, 4.9], [4.9, 9.3], [9.3, 14.1], [14.1, 17.0]];
  const chapBars = CH.map((_, i) => {
    const b = el(chap, 'abs', `left:${i * 38}px;top:0;width:30px;height:4px;border-radius:2px;background:rgba(23,24,28,.12);overflow:hidden`);
    return el(b, 'abs', `left:0;top:0;height:4px;width:30px;background:${INK};border-radius:2px;transform-origin:0 0`);
  });

  // world: phone + desktop window
  const world = el(stage, null, 'position:absolute;left:0;top:0;transform-origin:0 0');
  const phoneWrap = el(world, null, 'position:absolute;left:0;top:0;width:360px;height:680px');
  el(phoneWrap, null, 'position:absolute;left:-9px;top:-9px;width:378px;height:698px;border-radius:54px;background:#15161a;box-shadow:0 60px 90px -30px rgba(40,40,90,.38),0 22px 40px -14px rgba(40,40,90,.22),inset 0 0 0 1.5px #34363d');
  const screen = el(phoneWrap, null, 'position:absolute;left:0;top:0;width:360px;height:680px;border-radius:45px;overflow:hidden;background:#f6f5f1');

  // status bar
  el(screen, 'abs', 'left:34px;top:14px;font-size:15px;font-weight:600;letter-spacing:-.01em', '9:41');
  el(screen, 'abs', 'right:30px;top:19px;width:24px;height:12px;border-radius:4px;border:1.5px solid rgba(23,24,28,.45)', '<div style="position:absolute;left:1.5px;top:1.5px;right:4px;bottom:1.5px;border-radius:2px;background:#17181c"></div>');
  // header
  const hDate = el(screen, 'abs', 'left:24px;top:64px;font-size:13px;font-weight:550;color:' + MUTE, 'Thursday, 8 October');
  const hTitle = el(screen, 'abs', 'left:24px;top:82px;font-size:38px;line-height:44px;font-weight:700;letter-spacing:-.035em', 'Today');
  // progress pill
  const pill = el(screen, 'abs', 'left:236px;top:90px;width:108px;height:34px;border-radius:17px;background:#fff;box-shadow:0 0 0 1px rgba(30,30,40,.04),0 6px 14px -8px rgba(30,30,50,.2);font-size:14px;font-weight:600');
  const ringSvg = el(pill, 'abs', 'left:10px;top:7px;width:20px;height:20px', `<svg viewBox="0 0 20 20" width="20" height="20" style="transform:rotate(-90deg)"><circle cx="10" cy="10" r="8" fill="none" stroke="#e8e6e0" stroke-width="3" class="rb"/><circle cx="10" cy="10" r="8" fill="none" stroke="${GREEN}" stroke-width="3" stroke-linecap="round" pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="1" class="ra"/></svg>`);
  const ringBg = ringSvg.querySelector('.rb'), ringArc = ringSvg.querySelector('.ra');
  function odo(parent, left, vals) {
    const box = el(parent, 'abs', `left:${left}px;top:7px;width:10px;height:20px;overflow:hidden`);
    const col = el(box, 'abs', 'left:0;top:0;width:10px', vals.map(v => `<div style="height:20px;line-height:20px;text-align:center">${v}</div>`).join(''));
    return col;
  }
  const odoN = odo(pill, 38, [0, 1, 2, 3, 4]);
  const ofTxt = el(pill, 'abs', 'left:52px;top:7px;height:20px;line-height:20px;font-weight:500', 'of');
  const odoD = odo(pill, 70, [3, 4]);

  // list
  const ROWH = 78, GAP = 10, TOP = 164;
  const TASKS = [
    { id: 'new', title: 'Book dentist', date: 'Fri', tags: ['Health', 'Errands'] },
    { id: 'a', title: 'Review launch notes', tags: ['Work'], time: '10:30' },
    { id: 'b', title: 'Pick up groceries', tags: ['Errands'], time: '6 pm' },
    { id: 'c', title: 'Call mom', tags: ['Home'], time: 'Evening' },
  ];
  const PCOL = ['#1fa971', BRAND, '#e8920f', '#e9568f'];
  function pillChip(parent, tag, left) {
    const c = TAGS[tag];
    return el(parent, 'chip', `left:${left || 0}px;padding:0 9px;background:${rgba(c, .12)};color:${mix(c, '#000000', .28)}`, `<span class="dotc" style="background:${c}"></span>${tag}`);
  }
  const rowsHost = el(screen, null, 'position:absolute;left:0;top:0;width:360px;height:680px');
  const rows = TASKS.map((task, ri) => {
    const r = { task };
    r.root = el(rowsHost, 'row', ri === 0 ? 'z-index:18' : 'z-index:1');
    r.cb = el(r.root, 'abs', 'left:18px;top:25px;width:28px;height:28px', `<svg viewBox="0 0 28 28" width="28" height="28" style="overflow:visible"><circle class="o" cx="14" cy="14" r="12.5" fill="none" stroke="#cfcdc5" stroke-width="2"/><circle class="f" cx="14" cy="14" r="14" fill="${GREEN}"/><path class="c" d="${CHECKP}" pathLength="1" fill="none" stroke="#fff" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 2" stroke-dashoffset="1"/></svg>`);
    r.fill = r.cb.querySelector('.f'); r.chk = r.cb.querySelector('.c'); r.outl = r.cb.querySelector('.o');
    r.pulse = el(r.root, 'abs', `left:32px;top:39px;border-radius:50%;border:2px solid ${GREEN}`);
    r.pts = Array.from({ length: 10 }, (_, i) => el(r.root, 'pt', `background:${PCOL[i % 4]}`));
    r.titleEl = el(r.root, 'title', '', task.title);
    r.tw = r.titleEl.offsetWidth;
    r.strike = el(r.root, 'abs', `left:62px;top:24px;height:2px;width:${r.tw}px;border-radius:1px;background:#a6a49d;transform-origin:0 0;transform:scaleX(0)`);
    r.meta = el(r.root, 'meta');
    if (task.id === 'new') {
      r.date = el(r.meta, 'chip', 'left:0;padding:0 9px;background:#efeee9;color:#6b6a65', 'Fri');
      r.dw = r.date.offsetWidth;
      r.pillEls = task.tags.map(tg => pillChip(r.meta, tg));
      r.pw = r.pillEls.map(p => p.offsetWidth);
      r.plus = el(r.meta, 'chip', `left:${r.dw + 6}px;padding:0 8px;border:1.5px dashed #c9c7bf;color:#8b8a85;overflow:hidden`, `<span style="font-size:14px;line-height:14px;margin-right:4px;font-weight:500">+</span><span class="lab">Tag</span>`);
      r.plusLab = r.plus.querySelector('.lab'); r.plusW = r.plus.offsetWidth;
    } else {
      let x = 0; r.chips = task.tags.map(tg => { const c = pillChip(r.meta, tg, x); x += c.offsetWidth + 6; return c; });
      r.time = el(r.meta, 'chip', `left:${x}px;color:#9a9892;font-weight:500`, task.time);
    }
    return r;
  });
  const rowById = Object.fromEntries(rows.map(r => [r.task.id, r]));

  // empty state
  const empty = el(screen, null, 'position:absolute;left:0;top:0;width:360px;height:680px;z-index:2;pointer-events:none');
  const eGlow = el(empty, 'abs', 'left:60px;top:210px;width:240px;height:240px;border-radius:50%;background:radial-gradient(closest-side,rgba(31,169,113,.2),rgba(31,169,113,0))');
  const eRings = [0, 1].map(() => el(empty, 'abs', `left:180px;top:318px;border-radius:50%;border:2px solid ${GREEN}`));
  const eDisc = el(empty, 'abs', 'left:132px;top:270px;width:96px;height:96px', `<svg viewBox="0 0 96 96" width="96" height="96" style="overflow:visible"><circle cx="48" cy="48" r="48" fill="#dff3ea"/><path class="c" d="M29 49.5 L42 62 L68 35" pathLength="1" fill="none" stroke="${GREEN}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 2" stroke-dashoffset="1"/></svg>`);
  const eChk = eDisc.querySelector('.c');
  const eT1 = el(empty, 'abs', 'left:0;top:390px;width:360px;text-align:center;font-size:30px;line-height:36px;font-weight:700;letter-spacing:-.03em', 'All clear');
  const eT2 = el(empty, 'abs', 'left:0;top:434px;width:360px;text-align:center;font-size:15px;font-weight:500;color:#8b8a85', 'Nothing left for today.');

  // composer + fab
  const card = el(screen, null, 'position:absolute;background:#fff;overflow:hidden;z-index:15');
  const cWrap = el(card, 'abs', 'left:0;top:0;width:332px;height:164px');
  const cTextWrap = el(cWrap, 'abs', 'left:24px;top:22px;width:290px;height:30px;font-size:20px;line-height:30px;font-weight:500;white-space:nowrap');
  const cPlace = el(cTextWrap, 'abs', 'left:0;top:0;color:#aaa8a1', 'What needs doing?');
  const cTyped = el(cTextWrap, 'abs', 'left:0;top:0');
  const cA = el(cTyped, null, 'display:inline', '');
  const cHi = el(cTyped, null, `display:inline;padding:2px 5px;margin:0 -2px 0 -3px;border-radius:8px;background-repeat:no-repeat;background-position:left;background-image:linear-gradient(${rgba(BRAND, .14)},${rgba(BRAND, .14)})`, '');
  const cCaret = el(cTyped, null, `display:inline-block;width:2.5px;height:24px;margin-left:1px;vertical-align:-5px;border-radius:1px;background:${BRAND}`);
  const cCal = el(cWrap, 'abs', 'left:20px;top:108px;height:34px;border-radius:17px;background:#f1f0eb;color:#6b6a65;overflow:hidden;font-size:13px;font-weight:600;white-space:nowrap');
  const cCalIcon = el(cCal, 'abs', 'left:8px;top:8px;width:18px;height:18px', ICON.cal);
  const cCalLab = el(cCal, 'abs', 'left:32px;top:0;line-height:34px', 'Fri, 9 Oct');
  const cTag = el(cWrap, 'abs', 'top:108px;width:34px;height:34px;border-radius:17px;background:#f1f0eb;color:#6b6a65');
  el(cTag, 'abs', 'left:8px;top:8px;width:18px;height:18px', ICON.tag);
  const cContent = [cTextWrap, cCal, cTag];
  const fab = el(screen, null, `position:absolute;border-radius:50%;background:${BRAND};color:#fff;z-index:19;box-shadow:0 12px 24px -8px rgba(91,91,240,.55),0 3px 6px rgba(91,91,240,.25)`);
  const fabPlus = el(fab, 'abs', 'left:0;top:0;width:100%;height:100%;padding:31%;', ICON.plus);
  const fabUp = el(fab, 'abs', 'left:0;top:0;width:100%;height:100%;padding:28%;', ICON.up);

  // tag picker
  const picker = el(screen, 'pop', 'z-index:20');
  const pkInner = el(picker, 'abs', 'left:0;top:0;width:240px;height:226px');
  const pkSearch = el(pkInner, 'abs', 'left:8px;top:8px;width:224px;height:38px;border-radius:12px;background:#f3f2ee;color:#a09e97;font-size:14.5px;font-weight:500;line-height:38px;padding-left:38px', 'Find or create tag');
  el(pkSearch, 'abs', 'left:12px;top:10px;width:18px;height:18px', ICON.search);
  const OPTS = ['Work', 'Health', 'Home', 'Errands'];
  const opts = OPTS.map((name, i) => {
    const o = {}; const c = TAGS[name];
    o.root = el(pkInner, 'opt', `top:${54 + i * 40}px`);
    o.bg = el(o.root, 'abs', `left:0;top:0;width:100%;height:100%;border-radius:12px;background:${rgba(c, .1)};opacity:0`);
    el(o.root, 'abs', `left:12px;top:15px;width:10px;height:10px;border-radius:50%;background:${c}`);
    el(o.root, 'abs', 'left:34px;top:0;line-height:40px', name);
    o.cb = el(o.root, 'abs', 'right:12px;top:10px;width:20px;height:20px', `<svg viewBox="0 0 20 20" width="20" height="20" style="overflow:visible"><circle class="o" cx="10" cy="10" r="8.6" fill="none" stroke="#d4d2cb" stroke-width="1.8"/><circle class="f" cx="10" cy="10" r="10" fill="${c}"/><path class="c" d="M5.8 10.4 L8.8 13.2 L14.2 6.8" pathLength="1" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 2" stroke-dashoffset="1"/></svg>`);
    o.f = o.cb.querySelector('.f'); o.c = o.cb.querySelector('.c');
    return o;
  });

  // dot-matrix loader (own implementation of the dots-to-check idea)
  const PTS = []; for (let iy = -3; iy <= 3; iy++) for (let ix = -3; ix <= 3; ix++) if (Math.abs(ix) + Math.abs(iy) <= 3) PTS.push([ix * 5, iy * 5]);
  const CHK = [[-10, 1], [-3, 8], [12, -9]];
  const segD = (px, py, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1]; const u = clamp(((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy)); return Math.hypot(px - a[0] - u * dx, py - a[1] - u * dy); };
  const nearChk = PTS.map(([x, y]) => Math.min(segD(x, y, CHK[0], CHK[1]), segD(x, y, CHK[1], CHK[2])) < 4.4);
  function makeDots(parent, css, color) {
    const host = el(parent, 'abs', css);
    host.innerHTML = `<svg viewBox="-20 -20 40 40" width="100%" height="100%">${PTS.map(([x, y]) => `<rect x="${x - 1.7}" y="${y - 1.7}" width="3.4" height="3.4" rx=".6" fill="${color}"/>`).join('')}<path d="M-10 1 L-3 8 L12 -9" pathLength="1" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 2" stroke-dashoffset="1"/></svg>`;
    const rects = [...host.querySelectorAll('rect')], path = host.querySelector('path');
    return (t, succ) => {
      rects.forEach((r, i) => {
        const ang = Math.atan2(PTS[i][1], PTS[i][0]); const wv = (Math.cos(ang - t * 6) + 1) / 2; const base = .14 + .86 * Math.pow(wv, 5);
        const o = succ == null ? base : lerp(base, nearChk[i] ? .95 : .1, E.inOut(P(succ, 0, .45)));
        r.setAttribute('fill-opacity', o.toFixed(3));
      });
      path.setAttribute('stroke-dashoffset', (succ == null ? 1 : 1 - E.out(P(succ, .3, .45))).toFixed(3));
    };
  }
  // island (sync live activity)
  const island = el(screen, null, 'position:absolute;top:11px;height:30px;border-radius:19px;background:#050506;overflow:hidden;z-index:30');
  const islDots = makeDots(island, 'left:11px;top:5px;width:26px;height:26px', '#ffffff');
  const islT1 = el(island, 'abs', 'left:46px;top:0;line-height:36px;font-size:13.5px;font-weight:600;color:#fff;white-space:nowrap', 'Syncing…');
  const islT2 = el(island, 'abs', 'left:46px;top:0;line-height:36px;font-size:13.5px;font-weight:600;color:#7be0b4;white-space:nowrap', 'Synced');
  const touchEl = el(screen, 'touch');

  // desktop window (appears in the sync scene)
  const DK = { x: 512, y: 138, w: 480, h: 320 };
  const desk = el(world, null, `position:absolute;left:${DK.x}px;top:${DK.y}px;width:${DK.w}px;height:${DK.h}px;border-radius:16px;background:#fff;overflow:hidden;box-shadow:0 0 0 1px rgba(30,30,60,.06),0 50px 70px -30px rgba(40,40,90,.35),0 14px 28px -12px rgba(40,40,90,.18)`);
  const deskShell = el(world, null, 'position:absolute;left:0;top:0'); // packets live in world space
  el(desk, 'abs', 'left:0;top:0;width:124px;height:320px;background:#f5f4f0');
  [0, 1, 2].forEach(i => el(desk, 'abs', `left:${16 + i * 16}px;top:15px;width:9px;height:9px;border-radius:50%;background:${['#ff6159', '#ffbd2e', '#28c941'][i]};opacity:.85`));
  el(desk, 'abs', `left:16px;top:42px;width:22px;height:22px;border-radius:7px;background:${BRAND}`, `<svg viewBox="0 0 22 22" width="22" height="22"><path d="M6 11.4 L9.4 14.6 L16 7.6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
  el(desk, 'abs', 'left:46px;top:42px;line-height:22px;font-size:15px;font-weight:700;letter-spacing:-.02em', 'Tidy');
  ['Inbox', 'Today', 'Upcoming'].forEach((s, i) => {
    const it = el(desk, 'abs', `left:10px;top:${84 + i * 32}px;width:104px;height:28px;border-radius:8px;line-height:28px;padding-left:10px;font-size:13px;font-weight:550;color:${i === 1 ? BRAND : '#6b6a65'};${i === 1 ? 'background:' + rgba(BRAND, .1) : ''}`, s);
    if (i === 1) { const box = el(it, 'abs', 'right:9px;top:5px;width:12px;height:18px;overflow:hidden;font-weight:700;font-size:12.5px'); desk.badge = el(box, 'abs', 'left:0;top:0;width:12px', [4, 3, 2, 1, 0].map(v => `<div style="height:18px;line-height:18px;text-align:center">${v}</div>`).join('')); }
  });
  el(desk, 'abs', 'left:20px;top:196px;font-size:10px;font-weight:700;letter-spacing:.12em;color:#a8a69f', 'TAGS');
  Object.keys(TAGS).forEach((k, i) => el(desk, 'abs', `left:20px;top:${216 + i * 22}px;line-height:18px;font-size:12.5px;font-weight:550;color:#6b6a65`, `<span class="dotc" style="background:${TAGS[k]}"></span>${k}`));
  el(desk, 'abs', 'left:148px;top:34px;font-size:26px;line-height:32px;font-weight:700;letter-spacing:-.03em', 'Today');
  const dChip = el(desk, 'abs', 'right:20px;top:36px;height:28px;border-radius:14px;background:#f3f2ee;overflow:hidden;width:112px');
  const dDots = makeDots(dChip, 'left:7px;top:4px;width:20px;height:20px', '#2a2b33');
  const dT1 = el(dChip, 'abs', 'left:34px;top:0;line-height:28px;font-size:12.5px;font-weight:600;color:#55545f;white-space:nowrap', 'Syncing…');
  const dT2 = el(dChip, 'abs', `left:34px;top:0;line-height:28px;font-size:12.5px;font-weight:600;color:${GREEN};white-space:nowrap`, 'Synced');
  const DROWS = TASKS.map((task, i) => {
    const r = el(desk, 'abs', `left:148px;top:${98 + i * 54}px;width:316px;height:50px;border-top:1px solid #eceae4`);
    const cb = el(r, 'abs', 'left:0;top:15px;width:20px;height:20px', `<svg viewBox="0 0 20 20" width="20" height="20" style="overflow:visible"><circle class="o" cx="10" cy="10" r="8.6" fill="none" stroke="#cfcdc5" stroke-width="1.8"/><circle class="f" cx="10" cy="10" r="10" fill="${GREEN}"/><path class="c" d="M5.8 10.4 L8.8 13.2 L14.2 6.8" pathLength="1" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 2" stroke-dashoffset="1"/></svg>`);
    const tt = el(r, 'abs', 'left:34px;top:14px;line-height:22px;font-size:14.5px;font-weight:600;white-space:nowrap', task.title);
    const st = el(r, 'abs', `left:34px;top:24px;height:1.8px;width:${tt.offsetWidth}px;background:#a6a49d;transform-origin:0 0;transform:scaleX(0)`);
    const tg = el(r, 'abs', 'right:0;top:14px;line-height:22px;font-size:12px;font-weight:600;color:#8b8a85;white-space:nowrap', `<span class="dotc" style="background:${TAGS[task.tags[0]]}"></span>${task.tags[0]}`);
    return { r, f: cb.querySelector('.f'), c: cb.querySelector('.c'), st, tt, tg, cb };
  });
  const dEmpty = el(desk, 'abs', 'left:124px;top:110px;width:356px;height:150px;text-align:center');
  const dEDisc = el(dEmpty, 'abs', 'left:149px;top:10px;width:58px;height:58px', `<svg viewBox="0 0 58 58" width="58" height="58"><circle cx="29" cy="29" r="29" fill="#dff3ea"/><path class="c" d="M17.5 30 L25.5 37.5 L41 21.5" pathLength="1" fill="none" stroke="${GREEN}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 2" stroke-dashoffset="1"/></svg>`);
  const dEChk = dEDisc.querySelector('.c');
  const dET = el(dEmpty, 'abs', 'left:0;top:80px;width:356px;font-size:19px;font-weight:700;letter-spacing:-.02em', 'All clear');
  const packets = Array.from({ length: 4 }, () => Array.from({ length: 6 }, (_, j) => el(world, 'abs', `width:${15 - j * 1.6}px;height:${15 - j * 1.6}px;margin:${-(15 - j * 1.6) / 2}px 0 0 ${-(15 - j * 1.6) / 2}px;border-radius:50%;background:${BRAND};opacity:0`)));
  const landRings = Array.from({ length: 4 }, () => el(world, 'abs', `border-radius:50%;border:2px solid ${BRAND};opacity:0`));

  // end card
  const cover = el(stage, null, 'position:absolute;left:0;top:0;width:1280px;height:720px;background:radial-gradient(900px 700px at 50% 40%,#6b6bf5,#4a4ae0 60%,#3c3cc9);clip-path:circle(0px at 574px 414px)');
  const endGrp = el(cover, 'abs', 'left:0;top:0;width:1280px;height:720px');
  const endRing = el(endGrp, 'abs', 'left:640px;top:268px;border-radius:50%;border:2px solid rgba(255,255,255,.7)');
  const tile = el(endGrp, 'abs', 'left:580px;top:208px;width:120px;height:120px;border-radius:34px;background:#fff;box-shadow:0 30px 50px -16px rgba(20,20,90,.5)', `<svg viewBox="0 0 120 120" width="120" height="120"><path class="c" d="M36 62 L53 78 L86 42" pathLength="1" fill="none" stroke="${BRAND}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 2" stroke-dashoffset="1"/></svg>`);
  const tileChk = tile.querySelector('.c');
  const wordHost = el(endGrp, 'abs', 'left:0;top:342px;width:1280px;height:110px;text-align:center;font-family:"Inter Display",Inter,sans-serif;font-size:104px;line-height:110px;font-weight:700;letter-spacing:-.045em;color:#fff;white-space:nowrap');
  const letters = 'Tidy'.split('').map(ch => { const s = document.createElement('span'); s.textContent = ch; s.style.display = 'inline-block'; wordHost.appendChild(s); return s; });
  const tagline = el(endGrp, 'abs', 'left:0;top:478px;width:1280px;text-align:center;font-size:26px;font-weight:500;letter-spacing:-.01em;color:rgba(255,255,255,.78)', 'Tasks, gently handled.');

  // ---------------------------------------------------------------- per-frame helpers
  const BG = ['#f1efe9', '#eceef7', '#ebf3ee', '#edf0f5'];
  const BGT = [0, 4.9, 9.3, 14.1];
  function bgAt(t) { let i = 0; for (let k = 0; k < BGT.length; k++) if (t >= BGT[k]) i = k; const n = Math.min(3, i + 1); return i === n ? BG[i] : mix(BG[i], BG[n], E.inOut(P(t, BGT[n] - .6, 1.2))); }

  const rowOrder = ['new', 'a', 'b', 'c'];
  const exitFlow = (id, tt) => { const c = COMP[id]; return 1 - E.inOut(P((tt - c.t) / c.sp, .78, .55)); };
  const present = (id, tt) => id === 'new' ? E.inOut(P(tt, T.flight + .04, .5)) : 1;
  const slot = (id, tt) => (ROWH + GAP) * present(id, tt) * exitFlow(id, tt);
  const doneP = (id, t) => E.inOut(P((t - COMP[id].t) / COMP[id].sp, .05, .4));

  function touchAt(t) {
    for (let k = 0; k < TAPS.length; k++) {
      const tap = TAPS[k], prev = TAPS[k - 1], next = TAPS[k + 1];
      const near = prev && (tap.t - prev.t) < 1.3, nextNear = next && (next.t - tap.t) < 1.3;
      const a = near ? prev.t + .24 : tap.t - .5;
      const end = nextNear ? next.t - (next.t - tap.t < 1.3 ? Math.min(.5, next.t - tap.t - .24) : .5) : tap.t + .6;
      if (t < a || t >= end) continue;
      const from = near ? prev : { x: tap.x + 28, y: tap.y + 36 };
      const p = E.inOut(P(t, a, tap.t - a - .04));
      const x = lerp(from.x, tap.x, p), y = lerp(from.y, tap.y, p);
      const press = E.out(P(t, tap.t - .09, .09)) * (1 - E.out(P(t, tap.t, .24)));
      let al = near ? 1 : E.out(P(t, a, .22));
      if (!nextNear) al *= 1 - E.out(P(t, tap.t + .3, .26));
      return { x, y, al, press };
    }
    return null;
  }

  // ---------------------------------------------------------------- render
  function render(t) {
    t = clamp(t, 0, DUR);
    const cam = camAt(t);
    world.style.transform = `translate(${(cam.sx - cam.s * cam.fx).toFixed(3)}px,${(cam.sy - cam.s * cam.fy).toFixed(3)}px) scale(${cam.s.toFixed(5)})`;
    stage.style.background = bgAt(t);
    blob1.style.transform = `translate(${1010 + Math.sin(t * .33) * 50}px,${170 + Math.cos(t * .27) * 40}px)`;
    blob2.style.transform = `translate(${260 + Math.cos(t * .29) * 50}px,${660 + Math.sin(t * .31) * 30}px)`;

    // captions
    CAPS.forEach(c => {
      const pin = [c.eb_, ...c.lns].map((e, i) => E.out(P(t, c.a + i * .1, .95)));
      const pout = E.inOut(P(t, c.b, .5));
      c.root.style.display = (t < c.a - .01 || t > c.b + .6) ? 'none' : 'block';
      [c.eb_, ...c.lns].forEach((e, i) => {
        const p = pin[i];
        e.style.opacity = (clamp(p * 1.15) * (1 - pout)).toFixed(3);
        e.style.transform = `translateY(${((1 - p) * 20 - pout * 16).toFixed(2)}px)`;
        const b = (1 - p) * 9 + pout * 7; e.style.filter = b < .05 ? 'none' : `blur(${b.toFixed(2)}px)`;
      });
    });
    // chapter bars
    const chapA = 1 - E.inOut(P(t, T.endStart - .1, .4));
    chap.style.opacity = (E.out(P(t, .5, .6)) * chapA).toFixed(3);
    chapBars.forEach((b, i) => b.style.transform = `scaleX(${clamp((t - CH[i][0]) / (CH[i][1] - CH[i][0])).toFixed(4)})`);

    // phone entrance
    const pin = E.out(P(t, .05, 1.1));
    phoneWrap.style.opacity = clamp(pin * 1.3).toFixed(3);
    phoneWrap.style.transform = `translateY(${((1 - pin) * 60).toFixed(2)}px) scale(${lerp(.95, 1, pin).toFixed(4)})`;
    phoneWrap.style.transformOrigin = '180px 340px';
    [hDate, hTitle, pill].forEach((e, i) => reveal(e, E.out(P(t, .4 + i * .1, .9)), 12, 6));

    // ---- list flow
    const yOf = {};
    rowOrder.forEach((id, i) => { let y = TOP; for (let j = 0; j < i; j++) y += slot(rowOrder[j], t - .05 * (i - j)); yOf[id] = y; });
    // tag selections (picker + row pills)
    const selT = [T.selHealth, T.selErrands];
    const pillA = selT.map(s => E.sp(P(t, s + .05, .75)));
    const nR = rowById.new;
    let x = nR.dw + 6, cur = [];
    pillA.forEach((a, i) => { cur.push(x); x += (nR.pw[i] + 6) * a; });
    const anyTag = Math.max(...pillA);
    const closeP = P(t, T.closeTap, .5);
    rows.forEach((r, ri) => {
      const id = r.task.id, y = yOf[id];
      let ox = 0, oy = 0, sc = 1, rot = 0, sx = 1, sy = 1, op = 1, blur = 0;
      if (id !== 'new') {
        const ap = E.out(P(t, .55 + .12 * (ri - 1), .9));
        oy += (1 - ap) * 26; op *= clamp(ap * 1.2); blur = (1 - ap) * 6;
      } else {
        const p = P(t, T.flight, .7), travel = E.spFirm(p);
        oy += (1 - travel) * 331;
        const comp = p < .33 ? E.inOut(p / .33) : p < .9 ? 1 - E.inOut((p - .33) / .57) : 0;
        sx = 1 - .06 * comp; sy = 1 + .05 * comp;
        sc = lerp(.86, 1, E.out(P(t, T.flight, .5)));
        op *= E.out(P(t, T.flight, .08));
        if (t < T.flight) op = 0;
      }
      // completion
      const c = COMP[id], u = (t - c.t) / c.sp;
      const fillP = E.spBouncy(P(u, 0, .5)), chkP = E.out(P(u, .08, .3));
      const pop = u < .09 ? lerp(1, .82, E.out(u / .09)) : lerp(.82, 1, E.spBouncy(P(u, .09, .55)));
      r.cb.style.transform = u > 0 ? `scale(${pop.toFixed(4)})` : 'none';
      r.fill.setAttribute('transform', `translate(14 14) scale(${Math.max(0, fillP).toFixed(4)}) translate(-14 -14)`);
      r.fill.style.opacity = u > 0 ? 1 : 0;
      r.chk.setAttribute('stroke-dashoffset', (1 - chkP).toFixed(3));
      r.outl.setAttribute('stroke-opacity', (1 - clamp(fillP * 1.5)).toFixed(3));
      const pu = P(u, 0, .65);
      r.pulse.style.opacity = u > 0 && pu < 1 ? (.55 * (1 - E.out(pu))).toFixed(3) : 0;
      const pr = lerp(14, 40, E.out(pu)); r.pulse.style.width = r.pulse.style.height = (pr * 2) + 'px'; r.pulse.style.margin = `${-pr}px 0 0 ${-pr}px`;
      r.pts.forEach((p, i) => {
        const ang = i * (Math.PI * 2 / 10) + rnd(i + 3) * .5, dist = lerp(22, 52, rnd(i + 9)) * E.out(P(u, .02, .62));
        const qu = P(u, .02, .62), size = 9.5 * Math.pow(1 - qu, .8) * (.6 + .6 * rnd(i + 20));
        p.style.opacity = u > 0 && qu < 1 ? 1 : 0;
        p.style.width = p.style.height = size.toFixed(2) + 'px';
        p.style.left = (32 + Math.cos(ang) * dist - size / 2).toFixed(2) + 'px';
        p.style.top = (39 + Math.sin(ang) * dist + 12 * qu * qu - size / 2).toFixed(2) + 'px';
      });
      const stp = E.inOut(P(u, .14, .4));
      r.strike.style.transform = `scaleX(${stp.toFixed(4)})`;
      r.titleEl.style.color = mix(INK, '#a6a49d', stp);
      r.meta.style.opacity = (1 - .5 * stp).toFixed(3);
      const ex = E.inOut(P(u, .62, .55));
      if (u > .62) { ox += 74 * ex; rot += 5 * ex; oy += 4 * ex; op *= 1 - clamp((u - .78) / .35); }
      if (u > 1.25) op = 0;
      r.root.style.top = y.toFixed(3) + 'px';
      r.root.style.transform = tf(ox, oy, sc, rot, sx, sy);
      r.root.style.transformOrigin = '50% 50%';
      r.root.style.opacity = (op * (id === 'new' ? 1 : 1)).toFixed(3);
      r.root.style.filter = blur < .05 ? 'none' : `blur(${blur.toFixed(2)}px)`;
      r.root.style.display = op <= .001 ? 'none' : 'block';
      if (id === 'new') {
        r.titleEl.style.opacity = 1;
        // tag pills / plus chip
        r.pillEls.forEach((pe, i) => {
          const a = pillA[i];
          pe.style.left = cur[i].toFixed(2) + 'px';
          pe.style.opacity = clamp(a * 1.3).toFixed(3);
          pe.style.transform = `scale(${lerp(.6, 1, a).toFixed(4)})`; pe.style.transformOrigin = '0 50%';
          pe.style.filter = a >= 1 ? 'none' : `blur(${((1 - a) * 4).toFixed(2)}px)`;
        });
        const shrink = E.inOut(P(t, T.selHealth + .05, .4));
        const pw = lerp(r.plusW, 25, shrink);
        const open = pickerQ(t);
        r.plus.style.left = x.toFixed(2) + 'px'; r.plus.style.width = pw.toFixed(2) + 'px';
        r.plus.style.padding = `0 ${lerp(8, 0, shrink).toFixed(2)}px`;
        r.plus.style.justifyContent = shrink > .5 ? 'center' : 'flex-start';
        r.plusLab.style.opacity = (1 - clamp(shrink * 2.2)).toFixed(3); r.plusLab.style.display = shrink > .55 ? 'none' : 'inline';
        r.plus.firstChild.style.marginRight = lerp(4, 0, shrink).toFixed(2) + 'px';
        r.plus.style.opacity = (1 - E.out(P(open, 0, .2))).toFixed(3);
        r.plus._x = x; r.plus._w = pw;
      }
    });

    // ---- progress pill
    let nDone = 0; rowOrder.forEach(id => nDone += doneP(id, t));
    const total = 3 + present('new', t);
    odoN.style.transform = `translateY(${(-nDone * 20).toFixed(3)}px)`;
    odoD.style.transform = `translateY(${(-(total - 3) * 20).toFixed(3)}px)`;
    const frac = clamp(nDone / total);
    ringArc.setAttribute('stroke-dashoffset', (1 - frac).toFixed(4));
    const full = E.inOut(P(t, 13.2, .35));
    pill.style.background = mix('#ffffff', GREEN, full);
    pill.style.color = mix(INK, '#ffffff', full);
    ringArc.setAttribute('stroke', mix(GREEN, '#ffffff', full));
    ringBg.setAttribute('stroke', mix('#e8e6e0', '#5fcaa0', full));
    const pop = t > 13.2 ? 1 + .09 * Math.sin(Math.PI * clamp((t - 13.2) / .6)) * (1 - clamp((t - 13.2) / .6) * .4) : 1;
    pill.style.transform = `scale(${pop.toFixed(4)})`; pill.style.transformOrigin = '100% 50%';

    // ---- empty state
    const e0 = 13.25;
    const eP = E.sp(P(t, e0, .8));
    eDisc.style.opacity = clamp(E.out(P(t, e0, .25))).toFixed(3);
    eDisc.style.transform = `scale(${lerp(.4, 1, eP).toFixed(4)})`;
    eChk.setAttribute('stroke-dashoffset', (1 - E.out(P(t, e0 + .3, .5))).toFixed(3));
    eGlow.style.opacity = E.out(P(t, e0, 1.0)).toFixed(3); eGlow.style.transform = `scale(${lerp(.6, 1, E.out(P(t, e0, 1.2))).toFixed(3)})`;
    eRings.forEach((r, i) => {
      const q = P(t, e0 + .05 + i * .22, .9), rad = lerp(48, 92, E.out(q));
      r.style.opacity = t > e0 && q < 1 ? (.5 * (1 - E.out(q))).toFixed(3) : 0;
      r.style.width = r.style.height = (rad * 2) + 'px'; r.style.margin = `${-rad}px 0 0 ${-rad}px`;
    });
    reveal(eT1, E.out(P(t, e0 + .35, .9)), 12, 8); reveal(eT2, E.out(P(t, e0 + .5, .9)), 12, 8);
    if (t < e0) { eT1.style.opacity = eT2.style.opacity = 0; }

    // ---- composer + fab
    const openP = E.spFirm(P(t, T.fabTap + .05, .7));
    const closeC = E.inOut(P(t, T.flight + .05, .55));
    const co = t < T.flight + .05 ? openP : (1 - closeC) * 1;
    const cr = (a, b) => lerp(a, b, co);
    card.style.left = cr(276, 14) + 'px'; card.style.top = cr(600, 496) + 'px';
    card.style.width = cr(60, 332) + 'px'; card.style.height = cr(60, 164) + 'px';
    card.style.borderRadius = '30px';
    card.style.boxShadow = `0 0 0 1px rgba(30,30,50,${(.05 * clamp(co * 3)).toFixed(3)}),0 ${(26 * co).toFixed(1)}px ${(46 * co).toFixed(1)}px -${(12 * co).toFixed(1)}px rgba(30,30,70,${(.3 * clamp(co * 1.5)).toFixed(3)})`;
    card.style.opacity = co > .003 ? 1 : 0;
    const cOp = clamp((co - .4) / .35) * (1 - E.out(P(t, T.flight, .16)));
    cContent.forEach((e, i) => { e.style.opacity = cOp.toFixed(3); e.style.filter = cOp >= .99 ? 'none' : `blur(${((1 - cOp) * 5).toFixed(2)}px)`; });
    cWrap.style.left = (14 - parseFloat(card.style.left)) + 'px'; cWrap.style.top = (496 - parseFloat(card.style.top)) + 'px';
    // typed text
    let nCh = 0; for (let i = 0; i < charT.length; i++) if (t >= charT[i]) nCh = i + 1;
    const typed = TEXT.slice(0, nCh), split = 'Book dentist '.length;
    cA.textContent = typed.slice(0, split); cHi.textContent = typed.slice(split);
    const hiP = E.out(P(t, FRIDAY_T, .3));
    cHi.style.padding = typed.length > split ? '2px 5px' : '0'; cHi.style.margin = typed.length > split ? '0 -2px 0 -3px' : '0';
    cHi.style.backgroundSize = (hiP * 100).toFixed(1) + '% 100%';
    cHi.style.color = mix(INK, BRAND, hiP);
    cPlace.style.opacity = nCh === 0 ? 1 : 0;
    const lastType = nCh ? charT[nCh - 1] : T.fabTap + .6;
    cCaret.style.visibility = (t - lastType < .45 && nCh > 0 && nCh < TEXT.length + 1 && t - lastType < .45) || (Math.floor((t - lastType) / .5) % 2 === 0) ? 'visible' : 'hidden';
    if (t > T.sendTap) cCaret.style.visibility = 'hidden';
    // date chip morph
    const dP = E.sp(P(t, FRIDAY_T + .05, .7));
    const calW = lerp(34, 106, dP);
    cCal.style.width = calW.toFixed(2) + 'px'; cCalLab.style.opacity = clamp((dP - .3) / .5).toFixed(3);
    cCal.style.background = mix('#f1f0eb', rgba(BRAND, 1) && '#e9e9fd', dP); cCal.style.color = mix('#6b6a65', BRAND, dP);
    cTag.style.left = (20 + calW + 8).toFixed(2) + 'px';
    // fab
    const fc = [lerp(306, 308, co), lerp(630, 622, co)], fr = lerp(30, 22, co);
    const press = TAPS.slice(0, 2).map(k => E.out(P(t, k.t - .09, .09)) * (1 - E.out(P(t, k.t, .24)))).reduce((a, b) => Math.max(a, b), 0);
    const fs = 1 - .1 * press;
    fab.style.left = (fc[0] - fr) + 'px'; fab.style.top = (fc[1] - fr) + 'px'; fab.style.width = fab.style.height = (fr * 2) + 'px';
    fab.style.transform = `scale(${fs.toFixed(4)})`;
    const dis = co * (1 - E.out(P(t, charT[0], .15))) * (t < T.flight ? 1 : 0);
    fab.style.background = mix(BRAND, '#c9c9f7', dis);
    fab.style.boxShadow = `0 ${12 * (1 - dis)}px 24px -8px rgba(91,91,240,${(.55 * (1 - dis)).toFixed(3)}),0 3px 6px rgba(91,91,240,${(.25 * (1 - dis)).toFixed(3)})`;
    const swap = E.inOut(P(co, .25, .5));
    fabPlus.style.opacity = (1 - swap).toFixed(3); fabPlus.style.transform = `rotate(${(swap * 90).toFixed(2)}deg)`;
    fabUp.style.opacity = swap.toFixed(3); fabUp.style.transform = `rotate(${((1 - swap) * -90).toFixed(2)}deg)`;
    fab.style.opacity = E.out(P(t, .7, .8)).toFixed(3);

    // ---- picker
    const q = pickerQ(t);
    const ar = { x: 78 + r_x(nR), y: yOf.new + 44, w: nR.plus._w || 68, h: 22 };
    const fin = { x: 104, y: 252, w: 240, h: 226 };
    picker.style.display = q <= .001 ? 'none' : 'block';
    picker.style.left = lerp(ar.x, fin.x, q) + 'px'; picker.style.top = lerp(ar.y, fin.y, q) + 'px';
    picker.style.width = lerp(ar.w, fin.w, q) + 'px'; picker.style.height = lerp(ar.h, fin.h, q) + 'px';
    picker.style.borderRadius = lerp(11, 22, clamp(q)) + 'px';
    picker.style.opacity = clamp(q * 5).toFixed(3);
    const cq = q > .01 && t < T.closeTap ? 1 : 1;
    pkSearch.style.opacity = E.out(P(q, .25, .45)).toFixed(3);
    opts.forEach((o, i) => {
      const k = OPTS[i], sel = k === 'Health' ? T.selHealth : k === 'Errands' ? T.selErrands : 9e9;
      const ap = E.out(P(q, .3 + i * .06, .5));
      o.root.style.opacity = ap.toFixed(3); o.root.style.transform = `translateY(${((1 - ap) * 8).toFixed(2)}px)`;
      o.root.style.filter = ap >= 1 ? 'none' : `blur(${((1 - ap) * 4).toFixed(2)}px)`;
      const sp = E.spBouncy(P(t, sel + .02, .5));
      o.f.setAttribute('transform', `translate(10 10) scale(${Math.max(0, sp).toFixed(4)}) translate(-10 -10)`);
      o.c.setAttribute('stroke-dashoffset', (1 - E.out(P(t, sel + .08, .3))).toFixed(3));
      const hl = E.out(P(t, sel - .15, .12)) * .9 + (t > sel ? .1 : 0);
      o.bg.style.opacity = (t > sel - .15 ? hl * (t > sel + .35 ? lerp(1, .55, E.out(P(t, sel + .35, .3))) : 1) : 0).toFixed(3);
    });

    // ---- touch
    const tc = touchAt(t);
    if (tc) {
      touchEl.style.display = 'block';
      touchEl.style.left = tc.x.toFixed(2) + 'px'; touchEl.style.top = tc.y.toFixed(2) + 'px';
      touchEl.style.opacity = tc.al.toFixed(3);
      touchEl.style.transform = `scale(${(1 - .26 * tc.press).toFixed(4)})`;
      touchEl.style.background = `rgba(30,30,48,${(.14 + .14 * tc.press).toFixed(3)})`;
    } else touchEl.style.display = 'none';

    // ---- island + desktop sync
    const iOpen = E.sp(P(t, T.syncOn, .7)) * (1 - E.inOut(P(t, T.endStart - .1, .45)));
    const iw = lerp(104, 184, iOpen), ih = lerp(30, 36, iOpen);
    island.style.width = iw.toFixed(2) + 'px'; island.style.height = ih.toFixed(2) + 'px';
    island.style.left = (180 - iw / 2).toFixed(2) + 'px'; island.style.top = lerp(11, 10, iOpen).toFixed(2) + 'px';
    const succ = t > T.syncDone ? t - T.syncDone : null;
    const ic2 = clamp((iOpen - .5) / .5);
    islDots(t, succ); dDots(t, succ);
    const swapT = E.inOut(P(t, T.syncDone + .15, .35));
    islT1.style.opacity = (ic2 * (1 - swapT)).toFixed(3); islT2.style.opacity = (ic2 * swapT).toFixed(3);
    islT1.style.transform = `translateY(${(-swapT * 8).toFixed(2)}px)`; islT2.style.transform = `translateY(${((1 - swapT) * 8).toFixed(2)}px)`;
    islDots.length; document; 
    // dots host opacity
    island.firstChild.style.opacity = ic2.toFixed(3);

    // desktop
    const dIn = E.out(P(t, 14.55, 1.0));
    desk.style.opacity = clamp(dIn * 1.3).toFixed(3);
    desk.style.transform = `translate(${((1 - dIn) * 70).toFixed(2)}px,0) scale(${lerp(.96, 1, dIn).toFixed(4)})`;
    desk.style.transformOrigin = '0 50%';
    desk.style.filter = dIn >= 1 ? 'none' : `blur(${((1 - dIn) * 8).toFixed(2)}px)`;
    const dsw = E.inOut(P(t, T.syncDone + .15, .35));
    dT1.style.opacity = (1 - dsw).toFixed(3); dT2.style.opacity = dsw.toFixed(3);
    dT1.style.transform = `translateY(${(-dsw * 8).toFixed(2)}px)`; dT2.style.transform = `translateY(${((1 - dsw) * 8).toFixed(2)}px)`;
    let dDone = 0;
    DROWS.forEach((d, i) => {
      const arrive = T.lands + .14 * i, u = t - arrive;
      const f = E.spBouncy(P(u, 0, .5)), ck = E.out(P(u, .06, .3)), st = E.inOut(P(u, .12, .35));
      d.f.setAttribute('transform', `translate(10 10) scale(${Math.max(0, f).toFixed(4)}) translate(-10 -10)`);
      d.f.style.opacity = u > 0 ? 1 : 0;
      d.c.setAttribute('stroke-dashoffset', (1 - ck).toFixed(3));
      d.st.style.transform = `scaleX(${st.toFixed(4)})`;
      d.tt.style.color = mix(INK, '#a6a49d', st);
      const fo = E.inOut(P(t, 16.15 + .07 * i, .45));
      d.r.style.opacity = (1 - fo).toFixed(3); d.r.style.transform = `translateX(${(fo * 26).toFixed(2)}px)`;
      dDone += E.inOut(P(u, .05, .4));
    });
    desk.badge.style.transform = `translateY(${(-dDone * 18).toFixed(3)}px)`;
    const de = 16.5;
    dEDisc.style.opacity = E.out(P(t, de, .25)).toFixed(3);
    dEDisc.style.transform = `scale(${lerp(.5, 1, E.sp(P(t, de, .7))).toFixed(4)})`;
    dEChk.setAttribute('stroke-dashoffset', (1 - E.out(P(t, de + .25, .45))).toFixed(3));
    reveal(dET, E.out(P(t, de + .3, .8)), 10, 6);
    if (t < de) dET.style.opacity = 0;

    // packets: island -> each desk row
    const P0 = [180, 26];
    packets.forEach((trail, k) => {
      const dep = T.packets + .14 * k, dd = .7;
      const P2 = [DK.x + 158, DK.y + 98 + 54 * k + 25], P1 = [420, -50 + 20 * k];
      trail.forEach((d, j) => {
        const tt = t - j * .022, p = E.inOut(P(tt, dep, dd));
        const bx = (1 - p) * (1 - p) * P0[0] + 2 * (1 - p) * p * P1[0] + p * p * P2[0];
        const by = (1 - p) * (1 - p) * P0[1] + 2 * (1 - p) * p * P1[1] + p * p * P2[1];
        const vis = tt > dep && tt < dep + dd ? 1 : 0;
        d.style.opacity = (vis * (1 - j * .15) * (j === 0 ? 1 : .8)).toFixed(3);
        d.style.transform = `translate(${bx.toFixed(2)}px,${by.toFixed(2)}px)`;
        if (j === 0) d.style.boxShadow = `0 0 12px ${rgba(BRAND, .55)}`;
      });
      const lr = landRings[k], arrive = dep + dd, lq = P(t, arrive - .02, .5);
      const rad = lerp(6, 24, E.out(lq));
      lr.style.opacity = lq > 0 && lq < 1 ? (.6 * (1 - E.out(lq))).toFixed(3) : 0;
      lr.style.width = lr.style.height = (rad * 2) + 'px'; lr.style.left = (P2[0] - rad) + 'px'; lr.style.top = (P2[1] - rad) + 'px';
    });

    // ---- end card: iris from the phone's check, then logo + wordmark
    const ir = E.inOut(P(t, T.endStart, .95));
    cover.style.clipPath = ir <= 0 ? 'circle(0px at 574px 414px)' : `circle(${(ir * 1500).toFixed(1)}px at ${lerp(574, 640, ir).toFixed(1)}px ${lerp(414, 360, ir).toFixed(1)}px)`;
    const g0 = T.endStart + .6;
    const tp = E.spBouncy(P(t, g0, .9));
    tile.style.opacity = E.out(P(t, g0, .25)).toFixed(3);
    tile.style.transform = `scale(${lerp(.5, 1, tp).toFixed(4)})`;
    tileChk.setAttribute('stroke-dashoffset', (1 - E.out(P(t, g0 + .35, .5))).toFixed(3));
    const rq = P(t, g0 + .1, 1.1), rr = lerp(60, 120, E.out(rq));
    endRing.style.opacity = rq > 0 && rq < 1 ? (.7 * (1 - E.out(rq))).toFixed(3) : 0;
    endRing.style.width = endRing.style.height = (rr * 2) + 'px'; endRing.style.margin = `${-rr + 60}px 0 0 ${-rr}px`;
    letters.forEach((l, i) => reveal(l, E.out(P(t, g0 + .55 + i * .08, .85)), 22, 12));
    reveal(tagline, E.out(P(t, g0 + 1.1, .9)), 14, 8);
    const drift = 1 + .025 * P(t, g0, 3);
    endGrp.style.transform = `scale(${drift.toFixed(5)})`; endGrp.style.transformOrigin = '640px 360px';
  }
  // picker open amount (0..1): spring open from the chip tap, ease closed after the outside tap
  function pickerQ(t) {
    if (t < T.tagTap + .05) return 0;
    if (t < T.closeTap + .05) return E.sp(P(t, T.tagTap + .05, .7));
    return 1 - E.inOut(P(t, T.closeTap + .05, .45));
  }
  function r_x(nR) { return nR.plus._x != null ? nR.plus._x : nR.dw + 6; }

  window.render = render; window.DUR = DUR;
  render(0);
})();
