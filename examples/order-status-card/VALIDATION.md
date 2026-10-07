# Run and controls

Open `index.html` directly or run `python3 -m http.server 8000`. No build or network service is required.

Click a progress segment or use Left/Right to replay that stage. R restarts the complete loop, Space pauses/resumes, and Escape freezes the current state. Reduced motion starts still and changes selected stages immediately.

The sequence starts mid-delivery and ends with the fourth segment complete. Badge handoffs overlap; an authored reset closes the loop.

## Development

- `node test.cjs`: scene states, native timestamps, badge handoffs, loop closure, repeated actions, keyboard and reduced-motion checks.
- `node render.cjs`: regenerate previews from `scene.js`; requires Node, Sharp and FFmpeg.

Previews are offline SVG renders. Browser interaction remains untested. Substitute glyphs, vector symbols, paper grain and soft contours differ from the reference.
