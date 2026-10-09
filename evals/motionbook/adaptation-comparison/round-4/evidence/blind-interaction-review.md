# Frozen independent interaction review

Status: frozen before condition disclosure. Reviewed A–F without opening CONDITIONS.md, condition variants, implementation reports, or another judge’s report. This is a preference judgment for these artifacts, not a numerical grade or a general claim about an implementation method.

## Preference

- Composer: **A = C > E**. A and C are a genuine tie: both provide coherent draft, dismissal, sending, and keyboard behavior in the supplied checks, with different but defensible visual proportions. E has attractive compact presentation, but the supplied interaction evidence exposes unreliable pointer transitions.
- Tags: **D > F > B**. D keeps the nested decision and its action visibly together. F is functional in the common checks, but its desktop creation panel hides most of the primary action until scrolling. B’s pointer-driven selection and nested transitions repeatedly fail to produce the expected visible outcome in the recording, although a keyboard creation path does pass.

## Evidence and boundaries

Read the common briefs and JUDGING.md; inspected the supplied composer and nested reference contact sheets. Inspected rendered desktop and narrow screenshots for every submission, including initial, edited/filtered, nested/multiline, and result states. Inspected keyboard-focus screenshots for A, C, and D at full size and F’s desktop nested form at full size. Read the common results.json, including individual failure messages and focus observations.

Extracted sequential frames from all six 390px no-preference browser webm recordings at 4 fps, plus 20 fps windows around B’s selection transition, E’s expansion/collapse transition, and E’s reduced-motion click-send behavior. These are frames from actual browser recordings, not reconstructed animation. Temporal sampling establishes state progression and conspicuous discontinuities; it does **not** establish real-time perceptual smoothness, dropped-frame performance, or subjective easing superiority. I did not play every recording end to end at native speed. I did not run a browser.

After visual observations, inspected B and E’s HTML for relevant control semantics and focus/state handling, F’s panel overflow/height rules, and the relevant common harness assertions. This was to distinguish missing controls or naming mismatches from observed interaction outcomes, not to reward implementation length. Scratch frame sheets remain local in blind-interaction-work and are not deliverables.

Native OS IME, mobile software keyboard behavior, screen-reader operation, long-history stress, and a complete accessibility audit are unavailable. Synthetic composition checks and a 390px desktop-browser viewport do not prove those behaviors.

## Composer observations

### A

Layout and hierarchy: The short document is clearly primary, with an aligned bottom composer and enough separation for the expanded draft. At 390px the document, editor, and controls remain within the viewport. The compact composer devotes a second line to the document context; the expanded conversation becomes a larger unified surface. After sending, it covers the document’s lower area but leaves the title and fixture body readable in the inspected state.

Visual treatment: Warm off-white surfaces, green-gray accents, serif document text, and rounded editor form a coherent reading environment. Context and auxiliary captions are small and light. The extra note captions and conversation heading are optional taste choices, not evidence of greater quality. The round expand-focus ring is conspicuous and readable in the keyboard screenshot.

Interaction: The common runner reports successful draft retention across explicit collapse, Escape, document click and reopening, newline versus send, exactly-one visible message/reply, empty-send suppression, synthetic IME handling, and keyboard focus checks at both widths and motion settings. Recording frames show retained draft in the compact editor and a visible user message plus explicitly local reply after sending. No specific functional defect observed in this scope.

Motion: Frames show bottom anchoring maintained while the editor grows upward, then a return to compact draft. The document itself stays stable through those transitions. No basis for declaring A smoother than C from this sampling.

### C

Layout and hierarchy: A taller paper surface makes the document feel more like a page; the composer is restrained and well aligned. At narrow width the expanded draft sits close to the document’s lower edge. The separate conversation card overlaps the lower document after send, but the fixture title and body remain readable. The broader user-message surface makes the result easy to scan.

Visual treatment: Consistent muted palette, serif title/body, soft shadows, and clear focused textarea boundary. Slightly fewer surrounding captions than A; slightly more empty paper. Those tradeoffs balance rather than establish a winner. The keyboard expand ring is clearly visible.

Interaction: The same substantive common behavior checks pass as A across all four configurations. The sampled sequence shows compact retained text, expansion, the multiline result, and the local reply. No specific functional defect observed. A single passing traversal is not a universal accessibility guarantee.

Motion: The editor and conversation grow from the lower workspace without displacing the document. Some multiline screenshots catch an intermediate state before expansion finishes; that alone is not an incorrect final state or a contrast defect.

### E

Layout and hierarchy: The slim initial input is economical, with a clean paper/composer relationship at both widths. Its expand and send controls sit beside the textarea, reducing usable text width compared with A/C when expanded. The separated result card remains legible in the inspected state. This is a reasonable layout alternative, not inherently inferior styling.

Visual treatment: Restrained green-gray surfaces and border focus treatment are coherent. Helper text is small/light, like the other entries. The initial single-row composition is particularly compact. I do not penalize it merely for being less decorated.

Observed interaction concern: The no-preference collapse test fails at the explicit collapse assertion at both widths. Its failure screenshot still shows the expanded draft. The sampled video likewise remains expanded through the relevant interval before the next independent reset. In reduced motion, pointer Send fails the exactly-one-message check at both widths; the 390px recording shows “Clicked message” remaining in a compact composer instead of a new conversation. These are meaningful activation/state outcomes, not proof of draft deletion. Enter sending and synthetic IME checks pass, and pointer send succeeds in the no-preference case.

Uncertainty: The HTML has the expected named controls and submit handler; this is not an obvious wrong-selector case. Focusout-triggered collapse and moving controls may be involved, but the precise event-order cause was not independently established. I would describe pointer collapse/send as unreliable under the recorded interaction, not claim every manual attempt must fail.

Motion: Its upward expansion has intermediate visible states in the 20 fps samples. The interaction issue changes with motion preference, so reduced motion needs behavioral verification as well as zero-duration CSS. The runner’s final motion-duration pass does not erase that issue.

## Tag-picker observations

### D

Layout and hierarchy: A modest project heading establishes context without competing with the picker. Labels, search, nested name field, labeled color choices, and Create align coherently. The compact two-row color grid keeps Create visible in both 960×720 and 390×720 nested screenshots. Selection remains visibly attached to the trigger area.

Visual treatment: Subtle rounded surfaces, distinct nested header, restrained green action, and readable focus outlines. Color choices have text labels and a visible selected state. Small secondary copy is understated. Preferring a compact grid to a vertical color list is partly taste, but keeping the completion action visible is a concrete usability advantage here.

Interaction: Common checks pass for selection persistence, query-preserving Back/Escape, exactly-once creation and selected color, outside dismissal, rapid switching, keyboard creation, and reduced motion. Recording frames show selected chips, search restored, and a visible focused color control. This is the most complete combination of rendered layout and interaction evidence of the tag entries.

Motion: In sampled frames the search/nested surfaces replace one another under a stable trigger area. No stranded visible partial panel observed. Fine easing quality remains unranked.

### F

Layout and hierarchy: Most narrowly scoped presentation, with existing Design and Research chips, a Labels trigger, and a minimal caption. Chip wrapping remains understandable at 390px. The nested form’s editable name, preview, and vertical named-color list closely preserve the reference’s interaction structure.

Visible concern: At 960×720, 05-nested-create.png shows only a thin dark sliver of the Create button at the bottom of the panel; the button label is hidden. The primary action is below the panel’s initial scroll view. The inspected CSS confirms a scrollable panel with a constrained maximum height. This is an action-discoverability/layout defect, **not an unreachable action**: the common create and keyboard-submit checks pass. At 390×720, the corresponding screenshot shows the complete action.

Visual treatment: Clear chip shapes, selected-color highlight/check, and a strong name-input focus ring. The nested rounded outer/inner surfaces are coherent. Its taller color list is not itself a flaw; the desktop clipping consequence is the problem.

Interaction: The common behavior checks pass across widths and motion settings. Created chips persist and query/Back/Escape behavior is supported by the runner. Starting with two labels already selected is an acceptable content choice under this brief, not a failure.

Motion: Filtered screenshots capture a translucent entering panel. Subsequent recording frames show an opaque, readable panel. I do not classify the intermediate opacity as a persistent contrast defect. Rapid reopening produces a usable visible picker in the supplied checks; native-speed smoothness remains unverified.

### B

Layout and hierarchy: Larger editorial heading and introductory copy place more emphasis on the surrounding page than D/F. The base picker is aligned below Labels and contains the expected search, label rows, and creation offer. On narrow screens the introductory text wraps somewhat awkwardly, including a short isolated “idea” line. That is a modest editorial/layout preference, not the reason for its ranking.

Visual treatment: Warm neutral palette and green-gray focus ring are consistent. The faded filtered screenshot is an entering animation frame: the 20 fps opening sequence becomes visibly opaque. It must not be scored as permanently washed out.

Observed interaction concern: In the recorded pointer selection sequence the picker disappears, the page shifts vertically, and no selected Personal chip remains visible. In subsequent pointer creation attempts, the supplied failure screenshots show the closed base page rather than an editable nested form. The common runner repeats these failures across all four configurations. Rapid trigger toggling ends open when the check expects closed. Keyboard selection also fails its selected-chip assertion.

Important qualification: This does not establish that nested creation is absent or categorically impossible. The separate keyboard activation/creation/Back check passes; the source contains a correctly labeled name field and creation form. The search timeout follows the panel disappearing, rather than proving the initial search control is missing or wrongly named. Multiple reported failed checks stop at the same early nested-entry assertion, so they should not be counted as independent demonstrated defects in color selection, duplicate prevention, and outside dismissal. Those later behaviors remain insufficiently exercised through the failed pointer path.

Motion and uncertainty: The opening fade is legible once settled. The more consequential observed discontinuity is panel disappearance and page-position movement during attempted interaction. Focus-related state handling is a plausible contributor, but this review does not establish the exact root cause or claim a selector correction alone would fix it.

## Interpretation

Prefer A or C for the composer and D for the picker on the present evidence. E and B need targeted activation/focus verification before their visual polish can be treated as a complete solution. F is behaviorally credible in the common runner, with a concrete desktop primary-action visibility issue. The ranking is bounded to these briefs, viewport sizes, states, and recorded inputs; it supplies no evidence about unseen conditions or general skill effectiveness.
