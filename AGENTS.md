# 仓库维护

- 在仓库根目录执行以下命令。
- 修改 `skills/motionbook/references/catalog.json` 更新目录条目。
- 运行 `python3 scripts/catalog.py` 生成 `catalog/README.md`，不要直接编辑生成的索引。
- 源码变动后重新检查锚点，更新匹配片段和行号。
- 运行 `python3 scripts/catalog.py --check` 检查索引、路径、源码锚点和画廊覆盖。
- 运行 `python3 -m unittest discover -s evals/motionbook -p 'test_*.py' -v` 检查检索行为。测试范围见 [evals/motionbook/README.md](evals/motionbook/README.md)。
- 将维护步骤放在本文件；`README.md` 保留简介、导航和三列 GIF 画廊。
