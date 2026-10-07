/* Independently authored deterministic clock motion. No third-party code or runtime dependencies.
 * Y-up, right-handed world; quaternion [x,y,z,w]. See motion-notes.md for approximation limits. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ClockMotion = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = '1.0.0';
  const DEFAULTS = Object.freeze({
    seed: 4262026, startTime: '12:39:42', fixedStep: 1 / 120,
    preRoll: 8, spawnPhase: -1.2, spawnInterval: 1,
    gravity: 1300, spawnY: 1200, capHeight: 210, bodyWidth: 140, thickness: 50,
    slotSpacing: 180, positionJitter: 2, depthJitter: 15, rotationJitter: 0.05, initialTiltX: 0, initialTiltZ: 0,
    mass: 300, restitution: 0.2, friction: 0.6, useGlyphBounds: true,
    platformWidth: 1000, platformDepth: 60, platformThickness: 20, platformY: -100,
    linearDamping: 0.035, angularDamping: 0.04, solverIterations: 10,
    removalY: -500, maxBodyAge: 24, maxBodies: 96,
    maxSeconds: 120, checkpointInterval: 1, maxCheckpoints: 24
  });
  // Bounds of this deliverable's independently licensed/modified OFL glyph meshes.
  // They are dimensions only, not the reference author's typography data.
  const GLYPH_BOUNDS = Object.freeze([[-0.3502944517, -0.5131720135, 0.3482161652, 0.5152517317], [-0.275390625, -0.5, 0.16796875, 0.5], [-0.3572236516, -0.4993069109, 0.3495996718, 0.5152533485], [-0.3756572408, -0.5152529681, 0.3551545579, 0.5152533319], [-0.3849472144, -0.4993069109, 0.3988089957, 0.5006930891], [-0.3651913702, -0.5131746141, 0.3669353139, 0.5006930891], [-0.3544547033, -0.5131784771, 0.3551516042, 0.5152519379], [-0.3454411373, -0.4993069109, 0.3440549592, 0.5006930891], [-0.3613915157, -0.5131736335, 0.3627771232, 0.5152525699], [-0.3572307377, -0.5131724562, 0.3537613329, 0.5152523749]].map(Object.freeze));
  const EPS = 1e-9, convenienceCache = new Map();
  const add = (a,b) => [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
  const sub = (a,b) => [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const mul = (a,s) => [a[0]*s,a[1]*s,a[2]*s];
  const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm = a => Math.sqrt(dot(a,a));
  const unit = a => { const d=norm(a); return d>EPS?mul(a,1/d):[1,0,0]; };
  const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
  function finite(x,name) { if(typeof x!=='number'||!Number.isFinite(x))throw new TypeError(name+' must be a finite number'); return x; }
  function range(x,name,a,b) { finite(x,name); if(x<a||x>b)throw new RangeError(name+' must be in ['+a+', '+b+']');return x; }
  function integer(x,name,a,b) { range(x,name,a,b);if(!Number.isInteger(x))throw new TypeError(name+' must be an integer');return x; }
  function parseTime(value) {
    if(typeof value==='number')return integer(value,'startTime',0,86399);
    if(typeof value!=='string'||!/^\d{2}:\d{2}:\d{2}$/.test(value))throw new TypeError('startTime must be HH:MM:SS or seconds since midnight');
    const n=value.split(':').map(Number);if(n[0]>23||n[1]>59||n[2]>59)throw new RangeError('Invalid clock time');return n[0]*3600+n[1]*60+n[2];
  }
  function clockText(seconds) {
    finite(seconds,'clock seconds');const s=((Math.floor(seconds)%86400)+86400)%86400;
    return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(x=>String(x).padStart(2,'0')).join('');
  }
  function seedNumber(seed) {
    if(typeof seed==='number')return integer(seed,'seed',0,4294967295)>>>0;
    if(typeof seed!=='string'||seed.length>128)throw new TypeError('seed must be uint32 or a string of at most 128 characters');
    let n=2166136261;for(let i=0;i<seed.length;i++)n=Math.imul(n^seed.charCodeAt(i),16777619);return n>>>0;
  }
  function randomFactory(seed) { let s=seed>>>0;return () => {s=(s+0x6D2B79F5)>>>0;let z=s;z=Math.imul(z^(z>>>15),z|1);z^=z+Math.imul(z^(z>>>7),z|61);return ((z^(z>>>14))>>>0)/4294967296;}; }
  function validate(input) {
    if(input===null||typeof input!=='object'||Array.isArray(input))throw new TypeError('options must be an object');
    Object.keys(input).forEach(k=>{if(!Object.prototype.hasOwnProperty.call(DEFAULTS,k))throw new TypeError('Unknown motion option: '+k);});
    const o=Object.assign({},DEFAULTS,input);if(typeof o.useGlyphBounds!=='boolean')throw new TypeError('useGlyphBounds must be boolean');o.seed=seedNumber(o.seed);o.startTime=parseTime(o.startTime);
    if(o.fixedStep!==1/120&&o.fixedStep!==1/60)throw new RangeError('fixedStep must be 1/120 or 1/60');
    integer(o.preRoll,'preRoll',0,30);range(o.spawnPhase,'spawnPhase',-3,0);
    if(o.spawnInterval!==1)throw new RangeError('spawnInterval is fixed at 1 second for this HHMMSS clock');
    const limits={gravity:[1,5000],spawnY:[200,3000],capHeight:[50,400],bodyWidth:[30,300],thickness:[10,150],slotSpacing:[60,350],positionJitter:[0,20],depthJitter:[0,60],rotationJitter:[0,0.3],initialTiltX:[-.3,.3],initialTiltZ:[-.3,.3],mass:[1,1000],restitution:[0,0.6],friction:[0,1.5],platformWidth:[200,2000],platformDepth:[10,300],platformThickness:[10,200],platformY:[-500,200],linearDamping:[0,2],angularDamping:[0,2],removalY:[-3000,-300],maxBodyAge:[4,120],maxSeconds:[1,600],checkpointInterval:[0.25,10]};
    Object.keys(limits).forEach(k=>range(o[k],k,...limits[k]));
    integer(o.solverIterations,'solverIterations',2,20);integer(o.maxBodies,'maxBodies',12,128);integer(o.maxCheckpoints,'maxCheckpoints',2,64);
    if(o.removalY>=o.platformY-o.platformThickness/2)throw new RangeError('removalY must be below the platform');
    return Object.freeze(o);
  }
  function qNormalize(q) {const d=Math.hypot(...q);return d>EPS?q.map(x=>x/d):[0,0,0,1];}
  function fromEuler(r) {const [x,y,z]=r.map(x=>x/2),sx=Math.sin(x),cx=Math.cos(x),sy=Math.sin(y),cy=Math.cos(y),sz=Math.sin(z),cz=Math.cos(z);return [sx*cy*cz-cx*sy*sz,cx*sy*cz+sx*cy*sz,cx*cy*sz-sx*sy*cz,cx*cy*cz+sx*sy*sz];}
  function axes(q) {const [x,y,z,w]=q;return [[1-2*(y*y+z*z),2*(x*y+w*z),2*(x*z-w*y)],[2*(x*y-w*z),1-2*(x*x+z*z),2*(y*z+w*x)],[2*(x*z+w*y),2*(y*z-w*x),1-2*(x*x+y*y)]];}
  function toEuler(q) {const a=axes(q),y=Math.asin(clamp(-a[0][2],-1,1));return Math.abs(a[0][2])<0.9999999?[Math.atan2(a[1][2],a[2][2]),y,Math.atan2(a[0][1],a[0][0])]:[Math.atan2(-a[2][1],a[1][1]),y,0];}
  function slerp(a,b,t) {let d=a.reduce((s,v,i)=>s+v*b[i],0),b1=b;if(d<0){b1=b.map(x=>-x);d=-d;}if(d>.9995)return qNormalize(a.map((v,i)=>v+(b1[i]-v)*t));const theta=Math.acos(clamp(d,-1,1)),s=Math.sin(theta),u=Math.sin((1-t)*theta)/s,v=Math.sin(t*theta)/s;return a.map((n,i)=>n*u+b1[i]*v);}
  function updateShape(b) {b.axes=axes(b.q);b.ext=[0,1,2].map(j=>Math.abs(b.axes[0][j])*b.h[0]+Math.abs(b.axes[1][j])*b.h[1]+Math.abs(b.axes[2][j])*b.h[2]);}
  function body(id,digit,row,slot,p,q,o,fixed) {
    const bounds=!fixed&&o.useGlyphBounds?GLYPH_BOUNDS[Number(digit)]:null;
    const h=fixed?[o.platformWidth/2,o.platformThickness/2,o.platformDepth/2]:bounds?[(bounds[2]-bounds[0])*o.capHeight*o.bodyWidth/280,(bounds[3]-bounds[1])*o.capHeight/2,o.thickness/2]:[o.bodyWidth/2,o.capHeight/2,o.thickness/2];
    const offset=bounds?[(bounds[0]+bounds[2])*o.capHeight*o.bodyWidth/280,(bounds[1]+bounds[3])*o.capHeight/2,0]:[0,0,0];
    const m=fixed?0:1/o.mass;
    const b={id,digit,row,slot,p:p.slice(),q:q.slice(),v:[0,0,0],w:[0,0,0],h,offset,im:m,ii:fixed?[0,0,0]:[3*m/(h[1]*h[1]+h[2]*h[2]),3*m/(h[0]*h[0]+h[2]*h[2]),3*m/(h[0]*h[0]+h[1]*h[1])],bornAt:row+o.spawnPhase};updateShape(b);return b;
  }
  function cloneBody(b) {const c=Object.assign({},b);['p','q','v','w','h','offset','ii','ext'].forEach(k=>c[k]=b[k].slice());c.axes=b.axes.map(x=>x.slice());return c;}
  function inverseInertia(b,v) {let r=[0,0,0];for(let i=0;i<3;i++)r=add(r,mul(b.axes[i],dot(v,b.axes[i])*b.ii[i]));return r;}
  function applyImpulse(b,r,j) {if(!b.im)return;b.v=add(b.v,mul(j,b.im));b.w=add(b.w,inverseInertia(b,cross(r,j)));}
  function support(b,n) {let p=b.p.slice();for(let i=0;i<3;i++)p=add(p,mul(b.axes[i],(dot(b.axes[i],n)>=0?1:-1)*b.h[i]));return p;}
  function radius(b,n) {return b.h[0]*Math.abs(dot(b.axes[0],n))+b.h[1]*Math.abs(dot(b.axes[1],n))+b.h[2]*Math.abs(dot(b.axes[2],n));}
  function clip(poly,n,d) {
    const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=dot(n,a)-d,db=dot(n,b)-d;if(da<=1e-7)out.push(a);if((da<0)!==(db<0))out.push(add(a,mul(sub(b,a),da/(da-db))));}return out;
  }
  function faceContacts(ref,inc,refIndex,n,depth) {
    const face=add(ref.p,mul(n,ref.h[refIndex]));let incident=0,best=-1;
    for(let i=0;i<3;i++){const d=Math.abs(dot(inc.axes[i],n));if(d>best){best=d;incident=i;}}
    const sign=dot(inc.axes[incident],n)>0?-1:1,center=add(inc.p,mul(inc.axes[incident],sign*inc.h[incident]));
    const other=[0,1,2].filter(i=>i!==incident),u=mul(inc.axes[other[0]],inc.h[other[0]]),v=mul(inc.axes[other[1]],inc.h[other[1]]);
    let poly=[add(add(center,u),v),add(sub(center,u),v),sub(sub(center,u),v),add(sub(center,v),u)];
    for(let i=0;i<3;i++)if(i!==refIndex){const axis=ref.axes[i],d=dot(axis,ref.p);poly=clip(poly,axis,d+ref.h[i]);if(!poly.length)break;poly=clip(poly,mul(axis,-1),-d+ref.h[i]);}
    const result=[];for(const p of poly){const separation=dot(n,sub(p,face));if(separation<=0.8)result.push({p:sub(p,mul(n,separation*.5)),depth:Math.max(0,-separation)});}
    // Clipping a quadrilateral can produce more points. Four extrema retain a bounded manifold.
    if(result.length>4){const selected=[result[0]];while(selected.length<4){let candidate=null,score=-1;for(const c of result){if(selected.includes(c))continue;const s=Math.min(...selected.map(a=>dot(sub(a.p,c.p),sub(a.p,c.p))));if(s>score){score=s;candidate=c;}}selected.push(candidate);}return selected;}
    if(!result.length)return [{p:mul(add(support(ref,n),support(inc,mul(n,-1))),.5),depth}];return result;
  }
  function nearestSegments(p1,q1,p2,q2) {
    const d1=sub(q1,p1),d2=sub(q2,p2),r=sub(p1,p2),a=dot(d1,d1),e=dot(d2,d2),b=dot(d1,d2),c=dot(d1,r),f=dot(d2,r),den=a*e-b*b;
    let s=den>EPS?clamp((b*f-c*e)/den,0,1):0,t=(b*s+f)/e;
    if(t<0){t=0;s=clamp(-c/a,0,1);}else if(t>1){t=1;s=clamp((b-c)/a,0,1);}return mul(add(add(p1,mul(d1,s)),add(p2,mul(d2,t))),.5);
  }
  function edge(b,axis,n) {let c=b.p.slice();for(let i=0;i<3;i++)if(i!==axis)c=add(c,mul(b.axes[i],(dot(b.axes[i],n)>=0?1:-1)*b.h[i]));const d=mul(b.axes[axis],b.h[axis]);return [sub(c,d),add(c,d)];}
  function collide(a,b) {
    const delta=sub(b.p,a.p);for(let k=0;k<3;k++)if(Math.abs(delta[k])>a.ext[k]+b.ext[k]+0.01)return null;
    let min=Infinity,n=null,type=0,ia=0,ib=0;
    function test(axis,kind,i,j){const len=norm(axis);if(len<1e-7)return true;axis=mul(axis,1/len);const d=dot(delta,axis),overlap=radius(a,axis)+radius(b,axis)-Math.abs(d);if(overlap<0)return false;const score=overlap*(kind===2?1.035:1);if(score<min){min=score;n=mul(axis,d>=0?1:-1);type=kind;ia=i;ib=j;}return true;}
    for(let i=0;i<3;i++)if(!test(a.axes[i],0,i,0))return null;
    for(let i=0;i<3;i++)if(!test(b.axes[i],1,i,0))return null;
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(!test(cross(a.axes[i],b.axes[j]),2,i,j))return null;
    let points;if(type===0)points=faceContacts(a,b,ia,n,min);else if(type===1)points=faceContacts(b,a,ia,mul(n,-1),min);else {const e1=edge(a,ia,n),e2=edge(b,ib,mul(n,-1));points=[{p:nearestSegments(...e1,...e2),depth:min/1.035}];}
    return {a,b,n,points,depth:min/(type===2?1.035:1)};
  }
  function velocityAt(b,r) {return add(b.v,cross(b.w,r));}
  function effectiveMass(a,b,ra,rb,n) {return a.im+b.im+dot(n,add(cross(inverseInertia(a,cross(ra,n)),ra),cross(inverseInertia(b,cross(rb,n)),rb)));}
  function prepare(c,o) {
    const ref=Math.abs(c.n[0])<.6?[1,0,0]:[0,1,0];c.t1=unit(cross(c.n,ref));c.t2=cross(c.n,c.t1);
    for(const p of c.points){p.ra=sub(p.p,c.a.p);p.rb=sub(p.p,c.b.p);p.mass=1/effectiveMass(c.a,c.b,p.ra,p.rb,c.n);p.tm1=1/effectiveMass(c.a,c.b,p.ra,p.rb,c.t1);p.tm2=1/effectiveMass(c.a,c.b,p.ra,p.rb,c.t2);p.jn=0;p.j1=0;p.j2=0;
      const vn=dot(sub(velocityAt(c.b,p.rb),velocityAt(c.a,p.ra)),c.n);p.target=vn<-65?-Math.min(c.a.im&&c.b.im?o.restitution:.1,o.restitution)*vn:0;}
  }
  function impulsePair(c,p,j) {applyImpulse(c.a,p.ra,mul(j,-1));applyImpulse(c.b,p.rb,j);}
  function solve(c,o) {
    for(const p of c.points){let relative=sub(velocityAt(c.b,p.rb),velocityAt(c.a,p.ra));const j=(p.target-dot(relative,c.n))*p.mass,old=p.jn;p.jn=Math.max(0,old+j);impulsePair(c,p,mul(c.n,p.jn-old));
      relative=sub(velocityAt(c.b,p.rb),velocityAt(c.a,p.ra));let j1=p.j1-dot(relative,c.t1)*p.tm1,j2=p.j2-dot(relative,c.t2)*p.tm2;const l=Math.hypot(j1,j2),limit=o.friction*p.jn;if(l>limit&&l>EPS){j1*=limit/l;j2*=limit/l;}impulsePair(c,p,add(mul(c.t1,j1-p.j1),mul(c.t2,j2-p.j2)));p.j1=j1;p.j2=j2;}
  }
  function integrate(b,dt,o) {
    b.v[1]-=o.gravity*dt;b.v=mul(b.v,Math.exp(-o.linearDamping*dt));b.w=mul(b.w,Math.exp(-o.angularDamping*dt));
    const speed=norm(b.v),spin=norm(b.w);if(speed>5000)b.v=mul(b.v,5000/speed);if(spin>25)b.w=mul(b.w,25/spin);
    b.p=add(b.p,mul(b.v,dt));const [x,y,z,w]=b.q,[wx,wy,wz]=b.w,h=.5*dt;
    b.q=qNormalize([x+h*(wx*w+wy*z-wz*y),y+h*(-wx*z+wy*w+wz*x),z+h*(wx*y-wy*x+wz*w),w-h*(wx*x+wy*y+wz*z)]);updateShape(b);
  }
  function createSimulation(input={}) {
    const o=validate(input),hz=Math.round(1/o.fixedStep),platform=body(-1,'',0,0,[0,o.platformY,0],[0,0,0,1],o,true),checkpoints=new Map();
    const interval=Math.max(1,Math.round(o.checkpointInterval*hz));let cacheHits=0,simulatedSteps=0,resets=0;
    function initial(){return {step:0,bodies:[],nextRow:-o.preRoll,spawned:0,removed:0,contacts:0};}
    let world=initial();
    const simTime=w=>w.step/hz-o.preRoll+o.spawnPhase;
    function snapshot(w){return {step:w.step,bodies:w.bodies.map(cloneBody),nextRow:w.nextRow,spawned:w.spawned,removed:w.removed,contacts:w.contacts};}
    function spawn(w,row) {
      const rnd=randomFactory((o.seed^Math.imul(row+1048576,0x9e3779b1))>>>0),digits=clockText(o.startTime+row);
      for(let slot=0;slot<6;slot++){
        const p=[(slot-2.5)*o.slotSpacing+(rnd()*2-1)*o.positionJitter,o.spawnY,(rnd()*2-1)*o.depthJitter],r=[0,1,2].map(()=> (rnd()*2-1)*o.rotationJitter);
        r[0]+=o.initialTiltX;r[2]+=o.initialTiltZ;
        const b=body(row*6+slot,digits[slot],row,slot,p,fromEuler(r),o,false);w.bodies.push(b);w.spawned++;
      }
    }
    function births(w,t){while(w.nextRow+o.spawnPhase<=t+1e-10){spawn(w,w.nextRow++);}if(w.bodies.length>o.maxBodies){const n=w.bodies.length-o.maxBodies;w.bodies.splice(0,n);w.removed+=n;}}
    births(world,simTime(world));checkpoints.set(0,snapshot(world));
    function step(w) {
      const dt=o.fixedStep;
      for(const b of w.bodies)integrate(b,dt,o);
      const collisions=[];
      // Stable id ordering is intentionally independent of rendering and query order.
      for(let i=0;i<w.bodies.length;i++){const a=w.bodies[i],p=collide(platform,a);if(p)collisions.push(p);for(let j=i+1;j<w.bodies.length;j++){const c=collide(a,w.bodies[j]);if(c)collisions.push(c);}}
      for(const c of collisions)prepare(c,o);
      for(let iter=0;iter<o.solverIterations;iter++){if(iter%2===0){for(const c of collisions)solve(c,o);}else{for(let k=collisions.length-1;k>=0;k--)solve(collisions[k],o);}}
      // Translation-only split position correction avoids turning overlap into artificial kinetic energy.
      for(const c of collisions){const inv=c.a.im+c.b.im,amount=Math.min(12,Math.max(0,c.depth-.25)*.45),p=mul(c.n,amount/inv);if(c.a.im)c.a.p=sub(c.a.p,mul(p,c.a.im));if(c.b.im)c.b.p=add(c.b.p,mul(p,c.b.im));}
      w.contacts+=collisions.length;w.step++;const t=simTime(w);
      const old=w.bodies.length;w.bodies=w.bodies.filter(b=>b.p[1]>o.removalY&&Math.abs(b.p[0])<2200&&Math.abs(b.p[2])<1100&&t-b.bornAt<o.maxBodyAge);w.removed+=old-w.bodies.length;
      births(w,t);simulatedSteps++;
      if(w.step%interval===0){checkpoints.set(w.step,snapshot(w));while(checkpoints.size>o.maxCheckpoints){const first=[...checkpoints.keys()].find(k=>k!==0);checkpoints.delete(first);}}
    }
    function advance(target) {
      if(world.step>target){let chosen=0;for(const k of checkpoints.keys())if(k<=target&&k>chosen)chosen=k;world=snapshot(checkpoints.get(chosen));cacheHits++;resets++;}
      else {let chosen=world.step;for(const k of checkpoints.keys())if(k<=target&&k>chosen)chosen=k;if(chosen>world.step){world=snapshot(checkpoints.get(chosen));cacheHits++;}}
      while(world.step<target)step(world);
    }
    function stateAt(seconds) {
      range(seconds,'seconds',0,o.maxSeconds);
      const exact=(seconds+o.preRoll-o.spawnPhase)*hz,lo=Math.floor(exact+1e-8),alpha=clamp(exact-lo,0,1);advance(lo);
      const lower=snapshot(world);if(alpha>1e-8)advance(lo+1);const upper=world,byId=new Map(upper.bodies.map(b=>[b.id,b]));
      const bodies=lower.bodies.map(a=>{const b=byId.get(a.id)||a,p=a.p.map((x,i)=>x+(b.p[i]-x)*alpha),q=alpha>1e-8?slerp(a.q,b.q,alpha):a.q.slice();return {id:a.id,digit:a.digit,row:a.row,slot:a.slot,bornAt:a.bornAt,age:seconds-a.bornAt,position:sub(p,axes(q).reduce((sum,axis,i)=>add(sum,mul(axis,a.offset[i])),[0,0,0])),physicsPosition:p,quaternion:q,rotation:toEuler(q),velocity:a.v.map((x,i)=>x+(b.v[i]-x)*alpha),angularVelocity:a.w.map((x,i)=>x+(b.w[i]-x)*alpha),scale:o.capHeight,thickness:o.thickness,depth:o.thickness/o.capHeight,collider:a.h.map(x=>x*2),colliderLocalCenter:a.offset.slice()};});
      const text=clockText(o.startTime+seconds),row=Math.floor(seconds-o.spawnPhase+1e-9);
      return {time:seconds,text,clock:{text,hours:Number(text.slice(0,2)),minutes:Number(text.slice(2,4)),seconds:Number(text.slice(4,6)),spawnedText:clockText(o.startTime+row),latestRow:row},bodies,platform:{position:[0,o.platformY,0],dimensions:[o.platformWidth,o.platformThickness,o.platformDepth],visible:false},stats:{bodyCount:bodies.length,spawned:lower.spawned,removed:lower.removed,contactPairsSolved:lower.contacts,fixedStep:o.fixedStep},parameters:o};
    }
    return Object.freeze({stateAt,options:o,cacheInfo:()=>({checkpoints:checkpoints.size,maxCheckpoints:o.maxCheckpoints,simulatedSteps,cacheHits,resets,retainedBodies:world.bodies.length}),reset:()=>{world=initial();births(world,simTime(world));checkpoints.clear();checkpoints.set(0,snapshot(world));}});
  }
  function stateAt(seconds,options={}) {
    const normalized=validate(options),key=JSON.stringify(normalized);let sim=convenienceCache.get(key);
    if(!sim){sim=createSimulation(normalized);if(convenienceCache.size>=4)convenienceCache.delete(convenienceCache.keys().next().value);convenienceCache.set(key,sim);}return sim.stateAt(seconds);
  }
  return Object.freeze({VERSION,DEFAULTS,stateAt,createSimulation,clockText,clearCache:()=>convenienceCache.clear(),cacheInfo:()=>({simulations:convenienceCache.size,maximum:4})});
});
