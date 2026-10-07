"""Local 14-study overlay checks: source bytes are required, never metadata-mocked."""
import importlib.util
import json
from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('integration_search',ROOT/'skills/motionbook/scripts/search.py')
search=importlib.util.module_from_spec(spec);spec.loader.exec_module(search)
CATALOG=json.loads((ROOT/'skills/motionbook/references/catalog.json').read_text())
CASES=[
 ('apple-music-player','mini player shared cover','播放器 共享封面','drag reverse'),
 ('things-magic-plus','things magic plus','加号 插入 编辑器','task editing'),
 ('cc0-monster-milestone','monster milestone','怪物 里程碑','rig pose'),
 ('telegram-media-spoiler','telegram spoiler','媒体 揭晓 遮罩','reveal reverse'),
 ('imessage-jitter','imessage jitter','文字 抖动','glyph text'),
 ('youtube-subscribe-feedback','youtube subscribe','订阅 铃铛','subscribe reward'),
 ('circle-to-search','circle search selection','圈选 选区 搜索','selection cancel'),
 ('mac-studio-turntable','mac studio turntable','转台 转角 接口','turntable rotation'),
 ('mac-studio-layered-assembly','layered assembly opacity','分层 透明度 尺寸线','layers assembly'),
 ('mac-studio-benchmark-tabs','benchmark tabs stats','柱图 标签 错峰','benchmark stats'),
 ('mac-studio-scroll-relay','scroll relay background video','文字接力 背景视频 双时间轴','scroll relay'),
 ('mac-studio-hero-transition','hero six phases chips','六阶段 芯片 开场','hero chips'),
 ('mac-studio-parallax-features','parallax zoom headline','视差 缩放 正文衔接','parallax zoom'),
 ('mac-studio-crossfade-gallery','crossfade gallery workspace','图库 交叉淡入 工作区','crossfade gallery'),
]
class UnpublishedIntegration(unittest.TestCase):
 def check_study(self,slug,english,chinese,capability_query):
  entries=CATALOG['entries'];entry=next(e for e in entries if e['slug']==slug)
  for query in (english,chinese):
   with self.subTest(language_query=query):
    matches=search.search(entries,query)
    self.assertTrue(matches);self.assertEqual(matches[0]['slug'],slug)
  matches=search.search(entries,capability_query,capability='reduced-motion')
  self.assertIn(slug,[e['slug'] for e in matches])
  selected=search.matched_source_anchors(entry,capability_query)
  self.assertIn('reduced-motion',search.source_capabilities(entry,selected))
  self.assertTrue(entry['source_anchors'])
  for p in [entry['readme'],entry['preview'],*entry['evidence']]:
   path=ROOT/p;self.assertTrue(path.is_file());self.assertGreater(path.stat().st_size,0)
  self.assertIn((ROOT/entry['preview']).read_bytes()[:6],(b'GIF87a',b'GIF89a'))
  for a in entry['source_anchors']:
   text=(ROOT/a['path']).read_text();self.assertEqual(text.count(a['match']),1)
   self.assertEqual(text[:text.index(a['match'])].count('\n')+1,a['line'])
for row in CASES:
 def test(self,row=row):self.check_study(*row)
 setattr(UnpublishedIntegration,'test_'+row[0].replace('-','_'),test)
if __name__=='__main__':unittest.main()
