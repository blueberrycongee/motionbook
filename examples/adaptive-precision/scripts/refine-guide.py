from pathlib import Path
from PIL import Image
import json,numpy as np
R=Path(__file__).resolve().parents[1];P=R.parents[1]/'sources/native-audit/rauno-adaptive-precision-5/frames';rows=json.load(open(R/'evidence/measured-geometry.json'))
for i in range(25,561):
 d=rows[i];a=np.asarray(Image.open(P/f'{i+1:05}.png').convert('RGB'))[:,500:650].astype(float);r=a[:,:,0];mask=(a.max(2)-a.min(2)<9)&(r>47)&(r<125);ys=np.where(mask.sum(1)>70)[0];groups=np.split(ys,np.where(np.diff(ys)>1)[0]+1);groups=[g for g in groups if len(g)>=3]
 if groups:
  q=min(groups,key=lambda g:abs(float(g.mean())-(d['guide'][1]+4)));c=float(np.median(r[q][mask[q]]));d['guide']=[390,int(q[0]),540,int(len(q)),c]
(R/'evidence/measured-geometry.json').write_text(json.dumps(rows,separators=(',',':'))+'\n');print('Guide row bounds refined')
