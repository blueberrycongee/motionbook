#!/usr/bin/env python3
"""Replay source/contract checks. Does not claim browser or visual acceptance."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent


def verify(round_dir=None):
    if round_dir is None:
        for path in sorted(HERE.glob('round-*')):
            if path.is_dir():
                verify(path)
        return
    round_dir = Path(round_dir)
    results = json.loads((round_dir / 'results.json').read_text())
    for trial in results['results']:
        case = round_dir / 'submissions' / trial['id']
        source = case / 'scene.mjs'
        actual = hashlib.sha256(source.read_bytes()).hexdigest()
        if actual != trial['source_sha256']:
            raise ValueError(f"Source fingerprint changed: {trial['id']}")
        if sum(trial['scores']) != trial['total'] or not all(0 <= n <= 4 for n in trial['scores']):
            raise ValueError(f"Invalid score: {trial['id']}")
        subprocess.run(['node', '--check', str(source)], check=True, capture_output=True, timeout=30)
        tests = sorted(case.glob('*test*.mjs'))
        if not tests:
            raise ValueError(f"No source tests: {trial['id']}")
        for test in tests:
            subprocess.run(['node', str(test)], check=True, capture_output=True, timeout=30)
        with tempfile.TemporaryDirectory(prefix='motionbook-') as tmp:
            subprocess.run(['node', str(HERE / 'harness/emit.mjs'), str(source), tmp],
                           check=True, capture_output=True, timeout=30)
            paths = sorted(Path(tmp).glob('*.svg'))
            if len(paths) != 153:
                raise ValueError(f"Unexpected sample count: {trial['id']}")
            for path in paths:
                root = ET.parse(path).getroot()
                if root.tag != '{http://www.w3.org/2000/svg}svg':
                    raise ValueError(f'Not SVG: {path.name}')
        print(f"{trial['id']}: source fingerprint, source tests, 153 SVG contract samples passed")


if __name__ == '__main__':
    verify()
