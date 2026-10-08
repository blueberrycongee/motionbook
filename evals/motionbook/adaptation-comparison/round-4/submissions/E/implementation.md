# Implementation

Self-contained document reader with a bottom-anchored composer. The neutral workspace, pale paper, muted green type, rounded floating shell, and focus-revealed context header adapt the supplied reference. The document is intentionally short; desktop and mobile share the same interaction.

A stable native textarea retains its draft through collapse, outside clicks, Escape, and reopening. Focus and input expand the editor. The explicit chevron toggles its height. Enter submits once, Shift+Enter remains native, composition events and composing key events prevent IME submission, and empty sends are ignored. Each submission synchronously adds one user message and one clearly labeled deterministic local reply. Text is inserted with textContent. Native buttons, visible focus states, a live conversation log, and reduced-motion overrides support keyboard and accessibility use.

## Reference files actually inspected

Under `audit-7f943c9/examples/chatgpt-document-workspace/`:
- `README.md`
- `docs/RUNNING.md`
- `src/app.mjs`
- `style.css`
- Composer-related matching lines in `src/scene.mjs`

Under `common-reference/`:
- `composer-contact-sheet.jpg`
- `composer-compact.png`
- `composer-focused.png`
- `composer-multiline.png`
- `composer-reference.png`
- `composer-wide.png`

Task brief: `round-4/briefs/composer.md`.

## Known limits

- Draft and conversation are retained only while this page remains loaded; no storage or reload persistence.
- Replies are immediate, fixed local simulations, not interpretations of the submitted text.
- Conversation history scrolls inside a bounded panel. No document editing, attachments, docking menu, or model integration is included.
- Browser execution and tests were intentionally not performed. Responsive and interaction behavior await independent acceptance.
