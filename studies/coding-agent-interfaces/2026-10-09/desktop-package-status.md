# Claude / Codex：下载来源与研究边界

采集日期：2026-10-09 UTC。状态：**两个文件已完整下载；安装包静态检查待完成；未安装、启动或登录**。

## Claude Desktop：macOS universal

来源链：[官网下载页](https://claude.com/download) → [官方 latest 重定向](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect) → [版本化 DMG](https://downloads.claude.ai/releases/darwin/universal/2.26454.2/Claude-75afdd18501b9670ae33bfb7c0cd88567ce76994.dmg)。

- URL 版本：`2.26454.2`；尚未与包内 Info.plist 核对
- 大小：`380704873` 字节
- SHA-256：`3c928d4af02c7174e6e3659f218adaab0ac5f6447809a1a2517d8368cee3b54a`
- 资源、UI 入口和技术栈：尚未检查

## Codex 命名的 macOS 下载：ARM64 渠道

来源：[OpenAI Codex 官方仓库](https://github.com/openai/codex)中的 `codex-rs/cli/src/desktop_app/mac.rs` 指向 [Codex.dmg](https://persistent.oaistatic.com/codex-app-prod/Codex.dmg)。

- Bundle 版本：未知；下载 URL 可变
- 大小：`783225467` 字节
- SHA-256：`e84fcc4ef6095aa2630d355b60c28e36cc80542c2ae362a120a4b15f49f2962c`
- CDN Last-Modified：`2026-10-08 22:42:17 GMT`
- 资源、UI 入口和技术栈：尚未检查

命名需要谨慎：[旧 Codex app 文档入口](https://developers.openai.com/codex/app)在本次读取时转向 [ChatGPT desktop 文档](https://learn.chatgpt.com/docs/app)。下载文件名不能证明包内就是历史上的独立 Codex UI，也不能据此做版本准确的复刻。

哈希根据取得的文件计算，用于区分研究样本；没有进行厂商签名验证。以上没有任何包内布局结论。

## 官方文档支持的 UI 线索

这些是文档事实，未与上述下载构建逐项核验。

### Claude Code 桌面界面

来源：[官方 desktop 文档](https://code.claude.com/docs/en/desktop)。研究对象是 Claude Desktop 的 Code 标签，不是把整个 Claude Desktop 都视为 coding agent。

- 输入区在发送前提供环境、项目、模型与权限模式选择。
- 灰色建议需明确采纳后才能发送；运行中补充可排队，立即停止是不同动作。
- 会话支持筛选、分组与双会话分屏；导航替换当前聚焦的面板。
- 工作区面板可调整；窄窗口把部分标题栏操作收进 overflow。
- Diff 按文件审阅，行评论可先收集再批量提交。

### OpenAI 桌面工作流

来源：[ChatGPT desktop 官方文档](https://learn.chatgpt.com/docs/app)。

文档将 ChatGPT 和 Codex 列为不同工作选择；ChatGPT 输入区上方有 Chat / Work，New chat 提供 Quick chat 入口。这里只确认文档中的工作流定位，不推断下载包的视觉实现。

## 值得做的两个独立案例

以下是原创实现提案，尚未实现或验收，不是厂商组件代码。

### 1. 输入意图边界

状态：草稿 → 建议出现 → 明确采纳 → 已发送 → 运行中 → 补充排队／已停止。

建议文本在采纳前不写入实际草稿值；明确区分排队补充与停止执行。重点测试未采纳建议时按 Enter、输入法组合、重复发送、附件变化和停止／补充竞态。

### 2. 聚焦面板负责导航，会话负责状态

每个会话拥有草稿、滚动位置、所选结果和未提交评论；双栏导航只替换聚焦面板。用虚构任务与原创素材展示文件反馈、后台完成及批量评审。

重点测试快速切换、关闭聚焦栏、窄屏溢出、长文件名、未提交评论，以及非当前会话在后台完成。尺寸、断点和动效参数都应明确标为独立默认值，或在后续采集后测量。

## 下一步与权益

静态检查待补：bundle 标识／版本、资源目录、入口结构和许可清单。原生交互、可访问性、截图和动画仍需单独验证。

安装包及专有代码、logo、字体、截图和提取资源不提交到 Motionbook。本条仅保存原创研究与来源；若后续使用允许引用的开源部分，应保留其实际许可和版权信息。
