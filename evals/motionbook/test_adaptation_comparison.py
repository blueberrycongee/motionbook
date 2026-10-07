"""Regression checks for published adaptation evidence, not UI-runtime tests."""
import importlib.util
from pathlib import Path
import shutil
import unittest

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location('adaptation_verify', HERE / 'adaptation-comparison/verify.py')
VERIFY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VERIFY)


class AdaptationComparison(unittest.TestCase):
    @unittest.skipUnless(shutil.which('node'), 'Node.js is required to replay SVG submissions')
    def test_published_source_and_scripted_states(self):
        VERIFY.verify()


if __name__ == '__main__':
    unittest.main()
