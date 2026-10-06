"""Encode the independent SVG raster sequence; no source media is required."""
from pathlib import Path
import argparse,subprocess
p=argparse.ArgumentParser();p.add_argument('frames',type=Path);p.add_argument('output',type=Path);a=p.parse_args();a.output.mkdir(parents=True,exist_ok=True)
for name in ['loop.mp4','loop.gif','palette.png']:
 if (a.output/name).exists():raise SystemExit('Choose a new output directory; existing media is preserved.')
base=['ffmpeg','-v','error','-threads','2','-framerate','30','-start_number','1','-i',str(a.frames/'%05d.png'),'-frames:v','312']
subprocess.run(base+['-c:v','libx264','-threads','2','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(a.output/'loop.mp4')],check=True)
subprocess.run(base+['-vf','scale=960:680:flags=lanczos,palettegen=stats_mode=full','-frames:v','1',str(a.output/'palette.png')],check=True)
subprocess.run(['ffmpeg','-v','error','-threads','2','-framerate','30','-start_number','1','-i',str(a.frames/'%05d.png'),'-i',str(a.output/'palette.png'),'-filter_complex_threads','1','-filter_complex','[0:v]scale=960:680:flags=lanczos[x];[x][1:v]paletteuse=dither=sierra2_4a','-frames:v','312','-loop','0',str(a.output/'loop.gif')],check=True)
print('Encoded full MP4 and looping GIF from independent PNG frames.')
