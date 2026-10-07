# Round 1 inputs

Source repository commit: `780a0a38087d0668eb9532cc32e577e5fbdf6675`.

Two briefs × three instruction conditions, one independent generation per cell:

| Brief | Current | Candidate | No skill |
| --- | --- | --- | --- |
| [Parcel detail](brief-detail.md) | A | C | E |
| [Save draft](brief-progress.md) | B | D | F |

The exact tested skill text is preserved in [current.md](conditions/current.md) and [candidate.md](conditions/candidate.md). Candidate adds only two sentences encouraging a useful first-pass rendered-output/reference comparison. Both use the same catalog, search script and reference documents from `skills/motionbook/` at the source commit. The no-skill condition receives no Motionbook instruction text. No candidate was installed based on this round.

All six receive the same relevant brief, reference source and sampled reference previews, renderer contract, offline tools and requested 12-minute maximum. Model: gpt-6-astra; reasoning effort: xhigh. This is a requested budget, not measured token/time equalization; actual start/end times were not recorded. No inference seeds were controlled. The workers are separate model contexts; file separation was instruction-based rather than operating-system isolation.

Reference inputs come from these independently authored repository studies at the source commit:

- Parcel detail: [flight-pill](../../../../examples/flight-pill/README.md), its source and `preview/loop.mp4`.
- Save draft: [micro-progress-button](../../../../examples/micro-progress-button/README.md), its source and `deliverables/micro-progress-button.mp4`.

Reference samples are decoded from the repository MP4s at these seconds (the same files within each brief):

- Parcel: 0, 2.1, 2.22, 2.32, 2.5, 2.7, 3, 4, 4.9, 5.08, 5.3, 5.8
- Save: 0, 0.52, 0.72, 1, 1.6, 2.25, 2.4, 2.8, 3.6, 3.9, 4.4, 5.5

Decode with FFmpeg `-ss <time> -i <video> -frames:v 1 -vf scale=960:-2`. Individual images are also laid out in a 3-column × 4-row sheet with 480×270 thumbnails and timestamp captions. Reference media is not duplicated here. Consult each study's provenance and rights notices before reuse.

Common deliverable contract: a self-contained `scene.mjs` exporting `renderFrame(t, options)` as SVG; t in [0,6], an 800×600 viewBox, width/height options, normal/interrupted scenario, and reducedMotion. Geometry and code are original; no external images, fonts, scripts, DOM dependencies or third-party assets. Authored event timelines are demonstrations, not live operations. Workers receive access to reference images and are asked to inspect actual output and write focused source tests.

Five equally weighted 0–4 assessment dimensions: brief/state semantics, useful reference relationships, visual coherence, sampled motion, and scripted interruption/reduced-motion handling. 0 = absent/unusable; 1 = serious problems; 2 = serviceable with important issues; 3 = good with minor issues; 4 = strong. Scores were frozen before condition disclosure. Sampled frames, not observed real-time playback, support the motion scores. One sample per cell cannot establish a general skill-quality or causal claim.
