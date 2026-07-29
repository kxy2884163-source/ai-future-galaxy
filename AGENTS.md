# AGENTS.md · Codex 冷启动包

> **接活第一件事**：读这个文件 + `docs/00-知识库索引.md` + `PRD.md`
> **写代码前**：读 `docs/06-原则与反模式.md`（6 条铁律 + 7 条反模式）

---

## §1 · 写入规约

| 维度 | 规约 |
|---|---|
| **编码** | UTF-8 无 BOM（PowerShell `apply_patch` 中文乱码，用 OpenClaw 内置工具） |
| **行尾** | LF（提交前确认 `.gitattributes`） |
| **缩进** | 2 空格（HTML/CSS/JS 一致） |
| **HTML 头部** | 每页 `<base href="/cosmic/">`（relative links 不崩） |
| **JS 类型** | `<script type="module">`（ES Modules） |
| **注释** | 关键函数 JSDoc · 区段用 `// §1 §2 §3` 分块 |
| **不动** | `prototype-login.html` · `server.js`（除非收到明确指令） |

---

## §2 · 为什么本项目单列

跟原 `projects/AI-社交平台/`（已清空）相比：
- ✅ 产品名升级：**AI 未来星域社区**（正式）+ **AI 星域**（注册名）
- ✅ 文档系统完整：docs/01-08 全部复制
- ✅ PRD 完整：4 模块 + 痛点 + 验收标准
- ❌ HTML 基线 0（Codex 第一阶段要先重建）

---

## §3 · 项目快照（11 项）

```
1.  名称        AI 未来星域社区（注册名 AI 星域）
2.  定位        AI 爱好者的一站式成长宇宙
3.  目标用户    AI 爱好者（学习者 / 创作者 / 工具党 / 学生）
4.  痛点        1. 孤独 2. 无交流 3. 知识获取难 4. 信息源复杂
5.  4 模块      🌟 社交 / 📚 知识 / 🛠️ 工具 / 🤖 AI 在线
6.  技术栈      vanilla HTML/CSS/ES Modules + Three.js + anime.js + Supabase
7.  部署        Vercel + Supabase + Sentry 三件套 · GitHub OAuth 统一
8.  阶段 0      docs ✅ · 三件套注册 · git init · 4 页 HTML
9.  阶段 1      6+4 新页 · 交互 · 持久化 · anime.js
10. 阶段 2      Supabase · Auth · Postgres · RLS · Sentry
11. 阶段 3      内容 · 性能 · SEO · 发布
```

---

## §4 · 结构约定

```
ai-future-galaxy/
├── README.md                ← 项目入口
├── PRD.md                   ← 产品需求
├── AGENTS.md                ← 本文件
├── server.js                ← 本地 dev server（端口 8000）
├── start.bat                ← Windows 一键启动
├── .gitignore
├── docs/                    ← 架构决策（来自全局 docs/01-08）
├── cosmic/                  ← 前端代码
│   ├── index.html           ← 首页（4 模块入口）
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── resource.html        ← 知识分享列表
│   ├── resource-detail.html
│   ├── tools.html           ← 插件工具（原 missing.html 改名）
│   ├── upload.html          ← AI 在线使用入口
│   ├── styles.css           ← glassmorphism + 6 段响应式
│   ├── app.js               ← auth mock + 导航 + 事件总线
│   └── cosmic-scene.js      ← Three.js 星空
├── memory/                  ← 项目级记忆
└── .agents/skills/          ← 项目级 Codex skill 库（按需）
```

---

## §5 · 渲染约定

### CSS 规范

```css
/* 1. CSS Variables（设计 token） */
:root {
  --bg: #0a0a1a;
  --glass: rgba(255,255,255,0.06);
  --blur: 16px;
  --accent: #7df9ff;
  /* ... */
}

/* 2. glassmorphism */
.glass {
  background: var(--glass);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
}

/* 3. 响应式 6 段断点 */
@media (max-width: 1280px) { /* 宽屏 */ }
@media (max-width: 980px)  { /* 详情页+aside */ }
@media (max-width: 880px)  { /* 平板横 */ }
@media (max-width: 768px)  { /* 平板竖 */ }
@media (max-width: 640px)  { /* 手机横 */ }
@media (max-width: 375px)  { /* 小屏手机 */ }

/* 4. 无障碍 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### HTML 规范

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <base href="/cosmic/">         <!-- 必须 -->
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>页面名 · AI 未来星域社区</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- 内容 -->
  <script type="module" src="app.js"></script>
</body>
</html>
```

### JS 规范

```js
// §1 入口
import { auth } from './app.js';

// §2 业务逻辑
// ...

// §3 导出
export { ... };
```

---

## §6 · 做

按阶段 docs/07：

| 阶段 | 时长 | 你（Codex）做 |
|---|---|---|
| **Day 0** | 0 | 建 cosmic/ 4 页 HTML（index/login/register/dashboard）+ styles.css + app.js + cosmic-scene.js |
| **Day 1-7** | 阶段 1 | 6+4 新页 + nav 完整化 + 持久化 + 事件总线 + 三态 + 键盘可达 + 响应式细化 + anime.js 集成 + UI/UX Pro Max 验收 |
| **Day 8-15** | 阶段 2 | Supabase CLI + Auth + Postgres Schema + RLS + Storage + Vercel 关联 + .env + Sentry SDK |
| **Day 16-23** | 阶段 3 | 种子内容 + 性能 + SEO + OG 图 + 域名 + HTTPS |

---

## §7 · 不做（7 条反模式 · docs/06）

- ❌ 自建后端（Express / Django / Rails）
- ❌ 自建数据库（MySQL / MongoDB on VM）
- ❌ MVP 引 React / Vue / Next.js
- ❌ 引 Tailwind（破坏零构建）
- ❌ 等装齐 skill 才开工
- ❌ 把 aspirational skill 写进 MEMORY
- ❌ 用 PowerShell pipeline 处理 binary 数据

---

## §8 · 引用

- **架构决策**：[docs/01-08](./docs/)
- **产品需求**：[PRD.md](./PRD.md)
- **冷启动包**：本文件
- **6 条铁律 + 7 条反模式**：[docs/06](./docs/06-原则与反模式.md)
- **启动 Checklist**：[docs/07](./docs/07-项目启动checklist.md)
- **架构按需选择**（Three.js / anime.js）：[docs/08](./docs/08-项目架构选择.md)

---

## §9 · 跟老大报 approval

每条沙盒 approval 都停下来，让老大看命令再 `/approve`。
**绝不自动通过**（铁律 3）。

---

*由小G 在 2026-07-29 沉淀 · Codex 冷启动包 v1*
*基于 cosmic/ Phase IV 实战经验 + docs/06 行为铁律*