# 创意视频对比：「从混乱到秩序」

两个 Opus 5.5 代理（high effort）并行执行同一份任务：用纯代码制作约 20 秒、主题为「从混乱到秩序」的创意短片。两份提示词只有「参考资料」一段不同。每个代理只生成一次，结果未经挑选，也没有人工修改画面。

| 目录 | 条件 |
| --- | --- |
| [control/](control/NOTES.md) | 不使用 Motionbook skill，不读取本仓库 |
| [skill/](skill/NOTES.md) | 先独立确定创意概念，再用 Motionbook skill 查找提升完成度的具体手法 |

## 共同提示词

```text
你是一个有顶级设计品味的动效设计师。

在 <工作目录> 中，用纯代码制作一段约 20 秒的创意动态视觉短片。

## 主题
「从混乱到秩序」。这是一支创意 motion graphics 短片，不是产品广告。具体的概念、视觉风格、叙事和形式完全由你决定，目标是让人看完印象深刻：要有一个鲜明的创意想法，并且在构图、节奏、运动质感、材质和转场上都有完成度。画面全部用代码自行生成，不使用外部图片、视频或素材文件。

## 参考资料
<见下方差异>

## 技术要求
- 只用代码生成画面（HTML/CSS/JS/SVG/Canvas/WebGL 均可），用 headless 浏览器逐帧截图，再用 ffmpeg 合成。动画必须由帧时间确定性驱动（给定时间 t 渲染对应画面），不能依赖实时播放。
- 可用工具：Node 22（`require('playwright')` 可直接使用，Chromium 已安装）、ffmpeg、Python 3 + Pillow。不要联网安装新依赖。
- 只在 <工作目录> 目录内写文件。

## 交付物（都放在 <工作目录>）
- `video.mp4`：1280×720，30fps，H.264（yuv420p），时长 18–22 秒
- `video.gif`：宽 640px，15fps，完整时长，文件不超过 15 MB
- 全部源码，以及一条命令即可重新渲染的脚本（脚本使用相对路径）
- `NOTES.md`：简要说明创意概念、设计思路和复现命令

## 自检
渲染完成后，用 ffmpeg 抽取若干关键帧 PNG 并亲自查看，检查构图问题、文字溢出、闪烁、卡顿等，发现就修正后重新渲染。最后用 ffprobe 确认时长、分辨率和帧率，报告最终文件的路径、大小和你的主要设计决策。
```

## 「参考资料」段的差异

- **control**：不要使用 Motionbook skill，也不要读取 /workspace/blueberrycongee/motionbook 仓库中的任何内容。
- **skill**：先独立确定你的创意概念，再用 Motionbook skill（/workspace/blueberrycongee/motionbook/skills/motionbook/SKILL.md）查找能提升完成度的具体手法（缓动、转场、材质、反馈等），不要借用参考作品的题材或创意本身。仓库就在 /workspace/blueberrycongee/motionbook，可以直接读取本地文件，但不要修改。

## 复现

需要 Node、Playwright Chromium、ffmpeg 和 Python 3 + Pillow。在各子目录运行 `node render.js`，会逐帧重新渲染并编码 MP4 和 GIF。
