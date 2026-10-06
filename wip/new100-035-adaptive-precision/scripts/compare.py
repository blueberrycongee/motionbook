"""Full-native-frame diagnostics; reference-containing contacts stay outside the deliverable."""
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json,csv,sys
R=Path(__file__).resolve().parents[1];BASE=R.parents[1];ref=BASE/'sources/native-audit/rauno-adaptive-precision-5/frames';out=BASE/'reviews/new100-035';rep=out/'replica-frames';(out/'contacts').mkdir(parents=True,exist_ok=True)
pts=json.load(open(R/'evidence/native-timestamps.json'));rows=[];sheet=None
for i,t in enumerate(pts):
 a=Image.open(ref/f'{i+1:05}.png').convert('RGB');b=Image.open(rep/f'{i:05}.png').convert('RGB');aa=np.asarray(a).astype(float);bb=np.asarray(b).astype(float);diff=np.abs(aa-bb);roi=diff[95:735,285:1210]
 rows.append({'frame':i,'pts_seconds':t,'canvas_mae_0_255':round(float(diff.mean()),6),'content_roi_mae_0_255':round(float(roi.mean()),6),'max_channel_error':int(diff.max()),'pixels_over_32':int((diff.max(axis=2)>32).sum())})
 if i%40==0:sheet=Image.new('RGB',(1760,10*156),(225,225,225));draw=ImageDraw.Draw(sheet)
 k=i%40;x=(k%4)*440;y=(k//4)*156;draw.text((x+3,y+2),f'{i:04d} | {t:.6f}s  Original / Replica',fill='black');sheet.paste(a.resize((220,136)),(x,y+20));sheet.paste(b.resize((220,136)),(x+220,y+20))
 if i%40==39 or i==len(pts)-1:sheet.save(out/'contacts'/f'comparison-{i//40:02}.jpg',quality=91)
with open(R/'evidence/all-frame-comparison.csv','w') as f:w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
summary={'frames_compared':len(rows),'coverage':[0,len(rows)-1],'native_pts_used':True,'resolution':[1318,812],'reference_pixels_redistributed':False,'renderer':'offline SVG raster via sharp/librsvg; not browser execution','metric_warning':'Raw error diagnostics are not a fidelity percentage or pass gate. Background pixels dilute whole-canvas error. Contact sheets require visual review.','canvas_mae_mean':float(np.mean([x['canvas_mae_0_255'] for x in rows])),'roi_mae_mean':float(np.mean([x['content_roi_mae_0_255'] for x in rows])),'worst_roi_frames':sorted(rows,key=lambda x:x['content_roi_mae_0_255'],reverse=True)[:15]}
(R/'evidence/comparison-summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
