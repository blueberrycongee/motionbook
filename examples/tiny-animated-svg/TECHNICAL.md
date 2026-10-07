# Implementation and reuse

An independently drawn SVG adaptation of the iridescent PRO animation in Mike Bespalov's Refero upgrade flow. SMIL drives a 4.4-second diagonal light sweep through three inner-shadow layers, blur, procedural grain and component-transfer color mapping. It has no JavaScript, font, raster-image or network dependency.

Open `index.html` for the effect, or reuse `pro.svg` directly. The page centers the SVG on white, omitting the checkout UI. Reduced motion shows a static SVG.

## Reference and rights

- [Inspora](https://www.inspora.design/posts/tiny-animated-svg)
- [Mike Bespalov's original post](https://x.com/bbssppllvv/status/2104747296671883312)
- [Creator's technique breakdown](https://x.com/bbssppllvv/status/2105312970410537249)
- [Original video](https://media.inspora.design/posts/7b43f354-3903-4a26-a29c-f36261997565.mp4)

Contours and filter parameters are independently recreated; the original SVG, reference video and screenshots are not included. No public reuse license was found for the original artwork. No rights to Refero's branding or design are granted; obtain any needed permission for commercial reuse.

## Development

- `node src/build.mjs`: regenerate SVG, page and reduced-motion still.
- `npm test`: source and loop checks.
- `npm install && npm run render`: regenerate previews; requires FFmpeg.

Previews evaluate the SVG offline with Sharp/librsvg. Browser playback and browser-specific filter output remain untested.
