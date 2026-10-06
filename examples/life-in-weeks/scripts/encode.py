"""Encode independently rendered PNGs. No reference media input is used."""
import sys,pathlib,subprocess
frames=pathlib.Path(sys.argv[1]);out=pathlib.Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
def run(args):subprocess.run(['ffmpeg','-y','-v','error','-threads','2','-filter_threads','1',*args],check=True)
run(['-framerate','30','-i',str(frames/'%04d.png'),'-frames:v','504','-an','-c:v','libx264','-threads','2','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(out/'loop.mp4')])
run(['-filter_threads','1','-framerate','30','-i',str(frames/'%04d.png'),'-vf','scale=960:757:flags=lanczos,palettegen=stats_mode=full','-frames:v','1',str(out/'palette.png')])
run(['-filter_complex_threads','1','-framerate','30','-i',str(frames/'%04d.png'),'-i',str(out/'palette.png'),'-lavfi','[0:v]scale=960:757:flags=lanczos[v];[v][1:v]paletteuse=dither=bayer:bayer_scale=3','-frames:v','504','-loop','0',str(out/'loop.gif')])
