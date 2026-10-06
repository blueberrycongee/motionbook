from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json,csv,hashlib
p=Path(__file__).resolve().parent.parent;pts=json.loads((p/'evidence/native-timestamps.json').read_text())['frames'];rows=[];pages=p/'reference/comparison-pages';pages.mkdir(exist_ok=True)
for i,f in enumerate(pts):
 src=Image.open(p/f'reference/frames/{i+1:04}.png').convert('RGB');out=Image.open(p/f'evidence/replica-native/{i:04}.png').convert('RGB');a=np.asarray(src).astype(float);b=np.asarray(out).astype(float);err=np.abs(a-b)
 def blue_left(v):
  m=(v[310:410,:,2]>160)&(v[310:410,:,0]<60)&(v[310:410,:,1]<165);ys,xs=np.where(m);return int(xs.min()) if len(xs) else -1
 rows.append({'frame':i,'pts_seconds':float(f['best_effort_timestamp_time']),'mae_whole_0_255':float(err.mean()),'mae_button_roi_0_255':float(err[285:435,140:585].mean()),'blue_left_error_px':blue_left(b)-blue_left(a),'source_png_sha256':hashlib.sha256((p/f'reference/frames/{i+1:04}.png').read_bytes()).hexdigest(),'replica_png_sha256':hashlib.sha256((p/f'evidence/replica-native/{i:04}.png').read_bytes()).hexdigest()})
 if i%32==0:sheet=Image.new('RGB',(1440,1200),'#ddd');d=ImageDraw.Draw(sheet)
 tile=i%32;x=tile%4*360;y=tile//4*150;sheet.paste(src.crop((140,280,580,440)).resize((360,131)),(x,y+19));sheet.paste(out.crop((140,280,580,440)).resize((360,131)),(x,y+19)) if False else None
 # Full-sequence source and replica contact sheets stay local and are excluded from packages.
 if tile==31 or i==len(pts)-1:sheet.save(pages/f'source-{i//32:02}.jpg')
with (p/'evidence/native-frame-comparison.csv').open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=rows[0]);w.writeheader();w.writerows(rows)
summary={'reference_frames':len(pts),'compared_frames':len(rows),'native_pts_first':rows[0]['pts_seconds'],'native_pts_last':rows[-1]['pts_seconds'],'comparison_type':'Every original native frame compared with independently rendered SVG at its exact timestamp; full pixel MAE and button-only ROI MAE. Not browser validation.','whole_frame_mae_mean':float(np.mean([r['mae_whole_0_255'] for r in rows])),'button_roi_mae_mean':float(np.mean([r['mae_button_roi_0_255'] for r in rows])),'button_roi_mae_p95':float(np.percentile([r['mae_button_roi_0_255'] for r in rows],95)),'blue_left_abs_error_median_px':float(np.median([abs(r['blue_left_error_px']) for r in rows])),'blue_left_abs_error_p95_px':float(np.percentile([abs(r['blue_left_error_px']) for r in rows],95)),'limitations':['Rounded font is the open-source Nunito substitute, not the proprietary reference font.','Blue internal shading and cursor outline are independent approximations.','Offline renderer and controller unit tests are verified. Browser interaction has not been validated.','User preview acceptance is pending.']}
(p/'evidence/comparison-summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
