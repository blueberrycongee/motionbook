import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');let css=fs.readFileSync(path.join(root,'src/style.css'),'utf8');
css=css.replace(/url\('\.\.\/assets\/fonts\/([^']+)'\)/g,(_,name)=>{const type=name.endsWith('.otf')?'font/otf':'font/ttf';return`url('data:${type};base64,${fs.readFileSync(path.join(root,'assets/fonts',name)).toString('base64')}')`;});
const source=['motion.mjs','scene.mjs','app.mjs'].map(name=>fs.readFileSync(path.join(root,'src',name),'utf8').replace(/^import .+;\n/gm,'').replace(/\bexport /g,'')).join('\n');
html=html.replace('<link rel="stylesheet" href="src/style.css">',`<style>${css}</style>`).replace('<script type="module" src="src/app.mjs"></script>',`<script type="module">${source}</script>`);
fs.writeFileSync(path.join(root,'standalone.html'),html);console.log(`Offline standalone: ${(Buffer.byteLength(html)/1024).toFixed(1)} KiB`);
