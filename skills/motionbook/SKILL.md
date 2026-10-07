---
name: motionbook
description: "Find, explain, and adapt Motionbook UI references by the user's problem, using the smallest useful interaction or visual part."
---

# Motionbook

Use [Motionbook](https://github.com/blueberrycongee/motionbook) to solve the interaction problem, not to copy an entire example by default.

## Choose the scope

- **Find references:** recommend a few relevant parts, explain their value and limits, then stop.
- **Explain:** inspect the selected source and describe its states, motion and input handling. Do not edit the target.
- **Integrate:** preserve the target stack and conventions, adapt the smallest useful part, and test it. Recreate a full screen only when requested.

## Search by behavior

The bundled [catalog](references/catalog.json) contains Chinese and English task vocabulary. No media download is needed for discovery.

```sh
python3 <skill-directory>/scripts/search.py "标签 创建"
python3 <skill-directory>/scripts/search.py "portfolio hover"
python3 <skill-directory>/scripts/search.py "progress" --capability reduced-motion
```

Translate long requests into short behavior terms. Search ranks matches to any known term; a result does not satisfy every constraint automatically. Shorten or rephrase an empty query rather than substituting an unrelated effect.

Use optional `--kind` and `--fit` filters from the [taxonomy](references/taxonomy.md). Everyday, brand and playful describe intent. A playful control is not a default business control; a page fragment is not a complete landing page. Explicit playful intent should remain playful.

Read `why`, `extract`, `use_when` and `avoid`. Prefer `matched_source_anchors` for a specific subpart: starfield queries need the background, not Space's cards; advanced-settings queries need the editor, not Automation's task list. Reduced-motion filtering applies to the selected anchors. Its partial index marks an inspected source branch, not all accessibility requirements.

## Inspect and adapt

1. Open only the chosen example's README, relevant preview, source and validation/rights notes. Catalog paths resolve against a checkout or the repository URL, not the installed skill directory. Check the current repository if the snapshot is stale; `wip/` is not a validated implementation collection.
2. Follow each anchor's file, symbol, line and purpose. Read needed imports and callers; a function may depend on sampled data or surrounding input code. Keep measured behavior separate from authored demo extensions.
3. Write a compact [interaction specification](references/interaction-spec.md): purpose, states, timing/geometry, inputs and observable checks. Link consequential parameters to source; label estimates.
4. Adapt geometry to the target layout. Preserve keyboard/touch access, focus and reduced motion. Connect progress, cancellation and completion to real business state rather than demonstration timers.

Implement independently without copying original reference code or assets; use verified CC0 replacement images and keep fonts’ actual licenses. An inspected source branch or offline GIF is not runtime validation.

## Verify and deliver

Run the target's relevant checks and exercise the requested behavior, including meaningful interruption, reversal, cancellation, failure and narrow-layout cases. Compare motion and hierarchy at a consistent scale; require pixel equality only for an exact recreation.

Return the chosen reference, the part borrowed, adaptations and checks. Distinguish executed runtime behavior from offline output and blocked checks. Reference-only requests need no implementation, prototype or publication. This skill does not authorize repository writes or deployment.
