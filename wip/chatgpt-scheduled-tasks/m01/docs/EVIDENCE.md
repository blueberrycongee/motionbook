# Evidence ledger

Inspection date: 2026-10-06 UTC.

## Public official reference

- [Scheduled tasks in ChatGPT](https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt): task list, natural-language creation, edit panel, pause/resume/delete, one-time/recurring schedules, time zone, viewing results, and sharing are documented. Desktop availability is explicitly version/account-dependent. Server execution is not part of this independent client.
- The official article's current Scheduled screenshot shows a white page, “Scheduled” heading, an Active filter, a rounded “Schedule a task” composer and three suggestion rows. Its task-panel screenshot shows a category label, editable task title/prompt, Repeat/Until selectors, more/pause/close controls.

Reference images and distributed app bytes are used only for inspection and are excluded from this package. No user account, credentials, real task, proprietary bundle, or reference screenshot is included.

## Installer

Official public download: https://persistent.oaistatic.com/codex-app-prod/ChatGPT.dmg

Downloaded 2026-10-06; HTTP Last-Modified: 2026-10-06 01:41:41 GMT. Size: 750982223 bytes. SHA-256: 3e61b9226a30ba928dd9d724a76710e89af5ab81dcf105868d60f9a46df92f75.

Info.plist confirms version 26.930.61225, build 13232, executable ChatGPT. The package retains the com.openai.codex bundle identifier and an Electron package name; these are packaging identifiers, not evidence that this reconstruction uses or launches a user's Codex session. Inspection was static on Linux. The app was not launched.

The ASAR contains a React-based webview. Dedicated modules implement the Scheduled page, task rows, device-local and cloud detail panels, editor, frequency fields, deletion confirmation and run history. File names and SHA-256 fingerprints are in evidence/client-fingerprints.json; no source excerpts or proprietary bytes are shipped.

Observed client contracts:
- List supports name search, status filtering (All/Active/Paused/Completed), selection, creation and suggested templates.
- Task rows reveal management actions on hover/focus: Run now, Pause/Resume and Delete. In-progress state disables duplicate run requests.
- The cloud detail editor supports draft changes, explicit Save/Cancel, title/prompt, frequency, a displayed time zone, and previous runs. Changed drafts alter Run now to Save and run now. The client has loading, retry and unavailable states.
- Frequency components expose Once, Hourly, Daily, Weekdays, Weekly, Monthly, Yearly and Custom concepts, selected weekdays, date/time, repeat end, and an advanced RRULE editor. Cloud validation checks future one-time dates and a two-year horizon.
- Run-history requests are paginated (25 records per request) and configured to refresh every five seconds. This demonstrates a remote history boundary, not recoverable server execution.
- Local and cloud tasks use separate mutation paths. Their server/native internals are not implemented here.

The current desktop bundle differs from the official article screenshot: it additionally contains search, manual setup, run-now, and template rows for Daily brief, Weekly review and Follow-up monitor. Layout reflects the inspected desktop components, with the public screenshot as a visual cross-check. Account feature flags can change which layout actually appears.

## Fidelity and scope

Original source is written independently. Client-side state/persistence, scheduling previews and run results are local simulation. They do not communicate with ChatGPT, execute AI prompts, access connected apps, or create real scheduled tasks. Exact server behavior cannot be recovered from a distributed UI client.
