# Classification and editorial contract

Classify the **available study**, not the source site's reputation. These are retrieval judgments, not measured aesthetic scores or production certification.

| Dimension | Values | Meaning |
| --- | --- | --- |
| kind | creative-motion / landing-page / component / interface | Illustration or choreography / marketing-page section / bounded control / composed workflow |
| fit | everyday / brand / playful | Ordinary interaction inspiration / deliberate expressive presentation / experiment or joke |
| values | information-architecture / feedback / spatial-continuity / material / expressive-motion / classic-pattern | Why the reference is worth studying |

A playful slider is still a component. A full management interface may contribute only its list/detail transition. `landing-page` includes page **fragments**; the current collection's footer, ribbon and hover studies are not complete landing-page implementations. An everyday fit describes the use case, not implementation readiness.

Each entry explains `why`, the smallest useful `extract`, `use_when`, and a specific `avoid` limitation. `keywords` include Chinese and English task vocabulary. `readme`, `preview` and `evidence` are repository-relative paths; installed skills resolve them against a checkout or the repository URL, never against their installation directory.

## Maintaining the collection

The canonical retrieval data lives in `catalog.json` beside this file. Existing root `catalog/*.json` records are historical provenance/validation records; retain them rather than flattening their varied evidence into a quality badge. After editing retrieval data, run `python3 scripts/catalog.py` from the repository root to update the human index. Use `--check` to detect coverage, broken paths and stale generated content.

Inspect the implementation and preview before making new claims about motion. Read validation and provenance before describing runtime or reuse status. Describe concrete cause and effect, not unsupported claims such as “perfect”, “silky smooth” or “production-ready”. Measured replay, inferred live behavior, offline renders and browser recordings are separate evidence. Existing descriptions are based on checked-in source/validation notes and have not received a new whole-collection visual review.

Add completed studies to the retrieval catalog only when a source/preview entry exists. Keep prototypes, source-only candidates and historical backups in the WIP ledger until their actual gates are met. Never count archive files as unfinished effects or delete them merely to reduce a count.
