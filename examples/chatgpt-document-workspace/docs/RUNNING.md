# Run

From this example directory:

```sh
npm start
```

Open http://127.0.0.1:4186. No package install or account is required.

- Click tabs or files in the sidebar. Each file remembers its zoom, reading position, and draft.
- Scroll in the document. Control-scroll zooms around the pointer; the percentage menu offers presets and Fit width.
- Command/Control + plus/minus zooms; Command/Control + 0 fits the page. Page Up/Down, Home, and End move through the document.
- Fold the sidebar with its titlebar button, or Command/Control + B.
- Open page thumbnails beside the document to jump between PDF pages.
- The top-right split-view button keeps the conversation alongside the document.
- The bottom composer is a native text input. Enter sends; Shift + Enter adds a line. Replies are deterministic local examples, with no API, network, voice, or model connection.
- Request changes attaches a local document context to the composer. It does not edit the PDF.
- Download saves the fictional sample document.
- Escape dismisses open controls without discarding your draft.

## Checks

```sh
npm test
npm run render
```

Capture uses the same SVG renderer and reducer as the interactive app. It is an offline render, not browser/input-device test evidence. The app's native textarea and DOM event bindings require a separate browser check.
