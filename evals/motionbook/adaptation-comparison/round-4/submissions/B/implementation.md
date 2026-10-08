# Implementation

Self-contained HTML/CSS/JavaScript label picker with a quiet Fieldnotes layout, pill selections, native checkbox and radio controls, and an inset nested creation surface. The reference's white pill labels, colored dots, softly bordered popover, muted outer creation shell, and rounded inner panel inform the design. The animation is adapted into real interactions rather than replayed artwork.

Inspected reference files:
- `README.md`
- `index.html`
- `style.css`
- `app.js`
- `model.js`
- `scene.js`
- `PROVENANCE.md`

Inspected shared visual reference: `common-reference/nested-contact-sheet.jpg`, `common-reference/nested-02.png` (picker), and `common-reference/nested-06.png` (nested color surface).

Behavior: selections survive closing and reopening; search is case-insensitive; Back preserves the previous query; creation trims names and deduplicates case-insensitively; creating an existing edited name selects that label without inserting another. Escape goes back one surface, then closes and restores trigger focus. Outside pointer presses and keyboard focus leaving the component close the popover. Incoming animations do not delay state or focus changes. Reduced-motion mode disables animations and transitions. Native Tab navigation, checkbox toggles, radio arrow keys, picker arrow navigation, and Enter from search are supported.

Known limits: data persists only for the current page session; names are capped at 40 characters; system fonts replace bundled reference fonts to keep the file entirely self-contained. No browser tools or tests were run, as requested. No external requests or dependencies.
