#!/usr/bin/env python3
"""Validate the retrieval catalog and generate the human browsing index."""
import argparse
from collections import Counter
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'skills/motionbook/references/catalog.json'
KINDS = {'component': '组件', 'interface': '界面与工作流', 'landing-page': 'Landing / 作品集片段', 'creative-motion': '创意动效'}
FITS = {'everyday': '日常交互', 'brand': '品牌展示', 'playful': '趣味实验'}
VALUES = {'information-architecture', 'feedback', 'spatial-continuity', 'material', 'expressive-motion', 'classic-pattern'}


def render(entries):
    lines = ['# 按用途找动效', '', f'这里按可借用的交互组织 {len(entries)} 个研究示例。分类是编辑判断，不是上线认证；具体运行、来源和许可边界见各例文档。', '',
             '先看要解决的问题，再选最小片段。页面片段不代表完整 landing；趣味效果可以启发创作，但不默认用于高频操作。', '',
             '[Agent skill](../skills/motionbook/SKILL.md) · [分类定义](../skills/motionbook/references/taxonomy.md) · [WIP 清单](../wip/README.md)', '']
    for kind, title in KINDS.items():
        group = [e for e in entries if e['kind'] == kind]
        lines += [f'## {title}（{len(group)}）', '', '| 示例 / 定位 | 值得研究什么 | 可借用的最小部分 / 场景 | 限制 |', '| --- | --- | --- | --- |']
        for e in group:
            lines.append(f"| [{e['title']}](../{e['readme']}) · {FITS[e['fit']]} | {e['why']} | **{e['extract']}**；{e['use_when']} | {e['avoid']} |")
        lines.append('')
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    entries = json.loads(DATA.read_text())['entries']
    slugs = [e['slug'] for e in entries]
    expected = {p.name for p in (ROOT / 'examples').iterdir() if p.is_dir()}
    assert len(slugs) == len(set(slugs)), 'Duplicate slugs'
    assert set(slugs) == expected, f'Coverage mismatch: {set(slugs) ^ expected}'
    for e in entries:
        assert e['kind'] in KINDS and e['fit'] in FITS
        assert e['values'] and set(e['values']) <= VALUES
        for field in ['why', 'extract', 'use_when', 'avoid', 'keywords', 'evidence']:
            assert e[field], (e['slug'], field)
        for path in [e['readme'], e['preview'], *e['evidence']]:
            assert path and (ROOT / path).is_file(), (e['slug'], path)
    text = render(entries)
    output = ROOT / 'catalog/README.md'
    if args.check:
        assert output.read_text() == text, 'Run python3 scripts/catalog.py to regenerate the index'
    else:
        output.write_text(text)
    print(f"Validated {len(entries)} entries: {dict(Counter(e['kind'] for e in entries))}")


if __name__ == '__main__':
    main()
