"""Build a procedural field from 18 measured color tokens. No source-image pixels are copied."""
import json, pathlib, numpy as np, base64
from PIL import Image, ImageFilter
root=pathlib.Path(__file__).resolve().parents[1]
d=json.loads((root/'assets/ambient-grid.json').read_text())
colors=np.array([[[int(row[key][i:i+2],16) for i in (1,3,5)] for key in ('left','center','right')] for row in d['rows']])
ys=[r['y'] for r in d['rows']]
out=np.zeros((934,432,3),dtype=np.uint8)
for y in range(934):
    anchors=np.array([[np.interp(y,ys,colors[:,j,c]) for c in range(3)] for j in range(3)])
    for c in range(3): out[y,:,c]=np.interp(np.arange(432),d['x'],anchors[:,c])
im=Image.fromarray(out).filter(ImageFilter.GaussianBlur(5))
im.save(root/'assets/ambient.png',optimize=True)
b64=base64.b64encode((root/'assets/ambient.png').read_bytes()).decode()
(root/'src/background-data.js').write_text('(function(r,f){if(typeof module==="object"&&module.exports)module.exports=f();else r.PlayerBackground=f();})(typeof globalThis!=="undefined"?globalThis:this,function(){return "data:image/png;base64,'+b64+'";});\n')
