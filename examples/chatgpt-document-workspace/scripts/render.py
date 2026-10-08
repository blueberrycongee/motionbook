#!/usr/bin/env python3
"""Capture the actual shared SVG scene offline. This is not browser verification."""
import json, os, pathlib, subprocess
from PIL import Image, ImageDraw
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'preview'; FRAMES = OUT / 'frames'
def run(args, **kwargs):
    result = subprocess.run(args, cwd=ROOT, text=True, capture_output=True, **kwargs)
    if result.returncode: raise RuntimeError(result.stderr[-3000:] + result.stdout[-1000:])
    return result
info = json.loads(run(['node', 'scripts/emit.mjs']).stdout)
env = os.environ.copy()
for name in ['CONFIG', 'CACHE']:
    folder = OUT / name.lower(); folder.mkdir(exist_ok=True)
    env['XDG_' + name + '_HOME'] = str(folder)
actions = []
for i in range(info['frames']):
    path = FRAMES / f'{i:04}'
    actions.append(f'file-open:{path}.svg;export-filename:{path}.png;export-width:1280;export-height:1180;export-do;file-close')
for name, w, h in [('reference', 1280, 1180), ('wide', 1920, 1080), ('compact', 390, 844), ('focused', 1280, 1180), ('multiline', 1280, 1180)]:
    path = FRAMES / name
    actions.append(f'file-open:{path}.svg;export-filename:{OUT/name}.png;export-width:{w};export-height:{h};export-do;file-close')
result = run(['inkscape', '--shell'], input='\n'.join(actions) + '\nquit\n', env=env, timeout=300)
(OUT / 'renderer.log').write_text(result.stdout + result.stderr)
for i in range(info['frames']):
    with Image.open(FRAMES/f'{i:04}.png') as im:
        if im.size != (1280, 1180): raise RuntimeError('Unexpected frame dimensions')
run(['ffmpeg', '-y', '-v', 'error', '-threads', '2', '-framerate', str(info['fps']), '-i', str(FRAMES/'%04d.png'), '-c:v', 'libx264', '-threads', '2', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(OUT/'document-workspace.mp4')], timeout=120)
# The same source frames, resized only for the repository gallery.
images = [Image.open(FRAMES/f'{i:04}.png').convert('RGB').resize((640, 590), Image.Resampling.LANCZOS) for i in range(0, info['frames'], 2)]
palette = images[0].quantize(colors=64)
quantized = [im.quantize(palette=palette, dither=Image.Dither.NONE) for im in images]
quantized[0].save(OUT/'document-workspace.gif', save_all=True, append_images=quantized[1:], duration=200, loop=0, optimize=True)
timeline = json.loads((FRAMES/'timeline.json').read_text())
chosen = timeline['frames']; sheet = Image.new('RGB', (1280, ((len(chosen)+3)//4)*315), '#eef0ee'); draw = ImageDraw.Draw(sheet)
for n, item in enumerate(chosen):
    with Image.open(FRAMES/f"{item['frame']:04}.png") as im: sheet.paste(im.convert('RGB').resize((320,295)), ((n%4)*320,(n//4)*315))
    draw.text(((n%4)*320+8, (n//4)*315+298), f"{item['t']:.2f}s", fill='#344137')
sheet.save(OUT/'contact-sheet.png')
manifest = {'kind':'Offline capture of the interactive app shared SVG renderer and reducer; NOT browser/input-device verification', 'renderer':'Inkscape', **info, 'gif_dimensions':[640,590], 'gif_fps':5, 'gif_playback_rate':0.5, 'gif_seconds':info['seconds'] * 2, 'ui_timing_unchanged':True, 'gif_palette_colors':64, 'fixture_documents':'Original fictional content', 'native_textarea_verified_in_browser':False}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))
