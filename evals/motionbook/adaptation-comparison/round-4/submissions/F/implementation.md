# Implementation

Self-contained HTML/CSS/JavaScript; no dependencies, assets, network, replay, or timer-driven state. Initial choices are Design, Research, and Personal; Design and Research start selected. State persists across picker dismissal within the page session.

Adapted the reference's small floating picker, quiet neutral palette, colored-dot pill labels, dark selection checks, inset creation surface, and short entering motion. The implementation is newly authored; no reference source, font, or artwork is embedded. The source's rights note does not grant a blanket code license.

Added editable creation names, explicit Back/Create actions, native color radios, keyboard focus outlines, reduced-motion support, case-insensitive duplicate prevention, and immediate focus transfers before hiding nested surfaces. Back preserves the search; a successful creation clears it and returns to all labels. Outside dismissal and Escape restore trigger focus. Keyboard arrows navigate search results; Tab reaches all controls. Color radios use native arrow-key behavior.

## Reference files inspected
- `round-4/briefs/tags.md`
- `round-4/conditions/current.md`
- `audit-7f943c9/examples/nested-tag-creation/README.md`
- `audit-7f943c9/examples/nested-tag-creation/PROVENANCE.md`
- `audit-7f943c9/examples/nested-tag-creation/VALIDATION.md`
- `audit-7f943c9/examples/nested-tag-creation/app.js`
- `audit-7f943c9/examples/nested-tag-creation/model.js`
- `audit-7f943c9/examples/nested-tag-creation/style.css`
- `audit-7f943c9/examples/nested-tag-creation/scene.js`
- `common-reference/nested-contact-sheet.jpg`
- `common-reference/nested-06.png`
- `common-reference/nested-10.png`
- `common-reference/nested-17.png`

## Known limits
No browser execution or tests were run, as requested. Layout is authored for 960×720 and 390×720 but not runtime-verified. System fonts replace the reference's Inter font. Selection is in-memory only and resets on reload. Many selected labels use a bounded scrolling chip area; long names are visually truncated and retained as full text/accessibility labels. The native radio focus styling uses modern `:has()` support. Reference previews are static evidence, not proof of browser behavior.
