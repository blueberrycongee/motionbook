---
name: motionbook
description: "Find, view, explain, and adapt concrete UI components, interactions, and interfaces from Motionbook's reference collection."
---

# Motionbook

Use Motionbook to find, view, explain, or adapt concrete components, interactions, and interfaces. Product-wide composition is a separate task.

For a named example, open its README and preview. Otherwise search with short Chinese or English component, behavior, or visual terms:

```sh
python3 <skill-directory>/scripts/search.py "your terms" --json
```

Rephrase empty queries. Results are candidates; inspect whether they satisfy the request. The bundled index contains preview, evidence, and source paths; media and code live in the repository. Check current source when metadata is stale. Optional filters are documented in references/taxonomy.md.

View the selected preview before visual judgments. Read its README, relevant evidence and rights notes. Follow source anchors into needed dependencies and callers; anchors are entry points, not standalone components. Ground what matters in observed appearance and source behavior; editorial fields are pointers, not proof.

Adapt at the requested scope and preserve the target stack. Retain useful distinctive relationships while accounting for real data, latency, layout, input, and accessibility. Demo timers are not business state. Reuse code only under applicable terms; do not import third-party assets without permission.

Report meaningful changes and verification limits. Distinguish measured behavior, authored extensions, source checks, offline rendering, and browser/device verification. Unavailable media or runtime access must remain explicit. This skill does not authorize writes or deployment.
