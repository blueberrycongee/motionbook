const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function boot(reduced=false){
  const callbacks=[];let doc;
  class Element{
    constructor(tag='div'){this.tagName=tag.toUpperCase();this.style={};this.dataset={};this.attributes={};this.children=[];this.listeners={};this.value='';this.selectionStart=0;this.innerHTML='';}
    addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}
    setAttribute(k,v){this.attributes[k]=v;}
    append(el){this.children.push(el);}
    replaceChildren(){this.children=[];}
    emit(type,extra={}){const e={type,target:this,key:'',preventDefault(){this.defaultPrevented=true;},...extra};for(const fn of this.listeners[type]||[])fn(e);return e;}
    focus(){if(doc.activeElement!==this){doc.activeElement=this;this.emit('focus');}}
    setSelectionRange(a,b){this.selectionStart=a;this.selectionEnd=b;}
    querySelector(selector){const kind=selector.match(/data-kind="([^"]+)"/)?.[1];return this.children.find(x=>x.tagName==='INPUT'&&x.dataset.kind===kind)||null;}
  }
  const ids=Object.fromEntries(['stage','art','controls','play','replay','status'].map(k=>[k,new Element(k==='play'||k==='replay'?'button':'div')]));
  doc=new Element();doc.activeElement=null;doc.getElementById=id=>ids[id];doc.createElement=tag=>new Element(tag);
  const context={document:doc,TagModel:require('../model.js'),TagScene:require('../scene.js'),matchMedia:()=>({matches:reduced}),performance:{now:()=>0},requestAnimationFrame:fn=>callbacks.push(fn)};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'),context);
  const button=label=>ids.controls.children.find(x=>x.tagName==='BUTTON'&&x.attributes['aria-label']===label);
  const input=()=>ids.controls.children.find(x=>x.tagName==='INPUT');
  function type(value){const el=input();assert.ok(el);el.focus();el.value=value;el.selectionStart=value.length;el.emit('input');}
  return{ids,doc,button,input,type,tick(now){callbacks.shift()(now);}};
}
test('event wiring creates a colored label from keyboard and preserves the search caret',()=>{const x=boot();x.button('Add label').emit('click');x.type('design');assert.equal(x.input().value,'design');assert.equal(x.input().selectionStart,6);x.doc.emit('keydown',{key:'Enter'});assert.equal(x.input().attributes['aria-label'],'Find a color');x.doc.emit('keydown',{key:'ArrowDown'});x.doc.emit('keydown',{key:'Enter'});assert.ok(x.button('Remove design'));assert.ok(x.ids.art.innerHTML.includes('#e6950a'));assert.equal(x.button('design').attributes['aria-pressed'],'true');});
test('Escape and outside dismissal unwind an interrupted create flow without committing it',()=>{const x=boot();x.button('Add label').emit('click');x.type('draft');x.button('Create draft').emit('click');x.doc.emit('keydown',{key:'Escape'});assert.equal(x.input().attributes['aria-label'],'Find or create a label');x.ids.stage.emit('pointerdown',{target:x.ids.controls});assert.equal(x.input(),undefined);assert.equal(x.button('Remove draft'),undefined);});
test('reduced motion starts paused and replay resets live changes',()=>{const x=boot(true);assert.equal(x.ids.play.textContent,'Play');const before=x.ids.art.innerHTML;x.tick(500);assert.equal(x.ids.art.innerHTML,before);x.button('Add label').emit('click');x.button('Handoff').emit('click');assert.equal(x.button('Remove Handoff'),undefined);x.ids.replay.emit('click');assert.ok(x.button('Remove Handoff'));assert.equal(x.ids.play.textContent,'Play');});
