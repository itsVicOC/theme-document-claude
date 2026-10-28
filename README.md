# Document — claude.com 风格改造版

## 安装包兼容修正（1.1.1）

请使用新文件 `dist/theme-document.zip`。新版将 `style.css`、`index.php` 和 `functions.php` 直接放在 ZIP 最外层，显式记录子目录，并统一文件权限。请保持文件名为 `theme-document.zip`，WordPress 会以此作为安装目录名。

`npm run package` 现在会调用 WordPress 原生主题安装器，实际验证默认解压器与 PclZip 的安装、覆盖更新、主题名称和版本。安装测试失败时打包命令会报错。


## 2026-10-28 — 响应式与阅读体验优化（1.1.0）

修复移动菜单被顶栏裁切、1025px 横向溢出和滚动时透明顶栏仍接收点击的问题。保留暖白与赤陶色，统一手机、平板和桌面布局，改善文章卡片、正文、代码高亮、聚合页、评论表单、深色模式及空状态。

- `<1024px` 单栏；`1024–1279px` 正文与右栏；`≥1280px` 按现有配置显示三栏。
- 小于 1280px 使用完整抽屉导航，支持多级菜单、遮罩、Escape、焦点限制与返回。
- 已启用目录的文章在小屏显示正文前折叠目录；原有开关、HTML/短代码模式、URL 和菜单位置保留。
- 普通文字用稍深的赤陶色 `#B14D24`，深色模式对应 `#E6A17A`；装饰色仍延续原有暖色风格。

[查看修改前后截图](docs/visual-review.html) · [验证记录](docs/qa/verification.md)

### 构建与本地预览

开发工具需要 Node.js 24.18+、npm 11.16+；打包还需要 Python 3。网站运行无需 Node.js。

```sh
npm ci
npm run build
npm run dev
npm run check:php
npm run package
```

`npm run dev` 在 `http://127.0.0.1:9400` 启动隔离的 WordPress Playground，生成演示文章、菜单和小部件。测试数据仅存在于临时 WordPress，不访问线上站点。

样式入口是 `style.scss` 与 `common/page/page.scss`。统一断点与组件规则在 `assets/extra/responsive.scss`；旧 `w-*.scss` 和独立 `assets/extra/*.css` 不再作为运行入口。修改 SCSS 后运行构建并一并提交生成的 CSS。

### 安装与更新

安装包为 `dist/theme-document.zip`，主题文件直接位于 ZIP 根目录，WordPress 安装后的目录为 `theme-document`。请保持 ZIP 文件名不变，以沿用当前线上目录。在 WordPress 后台上传并选择替换现有主题，可以沿用该目录的菜单和主题绑定。先保存当前主题文件副本，便于回退；无需删除或重建主题选项。若站点使用了其他目录名，请先将包内目录改为对应名称。

安装包不包含测试数据、开发依赖、报告或截图。浏览器回归脚本位于 `tests/`，通过 Codex 的 CUA 浏览器接口执行，完整结果见验证记录。

---

😁 作为一个程序员，在日常的工作、生活、学习的过程中基本都有很多需要做笔记的地方；做笔记的主要目的之一是为了"温故而知新"，另一个则是为了在下一次遇到的时候，不需要再次耗费精力去找解决方法。

本版本基于 [friend-nicen/theme-document](https://github.com/friend-nicen/theme-document) 进行 claude.com 暖色风格与响应式体验改造（配色、排版、组件及必要的前端交互）。保留原始主题功能和已有配置。

原作者 demo：[https://nicen.cn](https://nicen.cn/)

> 本仓库为个人 fork。如需原版完整功能说明与历史记录，请访问上方原作者仓库链接。

---

# 2026-06-02 — claude.com 风格视觉重塑

> 本次重构以 [claude.com/blog](https://claude.com/blog) 为视觉参考，对配色、排版、关键组件做全面暖色调改造。仅改样式，不动功能与模板。

## 配色

| 维度 | 改前 | 改后 |
|---|---|---|
| 页面背景 | `#f5f7fd` 冷白 | `#FAF9F5` 暖白 |
| 主文字 | `#333` 冷灰 | `#1F1E1B` 暖深棕 |
| 强调色 | `#3eaf7c` Ant 绿 | `#C75F2C` 赤陶橙 |
| 暗色背景 | `#333` 冷灰 | `#1A1815` 暖深底 |
| 暗色文字 | `white` | `rgba(245,242,234,.92)` 暖白 |
| 边框 | `#e1e1e1` 中性灰 | `#E8E5DD` 暖灰 |
| 阴影 | `rgba(0,0,0,.22)` 冷黑 | `rgba(31,30,27,.06)` 暖低饱和 |
| 顶栏背景 | `#fff` 实色 | `rgba(250,249,245,.85)` 磨砂半透明 |
| 全局行高 | `1.75` 偏松 | `1.6` 克制（`pre`/`code` 局部覆盖回 `1.7`） |
| 按钮圆角 | 未统一 | `8px` |
| 卡片圆角 | 未统一 | `12px` |

## 改动文件

- `assets/extra/variant.scss` — 全量重写 `:root` 默认 token，去除 8 套主题色变体（`.theme-one` ~ `.theme-eight`），只保留一套暖色默认
- `assets/extra/dark.scss` — 暗色 token 改写，暖深底 + 暖白文字
- `assets/extra/common.scss` —
    - 引入 `--theme-font-sans` / `--theme-font-mono` 字体栈（落到 Inter / 系统无衬线 / 思源宋体后备；Tiempos/Sohne 不可公网访问时自动降级）
    - 全局 `line-height` 改为 `1.6`
    - `pre *` 颜色 `var(--theme-pre)` 替代硬编码 `#65a4e3`
    - `.tooltip` 颜色统一用 token
    - 新增全局 `a` 链接过渡（`var(--theme-transition)` + `--theme-color-20` 下划线）
    - 新增 `@media (prefers-reduced-motion: reduce)` 无障碍支持
- `assets/extra/normal.scss` —
    - 替换 14 处硬编码颜色（`#cfd4db` / `#e1e1e1` / `#2C3E50FF` / `rgb(117,117,117)`）为 token
    - 末尾追加 90 行组件微调覆盖：`.main-header` 磨砂、按钮 hover 抬升、`.i-article` 卡片化、`pre` 圆角、输入框聚焦主色光晕、标题字重与字距
- `assets/extra/w-1024.scss` / `w-480.scss` — 替换 2 处响应式硬编码 `rgba()`
- `include/config.php` — 更新后台主题色 / 背景色 / 头部色等默认值
- `include/themes/load.php` — 新增 `nicen_theme_claude_color_overrides()` 钩到 `wp_enqueue_scripts` priority 0，**在原主题的 inline `.personal{}` 注入之前修改 `$desination_configs`**，强制使用新色，绕过数据库中残留的旧色值
- `template/index/fixed.php` — 删除右侧"主题色切换"按钮（及其 9 个色块 ul/li），保留"回到顶部"和"阅读进度"
- `common/main.js` — 删除 `$('.theme-color div').click(...)` 点击处理函数（18 行）
- `common/inline/main.js` — 删除 `localStorage.getItem('theme-color')` 死代码（5 行）

## 字体策略

Tiempos / Sohne 是 Anthropic 内部商业字体，公网不可用。落到以下回退栈：

```css
--theme-font-sans: "Inter", "Sohne", -apple-system, BlinkMacSystemFont,
                   "PingFang SC", "Microsoft YaHei", "Source Han Serif SC",
                   "Segoe UI", system-ui, sans-serif;
--theme-font-mono: "JetBrains Mono", "Fira Code", "Source Code Pro", Menlo,
                   Monaco, Consolas, "Courier New", monospace;
```

用户机器若装有 Sohne / Inter 则自动优先；否则回退到系统中性无衬线 + 思源宋体后备。

## 已知妥协

1. **原 8 套主题色变体已移除** — 若以后想重新启用，需在 `variant.scss` 末尾追加 `.theme-one` ~ `.theme-eight` 块，并在 `fixed.php` 还原按钮。
2. **个别组件的极个别 1px 细节色**（如 ICP 徽章）保留为独立 token，未做硬性统一。
3. **小屏 / 平板断点文件**只清理了硬编码颜色，未做视觉重设计。

## 升级注意

- 升级时保持现有主题目录名，通过上传 ZIP 替换文件，保留菜单绑定和已有主题选项。
- 若浏览器仍显示旧色，强刷一次（Ctrl+Shift+R）清掉 `style.css` 的 `filemtime` 版本缓存。
- 旧版用户 localStorage 中残留的 `theme-color` 值（来自已删除的 8 套配色）会作为空 class 写入 `<html>`，CSS 已无对应规则，**无视觉影响**，但若想清干净可在浏览器控制台执行 `localStorage.removeItem('theme-color')`。

---

# 安装之前

通过重新安装空白的 wordpress 使用本主题进行测试，按照如下步骤安装后，未发现问题。
显示的页面与原作者 [nicen.cn](https://nicen.cn) 别无二致，如您发现任何问题，欢迎反馈。

# 安装主题

直接将整个 GitHub 仓库下载，然后上传到 wordpress 的 `/wp-content/themes` 目录，然后在后台启用主题即可。启用后通过后台左侧菜单【主题选项】进行相关配置。

安装完了跟 [nicen.cn](https://nicen.cn/) 是不一样的，因为本 fork 用了 claude.com 风格的暖色调配色，你不需要做任何额外配置即可生效。

## 关于主题

原版大部分代码都有注释，作为学习 wordpress 主题开发的模板很合适。本 fork 保留原主题功能，同时改进样式、响应式模板与前端交互。

## 使用须知

主题默认启用经典文章编辑器、经典小部件编辑器，同时对经典文章编辑器进行了增强。

主题对 JS、CSS 全局进行了压缩，同时在主题内提供了未压缩的源文件（`.scss` / `.js` 源文件）。

---

# 安装之后

## 1.关于文章目录

文章目录由后端生成，默认读取【h1】、【h2】、【h3】元标签（编辑器内的小插件可直接插入）。主题已对经典编辑器进行插件增强，请自行体验哈。

## 2.主题后台修改基本信息

主题后台提供了超强的自定义功能，你可以通过自定义做出自己真正喜欢的主题。

## 3.新增页面模板

主题具有 文章聚合、留言 两个文章模板，在后台添加页面时选择对应模板发布后，可将导航栏内的文章聚合、留言页面链接修改为你创建的链接。

1. 新建页面
2. 选择留言板或者文字聚合模板
3. 发布
4. 复制链接
5. 修改主题选项为这俩页面

## 4.顶部菜单

1. 新建菜单
2. 添加菜单项
3. 发布到顶部菜单

主题采集支持无限级的菜单，下级菜单会自动作为下拉菜单出现。

## 5.小部件、侧边栏

主题具有文章信息、作者信息、最新文章、最近更新 四个小部件（小部件自带配置，可在添加的时候填写），添加后默认在文章页面的右侧边栏显示。

1. 关闭之前主题自带的小工具
2. 拖入 document 主题的小部件
3. 保存修改
4. 不保存的话，会显示之前主题的小部件导致样式错乱

## 6.邮箱 SMTP 配置

wordpress 自带的邮件发送服务不太友好，你可以在主题选项开启主题自带的邮件服务，使用自己的邮箱服务。

1. 开启后，新评论通知站长
2. 评论回复通知被回复评论的用户
3. 评论审核通知通知发布评论的用户

---

# 致谢

本 fork 基于 [friend-nicen/theme-document](https://github.com/friend-nicen/theme-document)，原作者 [友人a丶](https://nicen.cn/) 完成了本主题的全部功能开发与维护。视觉风格借鉴自 [Anthropic Claude](https://claude.com/blog) 的产品页面设计。
