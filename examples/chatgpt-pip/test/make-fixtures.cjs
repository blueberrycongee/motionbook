// Compatibility entry point for clean local fixtures.
import('./render-fixtures.mjs').catch(error => { console.error(error); process.exitCode = 1; });
