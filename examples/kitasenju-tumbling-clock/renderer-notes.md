# Shared digit renderer

## Result

`renderer.js` is an independently written CPU triangle renderer. Browser Canvas2D and Node `@napi-rs/canvas` use the same projection, clipping, scan conversion, reciprocal-depth buffer, flat lighting, supersampling and output pixels. It uses no Three.js, external rasterizer, network assets, browser font rendering, reference-video texture or painter-order approximation.

Load `geometry-data.js` before `renderer.js`; the browser global is `ClockRenderer`. Node uses `require('./renderer.js')`.

```js
const stats = ClockRenderer.render(ctx, bodies, {
  width: 564, height: 342,
  fov: 40, cameraDistance: 1300,
  target: [0, 0, 0],
  antialias: 2
});
```

Bodies are `{ digit, position: [x,y,z], scale, thickness, quaternion: [x,y,z,w] }` or use `rotation: [rx,ry,rz]` instead. Digits accept strings `'0'` to `'9'` or integers 0 to 9. Coordinates are right-handed: +X right, +Y up, +Z toward the camera. Euler rotation applies X, then Y, then Z in radians. A supplied quaternion takes precedence and is normalized. `scale` is cap height in world units, default 210. `thickness` is extrusion in world units, default 50; alternatively `depth` gives extrusion as a fraction of cap height. The meshes are centered on their tabular advance and the font's vertical digit extent; extrusion is centered about local Z=0.

The camera is front-facing, at `target + [0,0,cameraDistance]`. `fov` is vertical, in degrees. `target` shifts the world camera target without tilting. `center` optionally shifts the principal point in output pixels. No automatic canvas resizing occurs: set the canvas's backing dimensions to the options dimensions before rendering. Canvas transforms, fill styles, CSS zoom and native text engines do not affect the pixels because the renderer uses `putImageData`.

`project(worldPoint, options)` returns `[screenX,screenY,viewDepth]`, or null outside near/far depth limits. `containsDigit(digit,[localX,localY])` supports geometry checks. `DATA`, `DEFAULTS`, `LIMITS`, `cameraOptions`, `quaternionFromEuler` and `matrixFromQuaternion` are exported for inspection/testing.

## Geometry, provenance and editability

- `assets/LiberationSans-Bold.ttf` is the unmodified Liberation Sans Bold 2.1.5 source, licensed under SIL OFL 1.1. Copyright and license accompany it in `assets/OFL.txt`
- `build-geometry.py` adaptively flattens its curves, canonicalizes ring winding, and uses a new horizontal-slab triangulator. It pairs even/odd fill intervals, preserves every shared boundary subdivision and joins the cap and side walls into a closed indexed manifold
- Digit 1 is an original shoulder-style construction from a stem, horizontal flag and circular-quadrant shoulder. The OFL-derived contours receive a generic 0.012-cap weight offset followed by renormalization. No proprietary glyph outline or raster tracing is used. Exact construction is in build-geometry-v2.py
- The combined modified digit geometry is named **Clock Study Bold Digits**, avoiding the source font's reserved name. Derived geometry is retained under OFL 1.1 alongside the license
- No font or code from the reference author's unlicensed repository is bundled or reused. Historical camera/dimension facts informed independent parameter choices only
- `geometry-data.js` is a standalone browser/Node module. `assets/digit-geometry.json` contains the same editable contours, indexed 3D vertices, triangle classifications and validation metadata
- Each mesh has explicit front/back triangles and side triangles; holes in 0, 4, 6, 8 and 9 are actual holes, including interior walls. The cap height is normalized to 1 and mesh Z depth is 1, then independently scaled by the renderer
- Run `python3 build-geometry-v2.py` to rebuild the final meshes. It reads assets/base-digit-geometry.json and imports triangulation helpers from build-geometry.py. Requirements are fontTools and NumPy. Running the baseline build-geometry.py alone would regenerate the earlier geometry; it is not the final rebuild command

Geometry validation runs during generation: cap area agreement, all triangle centroids inside even/odd fill, two incident faces per edge, opposite directed edge winding, and the expected Euler characteristic 2−2h. Tests also check signed volume equals cap area times extrusion. Maximum observed cap-area discrepancy across ten digits is approximately 1.12e-10 normalized square units.

## Depth, seams and deterministic rendering

Near/far clipping occurs in view space before perspective division. Reciprocal view depth interpolates linearly across screen-space triangles and is tested at each covered sample. This resolves overlapping and interpenetrating digits locally, including two caps that cross so each is nearer in a different region.

Scan conversion uses a half-open pixel-center convention. Shared triangle edges need no black-gap cover strokes. Caps have planar normals; side normals are constant per contour segment. Gray side albedo plus flat Lambert lighting yields white front faces and distinguishable extrusion. There are no cast shadows or ambient occlusion.

`antialias: 1` computes one center sample per output pixel. `antialias: 2` computes a deterministic 2×2 box-filtered sample grid. Use the same antialias and camera settings in offline exports and live playback to retain pixel parity. No randomness or wall-clock time enters this renderer.

The renderer validates every body/options object before changing the Canvas. Nonfinite values, malformed vectors, zero quaternions, invalid digit values and out-of-bound workloads throw. Maximums are 48 bodies, 2048 per output dimension, 2,097,152 output pixels, 8,388,608 internal samples, ±100,000 world position, cap scale/thickness 2,000, and antialias factor 2. Cached buffers are per-context; resize reallocates them. Geometry behind the camera or outside the clipping planes is clipped rather than projected to infinities.

## Verification

Run `node renderer-test.cjs` with `@napi-rs/canvas` available. The executable test suite writes `assets/renderer-tests.json` and three static geometry-preview PNGs. It covers:

1. All ten meshes' manifold edges, winding, nondegeneracy, filled cap area, volume, holes and genus; the unfooted 1 adjustment
2. 445,440 sampled analytical front-silhouette comparisons with zero mismatches, including hole openings
3. A nearer foreground cap winning regardless of body draw order
4. Two crossing tilted caps, with analytical ray/plane depth checking on both sides of the intersection
5. A 30-digit interpenetrating pile, exact repeated pixels and reversed-body-order equality
6. Browser-global UMD module entry versus Node entry, exactly equal ImageData bytes
7. Euler/quaternion parity and quaternion normalization
8. Camera center/FOV/target projection, proportional resize and buffer resizing
9. Near/far clipping and extreme finite offscreen geometry
10. 34 malformed-input/limit cases, atomic rejection, the body limit, and empty output
11. Warm render benchmarks for 18 and 30 digits at 564×342 and 720×436 with both antialias modes

The browser module entry is tested in an isolated JavaScript VM with an ImageData-compatible shim. A real browser's UI, timing and canvas display have **not** been exercised by these offline tests; that requires separate integration QA. Pixel generation itself avoids browser-specific rendering APIs. This is a geometry/runtime test, not a claim of frame-exact similarity to the reference animation.

On the provided Node 24 / `@napi-rs/canvas` 0.1.100 environment, representative warm medians are about 5–6ms (18 digits) and 8ms (30 digits) at 564×342/1×, 10–11ms and 16–17ms at 564×342/2×, 7–11ms at 720×436/1×, and 14–21ms at 720×436/2×. These are workload-specific measurements, not browser frame-rate guarantees. The final exact samples are in the test report. Recommended live baseline is 564×342 at 2×; 1× is available for tighter frame budgets.

## v2 geometry update
Run build-geometry-v2.py for the final shoulder1/weight-offset geometry, using assets/base-digit-geometry.json and build-geometry.py triangulation helpers. Requires NumPy and fontTools; no reference screenshots or fitting data are needed. Material is configured separately in scene-config.js. See V2-FIDELITY.md.
