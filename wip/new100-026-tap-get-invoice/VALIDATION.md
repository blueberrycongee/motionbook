# Reconstruction checkpoint status

All 831 native poses and 105 authored hold/reset poses have been rendered afresh with Sharp/librsvg. Full pair review is in progress; native frames 0–191 have been inspected so far, plus 28 paper/lip keyframes and 23 enlarged pen comparisons. Paper timing and the reverse-fold projecting faces are close at these reviewed points. The pen study still has visible start-position and return-loop timing differences; refinement is ongoing. This is not a final freeze.

Node tests cover projective corner mapping, finite font geometry, geometric stroke prefixes, all 831 source timestamps and SVG construction, separate reverse paper faces, loop reset identity, repeated/interrupted open/close commands, reduced motion, Escape while already closed, and PDF byte offsets. Browser runtime and performance have not been tested in this environment. Earlier browser security restrictions remain respected.

Run `npm test`. Serve with `npm start`, open http://127.0.0.1:4173 . Get invoice takes control, Escape or an outside click closes, Replay or R restarts the recorded sequence. Download PDF produces a local illustrative document without network requests. The full demo is 15.6 seconds, including an authored hold/reset tail.
