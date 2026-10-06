import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
class Element {
  constructor(){this.children=[];this.listeners={};this.attributes={};this.dataset={};this.textContent='';this.hidden=true;this.validity={valid:false};}
  append(x){this.children.push(x)}
  addEventListener(name,callback){this.listeners[name]=callback}
  setAttribute(name,value){this.attributes[name]=value}
  removeAttribute(name){delete this.attributes[name]}
  focus(){this.focused=true}
  fire(name){const event={prevented:false,preventDefault(){this.prevented=true;}};this.listeners[name](event);return event;}
}
const sky=new Element(),form=new Element(),email=new Element(),status=new Element(),notice=new Element();
const links=Array.from({length:23},(_,i)=>Object.assign(new Element(),{dataset:{demo:`Link ${i}`}}));
const document={
  listeners:{},querySelector(selector){return {'.sky':sky,'#newsletter':form,'#email':email,'#form-status':status,'.notice':notice}[selector]},
  createElement(){return new Element()},querySelectorAll(){return links},
  addEventListener(name,callback){this.listeners[name]=callback}
};
let timer=0;const liveTimers=new Map();
vm.runInNewContext(fs.readFileSync(new URL('./app.js',import.meta.url),'utf8'),{document,setTimeout(fn){liveTimers.set(++timer,fn);return timer},clearTimeout(id){liveTimers.delete(id)}});
assert.equal(sky.children.length,0); // Original procedural sky is a CSS background.
assert(fs.readFileSync(new URL('./style.css',import.meta.url),'utf8').includes('assets/original-blue-paper.svg'));
assert(!fs.readFileSync(new URL('./index.html',import.meta.url),'utf8').includes('reference-artwork'));
assert(form.fire('submit').prevented);assert.equal(email.attributes['aria-invalid'],'true');assert(email.focused);assert.match(status.textContent,/valid email/);
email.fire('input');assert.equal(status.textContent,'');assert(!email.attributes['aria-invalid']);
email.validity.valid=true;assert(form.fire('submit').prevented);assert.match(status.textContent,/no email was sent/);assert(!email.attributes['aria-invalid']);
for(const link of links){assert(link.fire('click').prevented);assert.equal(notice.hidden,false);assert.match(notice.textContent,/Preview link/)}
assert.equal(liveTimers.size,1);document.listeners.keydown({key:'Escape'});assert.equal(notice.hidden,true);assert.equal(liveTimers.size,0);
links[0].fire('click');[...liveTimers.values()][0]();assert.equal(notice.hidden,true);
console.log('PASS: offline event-logic checks: invalid email, valid email, repeat input, demo-link prevention, repeated-click timer cleanup, Escape and timeout dismissal.');
