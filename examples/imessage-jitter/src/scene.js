(function (root, factory) {
  const api = factory(typeof module === 'object' ? require('./motion.js') : root.JitterMotion);
  if (typeof module === 'object') module.exports = api; else root.JitterScene = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (M) {
  'use strict';
  const W = 800, H = 880, BLUE = '#087dff', INK = '#182125';
  function rr(c, x, y, w, h, r, fill, stroke) { c.beginPath(); c.roundRect(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.5; c.stroke(); } }
  function text(c, str, x, y, size, color = INK, weight = 400, align = 'left') { c.font = `${weight} ${size}px "Jitter Sans", Inter, sans-serif`; c.fillStyle = color; c.textAlign = align; c.textBaseline = 'alphabetic'; c.fillText(str, x, y); }
  function circle(c, x, y, r, color) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = color; c.fill(); }
  function drawWord(c, word, x, baseline, fontSize, seconds, color = INK, reducedMotion = false, maxWidth = 340) {
    const l = M.layout(word, (str, size) => { c.font = `400 ${size}px "Jitter Sans", Inter, sans-serif`; return c.measureText(str).width; }, {fontSize, maxWidth});
    c.font = `400 ${l.fontSize}px "Jitter Sans", Inter, sans-serif`; c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.fillStyle = color;
    for (const g of l.glyphs) {
      const p = M.glyphPose(g.x + g.width / 2 - l.width / 2, seconds, l.fontSize, reducedMotion);
      c.save(); c.translate(x + g.x + g.width / 2 + p.x, baseline - l.fontSize * .28 + p.y); c.rotate(p.rotation);
      c.fillText(g.char, -g.width / 2, l.fontSize * .28); c.restore();
    }
    return l;
  }
  function draw(c, { seconds = 0, selected = true, word = 'wiggling', reducedMotion = false } = {}) {
    c.clearRect(0, 0, W, H); c.fillStyle = '#f0f1f5'; c.fillRect(0, 0, W, H);
    text(c, 'Jitter', 42, 57, 25, '#222b36', 500); text(c, 'Reference-fitted text motion', 758, 55, 14, '#737d8a', 400, 'right');
    c.save(); c.shadowColor = '#202d4318'; c.shadowBlur = 30; c.shadowOffsetY = 14; rr(c, 147, 90, 506, 735, 55, '#252628'); c.restore();
    rr(c, 153, 96, 494, 723, 49, '#090a0b');
    c.save(); c.beginPath(); c.roundRect(162, 105, 476, 705, 41); c.clip(); c.fillStyle = '#fff'; c.fillRect(162, 105, 476, 705);
    text(c, '9:41', 191, 137, 14, '#171a1f', 500); rr(c, 354, 116, 91, 25, 15, '#0a0b0c');
    rr(c, 584, 124, 27, 12, 3, '#252c36'); rr(c, 613, 128, 2, 5, 1, '#252c36');
    text(c, '‹', 181, 193, 37, BLUE); circle(c, 400, 175, 22, '#d5e5ed'); text(c, 'R', 400, 183, 23, '#4e778c', 500, 'center'); text(c, 'Robin', 400, 219, 15, '#20262d', 400, 'center');
    c.strokeStyle = '#eceef1'; c.beginPath(); c.moveTo(162, 235); c.lineTo(638, 235); c.stroke();
    rr(c, 324, 252, 289, 45, 24, BLUE); text(c, 'Too much coffee today', 342, 281, 21, '#fff');
    text(c, 'Delivered', 610, 316, 12, '#8b8d93', 400, 'right');
    rr(c, 181, 330, 295, 43, 23, '#e9e9ec'); text(c, 'Maybe switch to decaf?', 199, 358, 21, '#24262a');
    circle(c, 195, 426, 20, '#edeef0'); text(c, '+', 195, 435, 30, '#8b8c91', 400, 'center');
    rr(c, 230, 391, 385, 76, 25, '#fff', '#dadcdf');
    text(c, 'Trying to keep my foot from', 247, 419, 21, '#1b1c20');
    const l = M.layout(word, (str, size) => { c.font = `400 ${size}px "Jitter Sans", Inter, sans-serif`; return c.measureText(str).width; }, {fontSize:21,maxWidth:302});
    c.fillStyle = '#bbd9fa'; c.fillRect(247, 423, l.width + 3, 27);
    drawWord(c, word, 248, 444, 21, selected ? seconds : 0, '#111c2b', reducedMotion,302);
    c.fillStyle = BLUE; c.fillRect(246, 418, 2, 33); c.fillRect(249+l.width, 425, 2, 29);
    circle(c,247,417,9,BLUE);circle(c,250+l.width,455,9,BLUE);
    circle(c,589,439,17,BLUE); c.strokeStyle = '#fff'; c.lineWidth = 3.2; c.lineCap='round'; c.beginPath();c.moveTo(589,448);c.lineTo(589,431);c.moveTo(582,438);c.lineTo(589,431);c.lineTo(596,438);c.stroke();
    c.fillStyle='#e6e7eb';c.fillRect(162,486,476,324);
    text(c,'B',225,530,25,'#08090a',500,'center');c.save();c.transform(1,0,-.22,1,0,0);text(c,'I',457,530,25,'#08090a',400,'center');c.restore();text(c,'U',470,530,25,'#08090a',400,'center');text(c,'S',577,530,25,'#08090a',400,'center');
    c.strokeStyle='#08090a'; c.lineWidth=1.4;c.beginPath();c.moveTo(460,534);c.lineTo(480,534);c.moveTo(569,521);c.lineTo(585,521);c.stroke();
    const names = ['Big','Small','Shake','Nod','Explode','Ripple','Bloom','Jitter'];
    for(let n=0;n<8;n++) {const x=181+(n%2)*224,y=555+Math.floor(n/2)*53,active=n===7&&selected;rr(c,x,y,214,43,13,active?BLUE:'#fff');if(n===7) {c.font='400 23px "Jitter Sans"';const ww=c.measureText('Jitter').width;drawWord(c,'Jitter',x+(214-ww)/2,y+29,23,seconds,active?'#fff':'#141719',reducedMotion,210);}else text(c,names[n],x+107,y+29,n===1?19:23,'#141719',400,'center');}
    rr(c, 315, 787, 170, 6, 3, '#15181c'); c.restore();
    text(c, reducedMotion ? 'Reduced motion · fixed letters' : 'Tap Jitter to replay', 400, 858, 14, '#6b7481', 400, 'center');
  }
  return { W, H, BLUE, rr, text, drawWord, draw };
});
