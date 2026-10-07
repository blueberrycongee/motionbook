# Run and validation

## Run

Open `index.html` in a modern browser. The runnable controls are the bottom city capsule, the top palette button and the first two theme swatches. The times and date are deterministic reference-study fixtures, not a live clock.

- Open the city capsule, type a city name, country or GMT offset, then choose a result.
- Arrow Up/Down moves the search selection; Enter chooses it.
- Escape or a background click closes search. Focus returns to the city trigger.
- The palette button shows appearance controls. Gray/black selects light/dark.
- R repeats the reveal when not typing; modified browser shortcuts are preserved.
- Reduced motion immediately settles character and theme animation.

The other drawn controls are unfinished visual placeholders. See [status](STATUS.md).

## Passed on 2026-10-07

`node --test test.cjs app.test.cjs`

18/18 tests passed. The suite covers alphabet completeness, deterministic reveal, isolated city-row replacement, filtering, no-results handling, exact result/capsule rectangles, keyboard wrap/selection, stale-state cleanup, repeated city selection, interrupted theme reversal, reduced motion, idle render shutdown, focus restoration, pointer dismissal and modified-key handling.

Four tests execute the input adapter in a minimal mocked DOM. They do not exercise Chromium, layout, real pointer dispatch or assistive technology.

`XDG_CACHE_HOME=/tmp/airport-font-cache node render-states.cjs`

The offline snapshot renderer requires the `sharp` package and uses one rendering thread. It generated the four authored PNG states under `evidence/` and the combined `authored-states.png`. These were inspected for clipped content, absent result messaging, active-result outline and theme legibility. They are render checks of authored SVG, not original-video comparisons or browser screenshots.

## Attempted and blocked

- Installed Chromium through Playwright: launch failed with `socket() failed: Operation not permitted (1)`. A reviewed escalation encountered the same error.
- Dot cloud browser, file URL: rejected by URL protocol policy.
- Dot cloud browser, local HTTP URL: `net::ERR_BLOCKED_BY_CLIENT`.
- Original reference: exact recorded media URL returned HTTP 403; no saved source bytes or verified original frames were found in the available workspace/Library.

## Not run / not passed

Real browser interaction and responsive layout acceptance, original native-frame inspection, per-frame original-versus-recreation comparison, missing reference motions, final GIF/MP4 export and independent final fidelity acceptance. No completed or accepted showcase claim is supported by this checkpoint.
