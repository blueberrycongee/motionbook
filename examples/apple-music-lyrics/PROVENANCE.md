# 来源、时间基准与权利

研究日期：2026-10-06。

## 真实动态来源

[How to Use Apple Music Sing · Apple TV 官方页面](https://tv.apple.com/us/movie/how-to-use-apple-music-sing/umc.cmc.3xdggtxhj5zdymvim87orptzm)；同一教程的 [Apple Music 页面](https://music.apple.com/us/music-movie/how-to-use-apple-music-sing/1660306166)。页面公开预告由 Apple Music 出品，元数据发布日期 2023-01-19。

通过页面公开的未加密视频 rendition 取得视频画面，无需账户、登录、DRM 密钥、安装程序或绕过安全提示。没有提取或分发音轨。

这是一段官方教程中的合成 iPhone 展示画面，不是经过验证的原生设备直接录屏。外观与 Sing 初期 iPhone 设计相符；精确设备型号、iOS 补丁与 Music build 未给出，不断言是某个精确版本或 2026 年当前界面。

## 源媒体与裁切

- 1920×1080，H.264，30000/1001 fps，time base 1/30000
- 视频文件 SHA-256：`e5769cae0b17e66f8266c0fb6feebab8b0ef46e9348c7d46c7a22a316d33e9e3`
- 手机画面裁切：x=1240、y=78、438×926；这些是源视频像素，不是 iPhone 逻辑点
- 本次回放：源帧 500–614 共 115 帧，原始 PTS 500500–614614
- 起点 16.683333333 秒，最后可见帧 20.487133333 秒，结束边界 20.5205 秒
- 时长 3.837166667 秒，1×，没有为显得顺滑而减速或补造“实测”帧
- 原始采样间隔 33.3667ms；事件边界至少保留一个源帧的时间不确定性

## 能分享什么

代码、原创示例文案、原创几何封面、粗略背景渐变、量测数值、无文字矩形示意图，以及由这些自产元素生成的预览。使用可再分发的 Inter 字体，许可随 `assets/Inter-LICENSE.txt` 保存。

原始教程、原始裁切帧、真实封面、歌曲歌词及音轨没有进入 ZIP 或本地例子。并排对比中的“source”面板仅由实际量测框重新画成几何图，不含原片像素。它用于核查轨迹，不能视为原视频与复刻的全画面相似度比较。

参考素材的公开可读不等于获得再分发整段素材的权利。本例不声称与 Apple 合作，也不提供官方歌曲资源。

## 辅助官方资料

- [Apple Music Sing 介绍](https://www.apple.com/newsroom/2022/12/apple-introduces-apple-music-sing/)
- [Apple TTML 交付规范](https://help.apple.com/itc/videoaudioassetguide/en.lproj/static.html)
- [iOS 16 更新说明](https://support.apple.com/en-us/101566)

这些资料能说明功能或时序语义；不能代替当前片段的几何量测，或证明原生字体、alpha、blur 和 spring 常数。
