# Behavior and validation

A ten-panel cyclic ribbon pinches at its center and flares at its edges. Dragging carries an inertial bend across an inverse screen-space mesh. Live input uses bounded deformation, decaying momentum and a short blend when taking over from replay.

`npm test` covers timing, finite/ordered edges, wrap, interrupted drag, reverse input, momentum, reduced motion and mocked app bindings. Replay follows native variable timestamps; the GIF is a viewing derivative.

Previews are offline Canvas renders with original artwork. Browser playback, touch, full-screen activation and device performance remain unverified; the geometry/cadence is a reconstruction rather than pixel parity.
