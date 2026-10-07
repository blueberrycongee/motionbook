# Catalog and retrieval tests

Run from the repository root:

```sh
python3 scripts/catalog.py --check
python3 -m unittest discover -s evals/motionbook -p 'test_*.py' -v
```

The 38 request/query cases cover relevant results, no-match behavior, filters, scoped source parts and adaptation caveats. Tests also check schema/path/anchor rejection, gallery coverage and a relocated skill CLI. These are retrieval and metadata checks, not UI-runtime acceptance.
