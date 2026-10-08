# Scope and attribution

An independently written ChatGPT document-workspace interaction reconstruction (复刻), not affiliated with or endorsed by OpenAI. Documents, local replies, icons, typography choices and implementation are original. No private screenshot, personal document, application package, proprietary source, or bundled proprietary asset is distributed here.

## Floating input reference

Read-only static inspection used the [official macOS 26.1002.52244 package](https://persistent.oaistatic.com/codex-app-prod/ChatGPT-darwin-arm64-26.1002.52244.zip), build 13536, linked by its [official update feed](https://persistent.oaistatic.com/codex-app-prod/appcast.xml). No original application was executed; static code paths do not establish runtime appearance or complete behavioral equivalence.

The inspected conversation page mounts a floating conversation surface when the main chat is hidden and a content/document tab is active. The host supplies the existing conversation and transcript, enabling the header. This is distinct from a standalone Library file preview, whose composer-only default suppresses that header.

This example now follows the conversation-owned configuration:

- Input focus reveals a 46 px header containing minimize, conversation title and Dock Chat grip. Header height and opacity ease together over 300 ms with cubic-bezier(0.23, 1, 0.32, 1). Input position and width remain stable during focus reveal.
- A separate header action expands the transcript. Expanded presentation retains its header. Outside interactions dismiss when appropriate; composer-owned transcript and menu interactions stay inside the surface. Escape collapses the transcript without deleting the draft.
- Whitespace focuses the editor. Newlines and measured nonempty overflow stack controls below the input; shortening an overflowed draft stays multiline until cleared. The compact blank-text layout lock does not prohibit ordinary nonempty overflow expansion.
- Document switches blur the input. Static inspection does not establish per-document draft persistence; that is retained as this study's own behavior.

## Reconstruction boundaries

This uses fictional SVG pages and a native textarea, not the original editor or a general-purpose PDF parser. Original measured document alignment is retained, but dimensions, font metrics, text-row estimates and responsive behavior are calibrated approximations. The source-derived 300 ms outer-surface/header transition is shared with this study's multiline layout; the original footer has an additional approximately 220 ms layout transition that is not separately reproduced.

The header title acts as a local expand/collapse affordance; chat selection is not reproduced. Dock options open this fictional conversation in full view, move it to the existing left pane, or minimize it. Grip dragging, arbitrary placement, right-pane docking and original minimize clip/opacity animation are not implemented. Minimize/restore currently switches directly between the panel and a 36 px restore control, using an original chat icon.

Send clears a local draft and queues a deterministic fictional reply; these are fixture semantics, not claims inferred from the original submit callback. Send does not itself expand this demo's transcript. No model, account, microphone, or third-party service is connected. Real attachment/voice-driven layout changes are not present. Offline screenshots and GIFs demonstrate this reconstruction, not an original-client or browser-runtime verification.
