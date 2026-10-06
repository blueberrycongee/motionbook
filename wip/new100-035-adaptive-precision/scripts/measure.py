"""Measure geometric motion only. Reference rasters are inputs and never copied into output."""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import label, find_objects
from scipy.optimize import least_squares
ROOT=Path(__file__).resolve().parents[1]
REF=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT.parents[1]/'sources/native-audit/rauno-adaptive-precision-5'
pts=json.load(open(REF/'pts.json'))
rows=[]
for i,p in enumerate(sorted((REF/'frames').glob('*.png'))):
 a=np.asarray(Image.open(p).convert('RGB')).astype(float); r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
 gray=(np.max(a,axis=2)-np.min(a,axis=2)<3)&(r>47)&(r<120); gray[:,:385]=False
 lab,n=label(gray); counts=np.bincount(lab.ravel()); counts[0]=0
 gi=int(counts.argmax()); yy,xx=np.where(lab==gi)
 guide=[float(xx.min()),float(yy.min()),float(xx.max()-xx.min()+1),float(yy.max()-yy.min()+1),float(np.median(r[lab==gi]))] if len(xx)>5 else [390,144,540,4,53]
 # Event is measured away from its text and ring, using the center-right flat fill.
 diff=np.median((b-r)[:,850:885],axis=1); mask=diff>max(7,float(diff.max())*.22)
 yy=np.where(mask)[0]
 evt=None
 if len(yy)>0:
  top,bot=int(yy.min()),int(yy.max())+1; alpha=float(np.clip(np.median(diff[top:bot])/253,0,1))
  evt=[top,bot-top,round(alpha,4)]
 # Ring is fit only from its visible arc, excluding the event rectangle.
 rm=(b-r>12)&(b>45)&(g>r+2)&(r>27)&(g<125); rm[:,:590]=False; rm[:,880:]=False
 if evt: rm[max(0,top-3):min(812,bot+3),:]=False
 ry,rx=np.where(rm)
 ring=None
 if len(rx)>35:
  # Remove sparse codec remnants through connected-component size filtering.
  labels,n=label(rm); cc=np.bincount(labels.ravel()); good=np.where(cc>12)[0]; good=good[good!=0]; ry,rx=np.where(np.isin(labels,good))
  if len(rx)>35:
   co=np.linalg.lstsq(np.c_[2*rx,2*ry,np.ones(len(rx))],rx*rx+ry*ry,rcond=None)[0]; cx,cy=co[:2]; rad=np.sqrt(max(0,co[2]+cx*cx+cy*cy))
   if 20<rad<75 and 550<cx<900:
    sel=np.abs(np.hypot(rx-cx,ry-cy)-rad)<3; pix=a[ry[sel],rx[sel]]; ring=[round(cx,2),round(cy,2),round(rad,2),round(float(np.percentile(pix[:,2]-pix[:,0],80)/98),4)]
 # Top-line glyph bounds are numeric layout measurements, not glyph outlines.
 text=None
 if evt and alpha>.35:
  white=(r>100)&(g>150)&(b>170); white[:,:399]=False; white[:,680:]=False
  white[:top]=False; white[bot:]=False; sums=white.sum(axis=1); ys=np.where(sums>4)[0]
  if len(ys):
   end=ys[0]
   for y in ys[1:]:
    if y-end>2:break
    end=y
   start=int(ys[0]); text=[start,int(end),round(min(26,(end-start+1)/.73),2)]
 rows.append({'t':float(pts[i]['best_effort_timestamp_time']),'guide':guide,'ring':ring,'event':evt,'text':text})
 if i%100==0:print(i,flush=True)
(ROOT/'evidence/measured-geometry.json').write_text(json.dumps(rows,separators=(',',':'))+'\n')
print('Measured',len(rows),'native frames')
