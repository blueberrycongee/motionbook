#!/usr/bin/env python3
"""Rebuild editable Clock Study Bold Digits v2 without reference images or metadata.

Usage: python3 build-geometry-v2.py [--out DIRECTORY]
Default outputs: geometry-data.js, assets/digit-geometry.json, glyph-bounds.json
Dependencies: Python 3, fontTools (existing base builder), and NumPy (additional).
Inputs: adjacent build-geometry.py triangulation helpers and the licensed baseline
assets/base-digit-geometry.json. Both are part of the distributable example.

The original shoulder uses only geometric primitives. The generic contour offset
is applied to the independent OFL-derived baseline. No reference screenshots,
measurement logs, fitting code, proprietary assets, or network access are used.
Historical build-candidate.py wording in metadata is retained for byte identity.
"""
import argparse, json, pathlib, math, importlib.util, copy
import numpy as np
ROOT = pathlib.Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--out', type=pathlib.Path, default=ROOT,
                    help='Output root; defaults to this script directory')
args = parser.parse_args()
P = args.out.resolve()
P.mkdir(parents=True, exist_ok=True)
(P/'assets').mkdir(exist_ok=True)
spec = importlib.util.spec_from_file_location('clock_geometry_builder', ROOT/'build-geometry.py')
B = importlib.util.module_from_spec(spec)
spec.loader.exec_module(B)
D = json.loads((ROOT/'assets/base-digit-geometry.json').read_text())

def primitive_one():
    # Original geometric shoulder: a horizontal flag, circular quadrant, and straight stem.
    # Parameters are design choices, not sampled reference boundary coordinates.
    pts=[(.16,-.5),(-.065,-.5),(-.065,.18),(-.27,.18),(-.27,.36),(-.16,.36)]
    for th in np.linspace(-math.pi/2,0,9): pts.append((-.16+.14*math.cos(th),.5+.14*math.sin(th)))
    pts.extend([(.16,.5)])
    return pts

shoulder=primitive_one()
DIST=.012

def offset(r):
 r=[v for i,v in enumerate(r) if math.dist(v,r[i-1])>1e-9]
 p=np.array(r,float);q=[]
 for i,b in enumerate(p):
  before=b-p[i-1];after=p[(i+1)%len(p)]-b
  before/=np.linalg.norm(before);after/=np.linalg.norm(after)
  n1=np.array([before[1],-before[0]]);n2=np.array([after[1],-after[0]])
  delta=(n1+n2)*DIST/max(.05,1+np.dot(n1,n2))
  if np.linalg.norm(delta)>DIST*4:delta*=DIST*4/np.linalg.norm(delta)
  q.append(tuple(round(float(v),10) for v in b+delta))
 # Remove small local self-intersection loops caused by outward offsets at concave joins.
 for _ in range(30):
  found=False
  for i in range(len(q)):
   for j in range(i+2,len(q)):
    if i==0 and j==len(q)-1:continue
    a=np.array(q[i]);b=np.array(q[(i+1)%len(q)]);c=np.array(q[j]);d=np.array(q[(j+1)%len(q)])
    mat=np.column_stack([b-a,c-d])
    if abs(np.linalg.det(mat))<1e-12:continue
    t,u=np.linalg.solve(mat,c-a)
    if 1e-8<t<1-1e-8 and 1e-8<u<1-1e-8:
     hit=tuple(round(float(v),10) for v in a+t*(b-a))
     loops=[[hit]+q[i+1:j+1],[hit]+q[j+1:]+q[:i+1]]
     q=max(loops,key=lambda pts:abs(B.area(pts)));found=True;break
   if found:break
  if not found:break
 return q

for d,g in D['digits'].items():
 rings=[{'role':'outer','nesting':0,'points':shoulder}] if d=='1' else copy.deepcopy(g['contours'])
 for c in rings:
  pts=c['points'];hole=c['role']=='hole'
  if (B.area(pts)>0)==hole:pts=list(reversed(pts))
  c['points']=[tuple(round(v/1.024,10) for v in p) for p in offset(pts)];c['signedArea']=round(B.area(c['points']),10)
  if (c['signedArea']>0)==hole:raise ValueError(f'Winding changed {d}: {c}')
 print("building",d,flush=True);mesh=B.triangulate(rings);pts=[p for c in rings for p in c['points']]
 g.update(contours=rings,bounds=[min(p[0] for p in pts),min(p[1] for p in pts),max(p[0] for p in pts),max(p[1] for p in pts)],**mesh)
 if d=='1':g['provenance']='Original primitive shoulder: horizontal flag, circular quadrant and rectangular upright stem. Not sampled or traced from source glyph pixels.'
D['name']='Clock Study Bold Digits v2';D['parameters']['v2WeightOffsetCapUnits']=DIST;D['parameters']['v2CapRenormalization']=1/1.024;D['parameters']['glyph1Adjustment']='Original primitive shoulder in build-candidate.py, then global right-normal offset 0.012 cap units.'
D['notice']='Renamed modified OFL digit geometry. Generic weight offset on independent licensed font; original primitive 1. No proprietary outline, source code, or direct pixel tracing.'
(P/'assets/digit-geometry.json').write_text(json.dumps(D,indent=2)+'\n')
(P/'geometry-data.js').write_text("/* Clock Study Bold Digits v2; SIL OFL 1.1, assets/OFL.txt. */\n(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ClockDigitData=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';return "+json.dumps(D,separators=(',',':'))+";});\n")
(P/'glyph-bounds.json').write_text(json.dumps([D['digits'][str(i)]['bounds'] for i in range(10)],indent=2))
print(json.dumps({d:g['validation'] for d,g in D['digits'].items()},indent=2))
