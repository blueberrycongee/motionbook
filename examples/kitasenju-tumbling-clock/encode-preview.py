#!/usr/bin/env python3
"""Encode independently rendered grayscale PNGs at their documented normal speed."""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageSequence

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('frames', type=Path)
p.add_argument('--output', type=Path, default=Path('preview.gif'))
a = p.parse_args()
manifest = json.loads((a.frames / 'render-manifest.json').read_text())
records = manifest['frames']
if not records or not 0 < manifest['duration'] <= 60:
    raise ValueError('Invalid render manifest')
palette = Image.new('P', (1, 1))
palette.putpalette([v for i in range(256) for v in (i, i, i)])
images = [Image.open(a.frames / row['file']).convert('RGB').quantize(palette=palette, dither=Image.Dither.NONE) for row in records]
n = len(images)
total = round(manifest['duration'] * 1000)
delays = [round((i+1)*total/n/10)*10 - round(i*total/n/10)*10 for i in range(n)]
if min(delays) < 10:
    raise ValueError('GIF sampling interval is below one centisecond')
a.output.parent.mkdir(parents=True, exist_ok=True)
images[0].save(a.output, save_all=True, append_images=images[1:], duration=delays, loop=0, disposal=2, optimize=False)
with Image.open(a.output) as check:
    duration = sum(frame.info.get('duration', 0) for frame in ImageSequence.Iterator(check))
    assert check.n_frames == n and duration == sum(delays)
print(json.dumps({'file': str(a.output), 'frames': n, 'duration_ms': duration}))
