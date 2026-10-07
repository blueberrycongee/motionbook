from pathlib import Path
import json,numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates
from scipy.optimize import minimize
R=Path(__file__).resolve().parents[1];fs=sorted((R/'evidence/frames').glob('f-*.png'))
a=[np.asarray(Image.open(p))[234:283,706:864].astype(float) for p in fs]
ink=lambda a:np.clip((170-a.max(2))/150,0,1)
template=ink(a[12]); yy,xx=np.mgrid[:49,:158];cx=783-706;cy=255-234
# Only interior glyphs are trustworthy: selection handles clip both end glyphs.
mask=(xx>=732-706)&(xx<=835-706)&(yy>=1)&(yy<=44)
def transform(p):
 dx,dy,r=p;r=np.deg2rad(r);u,v=xx-cx-dx,yy-cy-dy
 return map_coordinates(template,[np.sin(r)*u+np.cos(r)*v+cy,np.cos(r)*u-np.sin(r)*v+cx],order=1,mode='constant',cval=0)
results=[]
for i,a in enumerate(a):
 target=ink(a)
 def loss(p):return np.mean(((transform(p)-target)*mask)**2)
 starts=[[0,0,0]]+([results[-1][:3]] if results else [])
 fits=[minimize(loss,s,method='Powell',bounds=[(-10,10),(-10,10),(-10,10)],options={'xtol':.005,'ftol':1e-7}) for s in starts]
 f=min(fits,key=lambda x:x.fun);results.append([round(float(x),5) for x in f.x]+[float(f.fun)])
print(np.round(results[27:88:3],3));(R/'evidence/coordinated-fit.json').write_text(json.dumps(results,indent=2))
