"""Independent line-by-line text layout measurements, without copying glyph outlines."""
from pathlib import Path
from PIL import Image
import json,numpy as np
R=Path(__file__).resolve().parents[1];P=R.parents[1]/'sources/native-audit/rauno-adaptive-precision-5/frames';rows=json.load(open(R/'evidence/measured-geometry.json'));previous=None
for i,d in enumerate(rows):
 if not d['event']:previous=None;continue
 top,h,alpha=d['event'];a=np.asarray(Image.open(P/f'{i+1:05}.png').convert('RGB')).astype(float);mask=a[:,:,0]>(25+145*alpha);mask[:,:399]=False;mask[:,650:]=False;mask[:top]=False;mask[top+h:]=False;ys=np.where(mask.sum(1)>0)[0];groups=np.split(ys,np.where(np.diff(ys)>2)[0]+1);boxes=[]
 for g in groups:
  if len(g)<1:continue
  yy,xx=np.where(mask[g[0]:g[-1]+1]);boxes.append({'x':int(xx.min()),'y':int(g[0]),'w':int(xx.max()-xx.min()+1),'h':int(g[-1]-g[0]+1)})
 if alpha<.3 and previous:
  boxes=[dict(b,y=b['y']+top-previous[0]) for b in previous[1]]
 if boxes:
  boxes[0]['h']=max(14,boxes[0]['h'])
  if len(boxes)>1:boxes[1]['h']=max(19,boxes[1]['h'])
 d['ink']=boxes[:2];previous=(top,boxes[:2])
(R/'evidence/measured-geometry.json').write_text(json.dumps(rows,separators=(',',':'))+'\n');print('Measured independent text lines')
