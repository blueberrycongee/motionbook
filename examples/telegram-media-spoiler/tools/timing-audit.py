"""Compare original source frames with actual decoded old/new GIFs, without retiming their state.
Requires Pillow, ffmpeg and ffprobe. Full 60 fps MP4 is the timing master;
the convenience GIF is re-sampled to exact 20 ms delays (50 fps).
Optional historical tooling: neither input video nor version-0 GIF is bundled.
Usage: python3 tools/timing-audit.py SOURCE_MP4 VERSION_0_GIF
Generated source-containing media is for separate local analysis, not this public bundle.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from bisect import bisect_right
import json, subprocess, sys

if len(sys.argv) != 3:
    raise SystemExit('Usage: python3 tools/timing-audit.py SOURCE_MP4 VERSION_0_GIF (neither is bundled)')
source_video = Path(sys.argv[1]).resolve()
old_gif = Path(sys.argv[2]).resolve()
if not source_video.is_file() or not old_gif.is_file():
    raise SystemExit('Both authorized local input files must exist')

root = Path(__file__).resolve().parents[1]
out = root / 'evidence' / 'timing-audit'
out.mkdir(parents=True, exist_ok=True)
source_frames = out / 'source-frames'
frames = out / 'audit-frames'
source_frames.mkdir(exist_ok=True)
frames.mkdir(exist_ok=True)
subprocess.run(['ffmpeg','-v','error','-y','-i',str(source_video),'-vf',"select='between(n,428,481)',crop=504:386:347:195",'-vsync','0',str(source_frames/'%04d.png')],check=True)

def decode_gif(path):
    im=Image.open(path); result=[]; starts=[]; t=0
    for i in range(im.n_frames):
        im.seek(i); starts.append(t)
        result.append(im.convert('RGB').crop((80,286,560,646)))
        t += im.info['duration']
    return result,starts,t

old,old_pts,old_total=decode_gif(old_gif)
new,new_pts,new_total=decode_gif(root/'preview/telegram-media-spoiler.gif')
source=[Image.open(source_frames/f'{i:04d}.png').convert('RGB') for i in range(1,55)]
font_dir=Path('/usr/share/fonts/truetype/dejavu')
font=lambda size,bold=False:ImageFont.truetype(str(font_dir/('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')),size)
source_onset=7.541666666666667 # midpoint of observed 7.5333–7.5500 s bracket
old_onset=1300.0
new_onset=1320-1000/120
sequence=[]
sequence.extend((j,1,'1× REAL TIME') for j in range(54))
sequence.extend((53,1,'1× REAL TIME · END HOLD') for _ in range(24))
sequence.extend((j,4,'4× SLOW · SAME FRAMES / SAME ALIGNMENT') for j in range(54) for _ in range(4))
sequence.extend((53,4,'4× SLOW · END HOLD') for _ in range(18))
manifest=[]
for frame,(j,slow,label) in enumerate(sequence):
    source_n=428+j; source_pts=source_n/60; elapsed=(source_pts-source_onset)*1000
    old_clock=old_onset+elapsed; new_clock=new_onset+elapsed
    oi=max(0,bisect_right(old_pts,old_clock+1e-7)-1)
    ni=max(0,bisect_right(new_pts,new_clock+1e-7)-1)
    canvas=Image.new('RGB',(1120,464),'#edf2ed'); d=ImageDraw.Draw(canvas)
    d.text((24,18),label,font=font(16,True),fill='#33574c')
    d.text((840,19),f'Reveal clock: {elapsed:+07.1f} ms',font=font(12),fill='#638071')
    panels=[('2022 source · second reveal',source[j],f'60 fps · PTS {source_pts:.6f} s'),('Actual delivered GIF v0',old[oi],f'30 fps · GIF PTS {old_pts[oi]/1000:.3f} s'),('Sampling repair · same model',new[ni],f'50 fps · GIF PTS {new_pts[ni]/1000:.3f} s')]
    for x,(title,im,detail) in zip([24,392,760],panels):
        d.text((x,56),title,font=font(14,True),fill='#365246')
        d.text((x,79),detail,font=font(11),fill='#6e8577')
        im=im.copy();im.thumbnail((336,258),Image.Resampling.LANCZOS);canvas.paste(im,(x,107))
    d.text((24,369),'Fitted tap ≈ (0.486, 0.567)',font=font(10),fill='#6e8577')
    d.text((392,369),'Actual preview tap = image centre',font=font(10),fill='#6e8577')
    d.text((760,369),'Actual preview tap = image centre',font=font(10),fill='#6e8577')
    d.text((24,389),'Aligned to reveal onset, not the earlier white tutorial tap ring. Same 180 ms runtime in both reconstructions.',font=font(12),fill='#526d5e')
    d.text((24,411),'Different artwork / click geometry. This checks clocks and sampling; it is not a pixel-equivalence claim.',font=font(12),fill='#6e8577')
    d.text((24,433),'Master MP4: 60 fps. Convenience GIF: 50 fps. Both reconstructions are deterministic offline renders.',font=font(12),fill='#6e8577')
    canvas.save(frames/f'{frame:04d}.png')
    if frame in [25,26,27,28,29,30]:canvas.save(out/f'audit-sample-{frame:03d}.png')
    manifest.append({'output_frame':frame,'output_pts_seconds':frame/60,'source_frame_zero_based':source_n,'source_pts_seconds':source_pts,'elapsed_ms':elapsed,'speed':1/slow,'old_gif_frame':oi,'old_gif_pts_ms':old_pts[oi],'new_gif_frame':ni,'new_gif_pts_ms':new_pts[ni]})
mp4=out/'telegram-spoiler-timing-audit-60fps.mp4'
gif=out/'telegram-spoiler-timing-audit.gif'
subprocess.run(['ffmpeg','-v','error','-y','-framerate','60','-i',str(frames/'%04d.png'),'-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(mp4)],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-framerate','60','-i',str(frames/'%04d.png'),'-filter_complex','fps=50,split[a][b];[a]palettegen=max_colors=192:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4','-loop','0',str(gif)],check=True)
(out/'audit-timeline.json').write_text(json.dumps({'source_onset_seconds':source_onset,'source_onset_uncertainty_seconds':[7.533333,7.55],'old_gif_trigger_ms':old_onset,'new_gif_trigger_ms':new_onset,'both_runtime_envelopes_ms':180,'original_gif_total_ms':old_total,'new_gif_total_ms':new_total,'master_fps':60,'convenience_gif_fps':50,'master_frames':len(sequence),'duration_seconds':len(sequence)/60,'frames':manifest},indent=2)+'\n')
print(json.dumps({'mp4':str(mp4),'gif':str(gif),'frames':len(sequence),'seconds':len(sequence)/60}))
