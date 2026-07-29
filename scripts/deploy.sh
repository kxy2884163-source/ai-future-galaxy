#!/usr/bin/env bash
# ==========================================================
# AI 未来星域社区 · Vercel 部署
# 前提：Vercel 账号 + GitHub repo 关联完成
# 用法：bash scripts/deploy.sh
# ==========================================================
#
# 首次部署：在 Vercel Dashboard 操作（推荐）
#   1. https://vercel.com → GitHub OAuth 登录
#   2. Add New Project → 选 ai-future-galaxy
#   3. Framework Preset = Other
#   4. Deploy
# 后续：git push 自动部署（webhook 触发）
#
# CLI 部署（可选 · 需要先 `npx vercel login`）：
#   bash scripts/deploy.sh
# ==========================================================

set -e

cd "$(dirname "$0")/.."

echo "🚀 AI 未来星域社区 · Vercel 部署"
echo ""

# 检查是否有 Vercel token
if [ ! -f "$HOME/.vercel/auth.json" ]; then
  echo "⚠️  未找到 Vercel 认证"
  echo ""
  echo "请先选择以下方式之一："
  echo ""
  echo "方式 A · Dashboard（推荐）："
  echo "  1. 浏览器打开 https://vercel.com"
  echo "  2. GitHub OAuth 登录"
  echo "  3. Add New Project → 选 ai-future-galaxy"
  echo "  4. Framework Preset = Other"
  echo "  5. Deploy"
  echo ""
  echo "方式 B · CLI（需要先 login）："
  echo "  npx vercel login   # 浏览器 device flow"
  echo "  bash scripts/deploy.sh"
  exit 0
fi

# 用 Vercel CLI 部署
echo "使用 Vercel CLI 部署..."
npx --yes vercel deploy --prod --yes

echo ""
echo "✅ 部署完成"
echo ""
echo "验证部署：bash scripts/verify.sh --remote https://ai-future-galaxy.vercel.app"
