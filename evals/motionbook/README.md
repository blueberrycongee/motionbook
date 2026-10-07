# Motionbook behavior evaluation

Maintainer-only evaluation material. Do not load this rubric into ordinary Motionbook tasks or provide it to a candidate. Run this when assessing a skill revision, not on every invocation. This procedure and the fixed prompts are an evaluation kit, not recorded evidence that the skill performs better.

## Controlled comparison

1. Freeze the repository revision, catalog, target fixture, model, tools and runtime permissions. Compare the old and new skill with those inputs held constant. Save both skill versions and environment details with the results.
2. Start a fresh session for each prompt/variant; provide only its prompt, skill and relevant source/fixture. Keep this directory, scoring criteria and other candidate outputs outside the candidate workspace. Use neutral workspace names. Do not tell candidates which variant they have.
3. For integration cases, prepare one minimal target fixture before running either variant. Save its commit or archive and a run command. Both candidates receive identical copies. Permit writes only in disposable targets; do not publish or modify the source library. Use headless or isolated UI execution.
4. Keep actual tool transcripts, final outputs, target diffs and runtime evidence. Compare anonymized outputs with the same rubric. Human review is sufficient; multiple agents or models are not required.
5. Report per-case findings and concrete failures, plus elapsed time and token usage when available. Repeat ambiguous cases before drawing conclusions. Do not claim an aggregate win from one run or substitute prompt compliance for working interaction.

## Fixed user prompts

Use these prompts verbatim. Fixture/run details may be appended equally to both variants.

| ID | Prompt | Inputs supplied |
| --- | --- | --- |
| discover-tags | 用 Motionbook 找适合后台管理系统的标签就地创建交互，解释可借用部分和限制，只推荐，不改代码。 | Frozen library access; no target needed. |
| discover-playful | 给我的作品集找一个有趣的 hover 参考，解释触屏上怎么替代，不要默认选后台风格。 | Frozen library access; no target needed. |
| no-match | 找一个通过气味反馈提示密码强度的 Motionbook 示例；如果没有直接告诉我，不要拿普通加载动画凑数。 | Frozen catalog and library access. |
| explain-slider | 拆解 Fractional Slider 的状态、关键动效参数和输入处理，区分源码事实与推测，不要修改文件。 | Selected example source and existing evidence. |
| integrate-tags | 把 Motionbook 的标签就地创建交互适配到这个页面，沿用已有技术栈和样式；要求键盘可操作，创建取消后能恢复焦点，并实际验证。 | Identical runnable target with a tag picker and documented create/cancel contract; reference source. |
| integrate-progress | 借鉴 Motionbook 的 micro-progress-button 改造这个提交按钮，处理等待、成功和失败，避免等待期间重复提交，支持减少动态效果；给我运行证据。 | Identical runnable target with a submit counter and deterministically controlled pending/success/failure states; reference source. |

## Reviewer rubric

For each applicable criterion mark **met**, **partial**, or **failed**, citing a transcript location or artifact. Use **not applicable** rather than awarding free points. Reasonable alternatives are allowed; there is no required exact recommendation or wording.

| Criterion | Evidence to inspect |
| --- | --- |
| Retrieval relevance | Candidate solves the stated interaction need; playful intent is preserved; no-match is acknowledged instead of filled with unrelated examples. Inspect actual search terms and selected entries. |
| Scope | Reference/explanation tasks leave files unchanged; integrations preserve target conventions. No unsolicited prototype, publication or unrelated edits. |
| Source grounding | Explanation/integration reads the selected implementation and provenance. Consequential motion claims link to inspected source; inference and adaptation are identifiable. |
| Behavior | Integration works in the provided fixture, including requested cancellation/focus or pending/failure behavior. Re-run the supplied actions; code shape and self-report alone do not pass. |
| Evidence honesty | Runtime captures/logs correspond to the adapted implementation. Offline previews and unavailable checks are identified; no claim of successful input handling based only on a GIF or build. |

Keep retrieval failures separate from implementation failures. Change search behavior only when observed retrieval failures justify it. Record limitations when a runtime or source cannot be accessed, and compare variants under the same limitation.

## Executable metadata and retrieval checks

Run from the repository root:

```sh
python3 scripts/catalog.py --check
python3 -m unittest discover -s evals/motionbook -p 'test_*.py' -v
```

`retrieval-cases.json` contains 21 realistic requests and the compact keyword queries an agent would derive from them, including Chinese/English terms, fit/type filters, no-match cases, word-boundary collisions and source-inspected reduced-motion requirements. `test_catalog.py` checks those results, a relocated installed-skill CLI, exact code anchors, gallery coverage and rejection of invalid metadata. This is deterministic search/metadata regression coverage, not evidence that an agent follows the full requests or that the referenced UI works. Continue to use the controlled comparison above for end-to-end skill claims. See [the latest recorded check](RESULTS.md).
