# Round 4: live interaction

Six independent HTML studies compare a floating document composer and a nested label picker. [Briefs](briefs/) · [Conditions](CONDITIONS.md) · [Review contract](JUDGING.md)

The submissions are frozen experimental outputs, not production components. The formal Motionbook skill is unchanged. Browser acceptance and visual review are pending; source syntax checks alone do not establish working behavior.

Serve this directory with a local HTTP server, then open viewer.html?id=A (A–F); append &narrow=1 for a 390px frame. Each submission also opens independently.

The shared browser harness runs with Node.js 22 and Playwright 1.64.0. It writes evidence/results.json, screenshots and browser recordings under evidence/. Its output records runtime and source fingerprints. Real model requests and OS-native IME are outside the experiment.
