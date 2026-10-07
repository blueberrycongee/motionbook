/* Independently authored deterministic software triangle renderer.
 * Same rasterizer and pixels in browser Canvas2D and Node @napi-rs/canvas.
 * Geometry: renamed SIL OFL 1.1 derivative; see assets/OFL.txt.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./geometry-data.js'));
  else root.ClockRenderer = factory(root.ClockDigitData);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (DATA) {
  'use strict';
  if (!DATA || DATA.schemaVersion !== 2) throw new Error('Load geometry-data.js before renderer.js');
  const LIMITS = Object.freeze({ bodies: 48, dimension: 2048, pixels: 2097152, samples: 8388608, coordinate: 100000, scale: 2000 });
  const EPS = 1e-11;
  const DEFAULTS = Object.freeze({ width: 564, height: 342, fov: 40, cameraDistance: 1300, near: 5, far: 100000, thickness: 50, antialias: 2, ambient: .58, diffuse: .62, sideAlbedo: .90 });
  const caches = new WeakMap();
  const compiled = {};
  function finite(v, name) {
    if (typeof v !== 'number' || !Number.isFinite(v)) throw new TypeError(name + ' must be finite');
    return v;
  }
  function bounded(v, name, lo, hi) { finite(v, name); if (v < lo || v > hi) throw new RangeError(name + ' outside [' + lo + ', ' + hi + ']'); return v; }
  function integer(v, name, lo, hi) { bounded(v,name,lo,hi); if (!Number.isInteger(v)) throw new TypeError(name + ' must be an integer'); return v; }
  function vector(v, name, n, fallback, limit = LIMITS.coordinate) {
    if (v === undefined) v = fallback;
    if (!Array.isArray(v) || v.length !== n) throw new TypeError(name + ' must contain ' + n + ' numbers');
    return v.map((x,i) => bounded(x,name+'['+i+']',-limit,limit));
  }
  function normalize(v) { const len = Math.hypot(...v); if (len < EPS) throw new RangeError('Vector must be nonzero'); return v.map(x => x / len); }
  function quaternionFromEuler(v) {
    const [x,y,z]=vector(v,'rotation',3,[0,0,0],10000).map(a=>a/2);
    const cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);
    return [sx*cy*cz-cx*sy*sz,cx*sy*cz+sx*cy*sz,cx*cy*sz-sx*sy*cz,cx*cy*cz+sx*sy*sz];
  }
  function matrixFromQuaternion(q) {
    const [x,y,z,w] = normalize(vector(q,'quaternion',4,[0,0,0,1],10000));
    return [1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w),2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w),2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)];
  }
  function cameraOptions(options = {}) {
    if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('options must be an object');
    const get = (k) => options[k] === undefined ? DEFAULTS[k] : options[k];
    const width=integer(get('width'),'width',1,LIMITS.dimension),height=integer(get('height'),'height',1,LIMITS.dimension);
    if (width*height>LIMITS.pixels) throw new RangeError('Output pixel limit exceeded');
    const antialias=integer(get('antialias'),'antialias',1,2);
    if (width*height*antialias*antialias>LIMITS.samples) throw new RangeError('Sample limit exceeded');
    const fov=bounded(get('fov'),'fov',10,120), cameraDistance=bounded(get('cameraDistance'),'cameraDistance',10,LIMITS.coordinate);
    const near=bounded(get('near'),'near',.1,LIMITS.coordinate),far=bounded(get('far'),'far',near+.1,300000);
    const center=vector(options.center,'center',2,[width/2,height/2]);
    const target=vector(options.target,'target',3,[0,0,0]);
    const light=normalize(vector(options.light,'light',3,[-.35,.7,1],10));
    return {width,height,antialias,fov,cameraDistance,near,far,center,target,light,
      focal:height/(2*Math.tan(fov*Math.PI/360)),
      ambient:bounded(get('ambient'),'ambient',0,1),diffuse:bounded(get('diffuse'),'diffuse',0,2),
      sideAlbedo:bounded(get('sideAlbedo'),'sideAlbedo',0,1),
      thickness:bounded(get('thickness'),'thickness',.01,LIMITS.scale)};
  }
  function digitName(v) { if ((typeof v!=='string' || !/^[0-9]$/.test(v)) && !(Number.isInteger(v)&&v>=0&&v<=9)) throw new TypeError('digit must be 0–9'); return String(v); }
  function validateBodies(bodies, camera) {
    if (!Array.isArray(bodies) || bodies.length > LIMITS.bodies) throw new RangeError('bodies must be an array of at most '+LIMITS.bodies+' items');
    return bodies.map((b,index) => {
      if (!b || typeof b !== 'object' || Array.isArray(b)) throw new TypeError('Invalid body at '+index);
      const digit=digitName(b.digit), position=vector(b.position,'position',3,[0,0,0]);
      const scale=bounded(b.scale===undefined?210:b.scale,'scale',.01,LIMITS.scale);
      const thickness=bounded(b.thickness===undefined?(b.depth===undefined?camera.thickness:bounded(b.depth,'depth',.00001,100)*scale):b.thickness,'thickness',.01,LIMITS.scale);
      // Validate supplied Euler values too, even when a quaternion takes precedence.
      if (b.rotation!==undefined) vector(b.rotation,'rotation',3,[0,0,0],10000);
      const matrix=matrixFromQuaternion(b.quaternion===undefined?quaternionFromEuler(b.rotation):b.quaternion);
      return {digit,position,scale,thickness,matrix,index};
    });
  }
  function meshFor(digit) {
    digit=digitName(digit);
    if (compiled[digit]) return compiled[digit];
    const g=DATA.digits[digit],v=new Float64Array(g.vertices.flat()),t=new Int32Array(g.triangles.flat()),normals=new Float64Array(g.triangles.length*3);
    g.triangles.forEach((tri,i) => {
      const a=g.vertices[tri[0]],b=g.vertices[tri[1]],c=g.vertices[tri[2]];
      const u=b.map((n,j)=>n-a[j]),w=c.map((n,j)=>n-a[j]);
      const n=normalize([u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]]);
      normals.set(n,3*i);
    });
    return compiled[digit]={v,t,normals,vertexCount:g.vertices.length,triangleCount:g.triangles.length};
  }
  function project(point, options = {}) {
    const c=cameraOptions(options),p=vector(point,'point',3,[0,0,0]);
    const depth=c.cameraDistance-(p[2]-c.target[2]);
    if (depth<c.near || depth>c.far) return null;
    return [c.center[0]+(p[0]-c.target[0])*c.focal/depth,c.center[1]-(p[1]-c.target[1])*c.focal/depth,depth];
  }
  function containsDigit(digit, point) {
    const g=DATA.digits[digitName(digit)],p=vector(point,'point',2,[0,0]); let hit=false;
    for (const contour of g.contours) {
      const ring=contour.points;
      for (let i=0,j=ring.length-1;i<ring.length;j=i++) {
        const a=ring[i],b=ring[j];
        if ((a[1]>p[1])!==(b[1]>p[1]) && p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]) hit=!hit;
      }
    }
    return hit;
  }
  function clipDepth(poly, plane, greater) {
    const out=[];
    for(let i=0,j=poly.length-1;i<poly.length;j=i++) {
      const a=poly[j],b=poly[i],ia=greater?a[2]>=plane:a[2]<=plane,ib=greater?b[2]>=plane:b[2]<=plane;
      if(ia!==ib) {const t=(plane-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,plane]);}
      if(ib)out.push(b);
    }
    return out;
  }
  function acquireBuffers(ctx, camera) {
    let b=caches.get(ctx); const {width,height,antialias}=camera, sw=width*antialias,sh=height*antialias;
    if (!b || b.width!==width || b.height!==height || b.aa!==antialias) {
      b={width,height,aa:antialias,sw,sh,depth:new Float64Array(sw*sh),shade:new Uint8Array(sw*sh),image:ctx.createImageData(width,height)};
      caches.set(ctx,b);
    }
    b.depth.fill(0);b.shade.fill(0);return b;
  }
  // Scan-convert one projected triangle. Shared edges use a half-open pixel-center
  // convention. Reciprocal depth is a screen-space plane, not a painter key.
  function rasterTriangle(p0,p1,p2,shade,b,stats) {
    let x0=p0[0],y0=p0[1],z0=p0[2],x1=p1[0],y1=p1[1],z1=p1[2],x2=p2[0],y2=p2[1],z2=p2[2];
    const area=(x1-x0)*(y2-y0)-(y1-y0)*(x2-x0);
    if(Math.abs(area)<1e-10)return;
    const dzdx=((z1-z0)*(y2-y0)-(z2-z0)*(y1-y0))/area;
    const dzdy=((x1-x0)*(z2-z0)-(x2-x0)*(z1-z0))/area;
    const zbase=z0-x0*dzdx-y0*dzdy;
    if(y0>y1){let t=x0;x0=x1;x1=t;t=y0;y0=y1;y1=t;}
    if(y1>y2){let t=x1;x1=x2;x2=t;t=y1;y1=y2;y2=t;}
    if(y0>y1){let t=x0;x0=x1;x1=t;t=y0;y0=y1;y1=t;}
    const minY=Math.max(0,Math.ceil(y0-.5)),maxY=Math.min(b.sh-1,Math.ceil(y2-.5)-1);
    if(minY>maxY)return;
    const slope02=(x2-x0)/(y2-y0),slope01=y1===y0?0:(x1-x0)/(y1-y0),slope12=y2===y1?0:(x2-x1)/(y2-y1);
    stats.rasterizedTriangles++;
    for(let y=minY;y<=maxY;y++) {
      const sy=y+.5;
      const xa=x0+(sy-y0)*slope02,xb=sy<y1?x0+(sy-y0)*slope01:x1+(sy-y1)*slope12;
      const minX=Math.max(0,Math.ceil(Math.min(xa,xb)-.5-1e-9)),maxX=Math.min(b.sw-1,Math.ceil(Math.max(xa,xb)-.5-1e-9)-1);
      let z=zbase+(minX+.5)*dzdx+sy*dzdy,idx=y*b.sw+minX;
      for(let x=minX;x<=maxX;x++,idx++,z+=dzdx) {
        // The brighter-shade tie break is independent of body or triangle order.
        if(z>b.depth[idx]+1e-13 || (Math.abs(z-b.depth[idx])<=1e-13&&shade>b.shade[idx])) {b.depth[idx]=z;b.shade[idx]=shade;}
      }
    }
  }
  function render(ctx, bodies, options = {}) {
    if(!ctx||typeof ctx.createImageData!=='function'||typeof ctx.putImageData!=='function')throw new TypeError('Canvas2D context required');
    // All external input is validated before touching the context or buffers.
    const camera=cameraOptions(options),instances=validateBodies(bodies,camera),b=acquireBuffers(ctx,camera),aa=camera.antialias;
    const stats={bodies:instances.length,triangles:0,culledTriangles:0,clippedTriangles:0,rasterizedTriangles:0,width:camera.width,height:camera.height,antialias:aa};
    const fx=camera.focal*aa,cx=camera.center[0]*aa,cy=camera.center[1]*aa;
    const screen = p => [cx+p[0]*fx/p[2],cy-p[1]*fx/p[2],1/p[2]];
    for(const body of instances) {
      const mesh=meshFor(body.digit),m=body.matrix,v=mesh.v,world=new Float64Array(v.length),proj=new Float64Array(v.length),p=body.position;
      for(let i=0;i<v.length;i+=3) {
        const x=v[i]*body.scale,y=v[i+1]*body.scale,z=v[i+2]*body.thickness;
        const wx=m[0]*x+m[1]*y+m[2]*z+p[0]-camera.target[0],wy=m[3]*x+m[4]*y+m[5]*z+p[1]-camera.target[1];
        const depth=camera.cameraDistance-(m[6]*x+m[7]*y+m[8]*z+p[2]-camera.target[2]);
        world[i]=wx;world[i+1]=wy;world[i+2]=depth;
        if(depth>=camera.near && depth<=camera.far) {proj[i]=cx+wx*fx/depth;proj[i+1]=cy-wy*fx/depth;proj[i+2]=1/depth;}
      }
      for(let ti=0;ti<mesh.t.length;ti+=4) {
        stats.triangles++;
        const ia=3*mesh.t[ti],ib=3*mesh.t[ti+1],ic=3*mesh.t[ti+2],ni=(ti/4)*3;
        const nx=mesh.normals[ni],ny=mesh.normals[ni+1],nz=mesh.normals[ni+2];
        const n0=m[0]*nx+m[1]*ny+m[2]*nz,n1=m[3]*nx+m[4]*ny+m[5]*nz,n2=m[6]*nx+m[7]*ny+m[8]*nz;
        if(-n0*world[ia]-n1*world[ia+1]+n2*world[ia+2]<=0){stats.culledTriangles++;continue;}
        const lambert=Math.max(0,n0*camera.light[0]+n1*camera.light[1]+n2*camera.light[2]);
        const albedo=mesh.t[ti+3]===2?camera.sideAlbedo:1;
        const shade=Math.round(255*albedo*Math.min(1,camera.ambient+camera.diffuse*lambert));
        const da=world[ia+2],db=world[ib+2],dc=world[ic+2];
        if(da>=camera.near&&db>=camera.near&&dc>=camera.near&&da<=camera.far&&db<=camera.far&&dc<=camera.far) {
          rasterTriangle([proj[ia],proj[ia+1],proj[ia+2]],[proj[ib],proj[ib+1],proj[ib+2]],[proj[ic],proj[ic+1],proj[ic+2]],shade,b,stats);
        } else {
          stats.clippedTriangles++;
          let poly=[[world[ia],world[ia+1],da],[world[ib],world[ib+1],db],[world[ic],world[ic+1],dc]];
          poly=clipDepth(clipDepth(poly,camera.near,true),camera.far,false);
          for(let j=1;j+1<poly.length;j++)rasterTriangle(screen(poly[0]),screen(poly[j]),screen(poly[j+1]),shade,b,stats);
        }
      }
    }
    const out=b.image.data;
    let occupied=0;
    for(let y=0,i=0;y<camera.height;y++)for(let x=0;x<camera.width;x++,i+=4) {
      let value;
      const j=(y*aa)*b.sw+x*aa;
      if(aa===1)value=b.shade[j];else value=Math.round((b.shade[j]+b.shade[j+1]+b.shade[j+b.sw]+b.shade[j+b.sw+1])/4);
      out[i]=out[i+1]=out[i+2]=value;out[i+3]=255;if(value)occupied++;
    }
    stats.occupiedPixels=occupied;
    ctx.putImageData(b.image,0,0);
    return stats;
  }
  return Object.freeze({render,project,cameraOptions,containsDigit,quaternionFromEuler,matrixFromQuaternion,DEFAULTS,LIMITS,DATA});
});
