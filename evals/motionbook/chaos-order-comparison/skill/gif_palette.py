# Builds a fixed 16x16 GIF palette from the film's own colour ramps
# (paper<->ink, paper<->vermilion, ink<->vermilion, vignette shades) so the
# rare vermilion accent survives quantisation. Usage: python3 gif_palette.py out.png
import sys
from PIL import Image
PAPER, INK, VERM, NIGHT = (236, 231, 221), (24, 22, 20), (226, 72, 43), (18, 17, 16)
VIG = (20, 14, 8)
def ramp(a, b, n):
    return [tuple(round(a[k] + (b[k] - a[k]) * i / (n - 1)) for k in range(3)) for i in range(n)]
cols = []
cols += ramp(PAPER, INK, 16)
cols += ramp(NIGHT, PAPER, 12)
cols += ramp(PAPER, VERM, 7)
cols += ramp(INK, VERM, 4)
cols += ramp(NIGHT, VERM, 4)
cols += [tuple(round(PAPER[k] * (1 - a) + VIG[k] * a) for k in range(3)) for a in (.04, .08, .12)]
uniq = list(dict.fromkeys(cols))[:256]
img = Image.new('RGB', (16, 16), uniq[0])
for i, c in enumerate(uniq):
    img.putpixel((i % 16, i // 16), c)
img.save(sys.argv[1])
print(len(uniq), 'colours')
