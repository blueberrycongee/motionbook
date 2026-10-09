"""Discovery and evidence checks; visual approval remains a separate review."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
DATA = json.loads((ROOT / 'skills/motionbook/references/catalog.json').read_text())
SPEC = importlib.util.spec_from_file_location('openaidevs_search', ROOT / 'skills/motionbook/scripts/search.py')
SEARCH = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SEARCH)
SLUG = 'openaidevs-kinetic-type'


class OpenAIDevsIntegration(unittest.TestCase):
    def test_bilingual_discovery(self):
        for query in ['OpenAI Ultrafast', 'leading dot', '前导圆点 逐词', 'kinetic typography']:
            with self.subTest(query=query):
                self.assertEqual(SEARCH.search(DATA['entries'], query)[0]['slug'], SLUG)

    def test_measured_trajectory_does_not_claim_reduced_motion(self):
        entry = next(e for e in DATA['entries'] if e['slug'] == SLUG)
        self.assertEqual([a['symbol'] for a in SEARCH.matched_source_anchors(entry, 'trajectory')], ['interpolateTrack'])
        self.assertEqual(SEARCH.search([entry], 'trajectory', capability='reduced-motion'), [])
        self.assertEqual(SEARCH.search([entry], 'playback', capability='reduced-motion')[0]['slug'], SLUG)

    def test_preview_records_a_real_fourteen_second_animation_and_review_limit(self):
        entry = next(e for e in DATA['entries'] if e['slug'] == SLUG)
        self.assertIn('视觉验收待云端完成', entry['avoid'])
        self.assertIn((ROOT / entry['preview']).read_bytes()[:6], [b'GIF87a', b'GIF89a'])
        report = json.loads((ROOT / 'examples' / SLUG / 'preview/recording.json').read_text())
        self.assertEqual(report['gif']['duration_ms'], 14000)
        self.assertGreater(report['gif']['distinct_frames'], 80)
        self.assertLess(report['gif']['size_bytes'], 15000000)
        self.assertEqual(report['capture']['kind'], 'continuous real-time browser video')


if __name__ == '__main__':
    unittest.main()
