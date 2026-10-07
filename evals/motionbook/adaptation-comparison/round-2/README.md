# Round 2: content scope on new briefs

Four fresh studies compare current Motionbook guidance with one narrow clause: [candidate-clause.txt](candidate-clause.txt). Root's condition-blind scores are 18 vs 17 on both label creation and room-volume control. The observed difference is less unsolicited copy; the volume countercase retains its explicitly requested title and subtitle in both conditions. The independent blind reviewer ties both pairs (label picker: 19/19; volume: 20/20), judging the added copy as an orderly tradeoff. The weak root preference is not independently confirmed, so the current skill remains unchanged.

| Brief | Current | Content-scope candidate |
| --- | --- | --- |
| [Label picker](brief-labels.md) | I: 17/20 | G: 18/20 |
| [Room volume](brief-slider.md) | J: 17/20 | H: 18/20 |

[Root scores and observations](results.json) · [Independent scores and observations](independent-results.json). Individual actual-output GIFs: [G](previews/G.gif), [H](previews/H.gif), [I](previews/I.gif), [J](previews/J.gif).

## Inputs and interpretation

The candidate appends only the saved clause to the Adapt bullet in [the same current skill](../round-1/conditions/current.md). The unsuccessful first-round comparison clause is absent. All other skill resources are unchanged at source commit `780a0a38087d0668eb9532cc32e577e5fbdf6675`. Each pair receives identical reference files, brief, renderer and requested 12-minute ceiling (gpt-6-astra, xhigh). Actual start/end times and token use were not recorded or equalized; no inference seeds were controlled. This is one fresh generation per cell, with instruction-based isolation. The reference-only condition was not rerun.

References: [nested-tag-creation](../../../../examples/nested-tag-creation/README.md), `preview/loop.mp4`, sampled at 0, 1.4, 3.5, 4.1, 4.8, 5.5, 6.2, 7, 8, 9, 12, 18 seconds; and [fractional-slider](../../../../examples/fractional-slider/README.md), `preview/full.mp4`, sampled at 0, 0.3, 0.65, 1, 1.5, 2, 2.5, 3, 3.5, 4.2, 5, 5.8 seconds. The [same reference sampling recipe](../round-1/CONDITIONS.md) and [output contract/rubric](../round-1/CONDITIONS.md) apply.

Round 1 motivated this clause; Round 2 evaluates it on different tasks. Scores were frozen before unmasking, using normal/interrupted/reduced-motion sheets. Motion judgments are sampled-frame judgments. Replay commands and the limits of offline verification are in the [comparison guide](../README.md).

Review-order deviation: the root assessment was frozen and unmasked before the additional independent blind review began. The second reviewer receives anonymous outputs without conditions or root scores. This departs from the planned freeze-both-before-unmask order. Both assessments use the same five dimensions, but coarse subjective scores differ; no rater agreement or winner is manufactured.
