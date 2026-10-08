# Round 4: live interaction

Six independent HTML studies compare a floating document composer and a nested label picker. [Briefs](briefs/) · [Conditions](CONDITIONS.md) · [Review contract](JUDGING.md)

The formal Motionbook skill is unchanged. The state-identity candidate did not establish a consistent improvement over the current entrypoint in this exploratory round.

## Browser evidence

[Chromium run](https://github.com/blueberrycongee/motionbook/actions/runs/37816365890) executed the frozen source at `712c6271ed78b71598e16dd5dd6c2d95f32decea`: Node 22.23.3, Playwright 1.64.0, Chromium 156.0.8078.4, Linux x64. Each study ran at 960×720 and 390×720, with normal and reduced motion. There were 240 check results: 212 passed, 28 failed. No fatal, configuration, or video errors occurred; all evidence uploaded. The failed CI status records study failures, not an installation failure.

| Study | Condition | Passed / failed |
| --- | --- | --- |
| A — composer | Candidate | 36 / 0 |
| C — composer | Current | 36 / 0 |
| E — composer | No skill | 32 / 4 |
| B — labels | No skill | 20 / 24 |
| D — labels | Candidate | 44 / 0 |
| F — labels | Current | 44 / 0 |

[Complete check records](evidence/browser-results.json) · [Summary](evidence/summary.json)

B closes during selection or entry into creation, blocking later checks. Its 24 failures are repeated observations, not 24 distinct bugs. E fails collapse under normal motion and mouse Send with reduced motion at both widths. Screenshots support visible defects; their shared focus-dismissal patterns are a possible cause, not a confirmed root-cause investigation. Frozen submissions are preserved, including failures.

Passing these checks is not complete visual acceptance. In particular, vertical clipping and content overlap can remain despite the runner's horizontal-overflow check. Screenshot captures during entrance animations are not settled opacity measurements. The label comparison uses reduced-motion captures to avoid that phase mismatch.

## Visual review

Two independent reviewers inspected anonymous rendered outputs and recorded frames, without the condition map, and froze their reports before disclosure. The visual reviewer prefers C > A > E for the composer (C/A close); the interaction reviewer ties A = C > E. Both prefer D > F > B for labels. Thus the candidate does not consistently beat current across tasks. Their reports distinguish preference, observed defects, and runner evidence. The coordinating root knows the map and is not a blind judge.

- [Visual review](evidence/blind-visual-review.md)
- [Interaction review](evidence/blind-interaction-review.md)
- [Composer comparison](evidence/previews/composer-expanded-comparison.png)
- [Label comparison](evidence/previews/tags-filtered-comparison.png)
- [Actual browser recording excerpt](evidence/previews/composer-actual-browser-comparison.gif)
- [Media limits](evidence/previews/media-notes.md)

This is one generated sample per condition and task, not a controlled estimate of average skill benefit. Four browser configurations do not create four independent generations. Current and candidate are both behaviorally stronger than these no-skill samples; that observation does not establish causation or model-wide superiority. Neither the new clause nor any visual preference is promoted into the formal skill.

## Replay

Serve this directory with a local HTTP server, then open `viewer.html?id=A` (A–F); append `&narrow=1` for a 390px frame. Each submission also opens independently.

For browser evidence, use Node.js 22:

```sh
npm install --no-save --ignore-scripts --no-audit --no-fund playwright@1.64.0
npx playwright install --with-deps chromium
node harness/browser-check.cjs
```

The runner writes `evidence/results.json`, screenshots and browser recordings. Real model requests, actual mobile hardware and OS-native IME are outside the experiment. Synthetic IME events only check the exposed event handlers. Frame sampling cannot certify perceived real-time smoothness.
