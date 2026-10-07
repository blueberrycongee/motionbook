"""Tumbling-clock catalog and retrieval checks; these do not certify UI runtime."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
SLUG = 'kitasenju-tumbling-clock'
CATALOG = json.loads((ROOT / 'skills/motionbook/references/catalog.json').read_text())
spec = importlib.util.spec_from_file_location('kitasenju_search', ROOT / 'skills/motionbook/scripts/search.py')
search = importlib.util.module_from_spec(spec)
spec.loader.exec_module(search)


class KitasenjuIntegration(unittest.TestCase):
    def setUp(self):
        self.entry = next(e for e in CATALOG['entries'] if e['slug'] == SLUG)

    def test_expressive_classification(self):
        self.assertEqual(self.entry['kind'], 'creative-motion')
        self.assertEqual(self.entry['fit'], 'playful')
        self.assertEqual(self.entry['values'], ['material', 'expressive-motion'])
        self.assertIn('独立近似', self.entry['avoid'])
        self.assertIn('Canvas2D', self.entry['avoid'])
        self.assertIn('相邻片段收益不一致', self.entry['avoid'])
        self.assertIn('examples/' + SLUG + '/V2-FIDELITY.md', self.entry['evidence'])

    def test_bilingual_discovery(self):
        for query in ('tumbling extruded clock', '翻滚 挤出 时钟', 'kitasenju typography'):
            with self.subTest(query=query):
                self.assertEqual(search.search(CATALOG['entries'], query)[0]['slug'], SLUG)

    def test_kind_and_fit_filters(self):
        matches = search.search(CATALOG['entries'], 'tumbling clock', kind='creative-motion', fit='playful')
        self.assertEqual(matches[0]['slug'], SLUG)
        self.assertNotIn(SLUG, [e['slug'] for e in search.search(CATALOG['entries'], 'clock', fit='everyday')])
        self.assertNotIn(SLUG, [e['slug'] for e in search.search(CATALOG['entries'], 'clock', kind='component')])

    def test_existing_string_clock_stays_distinct(self):
        matches = search.search(CATALOG['entries'], 'elastic string clock')
        self.assertEqual(matches[0]['slug'], 'elastic-string-clock')
        self.assertNotEqual(self.entry['preview'], matches[0]['preview'])

    def test_subpart_anchor_selection(self):
        cases = {
            'extruded geometry': ['build-geometry-v2.rebuild'],
            'tumbling physics': ['ClockMotion.createSimulation'],
            'clock sampling': ['ClockMotion.simulation.stateAt'],
            'render occlusion': ['ClockRenderer.render'],
            'camera lighting': ['ClockRenderer.cameraOptions'],
            'playback': ['ClockPlayback.createController'],
            'settings': ['app.settingsSubmit'],
            'static preference': ['app.preferenceChange'],
            'lifecycle': ['app.pageLifecycle'],
        }
        for query, expected in cases.items():
            with self.subTest(query=query):
                self.assertEqual([a['symbol'] for a in search.matched_source_anchors(self.entry, query)], expected)

    def test_reduced_motion_uses_inspected_playback_branch(self):
        for query in ('playback reduced motion', '回放 减少动态效果'):
            with self.subTest(query=query):
                matches = search.search([self.entry], query)
                self.assertEqual([e['slug'] for e in matches], [SLUG])
                selected = search.matched_source_anchors(self.entry, query)
                self.assertEqual([a['symbol'] for a in selected], ['ClockPlayback.createController'])
                self.assertIn('reduced-motion', search.source_capabilities(self.entry, selected))
        self.assertEqual([e['slug'] for e in search.search([self.entry], 'static preference', capability='reduced-motion')], [SLUG])

    def test_geometry_renderer_and_physics_do_not_inherit_capability(self):
        for query in ('extrusion', 'render', 'physics', 'settings', 'lifecycle'):
            with self.subTest(query=query):
                self.assertEqual(search.search([self.entry], query, capability='reduced-motion'), [])
                self.assertEqual(search.search([self.entry], query + ' reduced motion'), [])

    def test_evidence_and_gif_bytes_exist(self):
        for relative in [self.entry['readme'], self.entry['preview'], *self.entry['evidence']]:
            with self.subTest(path=relative):
                path = ROOT / relative
                self.assertTrue(path.is_file())
                self.assertGreater(path.stat().st_size, 0)
        self.assertIn((ROOT / self.entry['preview']).read_bytes()[:6], (b'GIF87a', b'GIF89a'))

    def test_every_anchor_is_unique_and_current(self):
        self.assertEqual(len(self.entry['source_anchors']), 9)
        for anchor in self.entry['source_anchors']:
            with self.subTest(symbol=anchor['symbol']):
                source = (ROOT / anchor['path']).read_text()
                self.assertEqual(source.count(anchor['match']), 1)
                self.assertEqual(source[:source.index(anchor['match'])].count('\n') + 1, anchor['line'])


if __name__ == '__main__':
    unittest.main()
