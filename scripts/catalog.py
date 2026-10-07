#!/usr/bin/env python3
"""Validate the complete retrieval catalog, code anchors and visual gallery."""
import argparse
from collections import Counter
from html.parser import HTMLParser
import json
from pathlib import Path, PurePosixPath
import re

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'skills/motionbook/references/catalog.json'
KINDS = {'component': '组件', 'interface': '界面与工作流', 'landing-page': 'Landing / 作品集片段', 'creative-motion': '创意动效'}
FITS = {'everyday': '日常交互', 'brand': '品牌展示', 'playful': '趣味实验'}
VALUES = {'information-architecture', 'feedback', 'spatial-continuity', 'material', 'expressive-motion', 'classic-pattern'}
CAPABILITIES = {'reduced-motion'}
ENTRY_FIELDS = {'slug', 'title', 'kind', 'fit', 'values', 'why', 'extract', 'use_when', 'avoid', 'keywords', 'readme', 'preview', 'evidence', 'source_anchors'}
SOURCE_SUFFIXES = {'.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.swift', '.css', '.html', '.py', '.svg'}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def nonempty_string(value):
    return isinstance(value, str) and bool(value.strip())


def string_list(value):
    return isinstance(value, list) and bool(value) and all(nonempty_string(x) for x in value) and len(value) == len(set(value))


def local_file(root, path, slug):
    require(nonempty_string(path), f'{slug}: empty/non-string path')
    relative = PurePosixPath(path)
    require(not relative.is_absolute() and '..' not in relative.parts and '\\' not in path,
            f'{slug}: unsafe path {path}')
    require(len(relative.parts) > 2 and relative.parts[:2] == ('examples', slug),
            f'{slug}: path belongs to another example: {path}')
    target = (root / path).resolve()
    require(target.is_relative_to(root.resolve()) and target.is_file(), f'{slug}: missing/outside file {path}')
    return target


class Gallery(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows, self.current, self.images, self.hrefs = [], None, [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'tr':
            self.current = 0
        elif tag == 'td' and self.current is not None:
            self.current += 1
        elif tag == 'img':
            self.images.append(attrs.get('src'))
        elif tag == 'a' and attrs.get('href', '').startswith('examples/'):
            self.hrefs.append(attrs['href'])

    def handle_endtag(self, tag):
        if tag == 'tr' and self.current is not None:
            self.rows.append(self.current)
            self.current = None


def validate(catalog, root=ROOT):
    require(isinstance(catalog, dict) and set(catalog) == {'schema_version', 'repository', 'basis', 'entries'}, 'Invalid catalog envelope')
    require(type(catalog['schema_version']) is int and catalog['schema_version'] == 2, 'Unsupported catalog schema_version')
    require(catalog['repository'] == 'https://github.com/blueberrycongee/motionbook', 'Unexpected repository')
    require(nonempty_string(catalog['basis']), 'Missing evidence basis')
    entries = catalog['entries']
    require(isinstance(entries, list) and bool(entries), 'Entries must be a nonempty list')
    slugs = []
    for e in entries:
        require(isinstance(e, dict) and set(e) == ENTRY_FIELDS, 'Missing/unknown entry fields')
        slug = e['slug']
        require(isinstance(slug, str) and re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug), 'Invalid slug')
        slugs.append(slug)
        require(isinstance(e['kind'], str) and e['kind'] in KINDS and isinstance(e['fit'], str) and e['fit'] in FITS, f'{slug}: invalid kind/fit')
        require(string_list(e['values']) and set(e['values']) <= VALUES, f'{slug}: invalid values')
        for field in ['title', 'why', 'extract', 'use_when', 'avoid']:
            require(nonempty_string(e[field]), f'{slug}: invalid {field}')
        require(string_list(e['keywords']), f'{slug}: keywords must be unique strings')
        require(any(re.search('[\u4e00-\u9fff]', x) for x in e['keywords']) and any(re.search('[A-Za-z]', x) for x in e['keywords']), f'{slug}: bilingual keywords required')
        require(string_list(e['evidence']), f'{slug}: evidence must be unique paths')
        for path in [e['readme'], e['preview'], *e['evidence']]:
            local_file(root, path, slug)
        require(e['readme'] == f'examples/{slug}/README.md', f'{slug}: wrong README')
        require(e['preview'].endswith('.gif'), f'{slug}: gallery preview must be a GIF')
        anchors = e['source_anchors']
        require(isinstance(anchors, list) and bool(anchors), f'{slug}: source anchors required')
        seen = set()
        for anchor in anchors:
            required = {'path', 'symbol', 'match', 'line', 'purpose'}
            require(isinstance(anchor, dict) and required <= set(anchor) <= required | {'capabilities'}, f'{slug}: invalid anchor fields')
            for field in ['symbol', 'match', 'purpose']:
                require(nonempty_string(anchor[field]), f'{slug}: invalid anchor {field}')
            source = local_file(root, anchor['path'], slug)
            require(source.suffix in SOURCE_SUFFIXES, f'{slug}: anchor must point to source code')
            key = (anchor['path'], anchor['match'])
            require(key not in seen, f'{slug}: duplicate anchor')
            seen.add(key)
            content = source.read_text()
            require(content.count(anchor['match']) == 1, f'{slug}: missing/ambiguous anchor {anchor["symbol"]}')
            actual_line = content[:content.index(anchor['match'])].count('\n') + 1
            require(type(anchor['line']) is int and anchor['line'] == actual_line, f'{slug}: stale line for {anchor["symbol"]}')
            if 'capabilities' in anchor:
                require(string_list(anchor['capabilities']) and set(anchor['capabilities']) <= CAPABILITIES, f'{slug}: invalid source capability')
    expected = {p.name for p in (root / 'examples').iterdir() if p.is_dir()}
    require(len(slugs) == len(set(slugs)), 'Duplicate slugs')
    require(set(slugs) == expected, f'Coverage mismatch: {set(slugs) ^ expected}')
    gallery = Gallery()
    gallery.feed((root / 'README.md').read_text())
    require(gallery.rows and all(n == 3 for n in gallery.rows[:-1]) and 1 <= gallery.rows[-1] <= 3, 'Root gallery must remain three columns')
    require(len(gallery.images) == len(entries) and set(gallery.images) == {e['preview'] for e in entries}, 'Root gallery preview coverage mismatch')
    require(set(gallery.hrefs) == {e['readme'] for e in entries}, 'Root gallery README coverage mismatch')
    return entries


def render(entries):
    lines = ['# 按用途找动效', '', f'这里按可借用的交互组织 {len(entries)} 个研究示例。分类是编辑判断，不是上线认证；具体运行、来源和许可边界见各例文档。', '',
             '先看要解决的问题，再选最小片段。页面片段不代表完整 landing；趣味效果可以启发创作，但不默认用于高频操作。源码锚点是局部阅读入口，仍需检查依赖和目标布局；不表示整段代码可直接投入生产。', '',
             '[Agent skill](../skills/motionbook/SKILL.md) · [分类定义](../skills/motionbook/references/taxonomy.md) · [WIP 清单](../wip/README.md)', '']
    for kind, title in KINDS.items():
        group = [e for e in entries if e['kind'] == kind]
        lines += [f'## {title}（{len(group)}）', '', '| 示例 / 定位 | 值得研究什么 | 可借用的最小部分 / 场景 | 限制 |', '| --- | --- | --- | --- |']
        for e in group:
            anchors = '、'.join(f"[{a['symbol']}](../{a['path']}#L{a['line']})" for a in e['source_anchors'])
            lines.append(f"| [{e['title']}](../{e['readme']}) · {FITS[e['fit']]} | {e['why']} | **{e['extract']}**；{e['use_when']}<br>源码：{anchors} | {e['avoid']} |")
        lines.append('')
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    try:
        entries = validate(json.loads(DATA.read_text()))
        text = render(entries)
        output = ROOT / 'catalog/README.md'
        if args.check:
            require(output.read_text() == text, 'Run python3 scripts/catalog.py to regenerate the index')
        else:
            output.write_text(text)
    except (ValueError, OSError, TypeError) as error:
        parser.exit(1, f'Catalog validation failed: {error}\n')
    count = sum(len(e['source_anchors']) for e in entries)
    print(f"Validated {len(entries)} entries, {count} code anchors and three-column gallery: {dict(Counter(e['kind'] for e in entries))}")


if __name__ == '__main__':
    main()
