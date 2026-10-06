"""Export the exact variable-rate replay plus the explicitly authored return tail."""
import argparse,json,subprocess
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('frames',type=Path)
parser.add_argument('output',type=Path)
args=parser.parse_args();root=Path(__file__).resolve().parent.parent
timeline=json.loads(subprocess.check_output(['node',str(root/'scripts/render-native.cjs'),'--timeline'],text=True));times=timeline['times'];args.output.mkdir(parents=True,exist_ok=True)
us=[round(t*1000000)for t in times]+[round(timeline['duration']*1000000)]
def quoted(p):return "'"+str(p.resolve()).replace("'","'\\''")+"'"
lines=['ffconcat version 1.0']
for i,t in enumerate(times):
 p=args.frames/f'{i+1:05d}.png'
 if not p.is_file():raise FileNotFoundError(p)
 lines.extend(['file '+quoted(p),'option framerate 1000000',f'duration {(us[i+1]-us[i])/1000000:.6f}'])
lines.extend(['file '+quoted(args.frames/f'{len(times):05d}.png'),'option framerate 1000000'])
concat=args.output/'native-timeline.ffconcat';concat.write_text('\n'.join(lines)+'\n')
video=args.output/'loop.mp4';gif=args.output/'loop.gif';palette=args.output/'palette.png'
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-safe','0','-f','concat','-i',str(concat),'-frames:v',str(len(times)),'-fps_mode','passthrough','-enc_time_base','1:1000000','-c:v','libx264','-preset','fast','-crf','17','-threads','2','-bf','0','-x264-params','fps=60/1:force-cfr=0','-bsf:v',f"setts=duration='if(eq(N,{len(times)-1}),16667,DURATION)'",'-pix_fmt','yuv420p','-video_track_timescale','1000000','-movflags','+faststart',str(video)],check=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-threads','1','-safe','0','-f','concat','-i',str(concat),'-t',str(timeline['duration']),'-vf','fps=30,scale=800:-1:flags=lanczos,palettegen=stats_mode=full','-frames:v','1',str(palette)],check=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-threads','1','-safe','0','-f','concat','-i',str(concat),'-i',str(palette),'-filter_complex_threads','1','-lavfi','fps=30,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3','-t',str(timeline['duration']),'-loop','0',str(gif)],check=True)
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_frames','-show_streams','-of','json',str(video)],text=True));frames=[f for f in probe['frames']if f.get('media_type')=='video'];actual=[round(float(f['best_effort_timestamp_time'])*1000000)for f in frames];errors=[abs(a-b)for a,b in zip(actual,us)]
if len(frames)!=len(times)or max(errors)>1:raise RuntimeError(f'Native timestamp mismatch: count={len(frames)}, max_us={max(errors)}')
for media in [video,gif]:subprocess.run(['ffmpeg','-v','error','-threads','1','-i',str(media),'-f','null','-'],check=True)
report={'renderer':'offline SVG layers; no browser runtime claim','frame_count':len(frames),'original_frame_count':timeline['originalFrameCount'],'max_pts_error_microseconds':max(errors),'duration':probe['streams'][0]['duration'],'complete_decodes':['loop.mp4','loop.gif']};(args.output/'export-check.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
