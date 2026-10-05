# Run and validation

Open `index.html` directly. Click Sign to replay the signing sequence; Back to Docs or Cancel resets it. Escape cancels an interrupted sequence; R restarts the full preview. Reduced-motion users get immediate state changes. No data is submitted.

Tests: `node test.cjs`. Preview rebuild: install `sharp`, then run `node render.cjs`.

## Tests run

- `node test.cjs`: PASS. Initial/signing/success/reset phase assertions; exact 6.6-second loop seam; 400 finite SVG samples; simulated-DOM Sign/Back/reset, interrupted Escape, replay and reduced-motion paths.
- `node render.cjs`: PASS. 198 frames, 30 fps, 1080 × 1080 MP4; 20 fps, 864 × 864 looping GIF. Stills sample idle, handwriting, success and reset.
- Offline renders invoke the exact shared SVG scene used by the browser. They are not browser recordings.

## Browser runtime

Not run. Local Chromium launch and local-site browser access were denied in the current session. The restriction was not bypassed or retried. The public cloud browser cannot load these unpublished workspace files. Simulated DOM checks do not establish real-browser SVG, keyboard, focus or performance behavior.

## Visual self-review

Compared source 5 fps timing/contact sheet and full-resolution idle frame against replica idle, signing, success and return stills.

- Preserved square crop and large phone bottom, blue-to-pale gradient, white upper sheet, document hierarchy, dashed separator, equal-height action pills, and bottom home indicator.
- Signature is drawn as a continuous independent vector path, followed by the observed hold, details defocus, paper/check appearance and two-line centered confirmation.
- Success appears only after the signature stage. Back to Docs resets the demonstration; interruption is covered in logic tests.
- Corrected the separator gradient and sampled blue hues after source comparison.
- Remaining differences: independently drawn phone hardware, paper/check and signature shapes; system font metrics; source cursor and compression texture omitted. Background blur and layered typography are approximations, not pixel-identical reproductions.

Self-review: passed for the independent motion study with these declared differences. No actual-browser pass is claimed.
