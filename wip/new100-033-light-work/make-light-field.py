"""Build an independently modeled light field; this reads no reference image."""
from pathlib import Path
import math
import numpy as np
from PIL import Image
W,H=1506,752
field=np.zeros((H,W,4),dtype=np.uint8)
x=np.arange(W,dtype=float)
for y in range(742):
    distance=741-y
    left,right=503,1004
    sigma=4+.13*distance
    edge=np.array([.5*(math.erf((xx-left)/(sigma*math.sqrt(2)))-math.erf((xx-right)/(sigma*math.sqrt(2)))) for xx in x])
    phase=max(0,min(1,(y+50)/300));fade=phase*phase*(3-2*phase)
    gain=(.177+.00037*y)*fade
    cone=edge*gain
    haze=.092*math.exp(-.5*((y-85)/85)**2)*np.exp(-.5*((x-753)/230)**2)
    alpha=cone+haze*(1-cone)
    field[y,:,:3]=170
    field[y,:,3]=np.clip(np.rint(alpha*255),0,255)
Image.fromarray(field,'RGBA').save(Path(__file__).resolve().parent/'assets/light-field.png')
