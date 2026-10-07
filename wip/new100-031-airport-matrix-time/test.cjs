const assert=require('node:assert/strict'),test=require('node:test'),S=require('./scene');
test('all displayed city and time characters are drawable',()=>{for(const city of S.cities)for(const row of S.rows(city[0]))for(const s of row)for(const ch of s)assert.ok(S.font[ch]);for(const p of Object.values(S.font)){assert.equal(p.length,7);assert.ok(p.every(r=>/^[01]{5}$/.test(r)));}});
test('diagonal reveal resolves exactly to the requested city',()=>{for(let r=0;r<5;r++)for(let c=0;c<20;c++)assert.equal(S.glyph('A',r,c,3),'A');assert.equal(S.glyph('A',4,19,0),' ');});
test('city replacement changes only the final board row',()=>{const a=S.rows('Tokyo'),b=S.rows('San Francisco');assert.deepEqual(a.slice(0,4),b.slice(0,4));assert.deepEqual(b[4],['06:28','SAN FRANCISCO']);});
test('search is case-insensitive and handles no matches',()=>{assert.equal(S.filtered('SAN').length,5);assert.equal(S.filtered('no-such-city').length,0);});
test('deterministic SVG supports both theme endpoints',()=>{assert.equal(S.svg(.4),S.svg(.4));assert.ok(S.svg(2,{light:true}).includes('rgb(235,235,235)'));assert.ok(S.svg(2).includes('rgb(23,23,23)'));assert.ok(!/NaN|undefined/.test(S.svg(.6,{search:true,query:'san',controls:true})));});

const C = require('./controller');

test('search matches accent-insensitive names, country and GMT offset', () => {
  assert.equal(S.filtered('sao')[0][0], 'São Paulo');
  assert.equal(S.filtered('BRAZIL')[0][0], 'São Paulo');
  assert.equal(S.filtered(' gmt+9 ')[0][0], 'Tokyo');
});

test('all pointer targets follow the actual drawn capsule dimensions', () => {
  for (const [city] of S.cities) {
    const rect = S.capsuleLayout(city);
    assert.equal(rect.x + rect.w / 2, S.W / 2);
    assert.ok(rect.x >= 0 && rect.x + rect.w <= S.W);
  }
  for (const result of S.resultLayout('')) {
    assert.ok(result.x + result.w < S.W);
    assert.ok(result.y >= 0 && result.y + result.h < 984);
  }
});

test('keyboard search wraps, selects a city and clears stale query state', () => {
  let state = C.update(C.initial(), { type: 'open-search' });
  state = C.update(state, { type: 'query', value: 'san' });
  state = C.update(state, { type: 'move', delta: -1 });
  assert.equal(state.activeIndex, 4);
  state = C.update(state, { type: 'move', delta: 1 });
  assert.equal(state.activeIndex, 0);
  state = C.update(state, { type: 'select' }, 5000);
  assert.equal(state.city, 'San Francisco');
  assert.equal(state.changedRow, 4);
  assert.equal(state.revealAt, 5000);
  assert.equal(state.search, false);
  assert.equal(state.query, '');
  assert.equal(state.activeIndex, -1);
});

test('no-result query is visible and cannot select an unrelated city', () => {
  let state = C.update(C.initial(), { type: 'open-search' });
  state = C.update(state, { type: 'query', value: 'not a city' });
  state = C.update(state, { type: 'move', delta: 1 });
  assert.equal(state.activeIndex, -1);
  assert.equal(C.update(state, { type: 'select' }), state);
  assert.match(S.svg(2, state), /No cities found/);
});

test('opening appearance dismisses search and Escape dismisses all overlays', () => {
  let state = C.update(C.initial(), { type: 'open-search' });
  state = C.update(state, { type: 'toggle-controls' });
  assert.equal(state.search, false);
  assert.equal(state.controls, true);
  state = C.update(state, { type: 'escape' });
  assert.equal(state.search, false);
  assert.equal(state.controls, false);
});

test('selecting the current city does not restart an already settled reveal', () => {
  let state = C.initial(0);
  state = C.update(state, { type: 'open-search' }, 5000);
  state = C.update(state, { type: 'select', city: 'Tokyo' }, 5100);
  assert.equal(state.revealAt, 0);
  assert.equal(C.view(state, 5100).animating, false);
});

test('interrupted theme switches preserve the current background then reach both endpoints', () => {
  let state = C.update(C.initial(), { type: 'theme', light: true }, 2000);
  assert.equal(C.themeMix(state, 2220), .5);
  state = C.update(state, { type: 'theme', light: false }, 2220);
  assert.equal(C.themeMix(state, 2220), .5);
  assert.equal(C.themeMix(state, 2440), .25);
  assert.equal(C.themeMix(state, 2660), 0);
  assert.equal(C.view(state, 2660).animating, false);
  assert.match(S.svg(2, C.view(state, 2440).options), /rgb\(76,76,76\)/);
});

test('reduced motion settles all animation immediately and leaves no frame request', () => {
  let state = C.update(C.initial(100), { type: 'theme', light: true }, 100);
  const view = C.view(state, 100, true);
  assert.equal(view.animating, false);
  assert.equal(view.options.themeMix, 1);
  assert.match(S.svg(view.time, view.options), /rgb\(235,235,235\)/);
});

test('a settled scene stops animating until a new action needs it', () => {
  let state = C.initial();
  assert.equal(C.view(state, 0).animating, true);
  assert.equal(C.view(state, 1800).animating, false);
  state = C.update(state, { type: 'replay' }, 3000);
  assert.equal(C.view(state, 3000).animating, true);
  assert.equal(C.view(state, 4800).animating, false);
});
