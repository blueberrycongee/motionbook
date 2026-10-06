from pathlib import Path
from PIL import Image
import json,numpy as np
R=Path(__file__).resolve().parents[1];P=R.parents[1]/'sources/native-audit/rauno-adaptive-precision-5/frames';rows=json.load(open(R/'evidence/measured-geometry.json'))
for i,d in enumerate(rows):
 if not d['event']:continue
 y,h,alpha=d['event'];im=np.asarray(Image.open(P/f'{i+1:05}.png').convert('RGB')).astype(float);v=np.median(im[y:y+h,850:885,:],axis=(0,1));alpha=float(np.clip((v[2]-25)/228,0,1));d['event'][2]=round(alpha,4);d['paint']=[round(float(np.clip(25+(x-25)/max(.001,alpha),0,255)),2) for x in v]
(R/'evidence/measured-geometry.json').write_text(json.dumps(rows,separators=(',',':'))+'\n')
print('Refined event fill and fade colors from numeric medians')
