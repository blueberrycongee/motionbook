# Round 3: discovery and adaptation

Four fresh studies compare the [current entrypoint](conditions/current.md) with a [shorter experimental entrypoint](conditions/lean.md) on two new briefs. These are frozen evaluation inputs, not installed skill changes. Neither brief names an example: [archive navigation](brief-navigation.md) is open-ended; [studio follow feedback](brief-subscribe.md) specifies a motion signature.

| Brief | Current | Lean |
| --- | --- | --- |
| Navigation | M: 22/24 | K: 22/24 |
| Follow feedback | L: 22/24 | N: 21/24 |

These are [root scores](results.json). The [independent blind reviewer](independent-results.json) scores all four 24/24 and ties both pairs. That ceiling shows rubric saturation, not equal underlying quality or general non-inferiority. The current skill remains unchanged.

Actual output GIFs: [K](previews/K.gif), [L](previews/L.gif), [M](previews/M.gif), [N](previews/N.gif). [Reported queries, chosen references and source paths](discovery.json) make the discovery result inspectable. Both navigation studies chose luminous-tabs; both follow studies chose youtube-subscribe-feedback. Suitability, rather than an exact slug match, was the assessment criterion.

## Reproduction and limits

The source snapshot is `7fd789b922ddf4c81ffcebc36016bb520fe354b1`. Catalog, search code and supporting references are identical across conditions. Each independent context receives the brief, common SVG contract and offline tools, a requested 12-minute ceiling (gpt-6-astra, xhigh), and access to at most two catalog-listed examples. Selected example source is retrieved from that commit. The reference sheet uses 12 evenly spaced GIF frame indices, not uniformly spaced timestamps. Each decoded frame is also available individually. No reference media is republished here.

This round adds reference discovery as a sixth 0–4 dimension; totals are not comparable to the earlier 20-point rubric. Both judges froze their scores before unmasking. Materialization records and reports corroborate discovery, but raw observation traces were not independently audited. Requested budgets and common helpers do not equalize retrieval latency or consumed compute. One generation per cell provides exploratory evidence only.

The [shared replay command](../README.md) checks all fourteen submissions. GIFs come from the submitted source. Browser input, accessibility, real account operations, runtime performance and perceived real-time smoothness remain unverified.
