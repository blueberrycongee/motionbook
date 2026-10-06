# Horse silhouette revision

The user requested comparison with a real horse because the previous legs looked too thin. The broad-muscle/taper/joint/hoof silhouette improvements were retained as the starting artwork. The later real-video motion revision replaces the earlier rig; see GAIT-REFERENCE.md.

## References visually inspected

- University of Minnesota Extension: a real side-profile horse photograph in “Conformation of the horse.” The shoulder and thigh merge into substantial upper limbs; the cannon is narrower, while fetlock and hoof widen again.
  https://extension.umn.edu/agriculture/animals-and-livestock/horse/conformation-of-the-horse
  Photo: https://extension.umn.edu/sites/extension.umn.edu/files/styles/caption_large/public/Thirds-horse.png?itok=YxjDAFqJ
  Copyrighted university image, used only for study. It is not used as an implementation asset or packaged in this source.
- J. Wortley Axe, 1905, “Exterior of the Horse — Side View.” Particularly useful for the engraved style, angular hock, projecting fetlock, pastern and wedge-shaped hoof. Commons marks the image public domain in the United States.
  https://commons.wikimedia.org/wiki/File:Exterior_of_the_Horse_-_Side_View.jpg
- University of Arkansas, “Horse Conformation Analysis,” describes muscular shoulders/arms and forearm/gaskin mass extending toward the knee/hock.
  https://www.uaex.uada.edu/publications/pdf/FSA3029_2020.pdf

## Changes

These dimensions are art-direction choices in the SVG's own coordinates, informed by the reference images. They are not universal anatomical measurements.

- Broad, curved muscle mass blends the foreleg into the shoulder/chest and the hind leg into the thigh/stifle.
- Upper attachment width: fore 6 → 15.6; hind 8 → 18.5.
- Forearm/gaskin proximal width: 6 → 11.2 / 11.8, smoothly tapering to the joint instead of forming a uniform bar.
- The lower cannon remains relatively slender: 3.5 → 4.8 at its top, with taper below.
- Fore carpus has a compact joint enlargement. Hind hock has a separate backward-projecting angular silhouette.
- Added a rear-projecting fetlock, a separate short angled pastern, and a broader hoof with a sloping front wall and flat contact edge.
- Hoof base width: 7.6 → 9.4, preserving the existing toe pivot.
- Hatching describes upper muscle mass. Shorter, lighter highlights on the cannon avoid the earlier wireframe appearance.

Relative to the 4.8-unit cannon, the upper forearm is about 2.3×, the carpus about 1.6× and the hoof about 2× wide.

## Later motion revision

The current real-video-informed rig replaces the earlier joint solution. It has explicit pastern articulation, near-straight supporting forelegs, smoother toe-off, and a split rider response. See `GAIT-REFERENCE.md` for the current implementation and checks.

The clean previews have no added titles, captions or watermarks. They are offline renders of actual SVG/JavaScript, not browser recordings. The desert and blue-paper artwork are independently recreated procedural SVG assets; see PROVENANCE.md.
