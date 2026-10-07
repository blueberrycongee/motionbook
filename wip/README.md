# 未完成研究与历史快照

当前已收录的 51 个示例见[用途索引](../catalog/README.md)。这里不按文件数量计算待办：压缩包通常是同一效果的多个阶段，素材目录也不代表已有实现。

## 仍未完成的实现

| 研究 | 当前入口 | 已有内容 | 完成前缺口 |
| --- | --- | --- | --- |
| Airport matrix time | [源码](new100-031-airport-matrix-time/README.md) | 点阵、近似揭示、键盘城市搜索与焦点恢复、可中断主题切换；18 项逻辑和 DOM 适配测试通过 | 初始表盘、splash、支持卡片、完整转场和逐帧校准；真实浏览器交互与最终预览 |
| Radial menu | [源码](new100-034-radial-menu/README.md) | 径向几何、六个命令、短路径弹簧和按住释放 | 全序列时序、图标与透明度校准；键盘/取消流程和浏览器验收；最终预览 |
| AI scheduler | [最新归档](checkpoints/2026-10-06-1406/009-rebuild-wip-002.zip) | 本地查找宾客、时长、时段拖动与预约模拟；已有局部量测 | 归档内文档仅记录局部视觉检查；完整逐帧比较、文字转场、最终媒体和浏览器验收均未完成 |

2026-10-07 早先的[恢复记录](reference-recovery.json)记载机场点阵和径向菜单均曾下载成功，SHA-256 与历史记录一致，分别完整解码 1,094 / 595 帧。本次工作区恢复重新取得径向菜单原片并验证 595 帧；机场点阵当前重取返回 HTTP 403，已停止该请求，早先下载的字节未在本次工作区找到。原视频仅用于仓库外分析，不分发。下载与解码成功不等于实现或视觉验收完成。

## 只有来源记录的候选

[来源清单](source-catalog/README.md)中的 Date Range Picker、Watch face、Support analytics、Sending、Boarding Pass Printer 尚无对应的正式示例。它们是待研究候选，不计入 51 个示例，也不自动要求全部复刻。旧槽位 ID 曾被重新分配（例如 032 当前对应 Elastic String Clock），因此需按标题、来源 URL 和哈希核对，不能只按 ID 推断完成情况。

## 已有正式版本的历史阶段

`checkpoints/` 里的 File toss（030）、Elastic String Clock（032）、Fractional Slider（038）、Ringwriter（039）、Graph slider（040）及 ChatGPT scheduled tasks / Automation manager 的多个压缩包是历史阶段。正式版本在 `examples/`。source-catalog 中 Agent Plan、Light Work 和 Ringwriter 也已有正式入口。

保留这些历史记录便于追溯。清理前应核对正式版本是否保留必要源码、预览与证据；不能把 AI scheduler 归档误当作 Automation manager 的重复备份。
