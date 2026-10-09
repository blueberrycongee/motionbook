# 视频对比：用与不用 Motionbook skill

两个 Sonnet 5.5 代理（high effort）并行执行同一份任务：用纯代码为虚构任务 App「Tidy」制作约 20 秒的产品动效短片。两份提示词只有「参考资料」一段不同，代理不知道自己处在对比实验中。

| 目录 | 条件 |
| --- | --- |
| [control/](control/NOTES.md) | 不使用 Motionbook skill，不读取本仓库；在仓库外的独立目录工作 |
| [skill/](skill/NOTES.md) | 先阅读并遵循 `skills/motionbook/SKILL.md`，用它查找并参考相关作品 |

每个代理只生成一次，结果未经挑选，也没有人工修改画面。这是单次样本的定性对比，不能证明 skill 的普遍效果。

## 共同提示词

```text
在 <工作目录> 中，用纯代码制作一段约 20 秒的产品动效展示视频。

## 主题
一款虚构的任务管理 App「Tidy」的产品宣传短片。用 3–4 个界面交互片段展示它的使用体验（例如新建任务、给任务打标签、完成任务时的反馈、同步/加载状态），片段之间要有转场，结尾出现产品名。界面、文案、图形全部用代码自行绘制，不使用外部图片、视频或素材文件。追求真正有品质感的 UI 动效：节奏、缓动、空间连续性和细节反馈都要讲究。

## 参考资料
<见下方差异>

## 技术要求
- 只用代码生成画面（HTML/CSS/JS/SVG/Canvas 均可），用 headless 浏览器逐帧截图，再用 ffmpeg 合成。动画必须由帧时间确定性驱动（给定时间 t 渲染对应画面），不能依赖实时播放。
- 可用工具：Node 22（`require('playwright')` 可直接使用，Chromium 已安装）、ffmpeg、Python 3 + Pillow。不要联网安装新依赖。
- 只在 <工作目录> 目录内写文件。

## 交付物（都放在 <工作目录>）
- `video.mp4`：1280×720，30fps，H.264（yuv420p），时长 18–22 秒
- `video.gif`：宽 640px，15fps，完整时长，文件不超过 15 MB
- 全部源码，以及一条命令即可重新渲染的脚本
- `NOTES.md`：简要说明设计思路和复现命令

## 自检
渲染完成后，用 ffmpeg 抽取若干关键帧 PNG 并亲自查看，检查排版错位、文字溢出、闪烁、卡顿等问题，发现就修正后重新渲染。最后用 ffprobe 确认时长、分辨率和帧率，报告最终文件的路径、大小和你的主要设计决策。
```

## 「参考资料」段的差异

- **control**：不要使用 Motionbook skill，也不要读取 /workspace/blueberrycongee/motionbook 仓库中的任何内容。
- **skill**：开始前先阅读并遵循 Motionbook skill：/workspace/blueberrycongee/motionbook/skills/motionbook/SKILL.md，用它查找并参考相关作品。仓库就在 /workspace/blueberrycongee/motionbook，可以直接读取本地文件，但不要修改。

## 复现

需要 Node、Playwright Chromium 和 ffmpeg。`control/` 运行 `./build.sh`，`skill/` 运行 `./render.sh`，都会逐帧重新渲染并编码 MP4 和 GIF。
