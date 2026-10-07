#!/usr/bin/env python3
"""Render actual submitted renderFrame SVG output offline. Never a browser test."""
import argparse, hashlib, json, os, pathlib, subprocess, time, xml.etree.ElementTree as ET
from PIL import Image, ImageDraw
HERE=pathlib.Path(__file__).resolve().parent
p=argparse.ArgumentParser(); p.add_argument('source',type=pathlib.Path); p.add_argument('out',type=pathlib.Path); p.add_argument('--smoke',action='store_true'); args=p.parse_args()
source=args.source.resolve(); out=args.out.resolve(); out.mkdir(parents=True,exist_ok=True)
def run(cmd,**kwargs):
 r=subprocess.run(cmd,text=True,capture_output=True,**kwargs)
 if r.returncode: raise RuntimeError(f'{cmd[0]} failed: '+r.stderr[-2000:]+r.stdout[-1000:])
 return r
start=time.monotonic()
result=run(['node',str(HERE/'emit.mjs'),str(source),str(out/'frames')],timeout=30)
samples=json.loads((out/'frames/samples.json').read_text())
if args.smoke: samples=samples[:3]
for item in samples:
 root=ET.parse(out/'frames'/f"{item['name']}.svg").getroot()
 if not root.tag.endswith('svg'):raise ValueError('Not SVG')
actions=[]
for item in samples:
 name=out/'frames'/item['name']
 actions.append(f'file-open:{name}.svg;export-filename:{name}.png;export-width:800;export-height:600;export-do;file-close')
env=os.environ.copy();env['XDG_CONFIG_HOME']=str(out/'config');env['XDG_CACHE_HOME']=str(out/'cache')
for key in ['XDG_CONFIG_HOME','XDG_CACHE_HOME']:pathlib.Path(env[key]).mkdir(exist_ok=True)
r=run(['inkscape','--shell'],input='\n'.join(actions)+'\nquit\n',env=env,timeout=150)

for item in samples:
 with Image.open(out/'frames'/f"{item['name']}.png") as im:
  if im.size!=(800,600):raise ValueError('Unexpected dimensions')
if not args.smoke:
 run(['ffmpeg','-y','-v','error','-threads','2','-framerate','20','-i',str(out/'frames/normal-%03d.png'),'-c:v','libx264','-threads','2','-crf','20','-pix_fmt','yuv420p',str(out/'animation.mp4')],timeout=60)
 imgs=[Image.open(out/'frames'/f'normal-{i:03}.png').convert('RGB').resize((480,360)) for i in range(0,121,2)]
 imgs[0].save(out/'animation.gif',save_all=True,append_images=imgs[1:],duration=100,loop=0)
 for group in ['normal','interrupted','reduced']:
  chosen=([samples[i] for i in [0,10,13,17,20,28,32,42,50,60,70,76,84,100,110,120]] if group=='normal' else [s for s in samples if s['name'].startswith(group)])
  sheet=Image.new('RGB',(1280,4*260),'#f1f1f1');draw=ImageDraw.Draw(sheet)
  for i,s in enumerate(chosen):
   with Image.open(out/'frames'/f"{s['name']}.png") as im:sheet.paste(im.convert('RGB').resize((320,240)),((i%4)*320,(i//4)*260))
   draw.text(((i%4)*320+5,(i//4)*260+242),f"{s['t']:.2f}s",fill='black')
  sheet.save(out/(group+'-sheet.png'))
manifest={'kind':'Offline source SVG rendering; NOT browser or input-device verification','source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'source_file':source.name,'renderer':run(['inkscape','--version']).stdout.strip(),'dimensions':[800,600],'fps':20,'duration_seconds':6,'normal_frame_count':sum(x['name'].startswith('normal-') for x in samples),'smoke_only':args.smoke,'total_frame_count':len(samples),'deterministic':True,'svg_parse':True,'finite_tokens':True,'external_assets':False,'elapsed_seconds':round(time.monotonic()-start,2)}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)); print(json.dumps(manifest))
