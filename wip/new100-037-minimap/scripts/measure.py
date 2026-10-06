"""Measure 49 fixed-position ticks and pointer coordinates at every native PTS.
Only numbers are emitted. No original raster pixels or cropped cursor assets are copied.
"""
from pathlib import Path
from PIL import Image
import numpy as np,json,sys
from scipy.ndimage import label,find_objects
R=Path(__file__).resolve().parents[1];P=Path(sys.argv[1]) if len(sys.argv)>1 else R.parents[1]/'sources/native-audit/rauno-waveform';pts=json.load(open(P/'pts.json'));rows=[];black={4,11,23,31,41}
for i,p in enumerate(sorted((P/'frames').glob('*.png'))):
 a=np.asarray(Image.open(p).convert('RGB')).astype(float);r=a[:,:,0];heights=[]
 for j in range(49):
  x=204+18*j;center=320 if j in black else 326;v=np.mean(r[:,x:x+2],1);ys=np.where((v<235)&(np.arange(644)>190)&(np.arange(644)<450))[0]
  groups=np.split(ys,np.where(np.diff(ys)>1)[0]+1);groups=[g for g in groups if len(g)>0 and g[0]<=center<=g[-1]+1]
  if groups:
   q=max(groups,key=len);top=float(q[0]);bot=float(q[-1]+1)
   # Extents remain symmetric about each tick's own original center. This avoids cursor occlusion extending a line.
   h=min(230,2*min(center-top,bot-center));heights.append(max(0,h))
  else:heights.append(0)
 m=(a.max(2)<13);lab,n=label(m);slices=find_objects(lab);cand=[]
 for idx,sl in enumerate(slices):
  if sl is None:continue
  y,x=sl;w=x.stop-x.start;h=y.stop-y.start
  if 5<=w<=32 and 7<=h<=44:cand.append((int((lab[sl]==idx+1).sum()),x.start,y.start,w,h))
 cursor=None
 if cand:
  count,x,y,w,h=max(cand);cursor=[x,y-1] if count>20 else None
 rows.append({'t':float(pts[i]['best_effort_timestamp_time']),'h':heights,'cursor':cursor})
 if i%100==0:print(i,flush=True)
(R/'evidence/measured-trace.json').write_text(json.dumps(rows,separators=(',',':'))+'\n');(R/'evidence/native-timestamps.json').write_text(json.dumps([x['t'] for x in rows],separators=(',',':'))+'\n');print('Measured',len(rows),'native frames')
