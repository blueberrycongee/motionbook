"""Recover approximate independent glyph rigid transforms from the cited clip.

This is video fitting, not recovered Apple source code. The source is 29.97fps;
its compression, selected-text handles and unknown font limit precision.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates
from scipy.optimize import minimize

ROOT = Path(__file__).resolve().parents[1]
files = sorted((ROOT/'evidence/frames').glob('f-*.png'))
frames = [np.asarray(Image.open(f).convert('RGB')) for f in files]
fps = 30000/1001
spans = [(716,732),(735,751),(755,769),(774,789),(792,808),(811,815),(819,834),(837,853)]
results = []
for j,(left,right) in enumerate(spans):
    x0, y0, w, h = left-10, 234, right-left+20, 49
    def ink(im):
        rgb = im[y0:y0+h,x0:x0+w].astype(float)
        # Reject selection handles as colored pixels, retain antialiased black.
        return np.clip((170-rgb.max(axis=2))/150,0,1)
    template = ink(frames[12])
    template[:,:10] = 0
    template[:,10+right-left:] = 0
    yy,xx = np.mgrid[:h,:w]
    cx,cy = (w-1)/2, 255-y0
    target_mask = (yy>=1)&(yy<h-2)
    def transform(params):
        dx,dy,rot = params
        a = np.deg2rad(rot)
        u,v = xx-cx-dx,yy-cy-dy
        return map_coordinates(template,[np.sin(a)*u+np.cos(a)*v+cy,np.cos(a)*u-np.sin(a)*v+cx],order=1,mode='constant',cval=0)
    poses=[]
    for i,im in enumerate(frames):
        target=ink(im)
        def loss(p):
            return np.mean(((transform(p)-target)*target_mask)**2)
        fits=[minimize(loss,start,method='Powell',bounds=[(-7,7),(-8,8),(-10,10)],options={'xtol':.015,'ftol':.00001,'maxiter':80}) for start in [[0,0,0],[-3,-2,0],[3,2,0]]]
        fit=min(fits,key=lambda p:p.fun)
        poses.append([round(float(x),4) for x in fit.x]+[round(float(fit.fun),6)])
    results.append(poses)
    print(j,'done',flush=True)
records=[{'frame':i,'local_seconds':round(i/fps,6),'keynote_seconds':round(1316.79+i/fps,6),'glyphs':[results[j][i] for j in range(8)]} for i in range(len(frames))]
data={'source_url':'https://developer.apple.com/videos/play/wwdc2024/101/?time=1317','source_fps':fps,'excerpt_keynote_offset_seconds':1316.79,'coordinate_system':'1920x1080 source; dx/dy px, rotation degrees about glyph middle at y255; positive rotation follows fitting convention','glyphs':'bouncing','spans':spans,'reference_frame':12,'records':records,'limitations':['Rigid-fit estimate; not original engine parameters','Source font, video compression and selection handles affect fits','The frame sequence does not prove an exact native repeat period']}
(ROOT/'evidence/glyph-measurements.json').write_text(json.dumps(data,indent=2)+'\n')
for j in range(8):
    a=np.array(results[j])[30:85,:3]
    print('bouncing'[j], 'ranges', np.round(a.min(0),2), np.round(a.max(0),2))
