from pathlib import Path
from PIL import Image
from scipy.ndimage import label,find_objects
import numpy as np,json
R=Path(__file__).resolve().parents[1];P=R.parents[1]/'sources/native-audit/rauno-waveform/frames';rows=json.load(open(R/'evidence/measured-trace.json'));sx=16/17;sy=28/27
for i,d in enumerate(rows):
 a=np.asarray(Image.open(P/f'{i+1:05}.png').convert('RGB'));m=a.max(2)<100;l,n=label(m,np.ones((3,3)));q=[]
 for k,sl in enumerate(find_objects(l)):
  if sl:
   y,x=sl;w=x.stop-x.start;h=y.stop-y.start;c=int((l[sl]==k+1).sum())
   if 4<=w<=32 and 5<=h<=44:q.append((c,x.start,y.start,w,h))
 if q:
  count,x,y,w,h=max(q)
  if count>8:
   d['cursor']=[round(x-sx,4),round(y-3*sy,4),round(sx,6),round(sy,6)]
   if x==0:d['cursor_clipped_bbox']=[x,y,w,h]
  else:d['cursor']=None
 else:d['cursor']=None
(R/'evidence/measured-trace.json').write_text(json.dumps(rows,separators=(',',':'))+'\n');print('Pointer aligned using independent arrow ink bounds')
