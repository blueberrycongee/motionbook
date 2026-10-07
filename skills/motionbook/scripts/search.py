#!/usr/bin/env python3
"""Search the bundled editorial catalog without downloading example assets."""
import argparse
import json
from pathlib import Path
import re

CATALOG = Path(__file__).resolve().parents[1] / 'references' / 'catalog.json'


def search(entries, query, kind=None, fit=None):
    terms = re.findall(r'[\w-]+', query.casefold())
    matches = []
    for entry in entries:
        if kind and entry['kind'] != kind or fit and entry['fit'] != fit:
            continue
        fields = [entry['slug'], entry['title'], *entry['keywords'], entry['why'],
                  entry['extract'], entry['use_when'], *entry['values']]
        haystack = ' '.join(fields).casefold()
        score = sum(1 for term in terms if term in haystack)
        if terms and not score:
            continue
        # Relevance wins; practical studies win ties unless a fit was requested.
        matches.append((score, entry['fit'] == 'everyday', entry))
    return [item[2] for item in sorted(matches, key=lambda x: (-x[0], -x[1], x[2]['slug']))]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('query', nargs='?', default='')
    parser.add_argument('--kind', choices=['creative-motion', 'landing-page', 'component', 'interface'])
    parser.add_argument('--fit', choices=['everyday', 'brand', 'playful'])
    parser.add_argument('--limit', type=int, default=5)
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args()
    if args.limit < 1:
        parser.error('--limit must be positive')
    catalog = json.loads(CATALOG.read_text())
    entries = search(catalog['entries'], args.query, args.kind, args.fit)[:args.limit]
    if args.json:
        print(json.dumps(entries, ensure_ascii=False, indent=2))
    elif not entries:
        print('No matching study. Try shorter Chinese/English behavior keywords or relax filters.')
    else:
        for entry in entries:
            print(f"{entry['slug']} [{entry['kind']} / {entry['fit']}]")
            print(f"  Why: {entry['why']}\n  Extract: {entry['extract']}\n  Use: {entry['use_when']}\n  Limit: {entry['avoid']}")
            print(f"  {catalog['repository']}/blob/main/{entry['readme']}")


if __name__ == '__main__':
    main()
