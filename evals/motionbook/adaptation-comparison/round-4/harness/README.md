# Common browser acceptance harness

Run from `round-4` in a browser-capable CI runner:

    npm install --no-save playwright@1.64.0
    npx playwright install --with-deps chromium
    node harness/browser-check.cjs

The harness starts and closes its own loopback HTTP server. It never modifies submissions. Its inputs are the task briefs and six frozen HTML files only. It uses the same behavioral cases across each component kind, with small selector adapters for the actual HTML structure.

Upload `evidence/` with an `if: always()` artifact step, including on failed checks. `ARTIFACT_DIR` optionally overrides that output directory. A 15-minute workflow timeout is adequate headroom; every Playwright action has a timeout, all interaction loops are bounded, and a 25-second case deadline closes the active page to cancel pending browser work before the next case. A 90-second per-configuration deadline closes its browser context; override with CONFIG_TIMEOUT_MS if needed. Failures are recorded before proceeding to the next independent case or study. A missing source, configuration/capture error, failed check or fatal runner error produces a nonzero exit code after collection.

`results.json` records source and brief SHA256, Node/Playwright/Chromium versions, environment, individual checks, error details, screenshot paths, and actual Playwright video paths. Each study runs at 960×720 and 390×720, both with normal and reduced motion. Per-configuration video records the actual automated browser session, including reloads and failed branches; screenshots capture key settled states and failures at the fixed 720-pixel viewport height.

Interpret evidence individually. There is no universal grade or visual-quality score. IME coverage explicitly uses synthetic DOM events, not a native input method. Reduced-motion checks inspect visible computed CSS durations, not subjective animation quality. Focus checks require a visible outline in key keyboard states and recognize styled labels for visually hidden radio inputs and distinguish document-level tab-boundary focus from a focused control. Screenshots and these bounded cases do not replace a full accessibility or human visual review.

Local validation: `node --check harness/browser-check.cjs` passed. Browser execution was intentionally left to CI because the available shell environment cannot start Chromium under its runtime socket restriction. No browser acceptance results are claimed from syntax validation.
