from PIL import Image,ImageChops,ImageDraw
import numpy as np,json,subprocess,hashlib
from pathlib import Path
R=Path(__file__).resolve().parents[1];out=R/'preview';reports={}
for name,expected in [('jitter.gif',4500)]:
 im=Image.open(out/name);frames=[];durations=[]
 for n in range(im.n_frames):
  im.seek(n);frames.append(im.convert('RGB').copy());durations.append(im.info.get('duration',0))
 hashes=[hashlib.sha256(i.tobytes()).hexdigest() for i in frames]
 report={'decoded_frames':len(frames),'dimensions':frames[0].size,'duration_ms':sum(durations),'min_frame_delay_ms':min(durations),'max_frame_delay_ms':max(durations),'unique_decoded_frames':len(set(hashes))}
 if expected is not None:assert sum(durations)==expected
 assert len(set(hashes))>40
 if name=='jitter.gif':
  mask=np.ones((880,800),bool);mask[404:464,237:564]=False;mask[709:763,400:625]=False
  base=np.array(frames[170]);counts=[int(np.any(np.array(f)!=base,axis=2)[mask].sum()) for f in frames]
  report['max_changed_pixels_outside_effect_and_selection_regions']=max(counts)
  assert max(counts)==0
  selected=[0,33,49,58,72,94,134,180]
  sheet=Image.new('RGB',(800,460*4),'#f0f1f5');d=ImageDraw.Draw(sheet)
  for i,k in enumerate(selected):
   crop=frames[k].resize((400,440));sheet.paste(crop,((i%2)*400,(i//2)*460));d.text(((i%2)*400+10,(i//2)*460+442),f'decoded GIF frame {k}; {sum(durations[:k])/1000:.2f}s',fill='#223344')
  sheet.save(out/'decoded-contact.png')
 reports[name]=report
reports['checks']={'node_focused_tests':11,'browser_interaction_QA':'not run','native_iOS_QA':'not run','offline_renderer':'shared Canvas scene','source_time_alignment':'playlist offset plus source frame count; approximate absolute keynote time'}
(out/'media-validation.json').write_text(json.dumps(reports,indent=2)+'\n');print(json.dumps(reports,indent=2))
