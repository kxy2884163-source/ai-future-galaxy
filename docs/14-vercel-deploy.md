# 14 · Vercel 部署 Quickstart

> **预计时间**：10 分钟 · 公开 URL 立刻生效
> **前置**：项目已 push 到 GitHub（https://github.com/kxy2884163-source/ai-future-galaxy）
> **部署分支**：master

---

## 🎯 部署目标

部署到 Vercel 后：
- ✅ 公开 URL：`https://ai-future-galaxy.vercel.app`（自动生成）
- ✅ 自动 HTTPS（Let's Encrypt）
- ✅ 全球 CDN（边缘节点）
- ✅ GitHub push 自动部署（main 分支更新就部署）
- ✅ 自动关联 Supabase 环境变量（如果设）

URL 路径重写（已写好 `vercel.json`）：
- `/` → `/cosmic/index.html`
- `/login.html` → `/cosmic/login.html`
- `/styles.css` → `/cosmic/styles.css`

---

## 🚀 步骤 1 · 浏览器登录 Vercel（2 min）

1. **打开** → https://vercel.com
2. **点击右上角 "Sign Up"**
3. **选择 "Continue with GitHub"**（用 `kxy2884163-source` 账号）
4. **授权 Vercel 访问 GitHub**（默认 · 选 "All repositories" 或只选 `ai-future-galaxy`）

---

## 🚀 步骤 2 · 导入项目（3 min）

1. Vercel dashboard → **"Add New..."** → **"Project"**
2. 在 **"Import Git Repository"** 列表找到 **`kxy2884163-source/ai-future-galaxy`**
3. 点击 **"Import"** 按钮

**配置项目**（左侧）：
- **Project Name**：`ai-future-galaxy`（默认）
- **Framework Preset**：**"Other"**（不要选 Vite/Next.js · 我们是纯静态）
- **Root Directory**：`.`（默认项目根）
- **Build Command**：留空（不构建）
- **Output Directory**：`.`（项目根）
- **Install Command**：留空

4. 点击 **"Deploy"**（第一次部署 · 等 1-2 分钟）

---

## 🚀 步骤 3 · 等部署完成 + 拿 URL

Vercel 会：
1. 拉 GitHub repo
2. 读 `vercel.json` 路由
3. 部署静态文件（**不需要 build**）
4. 颁发 HTTPS 证书
5. DNS 分配 `*.vercel.app` 子域名

**完成后** Vercel 会显示：
```
✅ ai-future-galaxy.vercel.app
🎉 Deployment complete!
```

---

## 🔐 步骤 4 · 配 Supabase 环境变量（2 min · 可选）

让 Vercel 部署的页面能直接连 Supabase 服务端（**目前不需要** · 我们用 publishable key 暴露在前端 JS · 任何人都能看 · 所以放 .env 不必要 · 阶段 3 接入后台时再配）：

**步骤**：
1. Vercel 项目 → **Settings** → **Environment Variables**
2. 添加：
   - `SUPABASE_URL` = `https://mygrxpwcdbuappvploja.supabase.co`
   - `SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_FovABsTd--pVx5onBPwnRw_rd3M8yys`
3. 所有环境（Production / Preview / Development）都勾上
4. 点 **"Save"**

**注**：现在 `app.js` 直接 import 了硬编码的 `https://cdn.jsdelivr.net/...` supabase-js + publishable key 在 JS 顶部。**未来接入 Edge Functions 时**再走环境变量。

---

## 🔗 步骤 5 · 验证（2 min）

部署完成后：
1. **打开** `https://ai-future-galaxy.vercel.app`
2. 应该看到 `AI 未来星域社区` 首页 · 4 模块卡片
3. 点 **登录** → 注册 → 收藏 → 评论 → 点赞 → 跳 dashboard
4. ✓ 全部走 Supabase 真实数据
5. 检查 **Vercel → Deployments** 页面 → 看 build log + 部署时间

---

## 🔄 后续自动部署

之后每次 git push 到 master：
```bash
git push origin master
```

Vercel 自动：
- 监听 GitHub webhook
- 拉最新代码
- 部署（10-30 秒）
- 通知老大（邮件 / Vercel dashboard）

**完全不用手动操作**。

---

## 🎯 部署架构图

```
┌─────────────────────────────────────────────┐
│ 你的代码（git push 到 master）                │
│  ↓                                           │
│ Vercel 监听 GitHub                            │
│  ↓                                           │
│ 拉最新代码                                  │
│  ↓                                           │
│ 读 vercel.json 配置                          │
│  ↓                                           │
│ 部署 cosmic/* 静态文件 + URL 重写         │
│  ↓                                           │
│ 颁发 HTTPS 证书                              │
│  ↓                                           │
│ DNS 分配 *.vercel.app 子域名                 │
│  ↓                                           │
│ CDN 全球边缘节点（200+ 城市）                │
│  ↓                                           │
│ 你的浏览器访问 https://ai-future-galaxy.vercel.app │
└─────────────────────────────────────────────┘
```

---

## 🛠️ 故障排查

### 404 页面找不到
- 检查 `cosmic/` 目录是否完整
- 检查 Vercel → Project → Settings → Build & Development Settings → Output Directory 是否是 `.`

### supabase-js CDN 加载失败
- 检查 `app.js` 顶部 import 是否是 `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm`
- 浏览器 console 看是否有 404

### Supabase RLS 报错
- 在 Supabase Studio → Table Editor 看用户表
- 检查 browser console 看具体 401 错误

---

## 📌 备注

- **不要部署 `server.js`**（Vercel 自动用 Edge Functions / 静态服务）
- **保留 `docs/` 和 `supabase/` 在仓库里**（不部署，但版本控制需要）
- **Vercel 配置已包含 security headers**（X-Frame-Options 等）+ 静态资源 1 年缓存
- **部署时间**：首次 1-2 分钟 · 后续 < 30 秒

---

## 🎯 部署后能做的事

1. **公开 URL 分享**：发给任何人（朋友 / 投资 / 客户）
2. **关联自定义域名**：`ai-future-galaxy.com`（Vercel → Domains）
3. **部署预览**：每次 PR 自动生成预览 URL（`ai-future-galaxy-git-feature.vercel.app`）
4. **环境监控**：Vercel → Analytics 看访问量 / 性能
5. **Web Vitals**：自动监控 LCP / FID / CLS

---

*3 步浏览器操作 · 10 分钟公开 URL · 零额外成本 · 全球 CDN · 自动 HTTPS · git push 自动部署*

*老大你就 30 秒部署 · 然后发我公开 URL · 我们一起看效果 ✨*
