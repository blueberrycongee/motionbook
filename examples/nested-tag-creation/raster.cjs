'use strict';
const crypto=require('node:crypto'),Scene=require('./scene.js'),Data=require('./motion-data.js');
const pointerDefs='<defs><filter id="pointerShadow" x="-40%" y="-30%" width="180%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity=".3"/></filter></defs>';
function createRasterizer(sharp){
  const cache=new Map();
  return async function raster(time){
    const row=typeof time==='number'?Scene.observed(time):time;
    const base=Scene.render({...row,suppressPointer:true});const hash=crypto.createHash('sha256').update(base).digest('hex');
    let buffer=cache.get(hash);if(!buffer){buffer=await sharp(Buffer.from(base)).png().toBuffer();cache.set(hash,buffer);}
    const markup=Scene.pointer(row);if(!markup)return buffer;
    const p=Data.tracks[row.f].pointer,[x,y,w,h]=p.bounds,left=Math.max(0,Math.floor(x-12)),top=Math.max(0,Math.floor(y-12)),width=Math.min(Scene.W-left,w+26),height=Math.min(Scene.H-top,h+26);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${left} ${top} ${width} ${height}">${pointerDefs}${markup}</svg>`;
    const pointer=await sharp(Buffer.from(svg)).png().toBuffer();
    return sharp(buffer).composite([{input:pointer,left,top}]).png().toBuffer();
  };
}
module.exports={createRasterizer};
