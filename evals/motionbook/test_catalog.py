"""Deterministic metadata/retrieval regressions, not agent or UI-runtime evals."""
import copy
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]


def load_module(name, relative):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


validator = load_module('catalog_validator', 'scripts/catalog.py')
searcher = load_module('catalog_search', 'skills/motionbook/scripts/search.py')
CATALOG = json.loads((ROOT / 'skills/motionbook/references/catalog.json').read_text())
CASES = json.loads((Path(__file__).parent / 'retrieval-cases.json').read_text())


class CatalogValidation(unittest.TestCase):
    def rejects(self, mutate, message=None):
        catalog = copy.deepcopy(CATALOG)
        mutate(catalog)
        with self.assertRaisesRegex(ValueError, message or '.'):
            validator.validate(catalog)

    def test_full_inventory_schema_paths_anchors_gallery(self):
        validator.validate(CATALOG)

    def test_generated_index_is_current(self):
        self.assertEqual((ROOT / 'catalog/README.md').read_text(), validator.render(CATALOG['entries']))

    def test_rejects_schema_version(self):
        self.rejects(lambda c: c.update(schema_version=1), 'schema_version')

    def test_rejects_unknown_field(self):
        self.rejects(lambda c: c['entries'][0].update(ready=True), 'entry fields')

    def test_rejects_nonstring_kind(self):
        self.rejects(lambda c: c['entries'][0].update(kind=[]), 'kind/fit')

    def test_rejects_keyword_string(self):
        self.rejects(lambda c: c['entries'][0].update(keywords='sidebar'), 'keywords')

    def test_rejects_monolingual_keywords(self):
        self.rejects(lambda c: c['entries'][0].update(keywords=['sidebar']), 'bilingual')

    def test_rejects_missing_example(self):
        self.rejects(lambda c: c['entries'].pop(), 'Coverage')

    def test_rejects_duplicate_example(self):
        self.rejects(lambda c: c['entries'].append(copy.deepcopy(c['entries'][0])), 'Duplicate')

    def test_rejects_wrong_example_path(self):
        self.rejects(lambda c: c['entries'][0].update(preview=c['entries'][1]['preview']), 'another example')

    def test_rejects_absolute_path(self):
        self.rejects(lambda c: c['entries'][0].update(readme=str(ROOT / c['entries'][0]['readme'])), 'unsafe path')

    def test_rejects_traversal(self):
        self.rejects(lambda c: c['entries'][0].update(readme='examples/adaptive-email-sidebar/../../README.md'), 'unsafe path')

    def test_rejects_missing_code_anchors(self):
        self.rejects(lambda c: c['entries'][0].update(source_anchors=[]), 'source anchors')

    def test_rejects_missing_symbol(self):
        self.rejects(lambda c: c['entries'][0]['source_anchors'][0].update(match='function doesNotExist()'), 'missing/ambiguous')

    def test_rejects_ambiguous_match(self):
        self.rejects(lambda c: c['entries'][0]['source_anchors'][0].update(match='function'), 'missing/ambiguous')

    def test_rejects_stale_line(self):
        self.rejects(lambda c: c['entries'][0]['source_anchors'][0].update(line=999999), 'stale line')

    def test_rejects_noninteger_line(self):
        self.rejects(lambda c: c['entries'][0]['source_anchors'][0].update(line=True), 'stale line')

    def test_rejects_duplicate_anchor(self):
        self.rejects(lambda c: c['entries'][0]['source_anchors'].append(copy.deepcopy(c['entries'][0]['source_anchors'][0])), 'duplicate anchor')

    def test_rejects_anchor_keyword_string(self):
        self.rejects(lambda c: c['entries'][0]['source_anchors'][0].update(keywords='starfield'), 'anchor keywords')

    def test_rejects_unrecognized_capability(self):
        self.rejects(lambda c: c['entries'][0]['source_anchors'][0].update(capabilities=['production-ready']), 'source capability')

    def test_rejects_changed_gallery_columns(self):
        read_text = Path.read_text
        def altered(path, *args, **kwargs):
            text = read_text(path, *args, **kwargs)
            return text.replace('<tr>', '<tr><td></td>', 1) if path == ROOT / 'README.md' else text
        with patch.object(Path, 'read_text', altered):
            with self.assertRaisesRegex(ValueError, 'three columns'):
                validator.validate(CATALOG)


class Retrieval(unittest.TestCase):
    def test_realistic_requests(self):
        for case in CASES:
            with self.subTest(case=case['id'], request=case['request']):
                results = searcher.search(CATALOG['entries'], case['query'], case.get('kind'), case.get('fit'), case.get('capability'))
                slugs = [e['slug'] for e in results]
                if 'top' in case:
                    self.assertTrue(slugs)
                    self.assertEqual(slugs[0], case['top'])
                if 'exact' in case:
                    self.assertEqual(slugs, case['exact'])
                self.assertFalse(set(slugs) & set(case.get('exclude', [])))
                if case.get('nonempty'):
                    self.assertTrue(results)
                if 'matched_anchors' in case:
                    symbols = [a['symbol'] for a in searcher.matched_source_anchors(results[0], case['query'])]
                    self.assertEqual(symbols, case['matched_anchors'])
                    self.assertFalse(set(symbols) & set(case.get('not_matched_anchors', [])))
                for caveat in case.get('caveats_contains', []):
                    self.assertIn(caveat, results[0]['avoid'])
                if 'capability_required' in case:
                    self.assertTrue(all(case['capability_required'] in searcher.source_capabilities(e, searcher.matched_source_anchors(e, case['query'])) for e in results))

    def test_no_capability_inferred_from_motion_word(self):
        example = copy.deepcopy(CATALOG['entries'][0])
        example.update(keywords=['motion', '动态'], source_anchors=[])
        self.assertEqual(searcher.search([example], 'reduced motion'), [])

    def test_source_anchors_are_exposed_in_cli(self):
        result = subprocess.run([sys.executable, str(ROOT / 'skills/motionbook/scripts/search.py'), 'tag creation', '--limit', '1'], text=True, capture_output=True, check=True)
        self.assertIn('Picker.beginCreate', result.stdout)
        self.assertIn('/model.js#L', result.stdout)
        self.assertIn('焦点恢复', result.stdout)

    def test_cli_runs_from_installed_skill_without_repository(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / 'motionbook'
            shutil.copytree(ROOT / 'skills/motionbook', folder, ignore=shutil.ignore_patterns('__pycache__'))
            result = subprocess.run([sys.executable, str(folder / 'scripts/search.py'), 'portfolio hover', '--json', '--limit', '1'], cwd=tmp, text=True, capture_output=True, check=True)
            entry = json.loads(result.stdout)[0]
            self.assertEqual(entry['slug'], 'spencer-playful-hovers')
            self.assertTrue(entry['source_anchors'])

    def test_installed_text_cli_exposes_preview_and_evidence_links(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / 'motionbook'
            shutil.copytree(ROOT / 'skills/motionbook', folder, ignore=shutil.ignore_patterns('__pycache__'))
            for query, slug in [('send', 'chatgpt-dot-send'), ('svg', 'tiny-animated-svg'), ('automation', 'automation-manager')]:
                with self.subTest(slug=slug):
                    result = subprocess.run([sys.executable, str(folder / 'scripts/search.py'), query, '--limit', '1'], cwd=tmp, text=True, capture_output=True, check=True)
                    entry = next(e for e in CATALOG['entries'] if e['slug'] == slug)
                    base = CATALOG['repository'] + '/blob/main/'
                    self.assertIn(f"Preview: {base}{entry['preview']}", result.stdout)
                    self.assertIn(base + entry['readme'], result.stdout)
                    for evidence in entry['evidence']:
                        self.assertIn(f'Evidence: {base}{evidence}', result.stdout)
                    self.assertIn('Source:', result.stdout)

    def test_json_preserves_catalog_fields_and_relative_asset_paths(self):
        result = subprocess.run([sys.executable, str(ROOT / 'skills/motionbook/scripts/search.py'), 'send', '--json', '--limit', '1'], text=True, capture_output=True, check=True)
        entry = json.loads(result.stdout)[0]
        original = next(e for e in CATALOG['entries'] if e['slug'] == 'chatgpt-dot-send')
        self.assertEqual(entry.pop('matched_source_anchors'), searcher.matched_source_anchors(original, 'send'))
        self.assertEqual(entry, original)

    def test_json_exposes_matched_part_without_mutating_catalog(self):
        before = copy.deepcopy(CATALOG)
        result = subprocess.run([sys.executable, str(ROOT / 'skills/motionbook/scripts/search.py'), 'starfield', '--json', '--limit', '1'], text=True, capture_output=True, check=True)
        entry = json.loads(result.stdout)[0]
        self.assertEqual([a['symbol'] for a in entry['matched_source_anchors']], ['StarField', 'SpaceScene.glow', 'SpaceScene.star layer'])
        self.assertIn('cardPose', [a['symbol'] for a in entry['source_anchors']])
        searcher.matched_source_anchors(searcher.search(CATALOG['entries'], 'starfield')[0], 'starfield')
        self.assertEqual(CATALOG, before)

    def test_cli_rejects_invalid_limit(self):
        result = subprocess.run([sys.executable, str(ROOT / 'skills/motionbook/scripts/search.py'), '--limit', '0'], text=True, capture_output=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('must be positive', result.stderr)


if __name__ == '__main__':
    unittest.main()
