# Field notes composer

A self-contained, original HTML/CSS/JS adaptation focused on the document and floating editor. No remote assets or requests.

## Reference inspected

Under `audit-7f943c9/examples/chatgpt-document-workspace/`:
- `README.md`
- `docs/RUNNING.md`
- `docs/VALIDATION.md`
- `docs/PROVENANCE.md`
- `LICENSE.md`
- `src/model.mjs`
- `src/app.mjs` (composer input and ownership event bindings)
- `src/scene.mjs` (floating composer rendering)
- `style.css`

Visual references inspected: `common-reference/composer-contact-sheet.jpg` and `common-reference/composer-focused.png`. These are the reference reconstruction's offline frames, not observations of the original application running.

## Adaptation

Kept the white rounded floating surface, restrained green-gray palette, serif paper typography, focus-revealed 46px conversation header, bottom anchoring, and 300ms ease-out motion. Rebuilt with semantic native HTML rather than SVG rendering. Expanded editing additionally grows the native textarea, and the persistent explicit toggle replaces the reference's larger set of dock/minimize controls. The mobile layout, visible local transcript and deterministic reply are authored for this brief.

Draft text stays in the same native textarea through collapse, outside interaction, Escape and reopening. Sending synchronously clears it and appends one user message and one plainly labelled local simulated reply. Text is inserted with textContent. Enter sends, Shift+Enter remains native, and composition state plus keyboard composition flags prevent IME Enter submission. Keyboard focus is visible and reduced motion removes transitions.

## Known limits / verification

No browser execution or tests were performed, as requested. Native focus, wrapping and mobile keyboard behavior remain for independent acceptance. Draft and transcript live only for the current page lifetime; reload discards them. The reply is fixed local fixture content, not generated from the question. No document editing, server persistence, real AI, attachment or voice functionality is included. No reference source code was copied into the deliverable.
