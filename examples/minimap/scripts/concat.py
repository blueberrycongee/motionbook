"""Write a native-VFR FFmpeg concat, preserving all 480 original presentation times."""
from pathlib import Path
import json,sys
R=Path(__file__).resolve().parents[1];P=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else R/'preview/frames';target=Path(sys.argv[2]) if len(sys.argv)>2 else R/'preview/native.ffconcat';pts=json.load(open(R/'evidence/native-timestamps.json'));lines=['ffconcat version 1.0']
for i,t in enumerate(pts):
 duration=(pts[i+1]-t) if i+1<len(pts) else 1/60;lines += [f"file '{P}/{i:05}.png'",'option framerate 60',f'duration {duration:.6f}']
target.parent.mkdir(parents=True,exist_ok=True);target.write_text('\n'.join(lines)+'\n');print(target)
