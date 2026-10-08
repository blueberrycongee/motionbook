# Implementation

An independently written, self-contained DOM implementation adapted from the nested tag creation reference. Keeps the compact rounded picker, quiet neutral surface, color-dot chips, inset selectable rows, and creation surface in the same location. Adds a modest project context, explicit editable draft, named color radios, Back, and a separate Create action. No reference source code, fonts, or assets are included.

## Reference files inspected
- `audit-7f943c9/examples/nested-tag-creation/README.md`
- `audit-7f943c9/examples/nested-tag-creation/PROVENANCE.md`
- `audit-7f943c9/examples/nested-tag-creation/VALIDATION.md`
- `audit-7f943c9/examples/nested-tag-creation/index.html`
- `audit-7f943c9/examples/nested-tag-creation/style.css`
- `audit-7f943c9/examples/nested-tag-creation/app.js`
- `audit-7f943c9/examples/nested-tag-creation/model.js`
- `common-reference/nested-contact-sheet.jpg` (visually inspected)
- `common-reference/nested-06.png` (visually inspected)
- `common-reference/nested-09.png` (visually inspected)

## Behavior and limits
Selection identity is stored separately from display/query/draft state. Back and nested Escape retain the previous query and draft; Create trims the name, resolves case-insensitive duplicates, and adds selection through a Set. Selection and query survive dismissal/reopening for the current page session. Creation is committed synchronously without timers. Hidden surfaces are removed from keyboard navigation immediately, and every surface switch explicitly places focus. Outside pointer dismissal restores the trigger; keyboard focus leaving the component closes it without overriding the new focus destination. Search supports arrow navigation and Enter; rows use native buttons; colors use native radios. Reduced motion removes animation and transitions.

No network calls or dependencies. Labels are in memory and reset on reload; no server persistence. Names are limited to 60 characters; narrow chips truncate visually and retain full text in their title. The design targets 960×720 and 390×720 through responsive CSS. No tests or browser execution were performed, as requested. Reference images were inspected; live rendering, assistive technology, and device behavior remain for independent acceptance.
