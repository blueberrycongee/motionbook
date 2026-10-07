import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const [source,out] = process.argv.slice(2);
const {renderFrame} = await import(pathToFileURL(path.resolve(source)));
if(typeof renderFrame !== 'function') throw Error('scene.mjs must export renderFrame(t, options)');
fs.mkdirSync(out,{recursive:true});
const samples=[];
for(let i=0;i<=120;i++) samples.push({name:`normal-${String(i).padStart(3,'0')}`,t:i/20,scenario:'normal',reducedMotion:false});
for(const scenario of ['interrupted','reduced'])for(const t of [0,.49,.5,.65,.85,1,1.4,1.6,2.1,2.5,3,3.5,3.8,4.2,5.5,6]) samples.push({name:`${scenario}-${String(Math.round(t*100)).padStart(3,'0')}`,t,scenario:scenario==='reduced'?'normal':scenario,reducedMotion:scenario==='reduced'});
for(const sample of samples){
 const options={width:800,height:600,scenario:sample.scenario,reducedMotion:sample.reducedMotion};
 const svg=renderFrame(sample.t,options);
 if(typeof svg!=='string'||!svg.includes('<svg')||/NaN|Infinity|undefined/.test(svg))throw Error(`Invalid SVG ${sample.name}`);
 if(svg !== renderFrame(sample.t,options))throw Error(`Nondeterministic output ${sample.name}`);
 if(/<(?:script|foreignObject|image)\b|(?:https?:|file:)\/\//i.test(svg.replace('http://www.w3.org/2000/svg','').replace('http://www.w3.org/1999/xlink','')))throw Error(`External/scripted assets forbidden ${sample.name}`);
 fs.writeFileSync(path.join(out,sample.name+'.svg'),svg);
}
fs.writeFileSync(path.join(out,'samples.json'),JSON.stringify(samples,null,2));
console.log(JSON.stringify({frames:samples.length,deterministic:true,finite:true,externalAssets:false}));
