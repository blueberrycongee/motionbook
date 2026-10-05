const assert=require('node:assert/strict'),fs=require('node:fs');
const {ease}=require('./motion.js');const c=JSON.parse(fs.readFileSync(__dirname+'/motion-data.json','utf8'));
assert.equal(c.duration_ms,500);assert.equal(c.bounce,0);assert.equal(c.stagger_delay_ms,0);assert.equal(c.row_extra_px,87);
assert.equal(c.rows.length,4);assert.deepEqual(c.rows.map(x=>x.cards.length),[4,4,5,4]);
for(const row of c.rows)for(const card of row.cards)for(const state of [card.hidden,card.shown])for(const key of ['x','y','width','height','angle','z'])assert(Number.isFinite(state[key]));
assert.equal(c.rows[0].cards[0].hidden.angle,c.rows[0].cards[0].shown.angle);assert.equal(c.rows[0].cards[3].hidden.angle,-40);assert.equal(c.rows[0].cards[3].shown.angle,-12);
const travel=c.rows[0].cards.map(x=>x.hidden.y-x.shown.y);assert(new Set(travel).size===4);assert(travel[3]>350);
assert(ease(.2/.5)>.88&&ease(.2/.5)<.91);assert(ease(.35/.5)>.98);assert.equal(ease(1),1);
for(let i=0;i<=1000;i++){const p=ease(i/1000);assert(p>=0&&p<=1);assert(1+87*p>=1&&1+87*p<=88);}
assert(fs.readFileSync(__dirname+'/style.css','utf8').includes('min-height:800px'));
console.log('PASS: measured 500 ms zero-bounce spring, distinct card paths, fixed rotations, plus-card rotation, 17 finite targets, reveal bounds, stable desktop panel.');
