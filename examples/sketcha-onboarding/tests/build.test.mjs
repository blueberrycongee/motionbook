import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import path from'node:path';import os from'node:os';import{spawnSync}from'node:child_process';import{fileURLToPath}from'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
test('standalone build embeds fonts, needs no external files, and passes JavaScript syntax validation',()=>{
 const build=spawnSync(process.execPath,[path.join(root,'tools/build.mjs')],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 const html=fs.readFileSync(path.join(root,'standalone.html'),'utf8');assert.ok(html.includes('data:font/ttf;base64,'));assert.ok(html.includes('data:font/otf;base64,'));assert.equal(/<script[^>]+src=|<link[^>]+stylesheet/.test(html),false);
 const match=html.match(/<script type="module">([\s\S]*?)<\/script>/);assert.ok(match);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sketcha-syntax-'));const file=path.join(tmp,'bundle.mjs');fs.writeFileSync(file,match[1]);const syntax=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);
 fs.rmSync(tmp,{recursive:true});
});
