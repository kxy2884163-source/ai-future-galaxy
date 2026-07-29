# 07 · 项目启动 Checklist

> **适用**：每次启动新的网页开发项目
> **最后更新**：2026-07-29

---

## 🎯 使用方式

1. 复制整个 `docs/` 到新项目根目录
2. 填写下方「项目特定信息」段落（产品定位 / 目标用户 / 验收标准）
3. 按顺序执行各阶段 checklist
4. 每完成一项打 ✅，有问题的打 ❌ 并写明原因

---

## 📋 项目特定信息（每项目必填）

| 字段 | 内容 |
|---|---|
| **项目名称** | |
| **产品定位** | |
| **目标用户** | |
| **上线目标** | |
| **阶段 1 验收标准** | |
| **阶段 2 验收标准** | |
| **上线日期** | |

---

## 🚀 4 阶段上手 Checklist

### 阶段 0 · 基线（Day 0）

```
□ 确认技术栈（docs/ 01-06）
□ 注册 Supabase 账号 + 创建项目
□ 注册 Vercel 账号（GitHub OAuth）
□ 注册 Sentry 账号（GitHub OAuth）
□ GitHub CLI 登录（`gh auth login`）
□ 确认 9 页基线跑通（index + login + register + dashboard + ...)
□ 工具链到位（OpenClaw + Codex CLI）
□ docs/ 复制到项目根
□ 项目目录结构建好
□ GitHub repo 创建并 push
```

### 阶段 1 · 前端闭环（Day 1-7）

```
□ 6 个新页面（me / favorites / follows / notifications / settings / search）
□ 4 个新页面（drafts / search / 错误页 / 引导页）
□ nav 完整化（登录/登出状态切换）
□ 评论/收藏/点赞持久化（localStorage）
□ 全局事件总线
□ 三态组件（loading / error / empty）
□ 键盘可达性 + focus visible
□ 响应式细化（Mobile ≥ 375px）
□ anime.js 动效集成
□ UI/UX Pro Max 验收（看设计大脑是否激活）
□ Phase 1 验收标准自测
```

### 阶段 2 · 后端接入（Day 8-15）

```
□ Supabase CLI 安装 + 登录
□ Auth 接入（GitHub OAuth + 邮箱登录）
□ Postgres Schema（users / resources / comments / likes / favorites / follows / notifications / drafts）
□ RLS 策略（全表）
□ Storage bucket 创建
□ Vercel + Supabase 关联
□ .env.local 配置（SUPABASE_URL / SUPABASE_ANON_KEY）
□ 部署上线（git push）
□ Sentry SDK 接入
□ 错误监控验证
```

### 阶段 3 · 内容 + 发布（Day 16-23）

```
□ 种子内容录入
□ 性能优化（LCP < 2.5s / FID < 100ms / CLS < 0.1）
□ SEO（元标签 / sitemap / robots.txt）
□ Open Graph 社交分享图
□ 自定义域名（如有）
□ HTTPS 验证
□ 正式上线公告
```

---

## 💰 成本估算（免费额度撑 MVP）

| 服务 | 免费额度 | 付费触发 |
|---|---|---|
| Supabase | 500MB DB / 1GB Storage / 50k MAU | DAU > 50k |
| Vercel | 100GB 流量 / 月 | 流量超限 |
| Sentry | 5k 错误 / 月 | 错误量超限 |
| GitHub | 私有 repo 无限 | 团队 > 5 人 |

**结论**：MVP 阶段几乎 $0，够撑到盈利点。

---

## 📊 里程碑节点

| 里程碑 | 目标时间 | 完成标准 |
|---|---|---|
| **9 页基线上线** | Day 0 | `vercel.app` 可访问 |
| **阶段 1 完成** | Day 7 | 全部 9+6+4=19 页跑通，交互无死链 |
| **阶段 2 完成** | Day 15 | Auth 全通，DB 有数据，Vercel 自动部署 |
| **正式发布** | Day 23 | SEO / 性能 / 域名全到位 |

---

## ⚠️ 每个阶段只做本阶段的事

| 阶段 | 做 | 不做 |
|---|---|---|
| **Day 0** | 基线跑通 + 工具到位 | 优化 / 细节 / 后端 |
| **Day 1-7** | 交互 + 状态 + 新页面 | 后端 / 优化 / SEO |
| **Day 8-15** | 后端 + 部署 | 新功能 / 运营内容 |
| **Day 16-23** | 内容 + 优化 + 发布 | 新功能 |

---

*由小G 在 2026-07-29 沉淀 · 来自 AI 星域项目 4 阶段推进法的实操结论*