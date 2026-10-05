import fs from 'node:fs/promises';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
let html=await fs.readFile(path.join(root,'public/index.html'),'utf8');
const model=(await fs.readFile(path.join(root,'src/model.mjs'),'utf8')).replaceAll('export ','');
const scene=(await fs.readFile(path.join(root,'src/scene.mjs'),'utf8')).replace(/^import .*?;\n/,'').replaceAll('export ','');
const font=(await fs.readFile(path.join(root,'public/assets/Inter-Regular.woff2'))).toString('base64');
html=html.replace("url('./assets/Inter-Regular.woff2')",`url('data:font/woff2;base64,${font}')`).replace("import {Composer,spec,stateAt} from '../src/model.mjs';import {renderScene} from '../src/scene.mjs';",model+'\n'+scene);
await fs.mkdir(path.join(root,'artifacts'),{recursive:true});await fs.writeFile(path.join(root,'artifacts/flo-composer.html'),html);console.log('Built self-contained interactive HTML. No browser runtime verification implied.');
