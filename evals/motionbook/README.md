# Catalog and retrieval tests

Run from the repository root:

```sh
python3 scripts/catalog.py --check
python3 -m unittest discover -s evals/motionbook -p 'test_*.py' -v
```

The 38 request/query cases cover relevant results, no-match behavior, filters, scoped source parts and adaptation caveats. Tests also check schema/path/anchor rejection, gallery coverage and a relocated skill CLI. These are retrieval and metadata checks, not UI-runtime acceptance.

## Reference-supplied adaptation evidence

[Fourteen animation studies across three rounds](adaptation-comparison/README.md) compare instruction variants. The first candidate splits the results and is not promoted; a separate content-scope clause ties in independent review on two new briefs. A third round adds discovery and finds no persuasive benefit from a shorter entrypoint. No candidate is promoted. Source replay checks join this suite, while visual judgments remain exploratory and separate from retrieval regression coverage.
