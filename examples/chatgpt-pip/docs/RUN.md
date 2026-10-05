# Run

Node.js 20.11 or newer:

```sh
npm start
```

Open http://127.0.0.1:4317/. The buttons add and update local cards. Hover, drag, resize, or change placement with the controls.

On macOS 13 or newer with Xcode Command Line Tools:

```sh
npm run mac
```

## Tests

```sh
npm test
python3 test/verify_snap_independent.py
```

## Rebuild previews

Install the declared development dependencies and FFmpeg, then run:

```sh
npm install
npm run render
```

The renderer generates local fixture images and the existing snap/hover sequences, then encodes their GIF and MP4 files. Generated frame directories are ignored by Git.

The packaged snap trajectory is gzip-compressed and base64-encoded. Tests read it directly; no extraction or raw JSON file is required.
