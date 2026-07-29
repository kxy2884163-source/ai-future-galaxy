// ==========================================================
// AI 未来星域社区 · 星空流星（页面增强层）
// 2026-07-29 22:45 · 阶段 3 动画增强
// ==========================================================
//
// 效果：每几秒从随机位置生成流星 · 划过夜空
// 叠加在 Three.js 星空之上 · 跟用户交互感更强
//
// 性能：5 流星 · 纯 CSS 动画（GPU 加速）
// 降级：reduced-motion → 不生成
// ==========================================================

function initMeteors() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const container = document.createElement('div');
  container.className = 'meteor-container';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);

  // 5 条流星 · 不同位置 + 延迟 + 速度
  for (let i = 0; i < 5; i++) {
    const m = document.createElement('div');
    m.className = 'meteor';
    m.style.left = (10 + Math.random() * 80) + '%';
    m.style.animationDelay = (Math.random() * 6) + 's';
    m.style.animationDuration = (3 + Math.random() * 3) + 's';
    container.appendChild(m);
  }
}

document.addEventListener('DOMContentLoaded', initMeteors);

export { initMeteors };
