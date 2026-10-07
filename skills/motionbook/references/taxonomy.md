# Catalog contract

| Field | Values |
| --- | --- |
| `kind` | `creative-motion`, `landing-page`, `component`, `interface` |
| `fit` | `everyday`, `brand`, `playful` |
| `values` | `information-architecture`, `feedback`, `spatial-continuity`, `material`, `expressive-motion`, `classic-pattern` |

Classify the available study. A playful slider remains a component; `landing-page` includes fragments; an interface may contribute one small interaction. These describe relevance, not readiness.

Each entry contains `slug`, `title`, the fields above, `why`, `extract`, `use_when`, `avoid`, bilingual `keywords`, `readme`, `preview`, `evidence`, and `source_anchors`.

Each source anchor contains:

- `path`, `symbol`, `match`, `line`: an example-local source path, readable name, unique literal code fragment and checked 1-based line
- `purpose`: the extraction boundary and useful dependencies or limitations
- Optional `keywords`: vocabulary for that verified subpart
- Optional `capabilities`: currently `reduced-motion`, supported by that source branch

Queries use matched subpart anchors when available; capability filters follow that selection. Missing capability metadata means unknown. Paths resolve against the repository, not the installed skill. Existing provenance/validation records retain their own evidence.
