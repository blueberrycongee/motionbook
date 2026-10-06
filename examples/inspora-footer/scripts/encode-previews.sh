#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg -hide_banner -loglevel error -y -framerate 20 -i preview/public-cleanup-frames/footer-%04d.png -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart delivery/footer-preview.mp4
ffmpeg -hide_banner -loglevel error -y -framerate 20 -i preview/public-cleanup-frames/detail-%04d.png -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart delivery/horse-detail.mp4
ffmpeg -hide_banner -loglevel error -y -framerate 20 -i preview/public-cleanup-frames/footer-%04d.png -filter_complex '[0:v]split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a' delivery/footer-preview.gif
