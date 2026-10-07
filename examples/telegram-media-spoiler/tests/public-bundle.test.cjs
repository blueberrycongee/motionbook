const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const files=()=>walk(root).map(p=>path.relative(root,p)).filter(p=>!p.split(path.sep).includes('node_modules'));
test('public bundle contains no official/source comparison or old-preview media',()=>{
  for(const p of files()) {
    assert.ok(!/(^|\/)(__pycache__|source-frames|source-crops|comparison-frames|audit-frames)$/.test(path.dirname(p)),p);
    if(p.startsWith('evidence/')) assert.ok(!/\.(png|jpe?g|gif|mp4|webm)$/i.test(p),p);
    assert.ok(!/delivered-v0\.(gif|mp4)$/.test(p),p);
  }
  assert.equal(json('evidence/public-release.json').referenceMediaBundled,false);
});
test('approved runtime, original assets and normal preview are byte-preserved',()=>{
  for(const [p,expected] of Object.entries(json('evidence/public-release.json').preservedApprovedFilesSha256))
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex'),expected,p);
});
test('all Markdown relative file links resolve within the public example',()=>{
  for(const p of files().filter(p=>p.endsWith('.md'))) for(const match of read(p).matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const href=match[1]; if(/^[a-z][a-z0-9+.-]*:/i.test(href)||href.startsWith('#'))continue;
    const target=path.resolve(root,path.dirname(p),decodeURIComponent(href.split('#')[0]));
    assert.ok(target.startsWith(root+path.sep),`${p}: link escapes example`);
    assert.ok(fs.existsSync(target),`${p}: ${href}`);
  }
});
test('all retained JSON evidence parses and source pixels are explicitly unbundled',()=>{
  for(const p of files().filter(p=>p.endsWith('.json')))json(p);
  const s=json('evidence/source-measurements.json').source;
  assert.equal(s.full_source_bundled,false); assert.equal(s.source_pixels_bundled,false);
});
test('normal render manifest agrees with preview clock and runtime envelope',()=>{
  const r=json('evidence/render-manifest.json'),t=require('../tools/preview-timeline.cjs'),m=require('../src/motion.js');
  assert.equal(r.fps,t.fps);assert.equal(r.frames,t.frameCount);assert.equal(r.revealAtMs,t.revealAtMs);
  assert.equal(r.revealStateEnvelopeMs,m.REVEAL_MS);assert.equal(r.durationSeconds,t.frameCount/t.fps);
  assert.equal(r.notBrowserCapture,true);
});
test('standalone embeds exact current source and original assets',()=>{
  const html=read('standalone.html');
  for(const p of ['src/motion.js','src/app.js','src/style.css'])assert.ok(html.includes(read(p)),p);
  for(const p of ['assets/original-still-life.png','assets/original-still-life-blurred.png'])
    assert.ok(html.includes('data:image/png;base64,'+fs.readFileSync(path.join(root,p)).toString('base64')),p);
  assert.ok(!/<script[^>]+src=/.test(html));
});
