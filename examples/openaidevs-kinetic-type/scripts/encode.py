"""Trim a recording-only synchronization marker, then encode actual browser video."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FFMPEG = os.environ.get('FFMPEG') or shutil.which('ffmpeg')
if not FFMPEG:
    raise SystemExit('Set FFMPEG to a local FFmpeg executable.')
source = ROOT / '.capture/live.webm'
preview = ROOT / 'preview'
preview.mkdir(exist_ok=True)
raw = subprocess.check_output([FFMPEG, '-v', 'error', '-i', str(source), '-t', '2', '-vf', 'crop=16:16:0:0,fps=25', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'])
frame_size = 16 * 16 * 3
seen_marker = False
start = None
for index in range(len(raw) // frame_size):
    frame = raw[index * frame_size:(index + 1) * frame_size]
    magenta = sum(frame[i] > 100 and frame[i + 1] < 80 and frame[i + 2] > 100 for i in range(0, len(frame), 3))
    if magenta > 100:
        seen_marker = True
    elif seen_marker:
        start = index / 25
        break
if start is None:
    raise SystemExit('No complete synchronization marker found; rerun npm run capture.')

mp4 = preview / 'loop.mp4'
gif = preview / 'loop.gif'
subprocess.run([FFMPEG, '-y', '-v', 'error', '-i', str(source), '-ss', str(start), '-t', '14', '-an', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(mp4)], check=True)
subprocess.run([FFMPEG, '-y', '-v', 'error', '-i', str(mp4), '-filter_complex', 'fps=25,scale=960:540:flags=lanczos,split[a][b];[a]palettegen=max_colors=192:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a', '-loop', '0', str(gif)], check=True)
subprocess.run([FFMPEG, '-v', 'error', '-i', str(mp4), '-f', 'null', '-'], check=True)
subprocess.run([FFMPEG, '-v', 'error', '-i', str(gif), '-f', 'null', '-'], check=True)

image = Image.open(gif)
durations, hashes = [], set()
for index in range(image.n_frames):
    image.seek(index)
    durations.append(image.info.get('duration', 0))
    hashes.add(hashlib.sha256(image.convert('RGB').tobytes()).hexdigest())
assert sum(durations) == 14000, f'Expected 14 seconds, got {sum(durations)} ms'
assert len(hashes) > 80, 'Expected continuously animated frames'
assert gif.stat().st_size < 15_000_000, 'GIF exceeds 15 MB'
runtime = json.loads((ROOT / '.capture/runtime.json').read_text())
times = runtime.pop('frameTimes')
deltas = [b - a for a, b in zip(times, times[1:])]
report = {
    'capture': runtime,
    'raf_samples': len(times),
    'max_raf_gap_seconds': max(deltas),
    'source_recording_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'trim_start_seconds': start,
    'sync_precision_seconds': .04,
    'method': 'Continuous real-time Chromium video; recording-only marker trimmed; no reference footage or hand-assembled storyboard used',
    'gif': {'width': image.width, 'height': image.height, 'frames': image.n_frames, 'distinct_frames': len(hashes), 'duration_ms': sum(durations), 'size_bytes': gif.stat().st_size, 'sha256': hashlib.sha256(gif.read_bytes()).hexdigest()},
    'mp4': {'size_bytes': mp4.stat().st_size, 'sha256': hashlib.sha256(mp4.read_bytes()).hexdigest()},
    'decode': 'GIF and MP4 fully decoded by FFmpeg',
    'reference_comparison': 'Pending cloud visual reviewer; local reference access unavailable',
}
(preview / 'recording.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
