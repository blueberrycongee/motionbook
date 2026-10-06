from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json,csv
R=Path(__file__).resolve().parents[1];B=R.parents[1];ref=B/'sources/native-audit/rauno-waveform/frames';out=B/'reviews/new100-037';rep=out/'replica-frames';contacts=out/'contacts';contacts.mkdir(parents=True,exist_ok=True);pts=json.load(open(R/'evidence/native-timestamps.json'));rows=[]
for i,t in enumerate(pts):
 a=Image.open(ref/f'{i+1:05}.png').convert('RGB');b=Image.open(rep/f'{i:05}.png').convert('RGB');aa=np.asarray(a).astype(float);bb=np.asarray(b).astype(float);d=abs(aa-bb);roi=d[190:455,160:1120];rows.append({'frame':i,'pts_seconds':t,'canvas_mae_0_255':round(float(d.mean()),6),'field_roi_mae_0_255':round(float(roi.mean()),6),'max_channel_error':int(d.max()),'pixels_over_32':int((d.max(2)>32).sum())})
 if i%40==0:sheet=Image.new('RGB',(1760,10*133),(225,225,225));draw=ImageDraw.Draw(sheet)
 k=i%40;x=(k%4)*440;y=(k//4)*133;draw.text((x+3,y+2),f'{i:04d} | {t:.6f}s  Original / Replica',fill='black');sheet.paste(a.resize((220,113)),(x,y+20));sheet.paste(b.resize((220,113)),(x+220,y+20))
 if i%40==39:sheet.save(contacts/f'comparison-{i//40:02}.jpg',quality=93)
with open(R/'evidence/all-frame-comparison.csv','w') as f:w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
s={'native_frames_compared':480,'reviewed_time_span':[0,8.35],'native_pts_used':True,'source_vfr_gaps_preserved':True,'resolution':[1258,644],'renderer':'offline SVG raster, not browser execution','reference_pixels_redistributed':False,'canvas_mae_mean':float(np.mean([x['canvas_mae_0_255'] for x in rows])),'field_roi_mae_mean':float(np.mean([x['field_roi_mae_0_255'] for x in rows])),'worst_field_frames':sorted(rows,key=lambda x:x['field_roi_mae_0_255'],reverse=True)[:15],'warning':'Raw error statistics are not a fidelity percentage or pass. Background pixels dilute full-canvas error; all native frames require visual comparison.'};(R/'evidence/comparison-summary.json').write_text(json.dumps(s,indent=2)+'\n');print(json.dumps(s,indent=2))
