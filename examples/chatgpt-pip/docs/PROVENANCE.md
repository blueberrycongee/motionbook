# Provenance and scope

The GIF, MP4, and PNG previews are deterministic offline SVG/Sharp renders, not application recordings, browser screenshots, or native macOS captures.

The snap preview uses the approved v4 sequence: 6.5 seconds of slow drag, 6.5 seconds of fast flick, followed by 3 seconds replaying the fast release at half speed. Its solver runs at 60 Hz and its output is sampled at 30 fps. The complete slow and fast state histories are unchanged. Editorial headings, watermarks, diagnostic markers, projected-path guides, status panels, and fixture captions have been removed. The viewBox is reframed without changing any positions, scaling, timing, spring constants, or pointer inputs.

The optional hover preview retains the previously supplied 21-second interaction sequence at 15 fps. It is a state illustration; its scripted drag portion is not a native trajectory measurement. The clean viewBox includes its external hover controls and shadows.

Shared JavaScript state, geometry, hover, completion, and browser adapter modules are byte-identical to the approved v4 inputs. The runnable demo changes presentation text and visibility only. All functional controls, DOM IDs, event handlers, and animation logic remain available.

The local menu fixture and mascot are independently drawn. The two hover-control icons are independent window/companion SVG drawings, exported at 102 × 102 pixels by scripts/draw-control-icons.mjs. No third-party icon pixels or traced paths remain. Interaction inspiration is credited to OpenAI in LICENSE.md and public/assets/ATTRIBUTION.txt. No reference video, source screenshot, installer, executable, private addon, disassembly dump, or side-by-side source-media comparison is included.

The implementation remains an independent reconstruction of observed contracts. AppKit compilation, native runtime behavior, and pixel parity have not been verified on this Linux host. Private backdrop filters are approximations; remote transport and genuine IAB/Chrome focus handoff are not implemented. The demo only uses local fixtures and does not open a user Codex/Work session.

The trajectory is stored losslessly as artifacts/snapping/trajectory-trace.json.gz.b64. Both regression readers support this compressed form without requiring a raw JSON file. The renderer writes the compressed form directly.

## Original control replacement

The public-release cleanup replaces both extracted hover icons with original rounded-window, diagonal-arrow, and companion geometry. The browser CSS, AppKit target, and offline hover renderer now consume the replacement. Control placement, 16-point fitting, 22-point cells, timing, and all motion/state code are unchanged. The native target still requires macOS compilation/runtime verification.
