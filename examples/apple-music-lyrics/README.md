# Apple Music Lyrics

![Apple Music lyrics scrolling](preview/loop.gif)

[Demo](index.html) · [Video](preview/loop.mp4) · [¼-speed review](preview/highlight-review/highlight-review-0.25x.gif) · [Validation](VALIDATION.md) · [Fidelity](FIDELITY.md) · [Provenance](PROVENANCE.md)

用原创文字演示歌词组错峰滚动、行内柔边扫亮和前后景柔化。可复用 `src/motion.js` 的时间模型与 `src/scene.js` 的 SVG 场景。

打开 `index.html`，或运行 `npm start` 后访问 `http://127.0.0.1:4174`。播放/暂停、反向、seek、拖动和滚轮均可使用；Follow lyrics 或 Escape 恢复跟随。页面隐藏时暂停时钟；减少动态效果关闭自动播放和模糊。

- 测试：`npm test`
- 导出：`npm install`，再运行 `npm run render -- --source /absolute/path/to/the/official-video.mp4`（Node 20+、FFmpeg；原片不随包提供）
- 修改文本后量测字形：`node tools/measure-authored-text.cjs`
- 重建校准数据：`node tools/calibrate.cjs`

这是基于官方教程画面的独立研究；预览为共享场景的离线渲染，浏览器与原生设备表现尚未验证。
