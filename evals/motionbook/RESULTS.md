# Catalog and retrieval check, 2026-10-07

Checked against the working-tree skill revision based on `6a2c6f53724c147f66d1dbe0b5a0f7eb2bdc25f7`. This records deterministic Python checks, not a controlled whole-agent comparison or new UI/browser acceptance.

## Executed checks

- `python3 scripts/catalog.py --check`: passed. All 51 example directories and 51 root GIFs are represented; the root gallery remains three columns. All 77 source anchors resolve to one literal declaration at the recorded line inside the matching example.
- `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s evals/motionbook -p 'test_*.py' -v`: 25 tests passed, including 21 request/query cases in the retrieval matrix. Invalid field types, versions, missing entries, path traversal, cross-example paths, missing/ambiguous anchors, stale lines, duplicate anchors, unsupported capabilities and changed gallery columns are rejected.
- The skill was copied to a temporary directory without the repository. Its CLI still retrieved the portfolio hover example, returned valid JSON and exposed source anchors. Example paths intentionally continue to resolve against the repository, not the installed skill.
- `git diff --check`: passed for the catalog/skill revision.

## Observed retrieval corrections

The old search function was loaded from `6a2c6f5` and compared with the new function using the same current entries.

| Query | Before | After |
| --- | --- | --- |
| `ring` | Spring code input ranked ahead of Ringwriter because `ring` matched `spring` and `string`. | Ringwriter is the only result. |
| `progress reduced motion` | Progress squeeze and file upload ranked ahead of micro-progress; the motion requirement matched an editorial motion label. | Micro-progress is the only result, linked to its inspected reduced-motion controller branch. |
| `reduced motion` | Returned expressive effects without checking implementation coverage. | Every returned entry has a source anchor explicitly tagged for that branch. |
| `气味 密码 强度` | No match. | No match, preserved. |
| `portfolio hover` | Playful project hovers first. | Same relevant first result, with state-model and reduced-motion code anchors added. |

## Evidence limits

Fourteen examples currently have an explicitly inspected reduced-motion capability anchor. This is a partial index of source behavior, not proof of full accessibility, dynamic preference handling or runtime success. For example, the micro-progress app reads the initial media preference; a target adaptation should also consider preference changes while running.

The 51 catalog entries retain their existing editorial categories and use-case caveats. Source anchors identify a small place to begin reading; dependencies, sampled motion data, real business state, responsive geometry and target input handling may still need adaptation. No full interface, source artwork or example implementation was copied or changed by this catalog revision. The six end-to-end agent prompts and their browser/integration rubric remain an unrun evaluation kit in this pass.
