# Genie motion model

## References

- Minimize: [Harshil Shah's article](https://harshil.net/blog/recreating-the-mac-genie-effect/) identifies its [System Preferences clip](https://harshil.net/c43d923742c09a1704d62551cea4a912/sysprefs.mp4) as the native animation, separate from his recreation.
- Restore: [macos-defaults Dock settings](https://macos-defaults.com/dock/mineffect), [reference clip](https://macos-defaults.com/assets/genie.D0sOVPm_.mp4).

These recordings establish encoded motion, not exact OS builds or capture-time speed.

## Geometry and timing

The sheet keeps its texture height while translating behind the Dock. Its sides follow a screen-coordinate cosine corridor, with independently changing left/right amplitudes:

- C(y) = 0.5 − 0.5 cos(π clamp((y − y0) / (yD − y0), 0, 1))
- L(y,t) = L0 + AL(t) C(y)
- R(y,t) = R0 + AR(t) C(y)

Fixed world-y bounds keep the corridor stationary as the sheet moves. Native-time top positions and amplitudes use shape-preserving cubic interpolation; recorded holds remain holds. The mouth narrows then widens, rather than staying a fixed target rectangle. Restore has its own measurements: the top settles before the lower edge finishes opening.

- Minimize: unchanged at 0.733333 s; first change at 0.750000; downward translation at 0.850000; no visible ribbon at 1.233333. Sampled interval: 500 ms.
- Restore: hidden at 1.533333 s; first protrusion at 1.566667; top home near 1.900000; resting geometry at 2.066667. Sampled interval: about 533 ms.

`src/calibration-data.js` stores measurements; `src/calibrated.js` evaluates them; `src/motion.js` handles playback/interruption; `src/scene.js` draws the artwork. A short pose bridge preserves interrupted motion and is an authored addition.

## Limits

The demo retargets measured motion to original artwork and different window/Dock anchors. Canvas strips do not reproduce Apple's compositor, shadows, translucent blending or icon-layout response. Hidden sheet geometry is unobserved. Spatial fit diagnostics use the same recordings as calibration; missing source frames do not establish sub-frame timing. See [comparison methodology](validation/comparison-methodology.md) and [runtime checks](VALIDATION.md).
