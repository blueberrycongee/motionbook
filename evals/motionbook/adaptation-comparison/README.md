# Motionbook adaptation comparisons

Twenty studies compare Motionbook guidance across four exploratory rounds. No candidate has established a consistent benefit over the current skill. Rounds 1–2 supply references directly, Round 3 adds catalog discovery, and Round 4 adds real Chromium input, screenshots and recordings. These comparisons are separate from the deterministic retrieval regression suite.

- [Round 1: six studies, no stable winner](round-1/README.md)
- [Round 2: four new studies of content scope](round-2/README.md)
- [Round 3: discovery with a shorter entrypoint](round-3/README.md)
- [Round 4: six live interactions and browser evidence](round-4/README.md)
- [Briefs and exact tested conditions](round-1/CONDITIONS.md)
- [Scores and source fingerprints](round-1/results.json)

## Replay the offline evidence (Rounds 1–3)

From the repository root, with Node.js 20+ and Python 3.10+:

```sh
python3 evals/motionbook/adaptation-comparison/verify.py
```

This runs all three rounds' submission tests, verifies its recorded source fingerprint, re-emits 153 deterministic SVG samples per study, and parses them as XML. It is an offline source/contract check, not visual acceptance or browser testing.

For PNGs, contact sheets, GIF and MP4, also install Pillow, Inkscape and FFmpeg. Original captures used Node 24.19.0, Inkscape 1.4, FFmpeg 7.1.5, Pillow 12.3.0, and built-in sans-serif fonts. Font/rasterizer differences may change pixels across systems.

```sh
python3 evals/motionbook/adaptation-comparison/harness/capture.py \
  evals/motionbook/adaptation-comparison/round-1/submissions/A/scene.mjs \
  /tmp/motionbook-A
```

The timeline samples 0–6 seconds inclusive: 121 normal frames at 20 fps plus 16 interrupted and 16 normal reduced-motion samples. The GIF subsamples to 10 fps, includes the endpoint, and loops (6.1 seconds encoded; the MP4 is 6.05 seconds). The harness does not test reduced+interrupted captures jointly; some submission tests exercise that combination.

To produce an unlabeled three-column comparison from three capture directories, in the desired left-to-right order:

```sh
python3 evals/motionbook/adaptation-comparison/harness/compose.py \
  /tmp/detail-comparison.gif /tmp/motionbook-A /tmp/motionbook-C /tmp/motionbook-E
```

The published previews come from the submitted SVG code, not a separate illustration. They do not establish DOM layout, pointer/keyboard or focus behavior, assistive technology, network semantics, runtime performance, or perceived real-time smoothness. See [rights](NOTICE.md).
