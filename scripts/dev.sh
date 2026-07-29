#!/usr/bin/env bash
# ==========================================================
# AI 未来星域社区 · 本地开发服务器
# Windows 不需要 .sh（用 start.bat）
# Mac / Linux / WSL 用这个
# ==========================================================

set -e

PORT="${PORT:-8000}"
cd "$(dirname "$0")/.."

# 检查 Node
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js 未安装"
  echo "请访问 https://nodejs.org/ 安装"
  exit 1
fi

# 检查端口
if lsof -i:$PORT >/dev/null 2>&1; then
  echo "⚠️  端口 $PORT 已被占用"
  echo "如需终止旧进程：lsof -ti:$PORT | xargs kill -9"
fi

echo "🚀 启动 AI 未来星域社区 · 本地 dev server"
echo "   端口: $PORT"
echo "   访问: http://localhost:$PORT"
echo ""
echo "   Ctrl+C 停止"
echo ""

node server.js
