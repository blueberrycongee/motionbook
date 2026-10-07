#!/usr/bin/env python3
"""Build editable Clock Study digit meshes from OFL outlines plus an original 1.

Only Python/fontTools are required. No animation pixels, proprietary font,
third-party author code, network, or third-party triangulation library is used.
The cap tessellator is an independently written even/odd horizontal-slab
construction. It retains all edge subdivisions, so caps and walls are watertight.
"""
from pathlib import Path
from collections import Counter
import argparse
import hashlib
import json
import math
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parent
ROUND = 10
EPS = 1e-9


def area(points):
    return sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(points, points[1:] + points[:1])) / 2


def inside(p, ring):
    x, y = p
    yes = False
    for a, b in zip(ring, ring[1:] + ring[:1]):
        if (a[1] > y) != (b[1] > y) and x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]:
            yes = not yes
    return yes


def line_distance(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    if dx == dy == 0:
        return math.dist(p, a)
    t = max(0, min(1, ((p[0]-a[0])*dx + (p[1]-a[1])*dy)/(dx*dx+dy*dy)))
    return math.dist(p, (a[0]+t*dx, a[1]+t*dy))


class FlattenPen(BasePen):
    def __init__(self, glyph_set, tolerance):
        super().__init__(glyph_set)
        self.tolerance, self.contours, self.current = tolerance, [], None
    def _moveTo(self, p):
        if self.current is not None: raise ValueError('Unclosed contour')
        self.current = [p]
    def _lineTo(self, p): self.current.append(p)
    def subdivide(self, points, level=0):
        if level > 24: raise ValueError('Curve subdivision exceeded')
        if max(line_distance(p, points[0], points[-1]) for p in points[1:-1]) <= self.tolerance:
            self.current.append(points[-1]); return
        levels = [list(points)]
        while len(levels[-1]) > 1:
            levels.append([((a[0]+b[0])/2, (a[1]+b[1])/2) for a,b in zip(levels[-1], levels[-1][1:])])
        self.subdivide([row[0] for row in levels], level+1)
        self.subdivide([row[-1] for row in reversed(levels)], level+1)
    def _qCurveToOne(self, p1, p2): self.subdivide([self._getCurrentPoint(),p1,p2])
    def _curveToOne(self,p1,p2,p3): self.subdivide([self._getCurrentPoint(),p1,p2,p3])
    def _closePath(self):
        ring = self.current
        if ring[-1] == ring[0]: ring = ring[:-1]
        ring = [p for i,p in enumerate(ring) if p != ring[i-1]]
        if len(ring)<3 or abs(area(ring))<EPS: raise ValueError('Degenerate contour')
        self.contours.append(ring); self.current=None
    def _endPath(self): raise ValueError('Open contour')


def point(x,y): return (round(x,ROUND),round(y,ROUND))


def triangulate(contours):
    """Triangulate filled even/odd slabs, retaining matching boundary subdivisions."""
    rings = [c['points'] for c in contours]
    edges = [(a,b) for ring in rings for a,b in zip(ring,ring[1:]+ring[:1])]
    levels = sorted(set(p[1] for ring in rings for p in ring))
    def x_at(a,b,y):
        if y == a[1]: return a[0]
        if y == b[1]: return b[0]
        return round(a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]),ROUND)
    line_x = {}
    for y in levels:
        xs=[]
        for a,b in edges:
            if min(a[1],b[1])-EPS<=y<=max(a[1],b[1])+EPS:
                if a[1]==b[1]: xs.extend([a[0],b[0]])
                else: xs.append(x_at(a,b,y))
        line_x[y]=sorted(set(xs))
    vertices=[]; index={}; triangles=[]
    def vid(p):
        p=point(*p)
        if p not in index: index[p]=len(vertices); vertices.append(p)
        return index[p]
    for y0,y1 in zip(levels,levels[1:]):
        mid=(y0+y1)/2
        active=sorted([(x_at(a,b,mid),a,b) for a,b in edges if min(a[1],b[1])<mid<max(a[1],b[1])])
        if len(active)%2: raise ValueError('Odd number of crossings')
        for left,right in zip(active[::2],active[1::2]):
            xl0,xl1=x_at(left[1],left[2],y0),x_at(left[1],left[2],y1)
            xr0,xr1=x_at(right[1],right[2],y0),x_at(right[1],right[2],y1)
            # CCW perimeter. Include every collinear edge point shared with a neighbour.
            lower=[point(x,y0) for x in line_x[y0] if xl0-EPS<=x<=xr0+EPS]
            upper=[point(x,y1) for x in reversed(line_x[y1]) if xl1-EPS<=x<=xr1+EPS]
            perimeter=[]
            for p in lower+upper:
                if not perimeter or p!=perimeter[-1]: perimeter.append(p)
            if perimeter[0]==perimeter[-1]: perimeter.pop()
            if len(perimeter)<3 or area(perimeter)<EPS: continue
            # Zipper triangulate the two collinear chains. No extra center point,
            # no discarded boundary vertex, and exactly n-2 nondegenerate triangles.
            upper=list(reversed(upper)); li=ui=0
            while li+1<len(lower) or ui+1<len(upper):
                take_lower=(ui+1==len(upper) or (li+1<len(lower) and lower[li+1][0]<=upper[ui+1][0]))
                if take_lower:
                    tri=[lower[li],lower[li+1],upper[ui]]; li+=1
                else:
                    tri=[lower[li],upper[ui+1],upper[ui]]; ui+=1
                if area(tri)>1e-12: triangles.append([vid(p) for p in tri])
    # The exterior contour is split at exactly the same coordinates as its cap.
    boundaries=[]
    for ring in rings:
        ids=[]
        for a,b in zip(ring,ring[1:]+ring[:1]):
            if a[1]==b[1]:
                pts=[point(x,a[1]) for x in line_x[a[1]] if min(a[0],b[0])-EPS<=x<=max(a[0],b[0])+EPS]
                pts.sort(key=lambda p:p[0],reverse=b[0]<a[0])
            else:
                ys=[y for y in levels if min(a[1],b[1])-EPS<=y<=max(a[1],b[1])+EPS]
                ys.sort(reverse=b[1]<a[1]); pts=[point(x_at(a,b,y),y) for y in ys]
            ids.extend(vid(p) for p in pts[:-1])
        boundaries.append(ids)
    cap_area=sum(area([vertices[i] for i in t]) for t in triangles)
    target=sum(area(r) for r in rings)
    if abs(cap_area-target)>2e-8: raise ValueError(f'Area mismatch {cap_area} != {target}')
    # z is +/- .5 here; renderer scales extrusion independently of glyph cap height.
    n=len(vertices)
    verts3=[[x,y,.5] for x,y in vertices]+[[x,y,-.5] for x,y in vertices]
    mesh_triangles=[[a,b,c,0] for a,b,c in triangles]+[[c+n,b+n,a+n,1] for a,b,c in triangles]
    for ring in boundaries:
        for a,b in zip(ring,ring[1:]+ring[:1]):
            mesh_triangles.extend([[a,a+n,b+n,2],[a,b+n,b,2]])
    counts=Counter(tuple(sorted((a,b))) for t in mesh_triangles for a,b in zip(t[:3],t[1:3]+t[:1]))
    if any(v!=2 for v in counts.values()):
        bad=[(e,c) for e,c in counts.items() if c!=2]
        raise ValueError(f'Non-manifold edges: {bad[:12]}')
    directed=Counter((a,b) for t in mesh_triangles for a,b in zip(t[:3],t[1:3]+t[:1]))
    if any(directed[(a,b)]!=directed[(b,a)] for a,b in directed): raise ValueError('Inconsistent winding')
    holes=sum(c['role']=='hole' for c in contours)
    euler=len(verts3)-len(counts)+len(mesh_triangles)
    if euler!=2-2*holes: raise ValueError(f'Wrong Euler characteristic {euler}')
    for t in triangles:
        p=tuple(sum(vertices[i][j] for i in t)/3 for j in [0,1])
        if sum(inside(p,r) for r in rings)%2!=1: raise ValueError('Cap triangle outside fill')
    return {'vertices':verts3,'triangles':mesh_triangles,'validation':{'capArea':round(cap_area,10),'areaError':abs(cap_area-target),'closedManifold':True,'eulerCharacteristic':euler,'holes':holes,'capTriangles':len(triangles),'wallTriangles':sum(len(r)*2 for r in boundaries)}}


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--tolerance',type=float,default=.001)
    args=ap.parse_args()
    if not math.isfinite(args.tolerance) or not 1e-6<=args.tolerance<=.05: ap.error('Tolerance outside finite [1e-6,.05]')
    font_path=ROOT/'assets/LiberationSans-Bold.ttf'
    font=TTFont(font_path); glyphs,cmap=font.getGlyphSet(),font.getBestCmap()
    cap=float(font['OS/2'].sCapHeight)
    ymin,ymax=math.inf,-math.inf
    for d in '0123456789':
        bp=BoundsPen(glyphs); glyphs[cmap[ord(d)]].draw(bp)
        ymin,ymax=min(ymin,bp.bounds[1]),max(ymax,bp.bounds[3])
    cy=(ymin+ymax)/2
    out={'schemaVersion':2,'name':'Clock Study Bold Digits','license':'SIL-OFL-1.1; assets/OFL.txt','notice':'Renamed modified OFL digit geometry; 1 is a new independently authored unfooted outline. No source-animation pixels or proprietary font data used.',
         'source':{'family':'Liberation Sans','style':'Bold','version':'2.1.5','file':'assets/LiberationSans-Bold.ttf','sha256':hashlib.sha256(font_path.read_bytes()).hexdigest()},
         'parameters':{'capHeightFontUnits':cap,'curveFlatnessCapUnits':args.tolerance,'coordinateSystem':'x right, y up; glyph cap height 1, local extrusion depth 1, centered on advance and vertical digit extent','triangleKinds':['front','back','side'],'triangulator':'independent even-odd horizontal slabs; constrained subdivisions','glyph1Adjustment':'Original polygon using straight segments: a narrow vertical stem and diagonal upper flag, no wide lower foot.'},'digits':{}}
    for d in '0123456789':
        name=cmap[ord(d)]; advance=font['hmtx'].metrics[name][0]/cap
        if d=='1':
            # Entirely new author-defined silhouette, not a modification or trace of proprietary type.
            # Same tabular advance as the OFL glyphs; 0.18-cap stem and upper-left flag.
            raw=[[(-.205,.335),(-.035,.50),(.135,.50),(.135,-.50),(-.045,-.50),(-.045,.275),(-.205,.16)]]
            provenance='Original author-defined polygon; no font outline used'
        else:
            fp=FlattenPen(glyphs,args.tolerance*cap); glyphs[name].draw(fp)
            raw=[[point(x/cap-advance/2,(y-cy)/cap) for x,y in ring] for ring in fp.contours]
            provenance='Derived from unmodified bundled Liberation Sans Bold under SIL OFL 1.1'
        contours=[]
        for i,ring in enumerate(raw):
            nesting=sum(inside(ring[0],other) for j,other in enumerate(raw) if i!=j); hole=bool(nesting%2)
            if (area(ring)>0)==hole: ring=list(reversed(ring))
            start=min(range(len(ring)),key=lambda i:ring[i]); ring=ring[start:]+ring[:start]
            contours.append({'role':'hole' if hole else 'outer','nesting':nesting,'points':ring,'signedArea':round(area(ring),10)})
        contours.sort(key=lambda c:(c['nesting'],-abs(c['signedArea'])))
        pts=[p for c in contours for p in c['points']]
        mesh=triangulate(contours)
        out['digits'][d]={'advance':round(advance,10),'bounds':[min(p[0] for p in pts),min(p[1] for p in pts),max(p[0] for p in pts),max(p[1] for p in pts)],'provenance':provenance,'contours':contours,**mesh}
    (ROOT/'assets/digit-geometry.json').write_text(json.dumps(out,indent=2)+'\n')
    js="/* Clock Study Bold digit geometry; SIL OFL 1.1, assets/OFL.txt. */\n(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ClockDigitData=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';return "+json.dumps(out,separators=(',',':'))+";});\n"
    (ROOT/'geometry-data.js').write_text(js)
    print(json.dumps({d:{'vertices':len(g['vertices']),'triangles':len(g['triangles']),**g['validation']} for d,g in out['digits'].items()},indent=2))

if __name__=='__main__': main()
