# Run and controls

Requires Node.js 20+. Run `npm start`, then open `http://localhost:4173`.

Drag or scroll a date column, or focus it and use arrow keys. Choose a status/color, then use Mark, Undo, Done, Download PDF or Next invoice. Enter marks the invoice; R, Escape or Replay resets it. Reduced motion starts in a stationary editor and applies changes immediately. PDFs are generated locally as illustrative documents.

The replay advances the date 13→14→15, fades the form, extrudes the stamp and reveals the invoice. Stamp contact prints the date, followed by rebound and Undo/Done controls; Done flattens the document. An authored closing crossfade returns to the editor.

## Development

- `npm test`: date bounds/leap years, status changes, mark/undo/done/next, input events, reduced motion, PDF output and scene timing.
- `npm install && npm run render`: regenerate previews; requires FFmpeg and the pinned Sharp dependency.

Previews use the page's SVG scene rendered offline. Browser hit testing, focus, downloads and performance remain untested. Substitute typography, stamp contours, ink edges and light/shadow details differ from the reference.
