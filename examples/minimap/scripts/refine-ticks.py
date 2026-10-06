"""Recover occluded line extents from the opposite half; all x positions stay fixed."""
from pathlib import Path
from PIL import Image
import numpy as np,json
R=Path(__file__).resolve().parents[1];P=R.parents[1]/'sources/native-audit/rauno-waveform/frames';rows=json.load(open(R/'evidence/measured-trace.json'));black={4,11,23,31,41}
for f,d in enumerate(rows):
 a=np.asarray(Image.open(P/f'{f+1:05}.png').convert('RGB')).astype(float);r=a[:,:,0]
 for j in range(49):
  x=204+j*18;c=320 if j in black else 326;v=np.mean(r[:,x:x+2],1);mask=(v<235)&(np.arange(644)>190)&(np.arange(644)<450);occluded=False
  if d['cursor']:
   px,py=d['cursor'][:2]
   if px-4<=x<=px+26:mask[max(0,int(np.floor(py-4))):min(644,int(np.ceil(py+38)))]=False;occluded=True
  ys=np.where(mask)[0]; groups=np.split(ys,np.where(np.diff(ys)>1)[0]+1)
  if occluded: groups=[g for g in groups if len(g)>=3]
  else: groups=[g for g in groups if len(g) and g[0]<=c<=g[-1]+1]
  ys=np.concatenate(groups) if groups else np.array([])
  if len(ys):
   top,bot=float(ys[0]),float(ys[-1]+1);d['h'][j]=max(0,min(250,2*max(c-top,bot-c) if occluded else bot-top))
  else:d['h'][j]=0
(R/'evidence/measured-trace.json').write_text(json.dumps(rows,separators=(',',':'))+'\n');print('Occluded tick extents refined')
