#!/usr/bin/env bash
# One command: render every frame deterministically, then encode MP4 + GIF.
set -euo pipefail
cd "$(dirname "$0")"
node render.js
ffmpeg -y -loglevel error -framerate 30 -i frames/%05d.png \
  -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p -r 30 -movflags +faststart video.mp4
ffmpeg -y -loglevel error -i video.mp4 \
  -vf "fps=15,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=192:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" \
  -loop 0 video.gif
ls -l video.mp4 video.gif
