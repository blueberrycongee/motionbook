# 歌词滚动量测

参考 [Apple Sing 教程](https://tv.apple.com/us/movie/how-to-use-apple-music-sing/umc.cmc.3xdggtxhj5zdymvim87orptzm)。区间为源帧 500–614，PTS 16.683333–20.487133s，末端不含 20.520500s；原始采样间隔 33.3667ms。裁切为 x1240、y78、438×926 源像素。

四组文字 A/B/C/D 依次启动，组间差约 1–2 帧。B/C/D 稳定上移约 202–203px，约 4px 过冲后回落；B 组内还展开约 3–4px，不能用单一整层位移代替。

- B：首次超过 2px 位移在 17.5175–17.5509s；进入最终 ±2px 带在 18.2849–18.3183s
- C：启动 17.5509–17.5842s；收敛 18.3183–18.3517s
- D：启动 17.6176–17.6510s；收敛 18.3517–18.3850s
- A：启动 17.4508–17.4841s；A1–A4 分别在帧 527/529/531/535 后被遮挡，之后不补造轨迹

逐行模板相关得到位置，保守空间不确定度 A/B/C 约 ±2px、D 约 ±3px。亚像素拟合不增加时间分辨率；D 的 ±2px 收敛带也不代表 2px 绝对精度。x/y/w/h 是带边距的模板框，不是真实墨迹边界或字体基线。

[observations.json](observations.json)保留几何观测；[motion-summary.json](motion-summary.json)列出事件与收敛；[observed-trajectories.png](observed-trajectories.png)仅展示数值轨迹。最终模型使用全部有效观测点，同点吻合是拟合检查，不是独立精度；见[还原范围](../FIDELITY.md)。
