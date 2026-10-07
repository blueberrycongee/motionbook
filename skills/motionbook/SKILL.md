---
name: motionbook
description: "Find and adapt Motionbook UI motion references by purpose: components, interface workflows, landing-page fragments, creative motion and playful experiments. Use when choosing interaction inspiration, explaining what makes a reference useful, or implementing a selected effect in an app."
---

# Motionbook

Use [Motionbook](https://github.com/blueberrycongee/motionbook) as a searchable implementation reference. Preserve the user's target stack, interaction requirements and existing application conventions.

## Choose the requested outcome

| Request | Work and stopping point |
| --- | --- |
| Find references | Retrieve relevant candidates; explain what to borrow, tradeoffs and evidence limits. Return links and a recommendation. Do not start implementation. |
| Explain an effect | Inspect the selected implementation and evidence; describe its state flow and motion using the interaction specification below. Do not edit the target application. |
| Integrate an effect | Inspect the reference and target, write a compact interaction specification, implement, then verify the specified behavior in the target runtime. |

Infer the route from the request; these are not commands the user must memorize. Keep a clear chosen direction. When an authorized design exploration has an unresolved choice that would materially change the interaction, compare two small runnable variants in an isolated scratch directory, preferably behind one switcher. Exercise both, explain the tradeoff and recommend a direction before production integration. Do not require prototypes for an already selected effect or a reference-only request.

## Retrieve by the user's problem

Use this skill for finding and adapting references, not only for exact recreations. First identify the target task, the smallest interaction needed, the target stack and whether expressive motion serves that task. Preserve the user's choice of full-screen recreation when explicitly requested.

The bundled [catalog](references/catalog.json) describes every published study in Chinese and English search vocabulary. Read [the classification contract](references/taxonomy.md) when distinguishing kinds or maintaining entries. Search without loading every example or downloading media:

```sh
python3 <skill-directory>/scripts/search.py "标签 创建"
python3 <skill-directory>/scripts/search.py "slider" --fit everyday
python3 <skill-directory>/scripts/search.py --kind landing-page
python3 <skill-directory>/scripts/search.py "弹弓" --fit playful --json
```

This is keyword retrieval, not semantic search. Translate a long request into a few Chinese or English behavior terms; retry shorter terms when no result matches. Do not fill an empty result with an unrelated effect. Filters are optional. Everyday studies win only relevance ties; explicitly seek playful or brand studies when the user wants them.

Shortlist a few candidates and explain the specific reason for choosing: information hierarchy, state feedback, spatial continuity, material treatment, expressive motion or a classic interaction pattern. Use `extract` to define what to borrow and `avoid` to identify tradeoffs. A playful component should not become a default business control. A landing-page fragment must not be described as a complete website.

For humans, the repository's [purpose index](https://github.com/blueberrycongee/motionbook/blob/main/catalog/README.md) accompanies its root visual gallery. A local checkout is optional for discovery. Resolve catalog paths against that checkout or `https://github.com/blueberrycongee/motionbook/blob/main/`; they are not files bundled inside the installed skill. Open only the chosen example's README, preview and evidence, then obtain its implementation if adaptation requires it. Use available GitHub tooling or ordinary repository access; the skill does not depend on a particular connector. If a preview cannot be inspected, describe the evidence limit rather than claiming visual quality.

The bundled catalog is a snapshot. When an entry has moved or a new example is expected, check the current repository. The `wip/` ledger distinguishes prototypes, source-only candidates and historical archives. Do not recommend these as validated implementations.

## Read only what the adaptation needs

Follow that example's **Source/Reference** and **Run & validation** links. Filenames vary: provenance may be in `PROVENANCE.md`, `SOURCE.md` or `RIGHTS.md`, and run instructions usually live in `VALIDATION.md`. Read its license notices before copying or adapting code or assets; repository availability and attribution do not imply a blanket license.

Inspect the selected example's package and entrypoint, then the relevant scene, timing, state model and input adapter. Some examples share one renderer between playback and live interaction; others have a separate preview renderer. Determine which implementation actually drives the target behavior. Load large sampled traces only when the requested replay or measured timing needs them.

For explanations and integrations, use [the interaction specification](references/interaction-spec.md) to record the behavior and its verification scenarios. Keep it inline for small tasks; create a separate artifact only when useful or requested. Distinguish measured reference behavior from authored demo extensions or closing frames. Use parameters supported by the selected source; do not assume one spring or duration works for every example.

## Adapt to the application

Implement the behavior in the user's stack. Keep state transitions and input handling separate from visual rendering where that helps integration. Recreate geometry and motion responsively rather than copying reference-canvas coordinates without accounting for the target layout.

Honor the target's keyboard, pointer, touch and reduced-motion behavior. Avoid importing the source video's pixels, proprietary code or unrelated assets. Independently drawn or procedural artwork is suitable; an external replacement needs a verified license compatible with the intended use and its required attribution. Fonts and dependencies keep their actual licenses and notices, which may differ from CC0. Preserve original creator attribution and disclose meaningful substitutions.

## Verify the implemented result

Run the target project's relevant checks and exercise the interaction specification's scenarios in an available, permitted runtime. Preserve repeatable evidence: the start state, actions, expected and observed results, runtime and capture/log paths. Compare the visible result at a consistent scale with the chosen Motionbook example, then fix material differences. For adaptations, judge the agreed behavior, hierarchy and spatial continuity under the target layout; do not impose pixel equality across different fonts, sizes or platforms. Use a fixed visual baseline when exact reproduction is requested.

A rendered GIF or MP4 demonstrates an exported sequence. Seeing that image animate on GitHub verifies playback. Neither establishes that the application's input handling, browser layout or native runtime works. Report separately what was executed, what was rendered offline and what remains untested; name a concrete runtime blocker when one exists.

Deliver the integrated source and a concise account of the selected reference, adaptations and checks. If a preview is requested, generate it from the adapted implementation and identify whether it is a runtime recording or offline render. Follow the user's existing publication scope; using this skill alone does not authorize installation, deployment or repository writes.
