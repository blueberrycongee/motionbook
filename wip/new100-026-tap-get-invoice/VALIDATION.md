# Current checkpoint validation

The five Node tests cover projective corner mapping, finite font geometry, partial polyline lengths, all 831 native timestamp selections / finite SVG construction, separate reverse-fold paper faces, and reset-tail identity. These are model / renderer checks, not browser execution.

28 selected native-time SVGs were freshly rendered with Sharp/librsvg. Source/replica comparisons were inspected for frames 0, 17, 24, 29, 34, 39, 45, 130, 205, 210, 215–223 and 500–508. The reverse-fold projecting lip is separately modeled; pointer overlap was excluded from the right-edge fit. Broad unfolding structure and focused small-paper contours are close at those selected points.

This checkpoint is incomplete. Pen marks and recorded pointer tracks are absent. Full every-frame visual review, animation media exports and independent final review have not been performed on this new reconstruction. Font, icon and fine shadow differences still need full-size review. Native browser interaction / performance testing has not been run; earlier environment security restrictions are being respected.

Run `npm test`. To serve, run `npm start` and open http://127.0.0.1:4173 . Use Replay to restart the current recorded sequence. The recorded sequence is 13.888 seconds; the demo includes a hold and authored reset through 15.6 seconds.
