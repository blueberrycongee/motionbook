# Run and controls

Run `npm start` and open `http://localhost:8029`. The page has no external service or API key.

Click Add label to take over the replay: filter labels, toggle selections, create a label and choose its color. Arrow keys and Enter select rows. Escape returns from the nested palette or closes the picker; clicking outside dismisses it. Replay resets the sequence. Reduced motion starts paused.

The replay preserves typing pauses and adds a closing fade back to the initial labels. Live editing uses the same state flow with direct input responses.

## Development

- `npm test`: scene timing, nested creation, duplicate prevention, keyboard selection, interruption and reduced-motion checks.
- `npm install && node render.cjs 4.8 still.png`: render a still with Sharp.

Previews are offline SVG renders. Browser interaction and rendering remain untested. Font contours, pointer shapes and antialiasing differ from the reference.
