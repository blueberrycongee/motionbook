const path=require('node:path');
process.env.FONTCONFIG_FILE=path.join(__dirname,'fonts.conf');
const sharp=require('sharp'),Scene=require('./scene.js');sharp.concurrency(1);sharp.cache(false);
const baseCache=new Map();
const regions=[[470,185,575,295],[470,475,575,265],[490,735,548,110]];
function regionSVG(svg,[x,y,w,h],scale){return svg.replace(/^<svg\b[^>]*>/,`<svg xmlns="http://www.w3.org/2000/svg" width="${w*scale}" height="${h*scale}" viewBox="${x} ${y} ${w} ${h}">`);}
async function raster(input,options={}){
  const scale=options.scale??2,state=typeof input==='number'?Scene.observed(input):input,svg=Scene.render(state,scale);
  const pointer=state.cursor?.bbox_origin;
  if(options.full||pointer&&(pointer[0]<950||pointer[0]>2020||pointer[1]<390||pointer[1]>1430))return sharp(Buffer.from(svg)).png().toBuffer();
  if(!baseCache.has(scale))baseCache.set(scale,(async()=>{
    const initial={...Scene.observed(0),cursor:null},initialSVG=Scene.render(initial,scale);
    const full=await sharp(Buffer.from(initialSVG)).ensureAlpha().raw().toBuffer({resolveWithObject:true}),pieces=[];
    for(const region of regions)pieces.push(await sharp(Buffer.from(regionSVG(initialSVG,region,scale))).ensureAlpha().raw().toBuffer());
    return{full,pieces};
  })());
  const base=await baseCache.get(scale),result=Buffer.from(base.full.data),width=base.full.info.width;
  // A cropped SVG viewport can change the static outer shadow's raster bounds.
  // Apply each region's change against its own initial raster to the full base.
  for(let i=0;i<regions.length;i++){
    const region=regions[i],current=await sharp(Buffer.from(regionSVG(svg,region,scale))).ensureAlpha().raw().toBuffer(),initial=base.pieces[i];
    const left=Math.round(region[0]*scale),top=Math.round(region[1]*scale),w=Math.round(region[2]*scale),h=Math.round(region[3]*scale);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const source=(y*w+x)*4,target=((top+y)*width+left+x)*4;for(let c=0;c<3;c++)result[target+c]=Math.max(0,Math.min(255,base.full.data[target+c]+current[source+c]-initial[source+c]));result[target+3]=255;}
  }
  return sharp(result,{raw:base.full.info}).png().toBuffer();
}
module.exports={raster,regions};
