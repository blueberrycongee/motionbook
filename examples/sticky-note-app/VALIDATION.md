# Validation

See [Run](RUNNING.md) for setup, controls and preview generation. The demo changes local state only and does not join meetings or contact remote services.

- `node --check scene.js && node --check app.js && node --check motion-data.js`: syntax checks.
- `node --test tests/*.test.cjs`: navigation, swipe, filters, replay takeover, reset, finite geometry, independent counter timing and underline draw-on checks.

Previews render the shared Canvas scene offline. Browser interaction and performance remain untested; simulated DOM events do not verify them. See [motion and visual limits](SELF-REVIEW.md).
