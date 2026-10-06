"""Compile observed geometry, using manually reviewed semantic label ranges."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[1]
data=json.load(open(R/'evidence/measured-geometry.json'))
# Native frame ranges; labels are semantic observations, not OCR glyph assets.
labels=[(0,780,780),(61,780,810),(62,780,825),(63,780,825),(64,780,840),(67,780,855),(70,780,870),(72,780,885),(75,780,900),(163,930,960),(202,915,960),(288,900,915),(321,900,900),(333,885,900),(378,870,900),(382,855,900),(384,840,900),(393,825,900),(396,810,900),(456,915,945),(459,915,960),(460,915,975),(462,915,990),(466,915,1005),(469,915,1020)]
def fmt(m):return str(m//60%12 or 12)+(':'+str(m%60).zfill(2) if m%60 else '')+' PM'
frames=[]
for i,d in enumerate(data):
 g=d['guide'].copy();r=d['ring'];e=d['event'];
 if 25<=i<=560: g[0]=390;g[2]=540;g[3]=8
 a,b=[(a,b) for n,a,b in labels if n<=i][-1];evt=None
 if e:
  top,h,alpha=e; txt=d['text'];font=max(20,min(26,txt[2])) if txt else 20;baseline=txt[0]+font*.73 if txt else top+24
  if i and alpha<.99 and frames[-1]['event']: font=frames[-1]['event']['font'];baseline=top+frames[-1]['event']['baseline']-frames[-1]['event']['y']
  evt={'y':top,'h':h,'alpha':alpha,'font':font,'baseline':baseline,'label':fmt(a)+' - '+fmt(b),'paint':d.get('paint',[0,130,253]),'ink':d.get('ink',[])}
 frames.append({'t':d['t'],'guide':dict(zip(['x','y','w','h','c'],g)),'ring':dict(zip(['x','y','r','alpha','w'],r+[d.get('ringWidth',6)])) if r else None,'event':evt})
js='''(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.CalendarTrace=api;})(typeof globalThis==='object'?globalThis:this,function(){\nconst frames=DATA;const duration=10.366667;\nfunction at(t){t=Math.max(0,Math.min(duration,Number(t)||0));let lo=0,hi=frames.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(frames[mid].t<=t+.000001)lo=mid;else hi=mid-1;}return frames[lo];}\nreturn {frames,duration,at};\n});\n'''.replace('DATA',json.dumps(frames,separators=(',',':')))
(R/'src/trace.js').write_text(js)
(R/'evidence/native-timestamps.json').write_text(json.dumps([d['t'] for d in data],separators=(',',':'))+'\n')
print('Compiled',len(frames),'frames')
