#!/usr/bin/env python3
"""Tile actual capture PNGs without adding labels or drawing replacement art."""
import argparse
from pathlib import Path
from PIL import Image


def compose(output, captures):
    frames = []
    for index in range(0, 121, 2):
        frame = Image.new('RGB', (480 * len(captures), 360))
        for column, capture in enumerate(captures):
            with Image.open(capture / 'frames' / f'normal-{index:03}.png') as source:
                if source.size != (800, 600):
                    raise ValueError(f'Unexpected capture dimensions: {source.size}')
                frame.paste(source.convert('RGB').resize((480, 360)), (column * 480, 0))
        frames.append(frame)
    output.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(output, save_all=True, append_images=frames[1:], duration=100, loop=0)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    parser.add_argument('captures', type=Path, nargs=3)
    args = parser.parse_args()
    compose(args.output, args.captures)
