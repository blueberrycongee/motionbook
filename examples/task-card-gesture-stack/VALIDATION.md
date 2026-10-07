# Run and controls

Open `index.html` directly or run `python3 -m http.server 8000`. No build or network service is required.

Drag a card horizontally, press Enter/arrow keys on the focused card, or use Snooze, Complete and Next. An action after completion restarts the stack. R replays; Escape stops autoplay. Reduced motion starts still and makes dismissals immediate.

An authored closing transition returns the stack to its initial state. Incoming content, returning-card blur and completion-line visibility follow separate timing.

- `node test.cjs`: scene states, card phases, completion/reset, loop seam, drag/buttons, keyboard, replay and reduced motion.
- `node render.cjs`: regenerate shared-SVG previews; requires Node, Sharp and FFmpeg.

Previews are offline renders. Browser interaction remains untested. Substitute glyphs, symbols, shadow falloff and exiting-line softness differ from the reference.
