# Scope and provenance

This is an independently written ChatGPT document-workspace UI 复刻. The reference was a user-provided desktop screenshot, supplemented by documented and observable product behaviors. The public implementation contains no original screenshot, personal document content, app package, product source code, bundled icon, font, or image.

## Source observations

- The supplied screenshot shows a narrow primary rail, conversation sidebar, titlebar tabs, PDF selector, Request changes, percentage menu, download control, white document pages, and a floating bottom composer.
- [Work with files](https://learn.chatgpt.com/docs/artifacts-viewer?surface=app) and [Browser](https://learn.chatgpt.com/docs/browser) describe file previews next to chat and full/split views.
- Public desktop client observations as of 2026-10-07 inform the numeric behavior used here: PDF fit-to-width capped at 100%, 30–800% zoom bounds, pointer-anchored Control-scroll, 24 px page gap, and thumbnail navigation. Styles and feature choices can differ by version and account.

## Independent recreation choices

The document content, typography, icons, exact responsive composition, sidebar spring, zoom interpolation, example replies, and simplified interaction wiring are original. Their behavior is not a claim of frame-perfect equivalence with every product variant. Markdown is a second fictional fixture used to demonstrate shell reuse; its precise presentation was not established by the screenshot.

This example renders its own fixture pages as SVG, with a native HTML textarea. It is not a general-purpose PDF parser or editor. Request changes sets local context; it does not alter source files. Replies are canned, and no model, microphone, account, or third-party service is connected.

The main UI and preview intentionally contain only the interface, without instructional labels or promotional overlays. Validation and reproduction details live in these documents.
