#!/usr/bin/env bash
# ==========================================================
# AI 未来星域社区 · 验证脚本
# 检查：18 页 HTTP + 9 表 schema + SEO meta + JS 语法
# 用途：CI / 部署前回归 / 任何改动后 sanity check
# ==========================================================
#
# 用法：
#   bash scripts/verify.sh                              # 跑全部检查
#   bash scripts/verify.sh --local                     # 只检查本地 server
#   bash scripts/verify.sh --remote https://ai-future-galaxy.vercel.app
#   bash scripts/verify.sh --supabase                  # 只检查 Supabase
#
# 环境变量（可选）：
#   SUPABASE_URL          默认 https://mygrxpwcdbuappvploja.supabase.co
#   SUPABASE_PUB_KEY      默认 sb_publishable_FovABsTd--pVx5onBPwnRw_rd3M8yys
# ==========================================================

set -e

# § 0 参数解析
SCOPE="all"
TARGET_LOCAL="http://localhost:8000"
TARGET_REMOTE="https://ai-future-galaxy.vercel.app"
SUPABASE_URL="${SUPABASE_URL:-https://mygrxpwcdbuappvploja.supabase.co}"
SUPABASE_KEY="${SUPABASE_PUB_KEY:-sb_publishable_FovABsTd--pVx5onBPwnRw_rd3M8yys}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --local) SCOPE="local" ;;
    --remote) SCOPE="remote"; TARGET_REMOTE="$2"; shift ;;
    --supabase) SCOPE="supabase" ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
  shift
done

# § 1 颜色
if [[ -t 1 ]]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; NC=''
fi

COUNT=0
FAILED=0

check() {
  local desc="$1"
  local result="$2"
  COUNT=$((COUNT + 1))
  if [[ "$result" == "0" ]]; then
    echo -e "  ${GREEN}✓${NC} $desc"
  else
    echo -e "  ${RED}✗${NC} $desc"
    FAILED=$((FAILED + 1))
  fi
}

banner() {
  echo ""
  echo -e "${BLUE}==> $1${NC}"
}

# § 2 本地 18 页 HTTP 检查
check_local() {
  banner "本地 18 页 HTTP 检查"
  if ! curl -s -o /dev/null --max-time 3 "$TARGET_LOCAL/cosmic/index.html"; then
    echo -e "  ${RED}✗${NC} 本地 server 没启动（$TARGET_LOCAL）"
    echo -e "  ${YELLOW}  提示：cd .. && node server.js${NC}"
    exit 1
  fi
  for page in 404 anime-demo dashboard drafts favorites follows index login me notifications onboarding register resource resource-detail search settings tools upload; do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$TARGET_LOCAL/cosmic/$page.html")
    check "$page.html → HTTP $code" "$([ "$code" == "200" ] && echo 0 || echo 1)"
  done
}

# § 3 远端 18 页 HTTP 检查
check_remote() {
  banner "远端 18 页 HTTP 检查（$TARGET_REMOTE）"
  for page in 404 anime-demo dashboard drafts favorites follows index login me notifications onboarding register resource resource-detail search settings tools upload; do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$TARGET_REMOTE/cosmic/$page.html")
    check "$page.html → HTTP $code" "$([ "$code" == "200" ] && echo 0 || echo 1)"
  done
}

# § 4 Supabase 9 表 schema 检查
check_supabase() {
  banner "Supabase 9 表 schema 检查"
  local auth="Authorization: Bearer ${SUPABASE_KEY}"
  local apikey="apikey: ${SUPABASE_KEY}"
  for table in resources comments likes resource_favorites tool_favorites follows notifications drafts user_profiles; do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
      -H "$auth" -H "$apikey" \
      "$SUPABASE_URL/rest/v1/$table?limit=1")
    check "$table → HTTP $code" "$([ "$code" == "200" ] && echo 0 || echo 1)"
  done
}

# § 5 SEO meta 抽查
check_seo() {
  banner "SEO meta 抽查（5 个核心页）"
  local target="${1:-$TARGET_LOCAL}"
  for page in index login register dashboard resource; do
    content=$(curl -s --max-time 5 "$target/cosmic/$page.html")
    has_og=$(echo "$content" | grep -c 'property="og:title"' || true)
    has_tw=$(echo "$content" | grep -c 'twitter:card' || true)
    has_canonical=$(echo "$content" | grep -c 'rel="canonical"' || true)
    check "$page.html og=$has_og twitter=$has_tw canonical=$has_canonical" \
      "$([ "$has_og" -gt 0 ] && [ "$has_tw" -gt 0 ] && [ "$has_canonical" -gt 0 ] && echo 0 || echo 1)"
  done
}

# § 6 JS 语法
check_js() {
  banner "JS 语法（11 个 ES Module）"
  for js in app.js cosmic-scene.js; do
    if command -v node >/dev/null 2>&1; then
      if node --check "cosmic/$js" 2>/dev/null; then
        check "$js 语法 OK" "0"
      else
        check "$js 语法错误" "1"
      fi
    fi
  done
}

# § 7 a11y 抽查（每页基本元素）
check_a11y() {
  banner "a11y 基础（18 页 lang + skip-link + main id）"
  local target="${1:-$TARGET_LOCAL}"
  for page in 404 anime-demo dashboard drafts favorites follows index login me notifications onboarding register resource resource-detail search settings tools upload; do
    content=$(curl -s --max-time 5 "$target/cosmic/$page.html")
    has_lang=$(echo "$content" | grep -c 'lang="zh-CN"' || true)
    has_skip=$(echo "$content" | grep -c 'class="skip-link"' || true)
    has_main=$(echo "$content" | grep -c 'id="main-content"' || true)
    check "$page.html lang=$has_lang skip=$has_skip main=$has_main" \
      "$([ "$has_lang" -gt 0 ] && [ "$has_skip" -gt 0 ] && [ "$has_main" -gt 0 ] && echo 0 || echo 1)"
  done
}

# § 8 汇总
summary() {
  echo ""
  echo -e "${BLUE}=============================${NC}"
  echo -e "${BLUE} 检查汇总${NC}"
  echo -e "${BLUE}=============================${NC}"
  echo -e "  检查项: $COUNT"
  if [[ $FAILED -eq 0 ]]; then
    echo -e "  ${GREEN}✓ 全部通过${NC}"
    exit 0
  else
    echo -e "  ${RED}✗ $FAILED 项失败${NC}"
    exit 1
  fi
}

# § 9 跑检查
case "$SCOPE" in
  all)
    check_local
    check_supabase
    check_seo "$TARGET_LOCAL"
    check_js
    check_a11y "$TARGET_LOCAL"
    ;;
  local)
    check_local
    check_seo "$TARGET_LOCAL"
    check_js
    check_a11y "$TARGET_LOCAL"
    ;;
  remote)
    check_remote
    check_seo "$TARGET_REMOTE"
    check_a11y "$TARGET_REMOTE"
    ;;
  supabase)
    check_supabase
    ;;
esac

summary
