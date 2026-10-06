---
name: motionbook
description: Find a relevant Motionbook UI animation or micro-interaction and adapt its independently authored implementation to a target application, using the example's source, provenance and validation notes.
---

# Motionbook

Use [Motionbook](https://github.com/blueberrycongee/motionbook) as a searchable implementation reference. Preserve the user's target stack, interaction requirements and existing application conventions.

## Find the right example

Start with the repository's root `README.md` visual gallery. If a local checkout is available, search titles or `catalog/` metadata with terms describing the behavior, such as drag, selection, expanding input, hover or completion. Match the interaction and visual constraints before choosing by appearance alone.

Open only the promising example's `examples/<slug>/README.md` and linked GIF or MP4. Do not load the whole repository or every motion-data file into context. The `wip/` directory contains unfinished or historical snapshots; prefer the completed example linked from the gallery. Do not treat an unfinished snapshot as a validated reference.

## Read only what the adaptation needs

Follow that example's **Source/Reference** and **Run & validation** links. Filenames vary: provenance may be in `PROVENANCE.md`, `SOURCE.md` or `RIGHTS.md`, and run instructions usually live in `VALIDATION.md`. Read its license notices before copying or adapting code or assets; repository availability and attribution do not imply a blanket license.

Inspect the selected example's package and entrypoint, then the relevant scene, timing, state model and input adapter. Some examples share one renderer between playback and live interaction; others have a separate preview renderer. Determine which implementation actually drives the target behavior. Load large sampled traces only when the requested replay or measured timing needs them.

Record the small set of properties that matter: states and triggers, geometry, easing or springs, opacity/blur, layering, cancellation, repeated input and loop closure. Distinguish measured reference behavior from authored demo extensions or closing frames. Use parameters supported by the selected source; do not assume one spring or duration works for every example.

## Adapt to the application

Implement the behavior in the user's stack. Keep state transitions and input handling separate from visual rendering where that helps integration. Recreate geometry and motion responsively rather than copying reference-canvas coordinates without accounting for the target layout.

Honor the target's keyboard, pointer, touch and reduced-motion behavior. Avoid importing the source video's pixels, proprietary code or unrelated assets. Independently drawn or procedural artwork is suitable; an external image replacement needs verified CC0 provenance. Fonts and dependencies keep their actual licenses and notices, which may differ from CC0. Preserve original creator attribution and disclose meaningful substitutions.

## Verify the implemented result

Run the target project's relevant checks and exercise the real interaction in an available, permitted runtime. Cover the main transition plus relevant repeated or interrupted flows, cancellation/reset, and reduced motion. Compare the visible result at a consistent scale with the chosen Motionbook example, then fix material differences.

A rendered GIF or MP4 demonstrates an exported sequence. Seeing that image animate on GitHub verifies playback. Neither establishes that the application's input handling, browser layout or native runtime works. Report separately what was executed, what was rendered offline and what remains untested; name a concrete runtime blocker when one exists.

Deliver the integrated source and a concise account of the selected reference, adaptations and checks. If a preview is requested, generate it from the adapted implementation and identify whether it is a runtime recording or offline render. Follow the user's existing publication scope; using this skill alone does not authorize installation, deployment or repository writes.
