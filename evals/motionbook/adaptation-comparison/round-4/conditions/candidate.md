---
name: motionbook
description: "Find, view, explain, and adapt concrete UI components, interactions, and interfaces from Motionbook's reference collection."
---

# Motionbook

Use [Motionbook](https://github.com/blueberrycongee/motionbook) as a book of concrete design references: appearance, behavior, and the decisions worth studying. Its scope is standalone components, interactions, and interfaces. Product-wide composition is a separate design task.

## Find and see

Go directly to a named example's README and preview. Otherwise, browse the [GIF gallery](https://github.com/blueberrycongee/motionbook#预览画廊) or search for a shortlist:

```sh
python3 <skill-directory>/scripts/search.py "标签 创建"
python3 <skill-directory>/scripts/search.py "portfolio hover"
python3 <skill-directory>/scripts/search.py "starfield" --json
```

Use short Chinese or English component, behavior, or visual-quality terms. Matches are candidates, not proof that every constraint is met. Rephrase empty queries. Optional `--kind`, `--fit`, and `--capability reduced-motion` filters are described in the [catalog contract](references/taxonomy.md).

The installed skill contains the index and search tool; media and source live in the repository. Text results link previews, evidence, and source; `--json` exposes `readme`, `preview`, `evidence`, and `matched_source_anchors`. Resolve paths from a checkout or the catalog's repository URL. Retrieve selected files rather than the whole collection; check current source if the index is stale. `wip/` is outside the indexed collection.

View the preview for visual judgments. The example's README provides demo/run instructions; a GitHub HTML source link is not a running demo. Disclose unavailable media or runtime access instead of implying you observed it.

## Understand the selected work

Treat `why`, `extract`, `use_when`, and `avoid` as editorial pointers. Ground explanations in the preview and source: which particular choices matter here, and why? Preserve the example's distinctive qualities. Aesthetic or expressive value needs no invented usability benefit.

Follow `matched_source_anchors` and their `purpose` for a specific part; check needed dependencies and callers. Anchors are reading entrances, not self-contained components. Optional [reference-reading examples](references/interaction-spec.md) connect visible choices to implementation and limits without prescribing a procedure or report.

Read the selected evidence and rights notes. Check whether the preview actually shows the selected interaction; a scripted replay may omit source branches. Distinguish measured reference behavior, authored extensions, automated checks, offline rendering, and browser/device verification. `reduced-motion` marks an inspected branch in selected anchors; missing metadata means unknown. Neither that branch nor an offline GIF certifies accessibility or runtime readiness.

## Use at the requested scope

- **Find or explain:** return the reference, preview/source links, what is worth studying, and relevant limitations. No implementation or specification is needed.
- **Adapt:** preserve the target's stack and the selected work's useful relationships. Account for real data, latency, layout, input, and accessibility; demo timers and local cancellation are not business state. Recreate a full screen only when requested.

Reuse Motionbook code only under its applicable terms; do not import original third-party code or assets without permission. Use verified CC0 replacement images and preserve fonts' licenses. For integrations, check consequential states and interruptions in the target. Report what was borrowed, changed, and verified, with remaining gaps. This skill does not authorize repository writes or deployment.


For stateful interactions, distinguish what changes its presentation from what must retain its identity: draft, selection, focus, or in-flight work. Let that relationship guide the implementation. An interrupted transition should continue from the current state; dismissing a surface should have an intentional destination for focus and unfinished content.
