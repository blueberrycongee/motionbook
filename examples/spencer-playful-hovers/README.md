# Spencer · Playful project hovers v2

独立、无运行依赖的作品列表展开交互。下载本目录后，直接用浏览器打开 index.html；无需安装、账户、API Key 或后台服务。

## 交互

- 悬浮四个项目，显示各自倾斜卡片组并推动相邻行
- Tab/方向键切换焦点，Enter 或点击固定/关闭，Escape 重置
- Play sequence 自动演示，手动操作停止播放
- reduced-motion 偏好关闭自动播放并切换为即时状态

## 验证

运行 `node test-motion.cjs` 与 `node test-motion-v2.cjs`。动效状态、恢复参数测试，JavaScript 语法与 22 枚 SVG 的 XML 检查均通过。真实浏览器、移动端交互仍未完成验收。

500ms 零回弹弹簧、卡片独立轨迹和底部锚定揭示按参考测量校准。与原视频 181 帧过渡的行运动比较，RMS 为 1.825 原视频像素；这不代表整图像素一致。

## 来源与素材

- 原帖：https://x.com/spenceramarsh/status/2106075554264797619
- 作者网站：https://andpals.com/

全部 22 枚 SVG 为本次研究新绘的独立插画。此源代码提交不含原视频、原照片、参考截图、原站点代码或 Framer bundle，也不含含有原画面的对照视频。作者/项目名称与商标仍属于其权利方；不表示官方认可。

当前提交提供完整核心源码。离线 GIF 和对照材料没有包含在此源代码提交中。
