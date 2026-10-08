# Reading room

A self-contained, original HTML/CSS/JS adaptation of the floating composer. The short fictional page, muted green-gray palette, floating rounded surface, light dividers, native textarea, context label and bottom-anchored expansion keep the reference's calm document/conversation relationship. Focus opens a 46px conversation header; editing and explicit expansion increase the editor height. Geometry uses the reference's 300ms cubic-bezier(.23, 1, .32, 1) transition, with immediate reduced-motion presentation. CSS transitions can reverse from their current visual position.

## Interaction

The same textarea stays mounted through every presentation change, preserving the draft, selection and native undo history on collapse, outside clicks and Escape. Escape collapses and sends focus to the always-available expansion button; reopening focuses the textarea. Document focus and outside pointer interaction dismiss expansion. Sending uses one form submission path, trims only the submitted text, ignores whitespace-only submissions and clears the draft once. Each submission appends one user message and one explicitly labeled local simulated reply. Messages remain available when editing collapses. Enter submits; Shift+Enter remains native; composition state, isComposing and keyCode 229 guard IME entry. Native buttons support keyboard activation and visible focus. The scrollable conversation has a keyboard focus target and polite log semantics.

## References actually inspected

Within `audit-7f943c9/examples/chatgpt-document-workspace/`:
- `README.md`
- `docs/RUNNING.md`
- `docs/VALIDATION.md`
- `docs/PROVENANCE.md`
- `LICENSE.md`
- `style.css`
- `src/model.mjs` — reducer draft/send/focus/dismiss branches; composer geometry and transition helpers
- `src/app.mjs` — stable textarea, event ownership, input/keyboard/outside handling and local reply path
- `src/scene.mjs` — composer source anchors, header, controls and transcript layout inspected through targeted source search

Shared preview evidence viewed:
- `common-reference/composer-contact-sheet.jpg`
- `common-reference/composer-focused.png`
- `common-reference/composer-multiline.png`

Also read the assigned composer brief and candidate guidance. The preview images are the repository's offline reconstruction renders, not original-client screenshots or a browser verification. No original product assets or code were imported. Motionbook's example is MIT-licensed; this adaptation uses independently authored DOM, styles and interactions.

## Limits and verification

No browser, automated tests, network calls, external assets or model APIs were used. Browser/input-device acceptance, actual IME/platform differences, mobile virtual-keyboard behavior and screen-reader announcement behavior remain unverified. The layout is authored for 960×720 and 390×720 with responsive CSS, rather than claimed runtime measurements. Local replies are immediate and deterministic; draft and history live only for this page session, not after a reload. This deliberately omits reference-wide tabs, sidebar, zoom, docking, document editing and attachments. Increasing editor height on focus, retaining the transcript during collapse, and the new visual treatment are authored adaptations, not claims about the original product.
