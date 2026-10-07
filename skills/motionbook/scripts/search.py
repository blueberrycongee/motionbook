#!/usr/bin/env python3
"""Search the bundled editorial catalog without downloading example assets."""
import argparse
import json
from pathlib import Path
import re

CATALOG = Path(__file__).resolve().parents[1] / 'references' / 'catalog.json'
PLURALS = {'cards': 'card', 'hovers': 'hover', 'tags': 'tag', 'tabs': 'tab', 'sliders': 'slider', 'windows': 'window', 'projects': 'project', 'letters': 'letter'}
REDUCED_MOTION = re.compile(r'\b(?:prefers[ -])?reduc(?:e|ed)[ -]motion\b|减少(?:动态效果|动态|动画)|降低动态|低动态', re.I)


def tokens(text):
    # English words match words, not arbitrary substrings: ring is not spring.
    # Chinese terms remain substring matches to support terse behavior queries.
    return [PLURALS.get(word, word) for word in re.findall(r'[\w]+', text.casefold().replace('_', ' '))]


def source_capabilities(entry):
    return {capability for anchor in entry.get('source_anchors', []) for capability in anchor.get('capabilities', [])}


def search(entries, query, kind=None, fit=None, capability=None):
    capabilities = {capability} if capability else set()
    if REDUCED_MOTION.search(query):
        capabilities.add('reduced-motion')
        query = REDUCED_MOTION.sub(' ', query)
    terms = list(dict.fromkeys(tokens(query)))
    matches = []
    for entry in entries:
        if kind and entry['kind'] != kind or fit and entry['fit'] != fit:
            continue
        if not capabilities <= source_capabilities(entry):
            continue
        fields = [entry['slug'], entry['title'], *entry['keywords'], entry['why'],
                  entry['extract'], entry['use_when'], *entry['values']]
        haystack = ' '.join(fields).casefold()
        words = set(tokens(haystack))
        score = sum(term in haystack if re.search('[\u4e00-\u9fff]', term) else term in words for term in terms)
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
    parser.add_argument('--capability', choices=['reduced-motion'], help='Require an inspected source branch; not a runtime/accessibility certification')
    parser.add_argument('--limit', type=int, default=5)
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args()
    if args.limit < 1:
        parser.error('--limit must be positive')
    catalog = json.loads(CATALOG.read_text())
    entries = search(catalog['entries'], args.query, args.kind, args.fit, args.capability)[:args.limit]
    if args.json:
        print(json.dumps(entries, ensure_ascii=False, indent=2))
    elif not entries:
        print('No indexed matching study or source capability. Try shorter Chinese/English behavior keywords or inspect the source for an unindexed requirement.')
    else:
        for entry in entries:
            print(f"{entry['slug']} [{entry['kind']} / {entry['fit']}]")
            print(f"  Why: {entry['why']}\n  Extract: {entry['extract']}\n  Use: {entry['use_when']}\n  Limit: {entry['avoid']}")
            print(f"  {catalog['repository']}/blob/main/{entry['readme']}")
            for anchor in entry['source_anchors']:
                print(f"  Source: {anchor['symbol']} — {anchor['purpose']}")
                print(f"    {catalog['repository']}/blob/main/{anchor['path']}#L{anchor['line']}")
            if source_capabilities(entry):
                print('  Source-inspected capabilities (runtime not implied): ' + ', '.join(sorted(source_capabilities(entry))))


if __name__ == '__main__':
    main()
