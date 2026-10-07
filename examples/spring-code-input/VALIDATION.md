# Run and controls

Run `python3 -m http.server 4195`, then open `http://localhost:4195`. Add `?clean` to hide controls. The demo has no runtime dependencies or external asset requests.

Try it enables local input. Enter 123456 for success; another six-digit value demonstrates error recovery. Escape resets; clicking the successful pill starts another attempt. Input stays on the page and is not saved. This is a visual study, not authentication.

Replay can pause or restart, and live input respects reduced motion. The replay follows the source's variable-rate timing and adds a closing morph from Verified back to Enter code.

- `npm install && npm test`: input/paste limits, replacement, verification interruption, retry, reset, replay, reduced motion and bounded scene states.
- `npm run render`: regenerate previews; requires FFmpeg.

Previews are offline Canvas renders. Browser layout, fonts, focus, touch and accessibility behavior remain untested. Substitute glyphs, blur, overlapping cells, pointer shape and spinner phase differ from the reference. See [source and font rights](PROVENANCE.md).
