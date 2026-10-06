from pathlib import Path
import json
R=Path(__file__).resolve().parents[1];data=json.load(open(R/'evidence/measured-trace.json'))
s='''(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.MinimapTrace=api;})(globalThis,function(){const frames=DATA;const duration=8.366667;function at(t){t=Math.max(0,Math.min(duration,Number(t)||0));let lo=0,hi=frames.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(frames[mid].t<=t+.000001)lo=mid;else hi=mid-1;}return frames[lo];}return{frames,duration,at};});\n'''.replace('DATA',json.dumps(data,separators=(',',':')))
(R/'src/trace.js').write_text(s);print('Compiled',len(data),'native frames')
