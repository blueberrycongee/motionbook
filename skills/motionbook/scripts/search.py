#!/usr/bin/env python3
"""Search the bundled editorial catalog without downloading example assets."""
import argparse
import json
from pathlib import Path
import re

CATALOG = Path(__file__).resolve().parents[1] / 'references' / 'catalog.json'
PLURALS = {'cards': 'card', 'hovers': 'hover', 'tags': 'tag', 'tabs': 'tab', 'sliders': 'slider', 'windows': 'window', 'projects': 'project', 'letters': 'letter', 'stars': 'star'}
REDUCED_MOTION = re.compile(r'\b(?:prefers[ -])?reduc(?:e|ed)[ -]motion\b|减少(?:动态效果|动态|动画)|降低动态|低动态', re.I)


def tokens(text):
    # English words match words, not arbitrary substrings: ring is not spring.
    # Chinese terms remain substring matches to support terse behavior queries.
    return [PLURALS.get(word, word) for word in re.findall(r'[\w]+', text.casefold().replace('_', ' '))]


def source_capabilities(entry, anchors=None):
    selected = entry.get('source_anchors', []) if anchors is None else anchors
    return {capability for anchor in selected for capability in anchor.get('capabilities', [])}


def matched_source_anchors(entry, query):
    """Prefer an indexed subpart over the rest of a composed interface."""
    terms = tokens(REDUCED_MOTION.sub(' ', query))
    matched = []
    for anchor in entry['source_anchors']:
        keywords = ' '.join(anchor.get('keywords', [])).casefold()
        words = set(tokens(keywords))
        if any(term in keywords if re.search('[\u4e00-\u9fff]', term) else term in words for term in terms):
            matched.append(anchor)
    if matched or not terms:
        return matched or entry['source_anchors']
    return [a for a in entry['source_anchors'] if not a.get('keywords')] or entry['source_anchors']


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
        if not capabilities <= source_capabilities(entry, matched_source_anchors(entry, query)):
            continue
        fields = [entry['slug'], entry['title'], *entry['keywords'], entry['why'],
                  entry['extract'], entry['use_when'], *entry['values'],
                  *(word for anchor in entry.get('source_anchors', []) for word in anchor.get('keywords', []))]
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
        print(json.dumps([{**entry, 'matched_source_anchors': matched_source_anchors(entry, args.query)} for entry in entries], ensure_ascii=False, indent=2))
    elif not entries:
        print('No indexed matching study or source capability. Try shorter Chinese/English behavior keywords or inspect the source for an unindexed requirement.')
    else:
        for entry in entries:
            print(f"{entry['slug']} [{entry['kind']} / {entry['fit']}]")
            print(f"  Why: {entry['why']}\n  Extract: {entry['extract']}\n  Use: {entry['use_when']}\n  Limit: {entry['avoid']}")
            print(f"  Preview: {catalog['repository']}/blob/main/{entry['preview']}")
            print(f"  {catalog['repository']}/blob/main/{entry['readme']}")
            for evidence in entry['evidence']:
                print(f"  Evidence: {catalog['repository']}/blob/main/{evidence}")
            for anchor in matched_source_anchors(entry, args.query):
                print(f"  Source: {anchor['symbol']} — {anchor['purpose']}")
                print(f"    {catalog['repository']}/blob/main/{anchor['path']}#L{anchor['line']}")
                if anchor.get('capabilities'):
                    print('    Source branch (runtime not implied): ' + ', '.join(anchor['capabilities']))


if __name__ == '__main__':
    main()
