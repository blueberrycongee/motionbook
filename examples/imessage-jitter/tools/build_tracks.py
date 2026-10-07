import json,math
from pathlib import Path
R=Path(__file__).resolve().parents[1]
a=json.loads((R/'evidence/coordinated-fit.json').read_text());spans=[(716,732),(735,751),(755,769),(774,789),(792,808),(811,815),(819,834),(837,853)]
tracks=[]
for row in a[27:89]:
 dx,dy,deg,_=row;r=-math.radians(deg);slots=[]
 for l,h in spans:
  ox=(l+h)/2-783
  slots.append([round(dx+.235+(math.cos(r)-1)*ox,5),round(dy+math.sin(r)*ox,5),round(-deg,5)])
 slots.append([round(dx+.235,5),round(dy,5),round(-deg,5)])
 tracks.append(slots)
(R/'src/tracks.js').write_text('/* Approximate WWDC24 frame-fit trajectory; see EVIDENCE.md. No Apple pixels included. */\n(function(r){const data='+json.dumps(tracks,separators=(',',':'))+';if(typeof module==="object")module.exports=data;else r.JitterTracks=data;})(globalThis);\n')
