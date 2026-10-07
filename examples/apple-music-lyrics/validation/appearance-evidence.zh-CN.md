# 歌词时序与外观

## 数据模型

[Apple TTML 规范](https://help.apple.com/itc/videoaudioassetguide/en.lproj/static.html)用 `<p>` 定义行时段、`<span>` 定义更细的节拍时间；span 可跨词或切分词。保留原始空白、演唱者和伴唱信息，允许多个时段同时有效。格式不提供客户端的字体、blur、alpha 或动画曲线。

建议分开 `semanticLine` 与 `visualRows`，按绝对媒体时间求状态；换行只影响布局。示例结构为 `{id, begin, end, agent, spans, backingVocals}`。没有真实 span 数据时，不按字数等分并声称是 Apple 时序。减少动态效果、空段策略与恢复跟随属于演示设计。

## 画面通道

参考 [Apple Sing 教程](https://tv.apple.com/us/movie/how-to-use-apple-music-sing/umc.cmc.3xdggtxhj5zdymvim87orptzm)。手机画面裁切为 [1240,78,438,926]；30000/1001 fps，每帧约 33.37ms。墨迹高约 29–33 源像素、行距约 44 源像素，不能据此直接宣称字号或字体文件。

分开位置、局部对比度、模糊与扫亮前沿：Incoming B1 在 17.350667s 的额外 Gaussian sigma 约 2.25px、对比增益约 .52；17.484s 增益约 1.03 而 sigma 仍约 2.25，17.551s sigma 约 1，17.684s 接近清晰参考。Outgoing A4 在 17.551/17.618/17.684s 的相对 sigma 约 2/3.25/3.25，增益约 .684/.352/.233。这些是图像空间拟合，不能等同原生 blur 半径或 alpha。

[relative-softness-fit.json](relative-softness-fit.json)保留相对拟合；[background-palette.json](background-palette.json)仅作原创渐变配色参考。C/D 缺少同字形清晰对照，模糊等参数是重建选择。

行内扫亮使用完整柔边亮度场，不将近白阈值或字形间隙当作精确暂停；见[量测方法](highlight-measurement-method.md)。Inter 是替代字体，所有文字为原创。示例时间夹具是测试输入，不是歌曲时间；原片、歌词、音轨与裁切不分发。
