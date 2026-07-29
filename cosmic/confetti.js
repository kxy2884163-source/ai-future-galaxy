// ==========================================================
// AI 未来星域社区 · 登录成功 confetti 粒子（页面增强层）
// 2026-07-29 22:45 · 阶段 3 动画增强
// ==========================================================
//
// 效果：注册/登录成功时从顶部爆开五彩粒子
// 触发：检测 `cosmic-flash` localStorage 有 `success` 类型
//
// 性能：60 粒子 · 纯 CSS 动画 + setTimeout 清理
// 降级：reduced-motion → 跳过
// ==========================================================

function initConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // 检测登录/注册成功 flash
  const flash = (() => {
    try {
      const f = JSON.parse(localStorage.getItem('cosmic.flash') || 'null');
      return f;
    } catch { return null; }
  })();

  // 触发条件：URL 包含 ?welcome=1 或 flash.type === 'success'
  const url = new URL(location.href);
  const isWelcome = url.searchParams.get('welcome') === '1';

  if (!isWelcome && (!flash || flash.type !== 'success')) return;

  // 60 粒子
  const colors = ['#7df9ff', '#b388ff', '#6bd968', '#ffc857', '#ff6b9d'];
  const container = document.createElement('div');
  container.className = 'confetti-container';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);

  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    p.style.left = (Math.random() * 100) + '%';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDelay = (Math.random() * 0.3) + 's';
    container.appendChild(p);
  }

  // 清理
  setTimeout(() => container.remove(), 3500);

  // 清除 flash（避免重复触发）
  if (flash) localStorage.removeItem('cosmic.flash');
}

document.addEventListener('DOMContentLoaded', initConfetti);

export { initConfetti };
