# 按用途找动效

这里按可借用的交互组织 51 个研究示例。分类是编辑判断，不是上线认证；具体运行、来源和许可边界见各例文档。

先看要解决的问题，再选最小片段。页面片段不代表完整 landing；趣味效果可以启发创作，但不默认用于高频操作。源码锚点是局部阅读入口，仍需检查依赖和目标布局；不表示整段代码可直接投入生产。

[Agent skill](../skills/motionbook/SKILL.md) · [分类定义](../skills/motionbook/references/taxonomy.md) · [WIP 清单](../wip/README.md)

## 组件（30）

| 示例 / 定位 | 值得研究什么 | 可借用的最小部分 / 场景 | 限制 |
| --- | --- | --- | --- |
| [Adaptive Precision](../examples/adaptive-precision/README.md) · 日常交互 | 指针从点变成日历范围引导，把粗定位过渡到精确选择 | **锚点反向拖动与四分之一小时选择**；日历、时间范围编辑<br>源码：[Calendar](../examples/adaptive-precision/src/model.js#L9) | 实时时间模型是独立推断，不能当原作算法 |
| [Angry sliders](../examples/angry-sliders/README.md) · 趣味实验 | 把滑块拉成弹弓，预测轨迹和落地回弹形成笑点 | **拉伸、释放、落地三段反馈**；玩具、小游戏、活动彩蛋<br>源码：[reduce](../examples/angry-sliders/src/scene.mjs#L13)、[drawState](../examples/angry-sliders/src/scene.mjs#L24) | 飞走的把手妨碍精确输入，不适合常规设置 |
| [Card details sheet](../examples/card-details-sheet/README.md) · 日常交互 | 详情浮层与背景层次同步变化，保留卡片来源感 | **详情抽屉展开与关闭**；卡片详情、账户摘要<br>源码：[open](../examples/card-details-sheet/app.js#L1) | 剪贴板权限和命中区域需真实浏览器验证 |
| [dot send](../examples/chatgpt-dot-send/README.md) · 日常交互 | 发送形状从输入位置移动到消息位置，连接动作和结果 | **发送轨迹、形变与列表让位**；聊天输入、提交反馈<br>源码：[frame](../examples/chatgpt-dot-send/src/motion.mjs#L36)、[previousRowOffset](../examples/chatgpt-dot-send/src/motion.mjs#L43) | 尺寸和布局需重新测量，不照抄固定画布坐标 |
| [PiP](../examples/chatgpt-pip/README.md) · 日常交互 | 悬浮小窗吸附与悬停反馈表达窗口位置关系 | **边缘吸附与悬停状态**；悬浮播放器、工具小窗<br>源码：[chooseTargetAnchor](../examples/chatgpt-pip/src/stack-behavior.mjs#L30)、[HoverController](../examples/chatgpt-pip/src/hover-behavior.mjs#L7) | 不能据离线预览声称原生窗口行为已验证 |
| [Customizable glass folder](../examples/customizable-glass-folder/README.md) · 品牌展示 | 透明文件夹通过层叠和材质表现内容容器 | **玻璃层叠与外观切换**；文件入口、品牌化空状态<br>源码：[recolor](../examples/customizable-glass-folder/app.js#L1) | 材质不能代替清晰的文件名称和选中态 |
| [Document signature](../examples/document-signature/README.md) · 日常交互 | 签名绘制与成功状态形成可读的完成过程 | **签署中的笔迹与结果切换**；签收、确认流程<br>源码：[state](../examples/document-signature/scene.js#L8) | 动画不提供电子签名法律效力或真实签署服务 |
| [Dynamic island streak](../examples/dynamic-island-streak/README.md) · 品牌展示 | 胶囊展开、滚动计数和火焰庆祝组织连续打卡反馈 | **紧凑摘要展开与达成庆祝**；习惯追踪、里程碑<br>源码：[reduce](../examples/dynamic-island-streak/src/scene.mjs#L25) | 高频场景应缩短庆祝，保留静态计数 |
| [Expandable tool grid](../examples/expandable-tool-grid/README.md) · 日常交互 | 工具入口在网格中展开，兼顾概览与局部细节 | **单元展开与相邻布局协调**；工具面板、快捷入口<br>源码：[change](../examples/expandable-tool-grid/app.js#L2) | 需检查扩展后焦点与点击目标是否稳定 |
| [File toss](../examples/file-toss/README.md) · 趣味实验 | 文件投向垃圾桶，命中、失手和回归赋予删除动作物理隐喻 | **投掷轨迹与可撤销结果**；文件演示、桌面彩蛋<br>源码：[Toss](../examples/file-toss/model.js#L3) | 业务删除应保留直接操作和撤销，不能要求投准 |
| [File upload card](../examples/file-upload-card/README.md) · 日常交互 | 上传过程封装在卡片内，状态变化集中在同一位置 | **上传卡片的过程反馈**；附件上传、导入界面<br>源码：[reduce](../examples/file-upload-card/src/scene.mjs#L7) | 接入真实进度、失败和取消后再使用 |
| [Flight pill](../examples/flight-pill/README.md) · 日常交互 | 航班摘要胶囊展开为详情，路线和数字逐步进入 | **摘要到详情的容器变形**；出行状态、实时活动<br>源码：[transitionProgress](../examples/flight-pill/scene.js#L21) | 演示不提供实时航班数据 |
| [Fractional Slider](../examples/fractional-slider/README.md) · 日常交互 | 移动刻度与延迟选择标记让细微数值变化可感知 | **精细刻度拖动与按压反馈**；参数调节、精度控制<br>源码：[Ruler](../examples/fractional-slider/src/model.js#L1) | 实操控制是独立扩展，原片重置手势未知 |
| [Graph slider](../examples/graph-slider/README.md) · 日常交互 | 曲线标记、引导线和时间提示共同定位图表位置 | **沿曲线滑动与提示联动**；时间序列、图表探索<br>源码：[Scrub](../examples/graph-slider/model.js#L1) | 指针与引导线有独立轨迹，不应合并成一个坐标 |
| [Invite code reveal](../examples/invite-code-reveal/README.md) · 品牌展示 | 邀请码通过翻折和深度变化显露，建立揭晓仪式感 | **折叠容器的揭示动作**；邀请、奖励、一次性揭晓<br>源码：[interactiveState](../examples/invite-code-reveal/src/scene.mjs#L15) | 装饰不应延迟复制或遮挡关键文本 |
| [Light Work](../examples/light-work/README.md) · 品牌展示 | 指针光照、边缘流光与开关联动，赋予卡片材质感 | **局部光照与开关反馈**；品牌卡片、产品展示<br>源码：[step](../examples/light-work/controller.js#L2) | 暗部装饰不能影响标签阅读；非真实系统设置 |
| [Luminous tabs](../examples/luminous-tabs/README.md) · 品牌展示 | 发光标签增强当前导航位置的视觉反馈 | **选中态光效与切换**；小型导航、品牌控制面板<br>源码：[transition](../examples/luminous-tabs/src/scene.mjs#L7) | 保持未选中标签可读，不能只凭辉光辨识 |
| [Micro progress button](../examples/micro-progress-button/README.md) · 日常交互 | 将进度压缩到触发按钮附近，减少状态搜索 | **按钮内的进度变化**；短任务、提交和处理<br>源码：[ProgressController](../examples/micro-progress-button/src/motion.mjs#L6)、[outline](../examples/micro-progress-button/src/scene.mjs#L3) | 取消只改变本地状态；八秒计时结束调用 cancel 是演示复位而非成功，需接入真实进度、网络取消、成功/失败及焦点恢复 |
| [Minimap](../examples/minimap/README.md) · 日常交互 | 固定横向位置的刻度随悬停形变，增强局部指向感 | **刻度场的局部弹性响应**；时间线装饰、密集刻度提示<br>源码：[Minimap.step](../examples/minimap/src/model.js#L8) | 原例无拖动、播放或水平放大，不虚构这些能力 |
| [Labels and braille loading](../examples/morphing-braille-loader/README.md) · 日常交互 | 点阵形变与标签配合，提供轻量等待提示 | **点阵加载与状态标签**；异步等待、小型状态区<br>源码：[dots](../examples/morphing-braille-loader/scene.js#L13) | 视觉点阵不是盲文无障碍接口，需要文本状态 |
| [Nested tag creation](../examples/nested-tag-creation/README.md) · 日常交互 | 搜索、选择、创建和颜色选择嵌在同一标签流程 | **选择器中的就地创建与嵌套返回**；标签管理、分类输入<br>源码：[Picker.beginCreate](../examples/nested-tag-creation/model.js#L17)、[Picker.commit](../examples/nested-tag-creation/model.js#L18)、[Picker.escape](../examples/nested-tag-creation/model.js#L21) | 复用状态流，按目标布局处理弹层与焦点 |
| [Segmented order-status card](../examples/order-status-card/README.md) · 日常交互 | 分段卡片把订单阶段变化聚合到一个状态容器 | **分阶段进度与标签变化**；订单、交付状态<br>源码：[state](../examples/order-status-card/scene.js#L6)、[choose](../examples/order-status-card/app.js#L3) | 示例状态不是物流数据，需要真实失败分支 |
| [Paid stamp](../examples/paid-stamp/README.md) · 品牌展示 | 盖章动作用短促接触表达完成感 | **印章落下与确认停留**；收据、轻量完成反馈<br>源码：[reduce](../examples/paid-stamp/src/model.mjs#L7)、[drawState](../examples/paid-stamp/src/model.mjs#L36) | 不能仅凭动画宣告付款成功，要由业务结果驱动 |
| [Paperclip transcript](../examples/paperclip-interaction/README.md) · 品牌展示 | 纸夹与展开纸页把分享内容做成可触摸的层叠物 | **纸页扇形展开和悬停收拢**；分享预览、文档入口<br>源码：[hover](../examples/paperclip-interaction/app.js#L10)、[svg](../examples/paperclip-interaction/scene.js#L12) | 目标图标和复制行只是展示，不会分享或复制 |
| [Progress squeeze](../examples/progress-squeeze/README.md) · 品牌展示 | 进度线挤压和回弹给等待过程加入触感 | **进度边缘形变与暂停反馈**；轻量加载、品牌进度条<br>源码：[reduce](../examples/progress-squeeze/src/scene.mjs#L22)、[knot](../examples/progress-squeeze/src/scene.mjs#L35) | 形变不能歪曲真实进度或妨碍取消 |
| [Spring code input](../examples/spring-code-input/README.md) · 日常交互 | 输入格、错误重试和验证结果用弹性转场串联 | **验证码输入到错误与成功**；验证码、短码确认<br>源码：[CodeInputModel](../examples/spring-code-input/src/model.mjs#L4) | 没有认证后端，不能把本地 Verified 当作授权 |
| [Tactile controller](../examples/tactile-controller/README.md) · 品牌展示 | 旋钮、凹槽和数字变化共同表达物理调节感 | **模式切换与数值旋钮**；媒体工具、创意控制器<br>源码：[set](../examples/tactile-controller/app.js#L1)、[move](../examples/tactile-controller/app.js#L1) | 不改变真实音量或亮度；需保留键盘数值输入 |
| [Tap / get invoice](../examples/tap-get-invoice/README.md) · 品牌展示 | 纸张折叠展开与笔迹突出发票的文档属性 | **文档揭示和折面动画**；票据预览、文档下载入口<br>源码：[Controller](../examples/tap-get-invoice/src/controller.mjs#L4)、[scene](../examples/tap-get-invoice/src/scene.mjs#L9) | 导出为示意文档，不是交易或真实发票服务 |
| [Task-card gesture stack](../examples/task-card-gesture-stack/README.md) · 日常交互 | 任务卡退出后下一张晋升，明确队列推进关系 | **滑动完成与卡片晋升**；任务队列、逐项处理<br>源码：[advance](../examples/task-card-gesture-stack/app.js#L5)、[state](../examples/task-card-gesture-stack/scene.js#L8) | 业务动作需可撤销，拖动不能是唯一入口 |
| [Ticket dissolve](../examples/thanos-snap-ticket/README.md) · 趣味实验 | 票券粒子消散形成戏剧性的隐藏效果 | **卡片消散与反向恢复**；活动票券、趣味演示<br>源码：[particles](../examples/thanos-snap-ticket/scene.js#L11) | 不可暗示真实退票或删除成功，也不适合高频隐藏 |

## 界面与工作流（10）

| 示例 / 定位 | 值得研究什么 | 可借用的最小部分 / 场景 | 限制 |
| --- | --- | --- | --- |
| [Adaptive email sidebar](../examples/adaptive-email-sidebar/README.md) · 日常交互 | 邮件导航分组随选择展开，保留当前上下文 | **分组展开与叶子选择**；邮箱、文件树、项目导航<br>源码：[target](../examples/adaptive-email-sidebar/scene.js#L11)、[select](../examples/adaptive-email-sidebar/app.js#L4) | 需用真实长名称与键盘焦点验证层级 |
| [Agent plan](../examples/agent-plan/README.md) · 日常交互 | 批准、跳过、执行和完成在计划行内呈现，便于理解阶段 | **计划行状态与批量操作**；Agent 计划、审批流程<br>源码：[action](../examples/agent-plan/scene.js#L16) | 本地模拟，不执行搜索或远程任务 |
| [Apple Music Lyrics · 逐帧动效研究](../examples/apple-music-lyrics/README.md) · 日常交互 | 歌词组错峰滚动、扫亮和背景柔化建立阅读焦点 | **当前行跟随与逐字高亮**；歌词、字幕、逐步讲解<br>源码：[Controller](../examples/apple-music-lyrics/src/motion.js#L30) | 没有音乐服务；原生未验证，手动模式为补充设计 |
| [Automation manager](../examples/automation-manager/README.md) · 日常交互 | 任务列表、详情和条件设置逐层展开，高级规则通过显式入口进入编辑器，减少默认界面负担 | **列表到详情导航，或基础设置到高级规则编辑器的渐进披露**；自动化管理、任务配置、密集设置的高级选项<br>源码：[Controller.navigate](../examples/automation-manager/src/controller.mjs#L101)、[Controller.performNavigation](../examples/automation-manager/src/controller.mjs#L130)、[schedule custom-rule disclosure](../examples/automation-manager/src/view.mjs#L183)、[modal advanced-rule branch](../examples/automation-manager/src/view.mjs#L284)、[Controller.action advanced/save-rule](../examples/automation-manager/src/controller.mjs#L464) | 仅借高级设置时不带入任务列表、执行器或自动保存；保留显式取消/保存与验证错误，重新验证弹窗焦点和键盘；仅本地模拟，浏览器未验收 |
| [Flo composer](../examples/flo-composer/README.md) · 品牌展示 | 输入、应用图标、项目行和批准提示以错峰动作衔接 | **输入区局部反馈与上下文切换**；Agent 输入、上下文选择<br>源码：[Composer](../examples/flo-composer/src/model.mjs#L34) | 没有聊天后端、应用连接或权限变更 |
| [Life in Weeks](../examples/life-in-weeks/README.md) · 日常交互 | 以周为单位的网格把年龄变成可探索的时间尺度 | **年龄滑杆与周网格联动**；个人回顾、时间可视化<br>源码：[Controller](../examples/life-in-weeks/src/controller.mjs#L6) | 这是抽象展示，不能解释为个人寿命预测 |
| [Meeting Finder](../examples/meeting-finder/README.md) · 日常交互 | 多个城市时间随小时条联动，帮助比较共同会议时段 | **时间拖动与跨行比较**；会议安排、跨区时间选择<br>源码：[times](../examples/meeting-finder/scene.js#L6)、[drag](../examples/meeting-finder/app.js#L3) | 固定时区偏移演示，不含夏令时数据库或排程服务 |
| [Model router](../examples/model-router/README.md) · 日常交互 | 策略、路由图和表格联动，把模型分配关系具象化 | **图表双向悬停与策略切换**；路由配置、流程映射<br>源码：[Router.hoverRoute](../examples/model-router/model.js#L13)、[Transition.at](../examples/model-router/motion.js#L13) | Deploy 仅更新本地基线，没有真实部署后端 |
| [RAG Pipeline](../examples/rag-pipeline/README.md) · 日常交互 | 流程节点和连接线把检索生成过程变成可读路径 | **节点状态与数据流动**；AI 流程说明、执行过程可视化<br>源码：[state](../examples/rag-pipeline/scene.js#L8)、[handoffAt](../examples/rag-pipeline/scene.js#L31) | 可视演示不等于真实检索或生成后端 |
| [Pinned paper notes](../examples/sticky-note-app/README.md) · 日常交互 | 纸张层叠与翻页让笔记浏览保持对象连续性 | **笔记切换、分类与页数反馈**；轻量笔记、卡片阅读<br>源码：[action](../examples/sticky-note-app/scene.js#L11)、[step](../examples/sticky-note-app/app.js#L5) | 演示本地状态，不是完整持久化笔记产品 |

## Landing / 作品集片段（3）

| 示例 / 定位 | 值得研究什么 | 可借用的最小部分 / 场景 | 限制 |
| --- | --- | --- | --- |
| [Inspora footer](../examples/inspora-footer/README.md) · 品牌展示 | 页脚沙漠、纸张与骑马场景把页面结尾做成记忆点 | **叙事性页脚片段**；品牌站、作品集页尾<br>源码：[pose](../examples/inspora-footer/horse-motion.js#L44) | 仅页脚研究，不是完整 landing；素材是独立替代绘制 |
| [Portfolio ribbon](../examples/marcelo-portfolio-ribbon/README.md) · 品牌展示 | 作品条带中间收束、两端展开，拖动时惯性弯曲 | **循环作品带与惯性变形**；作品集、展示页局部<br>源码：[liveGeometry](../examples/marcelo-portfolio-ribbon/src/geometry.mjs#L8)、[RibbonController](../examples/marcelo-portfolio-ribbon/src/geometry.mjs#L30) | 仅画廊片段；视觉变形不适合密集文本浏览 |
| [Playful project hovers](../examples/spencer-playful-hovers/README.md) · 品牌展示 | 作品悬停序列让项目入口带有个性和探索感 | **项目条目的局部悬停反馈**；作品集、项目列表<br>源码：[createModel](../examples/spencer-playful-hovers/motion.js#L7)、[sync](../examples/spencer-playful-hovers/app.js#L22) | 只有局部 hover 研究；触屏需提供等价入口 |

## 创意动效（8）

| 示例 / 定位 | 值得研究什么 | 可借用的最小部分 / 场景 | 限制 |
| --- | --- | --- | --- |
| [ChatGPT Space](../examples/chatgpt-space-welcome/README.md) · 品牌展示 | 程序化星空提供纵深与轻微闪烁，文档卡片和协作内容另行编排成欢迎展示 | **独立星空背景，或卡片出入场与内容接力**；欢迎页、onboarding 标题背景、产品能力介绍<br>源码：[cardPose](../examples/chatgpt-space-welcome/src/motion.mjs#L59)、[editProgress](../examples/chatgpt-space-welcome/src/motion.mjs#L72)、[StarField](../examples/chatgpt-space-welcome/src/motion.mjs#L21)、[SpaceScene.glow](../examples/chatgpt-space-welcome/src/scene.mjs#L9)、[SpaceScene.star layer](../examples/chatgpt-space-welcome/src/scene.mjs#L13) | 仅借背景时不带入卡片、协作者标签或 warp；1000–11000 星点需调低密度和对比度，减少动态时冻结星场并避开初始透明度为零；非协作后端 |
| [Elastic String Clock](../examples/elastic-string-clock/README.md) · 趣味实验 | 弹性线条赋予时钟形态触感和节奏 | **线条形变与回弹**；实验时钟、展览视觉<br>源码：[step](../examples/elastic-string-clock/physics.js#L7) | 装饰复杂度不一定提高时间可读性 |
| [macOS Genie](../examples/macos-genie/README.md) · 品牌展示 | 窗口沿目标位置收束，展示经典最小化的空间连续性 | **窗口到停靠点的形变**；窗口管理概念、交互教学<br>源码：[row](../examples/macos-genie/src/motion.js#L22)、[action](../examples/macos-genie/src/motion.js#L41) | 原生集成和性能未验证，不应套用每个弹窗 |
| [Dither + ASCII cards](../examples/praveen-cards/README.md) · 品牌展示 | 抖动和 ASCII 表面把卡片变成视觉材质实验 | **卡片表面的字符化渲染**；艺术展示、品牌卡片<br>源码：[paintDither](../examples/praveen-cards/src/left-surface.mjs#L13)、[sculptureDensity](../examples/praveen-cards/src/right-surface.mjs#L24) | GIF 仅覆盖前六秒；纹理不宜用于正文背景 |
| [Ringwriter](../examples/ringwriter/README.md) · 趣味实验 | 字母围绕环形运动，让排版成为可操作的视觉玩具 | **环形字母编排与按住释放**；实验排版、艺术互动<br>源码：[createInteraction](../examples/ringwriter/src/interaction.mjs#L32) | 不适合长文阅读或常规文本输入 |
| [Shiba online](../examples/shiba-online/README.md) · 趣味实验 | 像素柴犬与复古桌面窗口组合成短循环叙事 | **像素场景的层次和循环节奏**；插画、趣味空状态<br>源码：[desktop](../examples/shiba-online/src/scene.mjs#L107)、[shiba](../examples/shiba-online/src/scene.mjs#L137) | 这是动画插画，不是交互桌面；角色经过改编 |
| [Sketcha onboarding](../examples/sketcha-onboarding/README.md) · 品牌展示 | 角色动作与撕开画面的转场连接欢迎和菜单 | **角色驱动的一次性揭幕**；品牌 onboarding、首次引导<br>源码：[poseAt](../examples/sketcha-onboarding/src/motion.mjs#L16)、[OnboardingController](../examples/sketcha-onboarding/src/motion.mjs#L33) | 长编排适合低频场景，需提供跳过和减少动态 |
| [Tiny animated SVG](../examples/tiny-animated-svg/README.md) · 品牌展示 | 小型 SVG 用渐变和滤镜形成虹彩字样，展示轻量装饰的表达力 | **字样表面的扫光与层次**；升级提示、品牌徽标<br>源码：[svgAt](../examples/tiny-animated-svg/src/build.mjs#L8) | 原作品牌权利未授予；浏览器滤镜兼容性需验证 |
