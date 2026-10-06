import test from 'node:test';
import assert from 'node:assert/strict';
import {project,partialLine,text} from '../src/art.mjs';
test('projective plane preserves all four corners and geometric stroke prefixes',()=>{
 const q=[[20,15],[150,30],[130,120],[35,110]];
 for(const [i,p] of [[0,[0,0]],[1,[1,0]],[2,[1,1]],[3,[0,1]]])assert(Math.hypot(...project(p,q).map((v,j)=>v-q[i][j]))<1e-8);
 assert.deepEqual(partialLine([[0,0],[10,0],[10,20]],.5),[[0,0],[10,0],[10,5]]);
});
test('licensed glyph subsets draw actual invoice text with finite geometry',()=>{
 for(const s of ['Membership','Invoice 1784925191620','ankursahuhp@gmail.com','$174.30'])assert(!/NaN|undefined|Infinity/.test(text(s,10,30)));
});
