const test=require('node:test'),assert=require('node:assert/strict'),S=require('./scene'),C=require('./controller');
test('all six sector directions and inner dead zone resolve',()=>{for(let i=0;i<6;i++){const p=S.polar(150,i*60);assert.equal(S.sector(...p),i);}assert.equal(S.sector(25,25),-1);});
test('rotation takes the short route across the angular seam',()=>{assert.equal(S.unwrap(350,0),360);assert.equal(S.unwrap(-350,0),-360);});
test('press, rotate and release select the intended item',()=>{const s=C.create();C.press(s,500,450);C.move(s,700,450);for(let i=0;i<30;i++)C.step(s);assert.equal(s.selected,0);assert.equal(C.release(s),'Forward');for(let i=0;i<60;i++)C.step(s);assert.ok(s.opacity<.0001);});
test('repeated openings reset stale sector selection',()=>{const s=C.create();C.press(s,500,450);C.move(s,300,450);C.release(s);C.press(s,800,300);assert.equal(s.selected,-1);assert.equal(C.release(s),null);});
test('full presentation SVG remains finite across angular states',()=>{for(let i=0;i<6;i++){const s=S.svg({selected:i,angle:i*60,pointer:[900,200]});assert.ok(!/NaN|undefined/.test(s));assert.ok(s.includes('1920 862'));}});
