# Source and reconstruction, revision 2

- Curator reference: https://www.inspora.design/posts/9-6
- Posted by @marcelkargul: https://x.com/marcelkargul/status/2089632076370763821
- Original media URL, checked against the post's original-media field: https://media.inspora.design/posts/380c26c2-3ef6-4111-93e4-b031adac1a87.mp4

The original is 1920 × 1728, 179 encoded frames at 30 fps, 5.966667 seconds. Every original frame and every same-timestamp SVG reconstruction was inspected in numbered sequential sheets. Detailed original-versus-replica crops were also inspected at frames 0, 18, 39, 69, 105 and 125.

Two charcoal tabs, Emails and Attachments, illuminate in succession. Their underlines grow symmetrically from the center, hold, then collapse. The tab's lower inner edge catches a bright reflection, with a broader pool of light underneath.

## Independent implementation

The drawing is a standalone parametric SVG at 960 × 864. Pill positions and dimensions were measured, and both icons redrawn as original paths. Revision 2 uses scalar width, center, text brightness and light-intensity controls measured at all 179 native timestamps instead of interpolating only sparse 0.1-second samples.

Lighting is an independently implemented analytic model: two fitted Gaussian light fields below each tab, an exponential vertical reflection multiplied by a generalized Gaussian horizontal mask inside each pill, and a narrow specular stripe. Model parameters were fitted against unobstructed source regions. No source frame, raster texture, copied SVG/code, font or third-party image is embedded.

The six-second clean loop includes the entire original interaction and a final neutral frame. Pointer, click, focus and arrow-key selection are authored demo behaviors; the footage does not establish the original event handlers.

## Rights

No original reuse license was shown on the inspected post. This independent educational study grants no rights in the creator's design. Reference footage and screenshots are excluded from the package. Obtain necessary permissions before commercial use.
