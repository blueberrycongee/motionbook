"""Independent source-derived numeric check, isolated from frozen replica modules.
Does not import the renderer or production math. No user task sessions or app launch.
"""
import json, math, hashlib, gzip, base64
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
HERE=ROOT/"docs"/"verification"
HERE.mkdir(parents=True,exist_ok=True)
FPS=60
DT=1/FPS
SIZE=(240,150)
HOST=(46,214,1188,478)
ANCHORS=[{'alignment':3,'point':(70,668)},{'alignment':2,'point':(1210,668)},{'alignment':0,'point':(70,238)},{'alignment':1,'point':(1210,238)}]
START=(1210,668)
RELEASE=(760,492)
POINTER_OFFSET=(-120,-75)

def add(a,b):return tuple(x+y for x,y in zip(a,b))
def sub(a,b):return tuple(x-y for x,y in zip(a,b))
def mul(a,k):return tuple(x*k for x in a)
def norm(a):return math.hypot(*a)
def lerp(a,b,t):return add(a,mul(sub(b,a),t))
def offset(alignment,index):
    x=28*index if alignment in (0,3) else -SIZE[0]-28*index if alignment in (1,2) else -SIZE[0]/2
    y=22*index if alignment in (0,1,4) else -SIZE[1]-22*index
    return x,y

def spring(index,dragging):
    if index==0:return (900,55) if dragging else (320,42)
    return ((260 if dragging else 150)/(1+.18*index),(32 if dragging else 30)/(1+.08*index))

def seed_velocity(filtered,index):
    return (0,0) if norm(filtered)<120 else mul(filtered,.25/(1+.45*index))

def choose(current,velocity):
    scaled=mul(velocity,.55)
    speed=norm(scaled)
    time=min(.45,max(.18,.18+speed/5000))
    projected=add(current,mul(scaled,time))
    scores=[]
    for a in ANCHORS:
        delta=sub(a['point'],current)
        direction=max(0,sum(x*y for x,y in zip(delta,scaled))/(norm(delta)*speed)) if norm(delta) and speed else 0
        score=norm(sub(a['point'],projected))-.12*speed*direction
        scores.append({'alignment':a['alignment'],'score':score})
    best=min(range(4),key=lambda i:scores[i]['score'])
    return ANCHORS[best],projected,time,scores

def simulate(kind):
    start=.7
    release=start+(2.2 if kind=='slow' else 1.4)
    positions=[add(START,offset(2,i)) for i in range(3)]
    velocities=[(0.,0.) for _ in positions]
    raw=(0.,0.)
    last_pointer=add(START,POINTER_OFFSET)
    last_time=start
    alignment=2
    anchor=START
    chosen=None
    settled_at=None
    running=False
    snapshots=[]
    release_report=None
    for frame in range(391):
        t=frame/FPS
        held=start-1e-9<=t<=release+1e-9
        if held:
            elapsed=max(0,t-start)
            if kind=='slow':anchor=lerp(START,RELEASE,min(1,elapsed/2.2))
            else:anchor=lerp(START,(1100,612),elapsed/1.2) if elapsed<=1.2 else lerp((1100,612),RELEASE,min(1,(elapsed-1.2)/.2))
            pointer=add(anchor,POINTER_OFFSET)
            dt=max(t-last_time,1/240)
            raw=add(mul(raw,.72),mul(sub(pointer,last_pointer),.28/dt))
            last_pointer,last_time=pointer,t
            running=True
        if chosen is None and t>=release-1e-9:
            held=False
            current=mul(tuple(sum(positions[i][axis]-offset(alignment,i)[axis] for i in range(3)) for axis in range(2)),1/3)
            chosen,projection,projection_time,scores=choose(current,raw)
            velocities=[seed_velocity(raw,i) for i in range(3)]
            release_report={'time':t,'pointer':list(last_pointer),'commandedAnchor':list(anchor),'sourceMeanAnchor':list(current),'filteredVelocity':list(raw),'speed':norm(raw),'projected':list(projection),'projectionTime':projection_time,'chosen':chosen,'scores':scores,'injectedVelocities':velocities.copy(),'oldOrigins':positions.copy()}
            alignment=chosen['alignment']
            anchor=chosen['point']
        if running:
            all_settled=True
            for i in range(3):
                target=add(anchor,offset(alignment,i))
                error=sub(target,positions[i])
                k,c=spring(i,held)
                velocities[i]=add(velocities[i],mul(sub(mul(error,k),mul(velocities[i],c)),DT))
                positions[i]=add(positions[i],mul(velocities[i],DT))
                all_settled &= norm(error)<=.5 and norm(velocities[i])<=2
            if chosen and all_settled:
                running=False
                if settled_at is None:settled_at=t
        snapshots.append({'frame':frame,'time':t,'positions':positions.copy(),'velocities':velocities.copy(),'running':running})
    return {'kind':kind,'release':release_report,'settledAt':settled_at,'settleSeconds':settled_at-release,'finalTargets':[add(anchor,offset(alignment,i)) for i in range(3)],'finalOrigins':positions,'finalVelocities':velocities,'snapshots':snapshots}

slow,fast=simulate('slow'),simulate('fast')
assert slow['release']['chosen']['alignment']==2
assert fast['release']['chosen']['alignment']==0
assert all(abs(a-b)<1e-9 for a,b in zip(slow['release']['pointer'],fast['release']['pointer']))
assert seed_velocity((119.999,0),2)==(0,0)
assert seed_velocity((120,0),0)==(30,0)
assert math.isclose(seed_velocity((120,0),1)[0],30/1.45)
assert math.isclose(seed_velocity((120,0),2)[0],30/1.9)
assert all(abs(x)>0 for x in fast['finalVelocities'][0])
source_paths=['src/stack-behavior.mjs','test/fixtures/snap-reference-vector.json','native/PiPReplica.swift']
result={
 'validation':'PASS: independent source-derived Python recurrence and release rules',
 'simulationHz':60,
 'sourceEvidence':{
   'endDrag':'0x1eff0..0x1f070: choose from currentStackAnchorOrDefault before promotion; then moveStackToAnchor with interaction velocity',
   'currentAnchor':'0x24630..0x24658 plus 0x246a4..0x246b4: average(origin-restOffset) of initialized contributing items',
   'releaseSpringMode':'0x2088c mov w3,#0 and 0x20890 mov w4,#0: dragging=false, programmaticMove=false',
   'releaseVelocity':'0x208c0..0x208dc: zero if raw speed<120, else 0.25*raw; 0x209a0..0x209d0: follower denominator 1 + 0.45*distance to lead; overwrite, not add',
   'reindex':'0x1f050..0x1f070 promotes chosen item before move; 0x20820 updates restOffsets; initialized origins are not teleported',
   'heldTarget':'0x23570..0x235fc: currentPointer-grabOffset-lead.restOffset; movement threshold is not applied here',
   'integration':'source semi-implicit Euler, error uses pre-step origin, settling tests pre-step error and post-step velocity; 60 Hz within 1/120..1/30 clamp'
 },
 'scope':'Offline simulation of three initialized layout-contributing items, same-host release, front item already lead. No app recording or macOS runtime parity claim.',
 'frozenReplicaCaveats':['Resolved in v4: v3 seeded full raw velocity; current implementation uses thresholded25% and follower attenuation.','Resolved in v4: current release chooses using mean rendered origins minus rest offsets.','Resolved in v4: held target tracks below4pt; click classification remains separate.'],
 'frozenFileSHA256':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in source_paths if (ROOT/p).exists()},
 'slow':slow,'fast':fast,
}
(HERE/'independent-verification.json').write_text(json.dumps(result,indent=2)+'\n')
for case in (slow,fast):
    print(json.dumps({k:v for k,v in case.items() if k!='snapshots'},indent=2))

# Compare all simulation frames against independently implemented recurrence.
trace_path=ROOT/'artifacts/snapping/trajectory-trace.json'
packed_trace=trace_path.with_suffix('.json.gz.b64')
if trace_path.exists() or packed_trace.exists():
    trace_bytes=trace_path.read_bytes() if trace_path.exists() else gzip.decompress(base64.b64decode(packed_trace.read_text()))
    trace=json.loads(trace_bytes)
    max_position_error=max_velocity_error=max_release_error=0.
    frames_checked=0
    for name,expected in [('slow',slow),('fast',fast)]:
        actual=trace[name]
        assert len(actual['history'])==len(expected['snapshots'])==391
        assert abs(actual['settledAt']-expected['settledAt'])<1e-12
        for act,ex in zip(actual['history'],expected['snapshots']):
            assert act['running']==ex['running']
            for i,item in enumerate(act['items']):
                max_position_error=max(max_position_error,*(abs(item['position'][axis]-ex['positions'][i][j]) for j,axis in enumerate(('x','y'))))
                max_velocity_error=max(max_velocity_error,*(abs(item['velocity'][axis]-ex['velocities'][i][j]) for j,axis in enumerate(('x','y'))))
            frames_checked+=1
        rs=actual['releaseState']
        er=expected['release']
        for ak,ek in [('anchor','sourceMeanAnchor'),('commandedAnchor','commandedAnchor'),('pointer','pointer'),('velocity','filteredVelocity'),('projection','projected')]:
            max_release_error=max(max_release_error,*(abs(rs[ak][axis]-er[ek][j]) for j,axis in enumerate(('x','y'))))
        for i,vel in enumerate(rs['injectedVelocities']):
            max_release_error=max(max_release_error,*(abs(vel[axis]-er['injectedVelocities'][i][j]) for j,axis in enumerate(('x','y'))))
        assert rs['target']['alignment']==er['chosen']['alignment']
    assert max_position_error<1e-9 and max_velocity_error<1e-9 and max_release_error<1e-9
    result['rendererTraceComparison']={'status':'PASS','framesChecked':frames_checked,'itemsPerFrame':3,'positionAndVelocityAxesChecked':frames_checked*3*4,'maxPositionError':max_position_error,'maxVelocityError':max_velocity_error,'maxReleaseError':max_release_error,'tolerance':1e-9,'traceSHA256':hashlib.sha256(trace_bytes).hexdigest(),'rendererSHA256':hashlib.sha256((ROOT/'artifacts/snapping/render-snapping.mjs').read_bytes()).hexdigest()}
    (HERE/'independent-verification.json').write_text(json.dumps(result,indent=2)+'\n')
    summary={
        'status':'PASS',
        'checks':result['rendererTraceComparison'],
        'scenarios':{name:{'samePointerRelease':[640,417],'target':case['release']['chosen'],'filteredReleaseSpeed':case['release']['speed'],'settleSeconds':case['settleSeconds']} for name,case in [('slow',slow),('fast',fast)]},
        'v3Caveats':result['frozenReplicaCaveats'],
        'limits':['Static recovered source plus independently simulated 60 Hz scripted input, not a running macOS recording.','No pixel parity, live panel/compositor, private transport, cross-host selection, rear-item promotion, resize, or variable refresh-rate runtime validation.','Video/GIF pixel encoding not reviewed by this numeric check.'],
        'sourceEvidence':result['sourceEvidence'],
        'frozenFileSHA256':result['frozenFileSHA256'],
    }
    (HERE/'independent-verification-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    print(json.dumps(summary,indent=2))
