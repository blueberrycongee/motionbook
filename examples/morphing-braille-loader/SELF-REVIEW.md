# Rendering notes

Directional camera trails transform one independently drawn central pose. Sixteen samples are averaged with balanced half-blends to preserve flat colors. Creating → Created collapses and fades outgoing characters before revealing the suffix.

Search ranking, breadcrumb reveal, tag-to-dots transition, dot/check geometry, panel width and caret timing use separate tracks. The preview adds an authored hold/reset tail.

See [VALIDATION.md](VALIDATION.md) for checks and runtime limits.
