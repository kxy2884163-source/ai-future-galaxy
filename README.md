# AI 未来星域社区 (AI Future Galaxy)

> AI 爱好者的一站式成长宇宙
> 让"孤独学习"变成"一起玩着学"，把"信息爆炸"压成"打开就能用"。

---

## 🎯 产品定位

**目标用户**：AI 爱好者（学习者 / 创作者 / 工具党 / 学生）

**4 大痛点 → 4 大模块**：

| 痛点 | 解法（模块）|
|---|---|
| 一个人研究 AI 太枯燥 | 🌟 **社交页面** — 找同好、组圈子 |
| 无人交流 | 🌟 **社交页面** — 评论 / 私信 / 兴趣群 |
| 知识获取困难 | 📚 **AI 知识分享** — 结构化资源中心 |
| 信息源过于复杂 | 🛠️ **常用插件工具** + 🤖 **AI 在线使用** — 收敛碎片 + 开箱即用 |

---

## 🚀 快速开始

```bash
# 启动本地 dev server（端口 8000）
node server.js

# 浏览器访问
http://localhost:8000
```

或 Windows 一键启动：

```bat
start.bat
```

---

## 📂 项目结构

```
ai-future-galaxy/
├── README.md                ← 本文件 · 项目入口
├── PRD.md                   ← 产品需求文档 · 4 模块定义
├── AGENTS.md                ← Codex 冷启动包 · 接活必读
├── server.js                ← 本地 dev server（Node 内置 http · 端口 8000）
├── start.bat                ← Windows 一键启动
├── .gitignore               ← 标准前端忽略
├── docs/                    ← 架构决策（来自全局 docs/01-08 · 每项目复制）
│   ├── 00-知识库索引.md
│   ├── 01-前端技术栈.md
│   ├── 02-后端技术栈.md
│   ├── 03-数据库技术栈.md
│   ├── 04-部署与运维.md
│   ├── 05-维护工具链.md
│   ├── 06-原则与反模式.md
│   ├── 07-项目启动checklist.md
│   └── 08-项目架构选择.md
├── cosmic/                  ← 前端代码（Codex 写）
│   ├── index.html           ← 首页（4 模块入口）
│   ├── login.html           ← 登录
│   ├── register.html        ← 注册
│   ├── dashboard.html       ← 个人主页
│   ├── styles.css           ← 全局样式（glassmorphism · 6 段响应式）
│   ├── app.js               ← 应用逻辑（auth mock · 导航 · 事件总线）
│   └── cosmic-scene.js      ← Three.js 星空场景
├── memory/                  ← 项目级记忆（小G 沉淀 Codex 复盘）
└── .agents/skills/          ← 项目级 Codex skill 库（按阶段切 · 不囤）
```

---

## 🛠️ 技术栈速览

| 层 | 选型 | 详情 |
|---|---|---|
| **前端** | vanilla HTML/CSS/ES Modules · CDN · 零构建 | [docs/01](./docs/01-前端技术栈.md) |
| **3D** | Three.js（unpkg ESM） | [docs/08](./docs/08-项目架构选择.md) |
| **动效** | anime.js v4（unpkg ESM） | [docs/08](./docs/08-项目架构选择.md) |
| **设计** | UI/UX Pro Max CLI · glassmorphism | [docs/01](./docs/01-前端技术栈.md) |
| **后端** | Supabase BaaS | [docs/02](./docs/02-后端技术栈.md) |
| **数据库** | Postgres on Supabase（RLS · JSONB · full-text） | [docs/03](./docs/03-数据库技术栈.md) |
| **运维** | Vercel + Supabase + Sentry 三件套 · GitHub OAuth 统一 | [docs/04](./docs/04-部署与运维.md) |
| **工具链** | OpenClaw（军师）+ Codex（程序员）+ Git + GitHub CLI | [docs/05](./docs/05-维护工具链.md) |

**成本**：MVP 阶段 **$0**（三件套免费额度撑到 50k MAU）。

---

## 📅 4 阶段路线（23 天）

| 阶段 | 时长 | 重点 | 验收 |
|---|---|---|---|
| **Day 0 基线** | 0 | docs ✅ · 三件套注册 · 9 页 HTML · git init + push | `vercel.app` 可访问 |
| **阶段 1 前端** | Day 1-7 | 6+4 新页 · nav 完整 · 评论/收藏/点赞持久化 · anime.js 集成 | 19 页跑通，交互无死链 |
| **阶段 2 后端** | Day 8-15 | Supabase CLI · Auth · Postgres Schema · RLS · Storage · Vercel 关联 · Sentry | Auth 全通 · DB 有数据 · 自动部署 |
| **阶段 3 内容+发布** | Day 16-23 | 种子内容 · LCP < 2.5s · SEO · OG 图 · 域名 · HTTPS | 正式上线 |

详见 [docs/07](./docs/07-项目启动checklist.md)

---

## ⚖️ 核心原则（6 条铁律 · 不许违反）

1. **想用不想懂** — 帮设计 workflow，不让 debug 代码
2. **少让选，多帮拍板** — 能 execute 就不 discuss
3. **绝不自动通过 approval** — Codex 沙盒撞墙停下，等老大点头
4. **记忆优先** — 重要决策立刻落盘
5. **不囤 tool/skill** — 按阶段切，需要啥才装啥
6. **代码 → 程序员** — 军师不动手写代码，只派活

详见 [docs/06](./docs/06-原则与反模式.md)

---

## 📜 文档索引

- [PRD.md](./PRD.md) — 4 模块产品需求
- [AGENTS.md](./AGENTS.md) — Codex 冷启动包（11 项快照 + 写入规约）
- [docs/00-知识库索引.md](./docs/00-知识库索引.md) — 架构文档索引
- [docs/14-vercel-deploy.md](./docs/14-vercel-deploy.md) — Vercel 部署 Quickstart（10 min 公开 URL）

---

## 🚀 部署（10 分钟公开 URL）

完整 Quickstart 走 [docs/14-vercel-deploy.md](./docs/14-vercel-deploy.md) · 这里只列最关键 3 步：

1. **浏览器** → https://vercel.com → **GitHub OAuth 登录**（用 `kxy2884163-source`）
2. **Add New Project** → 选 `kxy2884163-source/ai-future-galaxy` → **Framework Preset = Other**
3. **Deploy** → 等 1-2 分钟 → 拿到 `https://ai-future-galaxy.vercel.app`

⚠️ **首次访问 Vercel 会触发 Cloudflare 验证**（手机号 + 验证码）· 一次性 · 验证完就再也不弹。

之后 `git push` 到 master → Vercel **自动部署**（< 30 秒）。

---

## 🧪 本地预览

```bash
node server.js
# 访问 http://localhost:8000
```

或 Windows 一键：`start.bat`

---

## 🎯 端到端测试（部署后 30 秒）

```bash
# 1. 注册账号
# 2. 收藏一个资源 → 真实进 Supabase resource_favorites
# 3. 点赞 → likes
# 4. 发评论 → comments + trigger 自动发通知
# 5. 关注 → follows
# 6. 刷新页面 → 数据仍在
```

---

*由小G 在 2026-07-29 沉淀 · 来自 AI 星域项目 v3.0 实战经验 + cosmic/ Phase IV 复盘*
*项目全称：AI 未来星域社区 · 注册名：AI 星域*

## 📊 当前里程碑（v2.0 · 2026-07-29 21:51）

- ✅ **21 commits** · 全部 push 到 GitHub
- ✅ **18 页 cosmic/** · a11y 100%
- ✅ **9 表 schema** 上线 Supabase（资源/评论/点赞/收藏/关注/通知/草稿/用户元数据）
- ✅ **18 页全部接 Supabase JS SDK** · 端到端可用
- ✅ **vercel.json + 部署 Quickstart** 已就绪
- ⏳ Vercel 部署（10 min · 浏览器操作）→ 公开 URL
- ⏳ Sentry 接入（10 min）
- ⏳ 真实资源内容录入（100+ 卡）