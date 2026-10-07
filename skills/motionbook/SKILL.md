---
name: motionbook
description: "Find, explain, and adapt Motionbook UI references by user needs, design mechanisms and target constraints."
---

# Motionbook

Use [Motionbook](https://github.com/blueberrycongee/motionbook) to transfer design decisions that serve the user's goal.

## Choose the scope

- **Find references:** recommend a few relevant parts, explain their value and limits, then stop.
- **Explain:** inspect how the selected design connects user actions, system state and perceptible feedback. Do not edit the target.
- **Integrate:** preserve the target stack and conventions, adapt the smallest useful part, and test it. Recreate a full screen only when requested.

## Start with the need

Identify what the user is trying to do, their current state and what they need to understand or control. For expressive work, identify the intended mood or brand effect. Aesthetic value is a valid goal; it does not need an invented usability benefit.

## Search by mechanism

The bundled [catalog](references/catalog.json) contains Chinese and English task vocabulary. No media download is needed for discovery.

```sh
python3 <skill-directory>/scripts/search.py "标签 创建"
python3 <skill-directory>/scripts/search.py "portfolio hover"
python3 <skill-directory>/scripts/search.py "progress" --capability reduced-motion
```

Translate long requests into short behavior terms. Search ranks matches to any known term; a result does not satisfy every constraint automatically. Shorten or rephrase an empty query rather than substituting an unrelated effect.

Use optional `--kind` and `--fit` filters from the [taxonomy](references/taxonomy.md). Everyday, brand and playful describe intent. A playful control is not a default business control; a page fragment is not a complete landing page. Explicit playful intent should remain playful.

Read `why`, `extract`, `use_when` and `avoid` as candidate design rationales, not proof of effectiveness. Match the mechanism to the need: what cue or interaction could change the user's understanding, action or experience? Reject a visually similar reference when that connection does not hold.

Prefer `matched_source_anchors` for a specific subpart: starfield queries need the background, not Space's cards. Reduced-motion filtering applies to the selected anchors. Its partial index marks an inspected source branch, not all accessibility requirements.

## Inspect and adapt

1. Open only the chosen example's README, relevant preview, source and validation/rights notes. Catalog paths resolve against a checkout or the repository URL, not the installed skill directory. Check the current repository if the snapshot is stale; `wip/` is not a validated implementation collection.
2. Follow each anchor's file, symbol, line and purpose. Read needed imports and callers; a function may depend on sampled data or surrounding input code. Keep measured behavior separate from authored demo extensions.
3. Capture consequential decisions in a compact [interaction specification](references/interaction-spec.md): need, mechanism, states, target constraints and observable checks. Separate transferable behavior and relationships from incidental styling; retain visual form when it serves the goal or requested fidelity.
4. Adapt to real data, latency, layout, input and repeated use. Connect progress, cancellation and completion to business state rather than demonstration timers. Preserve keyboard/touch access, focus and reduced motion. Simplify or omit an effect if its value does not survive these constraints.

Implement independently without copying original reference code or assets; use verified CC0 replacement images and keep fonts’ actual licenses. An inspected source branch or offline GIF is not runtime validation.

## Verify and deliver

Run the target's relevant checks and exercise the intended behavior, including meaningful interruption, reversal, cancellation, failure and narrow-layout cases. Check state clarity and control as well as motion and hierarchy; require pixel equality only for an exact recreation. Runtime correctness does not establish a usability benefit.

Return the chosen reference, the part borrowed, adaptations and checks. Distinguish executed runtime behavior from offline output and blocked checks. Reference-only requests need no implementation, prototype or publication. This skill does not authorize repository writes or deployment.
