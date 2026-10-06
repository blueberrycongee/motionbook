from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import json
p=Path(__file__).resolve().parent.parent
f=instantiateVariableFont(TTFont(p/'assets/Nunito.ttf'),{'wght':775},inplace=False);gs=f.getGlyphSet();cm=f.getBestCmap();upm=f['head'].unitsPerEm
size=37;scale=size/upm
width=sum(f['hmtx'][cm[ord(c)]][0]*scale for c in 'Update');xscale=119/width
shapes={}
for text in ['Updat','e','ing']:
 pen=SVGPathPen(gs);x=0
 for c in text:
  gn=cm[ord(c)];g=gs[gn];g.draw(TransformPen(pen,(scale*xscale,0,0,-scale,x,25)));x+=f['hmtx'][gn][0]*scale*xscale
 shapes[text]={'d':pen.getCommands(),'width':x}
(p/'src/lettering-paths.json').write_text(json.dumps(shapes,indent=2)+'\n')
(p/'src/glyphs.mjs').write_text('// Outline lettering from Nunito (SIL OFL 1.1), with license in assets/Nunito-OFL.txt.\nconst paths='+json.dumps(shapes,separators=(',',':'))+';\nexport const prefixWidth=paths.Updat.width;\nexport function lettering(text,x,y,{opacity=1,scale=1,blur=0}={}) {return `<g opacity="${opacity}" transform="translate(${x},${y}) scale(${scale})" ${blur>0?\'filter="url(#textBlur)"\':\'\'}><path d="${paths[text].d}" fill="#0079eb"/></g>`;}\n')
print('full width',width,'x scale',xscale,'prefix',shapes['Updat']['width'],'updating',shapes['Updat']['width']+shapes['ing']['width'])
