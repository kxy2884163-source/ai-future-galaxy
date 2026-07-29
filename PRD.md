# PRD · AI 未来星域社区

> **产品全称**：AI 未来星域社区
> **注册名**：AI 星域
> **产品定位**：AI 爱好者的一站式成长宇宙
> **拍板日期**：2026-07-29

---

## 🎯 一句话定位

**让"孤独学习"变成"一起玩着学"，把"信息爆炸"压成"打开就能用"。**

---

## 👤 目标用户

**AI 爱好者**（学习者 / 创作者 / 工具党 / 学生）

**用户特征**：
- 想学 AI，但身边没人一起研究
- 知道 AI 工具很多，但不知道哪个好、怎么入门
- 信息源复杂（公众号 / B 站 / Reddit / Twitter / 论文），筛选成本高
- 想要一个"打开就能用"的入口，免安装免部署
- 期待交流 + 共学氛围

---

## 💔 4 大痛点

| # | 痛点 | 描述 |
|---|---|---|
| 1 | **一个人研究 AI 太枯燥** | 一个人看教程、写 prompt、调参数，没有反馈、没有共鸣，容易放弃 |
| 2 | **无人交流** | 找到问题没人讨论，发了想法没人回应，进步慢 |
| 3 | **知识获取困难** | AI 知识更新太快，教程过时，体系化资源稀缺 |
| 4 | **信息源过于复杂** | 公众号 / B 站 / Reddit / Twitter / 论文 / Discord... 多到根本看不过来 |

---

## 🌟 4 大核心功能模块

### 模块 1 · 🌟 社交页面（解痛点 1 + 2）

**核心功能**：
- 用户主页（个人介绍 / 关注 / 粉丝 / 作品）
- 内容发布（短文 / 想法 / 提问 / 资源分享）
- 评论 / 点赞 / 收藏 / 转发
- 私信 / 兴趣群组
- 关注流 / 推荐流

**MVP 功能（阶段 1）**：
- 注册 / 登录（GitHub OAuth + 邮箱）
- 个人主页（dashboard.html）
- 内容发布 + 评论（localStorage mock → 阶段 2 接 Supabase）
- 关注 / 粉丝列表

### 模块 2 · 📚 AI 知识分享（解痛点 3）

**核心功能**：
- 结构化资源中心（教程 / 案例 / 模型 / 工具 / 数据集）
- 分类 + 标签 + 搜索
- 评分 + 评论 + 收藏
- 贡献者榜单

**MVP 功能（阶段 1）**：
- 资源列表（resource.html · 12 类卡片）
- 资源详情页（resource-detail.html）
- 分类筛选 + 搜索框
- 评分 + 收藏

### 模块 3 · 🛠️ 常用插件工具页面（解痛点 4）

**核心功能**：
- 收敛 AI 工具到单一入口
- 一键直跳 / 嵌入式调用
- 工具评分 + 评测
- 收藏常用工具

**MVP 功能（阶段 1）**：
- 工具列表（tools.html · 至少 3 类占位）
- 分类筛选
- 一键直跳外部工具
- 收藏

### 模块 4 · 🤖 AI 在线使用（解痛点 4）

**核心功能**：
- 打开就能用，免安装免部署
- 配额管理 + 多模型 fallback
- 常见任务模板（写文案 / 翻译 / 总结 / 代码 / 图像）

**MVP 功能（阶段 1）**：
- 在线工具入口（upload.html · 后续扩展为 ai-tools.html）
- 任务模板选择
- 结果展示 + 历史记录

---

## 📐 信息架构（IA）

```
AI 未来星域社区
│
├── 首页（index.html）             ← 4 模块入口卡片 · Hero · 热门内容
├── 登录（login.html）              ← GitHub OAuth + 邮箱
├── 注册（register.html）           ← 邮箱 + 密码
├── 个人主页（dashboard.html）      ← 用户信息 · 作品 · 关注
│
├── 🌟 社交（4 大模块映射）
│   ├── 内容发布
│   ├── 评论 / 点赞 / 收藏
│   ├── 关注 / 粉丝
│   └── 私信 / 群组
│
├── 📚 知识分享
│   ├── 资源列表（resource.html）
│   ├── 资源详情（resource-detail.html）
│   ├── 分类 / 搜索 / 标签
│   └── 评分 / 评论
│
├── 🛠️ 插件工具
│   ├── 工具列表（tools.html · 原 missing.html 改名）
│   ├── 工具详情
│   ├── 分类 / 评分
│   └── 一键直跳
│
└── 🤖 AI 在线使用
    ├── 任务选择（upload.html）
    ├── 模型选择（GPT-4 / Claude / Gemini）
    ├── 输入 + 提交
    └── 结果 + 历史
```

---

## 🎨 设计原则

- **星空主题**（Phase IV 拍板）— 跟"星域"产品名对齐
- **glassmorphism**（毛玻璃）— Phase IV 已在 styles.css 实现 14 处
- **响应式 6 段断点**（1280/980/880/768/640/375）— Phase IV 实测
- **prefers-reduced-motion** 兼容 — 无障碍要求
- **键盘可达 + focus visible** — 无障碍要求

---

## 📊 验收标准

### 阶段 0 · Day 0 · 基线

- [x] docs/01-08 完整复制到项目根
- [x] 项目目录结构建好（cosmic / memory / .agents / docs）
- [ ] Supabase + Vercel + Sentry 三件套账号注册
- [ ] git init + 第一次 commit + push 到 GitHub
- [ ] server.js 跑通（localhost:8000）
- [ ] 4 页 HTML 基线（index/login/register/dashboard）

### 阶段 1 · Day 1-7 · 前端闭环

- [ ] 6 个新页面（me / favorites / follows / notifications / settings / search）
- [ ] 4 个新页面（drafts / search / 错误页 / 引导页）
- [ ] nav 完整化（登录/登出状态切换）
- [ ] 评论/收藏/点赞持久化（localStorage）
- [ ] 全局事件总线
- [ ] 三态组件（loading / error / empty）
- [ ] 键盘可达性 + focus visible
- [ ] 响应式细化（Mobile ≥ 375px）
- [ ] anime.js 动效集成
- [ ] UI/UX Pro Max 验收

### 阶段 2 · Day 8-15 · 后端接入

- [ ] Supabase CLI 安装 + 登录
- [ ] Auth 接入（GitHub OAuth + 邮箱登录）
- [ ] Postgres Schema（users / resources / comments / likes / favorites / follows / notifications / drafts）
- [ ] RLS 策略（全表）
- [ ] Storage bucket 创建
- [ ] Vercel + Supabase 关联
- [ ] .env.local 配置（SUPABASE_URL / SUPABASE_ANON_KEY）
- [ ] 部署上线（git push）
- [ ] Sentry SDK 接入
- [ ] 错误监控验证

### 阶段 3 · Day 16-23 · 内容 + 发布

- [ ] 种子内容录入
- [ ] 性能优化（LCP < 2.5s / FID < 100ms / CLS < 0.1）
- [ ] SEO（元标签 / sitemap / robots.txt）
- [ ] Open Graph 社交分享图
- [ ] 自定义域名（如有）
- [ ] HTTPS 验证
- [ ] 正式上线公告

---

## 🚨 风险与对策

| 风险 | 等级 | 对策 |
|---|---|---|
| 冷启动空城（社交模块无用户）| 🔴 高 | Day 5-7 走"内容驱动"破冰，先做种子内容 + 拉 KOL |
| AI 工具 API 配额成本 | 🟡 中 | 多模型 fallback + 用户配额管理 + 缓存 |
| RLS 漏洞 | 🟡 中 | 测试顺序：先本地 supabase start，再上云 |
| 信息源聚合版权 | 🟢 低 | 走"摘要 + 链接"，不全文复制 |
| 性能（CDN 命中 / LCP）| 🟡 中 | 阶段 3 优化；图片懒加载；CSS critical path |

---

## 📈 关键指标（北极星）

- **DAU（日活）** — MVP 阶段 100 → 1000 → 10000
- **人均停留时长** — 目标 > 5 min
- **内容贡献率** — 日发布数 / DAU（目标 > 5%）
- **AI 在线使用率** — 周调用次数 / WAU（目标 > 30%）

---

## 🔄 版本演进

- **v1.0 MVP**（Day 23）— 4 模块跑通，基础内容
- **v1.5 增长**（Day 30-60）— KOL 邀请 / 推荐算法 / 移动端
- **v2.0 变现**（Day 60-90）— 付费工具 / API 配额 / 企业版

---

*由小G 在 2026-07-29 沉淀 · 来自 AI 星域项目 v3.0 实战经验 + 老大 2026-07-29 14:33 拍板*