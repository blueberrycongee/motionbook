"""Decode exported GIFs and create an inspection sheet. Requires Pillow."""
from PIL import Image
from pathlib import Path
import hashlib,json,os
os.chdir(Path(__file__).resolve().parent)
records=[]
for p in sorted(Path('output').glob('*.gif')):
 im=Image.open(p);n=0;duration=0;unique=set();samples=[]
 while True:
  try:im.seek(n)
  except EOFError:break
  rgb=im.convert('RGB');unique.add(hashlib.sha256(rgb.tobytes()).hexdigest());duration+=im.info.get('duration',0)
  if n in [0,24,54,76,90,103,122,150]:samples.append(rgb.copy().resize((360,360)))
  n+=1
 assert n==162 and duration==5400,(p,n,duration)
 records.append({'file':p.name,'width':im.width,'height':im.height,'decoded_frames':n,'duration_ms':duration,'unique_frames':len(unique),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
 if p.name.endswith('demo.gif'):
  sheet=Image.new('RGB',(1440,720),'#fff')
  for i,a in enumerate(samples):sheet.paste(a,(i%4*360,i//4*360))
  sheet.save('evidence/decoded-gif-contact-sheet.png')
Path('evidence/validation.json').write_text(json.dumps({'rendering':'Shared JavaScript model and canvas functions rendered offline by @napi-rs/canvas; no browser QA','tests':15,'files':records},indent=2))
print(json.dumps(records,indent=2))
