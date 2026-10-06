"""Set the last GIF frame's delay without touching image data or palette bytes."""
from pathlib import Path
import sys, json, hashlib

path = Path(sys.argv[1])
delay_ms = int(sys.argv[2]) if len(sys.argv) > 2 else 50
if delay_ms <= 0 or delay_ms % 10:
    raise ValueError('GIF delay must be a positive multiple of 10 milliseconds')
raw = path.read_bytes()
if raw[:6] not in (b'GIF87a', b'GIF89a'):
    raise ValueError('Not a GIF')
data = bytearray(raw)
offset = 13
if data[10] & 128:
    offset += 3 * (1 << ((data[10] & 7) + 1))
frames, controls, pending = [], [], None

def skip_blocks(position):
    while data[position]:
        position += data[position] + 1
    return position + 1

while offset < len(data):
    marker = data[offset]
    if marker == 0x3B:
        break
    if marker == 0x21:
        if data[offset + 1] == 0xF9:
            if data[offset + 2] != 4:
                raise ValueError('Unexpected graphic-control block')
            pending = offset + 4
            controls.append(pending)
        offset = skip_blocks(offset + 2)
    elif marker == 0x2C:
        packed = data[offset + 9]
        offset += 10
        if packed & 128:
            offset += 3 * (1 << ((packed & 7) + 1))
        offset += 1  # LZW minimum code size
        offset = skip_blocks(offset)
        frames.append(pending)
        pending = None
    else:
        raise ValueError(f'Unexpected block marker at {offset}')
if not frames or frames[-1] is None:
    raise ValueError('Last image has no explicit graphic-control delay')
position = frames[-1]
before_delay = int.from_bytes(data[position:position + 2], 'little') * 10
data[position:position + 2] = (delay_ms // 10).to_bytes(2, 'little')
changed = [i for i, (old, new) in enumerate(zip(raw, data)) if old != new]
assert all(i in (position, position + 1) for i in changed)
path.write_bytes(data)
sha = lambda value: hashlib.sha256(value).hexdigest()
print(json.dumps({
    'frames': len(frames), 'old_last_delay_ms': before_delay,
    'new_last_delay_ms': delay_ms, 'changed_byte_offsets': changed,
    'image_and_palette_bytes_unchanged': True,
    'before_sha256': sha(raw), 'after_sha256': sha(data)
}, indent=2))
