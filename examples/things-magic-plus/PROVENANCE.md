# Provenance and rights

## Primary reference

- Product: Things 3, Magic Plus, Cultured Code
- Official feature page: https://culturedcode.com/things/features/
- Official product clip: https://static.culturedcode.com/things/videos/2017-05-18-website-videos/6-magicplus-1.mp4
- The path belongs to the 18 May 2017 Things 3 website launch media. This study is about that recorded version, not a claim about the current app.
- Source stream: 500 × 888 pixels; 30/1 fps; time base 1/30000; 925 frames; 30.833333 seconds
- Studied sequence: first create/edit/collapse cycle, [0, 7.5) s
- Source identity and frame timing: `validation/source_manifest.json`, `validation/frame_pts_0-7.5s.json`

The official feature description explains that the plus can be lifted and dragged to insert a to-do in a chosen position. We use the first filmed example to measure visible states. Nothing here came from Things application code.

## Independently authored material

All task prose, project description, page layout, SVG UI/icon drawings, controller, motion sampling, and scene construction are authored for this study. They are not a dump of product assets. The task text changes intentionally so comparison scores cannot honestly be interpreted as pixel-identity or a native-fidelity percentage.

The bundled Inter Regular and Bold fonts are covered by their included SIL Open Font License at `assets/Inter-LICENSE.txt`. Inter replaces the original platform font. The offline export and demo load the same font files, though browser and librsvg rasterization may differ.

`tools/render.cjs` adapts the repository's existing deterministic offline render harness. This is a shared-method reuse; it does not reuse an unrelated motion model.

## Public distribution boundary

The full official MP4, raw source frames, side-by-side comparison GIF/MP4, comparison poster, comparison contact sheet, and comparison-only manifest are not distributed in this public package. No redistribution permission for official footage has been verified. Only numerical measurements, source metadata/hashes, independently authored code, and reconstruction-only imagery remain. The normal GIF/MP4 and reconstruction keyframes contain the authored scene, not embedded source frames.

`tools/compare.cjs` remains an optional local research utility requiring a separately obtained source file. It does not download or bundle that footage, and its generated reference-pixel outputs are ignored by version control and rejected by the public-bundle test. Anyone generating or sharing those outputs must separately assess the relevant rights.

Cultured Code retains rights in the original footage, product, and trademarks; there is no affiliation or endorsement. No new redistribution license for the original footage or product assets is claimed. The bundled Inter fonts retain their included OFL-1.1 license; this example does not introduce a separate blanket license for the remaining material.
