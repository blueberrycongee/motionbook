from pathlib import Path
import json,numpy as np
from PIL import Image
from scipy.ndimage import label
R=Path(__file__).resolve().parents[1];P=R.parents[1]/'sources/native-audit/rauno-adaptive-precision-5/frames';rows=json.load(open(R/'evidence/measured-geometry.json'))
for i,d in enumerate(rows):
 if not any(a<=i<=b for a,b in [(43,116),(147,246),(269,433),(440,524)]):continue
 a=np.asarray(Image.open(P/f'{i+1:05}.png').convert('RGB'))[:,590:880].astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
 mask=(b-r>12)&(b>40)&(g>r+2)
 if d['event']:
  y,h,_=d['event'];mask[max(0,y-3):y+h+3]=False
 labels,n=label(mask);cc=np.bincount(labels.ravel());good=np.where(cc>15)[0];good=good[good!=0];yy,xx=np.where(np.isin(labels,good));xx=xx+590
 ring=None
 if len(xx)>35:
  co=np.linalg.lstsq(np.c_[2*xx,2*yy,np.ones(len(xx))],xx*xx+yy*yy,rcond=None)[0];cx,cy=co[:2];rad=np.sqrt(max(0,co[2]+cx*cx+cy*cy))
  if 20<rad<75 and 590<cx<880:
   sel=np.abs(np.hypot(xx-cx,yy-cy)-rad)<2;pix=a[yy[sel],xx[sel]-590];ring=[round(cx,2),round(cy,2),round(rad,2),round(float(np.percentile(pix[:,2]-pix[:,0],70)/105),4)]
 d['ring']=ring
(R/'evidence/measured-geometry.json').write_text(json.dumps(rows,separators=(',',':'))+'\n')
for i in [44,65,100,105,180,210,322,395,490]:print(i,rows[i]['ring'])
