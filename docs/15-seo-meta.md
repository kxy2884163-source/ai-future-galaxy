# 15 · SEO meta 优化指南

> **拍板日期**：2026-07-29 · 22:25
> **覆盖页面**：5 个核心页（index / login / register / dashboard / resource）
> **效果**：分享到 Twitter / 微信 / 飞书 / 任何 IM 时显示完整预览卡片

---

## 🎯 SEO meta 包含什么

每个核心页 head 添加：

```html
<!-- 基础 SEO -->
<meta name="description" content="...">
<meta name="keywords" content="AI, 人工智能, AI 社区, ...">
<meta name="author" content="AI 未来星域社区">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#0a0a1a">

<!-- Open Graph（Facebook / Twitter / 微信 / 飞书 / LinkedIn） -->
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:type" content="website">
<meta property="og:url" content="https://ai-future-galaxy.vercel.app/[path]">
<meta property="og:image" content="https://ai-future-galaxy.vercel.app/og.png">
<meta property="og:site_name" content="AI 未来星域社区">
<meta property="og:locale" content="zh_CN">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="https://ai-future-galaxy.vercel.app/og.png">

<!-- Canonical（避免重复内容） -->
<link rel="canonical" href="https://ai-future-galaxy.vercel.app/[path]">
```

---

## 🎨 社交分享效果

### 分享到 Twitter / X
```
┌─────────────────────────────────────┐
│                                      │
│   ✦ AI 未来星域社区                  │
│   让孤独学习变成一起玩着学 · 把信息爆 │
│   炸压成打开就能用。AI 爱好者 4 大模  │
│   块：社交页面 / 知识分享 / 常用插件  │
│   工具 / AI 在线使用。              │
│                                      │
│   ai-future-galaxy.vercel.app        │
│                                      │
└─────────────────────────────────────┘
```

### 分享到微信 / 飞书
完整预览卡片 + 标题 + 描述 + 缩略图（如果 og.png 存在）

---

## 📋 各页 meta 配置

| 页面 | title | description |
|---|---|---|
| **index.html** | AI 未来星域社区 · AI 爱好者的一站式成长宇宙 | 让孤独学习变成一起玩着学 · 把信息爆炸压成打开就能用。AI 爱好者 4 大模块：社交页面 / 知识分享 / 常用插件工具 / AI 在线使用。 |
| **login.html** | 登录 · AI 未来星域社区 | 登录 AI 未来星域社区 · 加入 AI 爱好者社区 · 社交 / 知识 / 工具 / AI 在线 4 大模块。 |
| **register.html** | 注册 · AI 未来星域社区 | 30 秒注册 AI 未来星域社区账号 · 加入 AI 爱好者社区 · 立刻开始你的 AI 探索之旅。 |
| **dashboard.html** | 个人主页 · AI 未来星域社区 | 你的 AI 探索空间 · 作品 · 收藏 · 关注 · 草稿 · 实时同步。 |
| **resource.html** | AI 知识分享 · AI 未来星域社区 | 结构化资源中心 · 教程 · 案例 · 模型 · 工具 · 数据集 · 灵感。12+ 精选资源。 |

---

## 🚧 TODO · 待优化

| 优先级 | 任务 | 估时 |
|---|---|---|
| 🟡 P1 | 13 个二级页面（404 / anime-demo / tools / me / favorites / follows / notifications / drafts / settings / search / onboarding / upload / resource-detail）补 SEO meta | 30 min |
| 🟡 P1 | 创建 og.png（1200×630 Open Graph 缩略图）| 30 min |
| 🟢 P2 | 写 sitemap.xml（自动生成）| 10 min |
| 🟢 P2 | 写 robots.txt（允许/禁止爬虫）| 5 min |
| 🟢 P2 | 加 structured data（JSON-LD · Schema.org）| 20 min |

---

## 🧪 验证

```bash
# 跑全部检查
bash scripts/verify.sh

# 只查 SEO meta
bash scripts/verify.sh --local | grep "SEO"
```

或浏览器装个 SEO 扩展：
- Chrome · "SEO Meta in 1 Click"
- Firefox · "SEO Doctor"

---

## 📚 参考

- [Google Search Central · Meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup)
- [Schema.org](https://schema.org/)

---

*由小G 2026-07-29 沉淀 · 部署第 1 天 · 让分享卡片漂亮 ✨*
