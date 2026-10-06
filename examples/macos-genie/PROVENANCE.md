# Reference and rights

This unofficial study independently recreates Apple's Genie window-to-Dock behavior. No Apple implementation code, wallpapers, icons, fonts, logos or window screenshots are used by the app.

## Frame-calibrated revision

The current motion was measured from two native recordings and compared by frame timestamp, visible contour and internal texture landmarks. See [FIDELITY.md](FIDELITY.md) for references, methods, numerical error, temporal uncertainty, and remaining differences. The default preview uses the same normal-speed pipeline as the runtime. Slow motion is separately labeled. Neither preview is a native Mac screen recording.

## Historical and behavioral context

- [Apple Dock settings](https://support.apple.com/en-euro/guide/deployment/depef1fdf19/web) distinguishes Genie and Scale
- [Apple-assigned patent US7362331B2](https://patents.google.com/patent/US7362331B2/en), inventor Bas Ording, documents curved scanline deformation and translation; Figures 2A–2F were inspected
- [Bas Ording's first-person interview](https://archive.computerhistory.org/resources/access/text/2018/10/102738558-05-01-acc.pdf), printed pages 7–8, identifies Genie and describes slow motion as a development aid
- [Original Dock engineer James Thomson's account](https://tla.systems/blog/2025/01/04/i-live-my-life-a-quarter-century-at-a-time/) records the January 5, 2000 Aqua introduction

The 33-example collection at source commit b7cbfa7d4467e070365629bfe0da0edbaf03aafd had no Genie reconstruction. Existing PiP snapping and Dynamic Island studies address different interactions.

## Attribution and limits

The app artwork and implementation are newly authored. Inter font files were reused unmodified from this repository's thanos-snap-ticket assets; their existing SIL Open Font License is preserved in assets/Inter-LICENSE.txt. Repository folder/preview conventions were followed without copying another animation implementation.

The separately delivered short side-by-side comparison is an attributed critical comparison of the two referenced recordings and this reconstruction; it contains only the relevant transition excerpts. No reference recordings, comparison videos, captured frames or comparison stills are checked into this example. The app uses only original artwork and numerical measurements.

Apple/macOS/Genie remain references to their owners' products. No affiliation, endorsement, patent-clearance conclusion, or new license for third-party material is asserted. This addition does not change the repository's licensing policy.
