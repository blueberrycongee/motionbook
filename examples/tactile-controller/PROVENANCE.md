# Source and motion

Reference: [Brightness and volume controller](https://www.inspora.design/posts/1-1), by [@staromlynski](https://x.com/staromlynski/status/2024447353415958577). [Original footage](https://media.inspora.design/posts/6674ca4e-7fef-4c30-844e-29780310da32.mp4).

Housing, track, selector buttons, icons, dial, shadows and grain are independently drawn SVG. Tracks contain measured fill, color and glyph motion, not source pixels or original code. Reference footage has no established reuse license and is not redistributed. See [rights](LICENSE).

Inter Regular 4.001 is bundled under the [SIL Open Font License](assets/Inter-LICENSE.txt). Upstream: [Inter](https://rsms.me/inter/). The original typeface is unknown.

## Sequence

The sequence shows empty startup, warm brightness fill and staggered 52% entry, a switch to blue Volume at 53%, clockwise adjustment to 72%, counterclockwise reduction to 14%, then display fade with Volume still selected.

Digits move independently: increases enter from below, decreases from above, and the percent sign has a longer settling interval. Repeated dial ticks make fast absolute rotation ambiguous; the fitted curve follows observed direction and slowdown.

An authored closing reset restores the initial mode and title.
