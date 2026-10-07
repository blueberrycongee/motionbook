"""Encode the shared-runtime PNG sequence; this is not a browser screenshot.
python3 scripts/build_review.py FRAME_DIRECTORY OUTPUT_DIRECTORY
Requires Pillow only. No external artwork is downloaded.
"""
from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import json,sys
src=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
frames=[Image.open(src/f'{i:03d}.png').convert('RGB') for i in range(150)]
preview=out/'little-wins-cc0-preview.gif'
frames[0].save(preview,save_all=True,append_images=frames[1:],duration=50,loop=0,disposal=2,optimize=False)
try:font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
except OSError:font=ImageFont.load_default()
indices=[0,16,35,43,72,78,88,105,110,123]
sheet=Image.new('RGB',(5*204,2*434),'#faf7f2');d=ImageDraw.Draw(sheet)
for i,n in enumerate(indices):
 x=(i%5)*204;y=(i//5)*434;d.text((x+8,y+8),f'{n/20:.2f} s',font=font,fill='#514572');sheet.paste(frames[n].resize((204,400)),(x,y+30))
sheet.save(out/'little-wins-cc0-keyframes.png')
im=Image.open(preview);dur=[]
for i in range(im.n_frames):im.seek(i);dur.append(im.info.get('duration',0))
assert sum(dur)==7500
report={'file':preview.name,'width':im.width,'height':im.height,'input_samples':150,'sample_interval_ms':50,'decoded_frames':im.n_frames,'duration_ms':sum(dur),'encoded_frame_delays_ms':sorted(set(dur)),'note':'Identical holds may merge; total duration verified. Shared SVG offline render, not browser capture.'}
(out/'media-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
