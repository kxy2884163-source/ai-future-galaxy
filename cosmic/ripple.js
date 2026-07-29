// ==========================================================
// AI 未来星域社区 · 按钮 ripple 粒子（页面增强层）
// 2026-07-29 22:43 · 阶段 3 动画增强
// ==========================================================
//
// 效果：点击按钮时 · 从点击位置发出圆形涟漪
// 真实"我点这里"反馈 · 触屏设备不触发
//
// 性能：click 事件冒泡 · 子元素 .ripple 自动 remove
// 降级：触屏 / reduced-motion → 不触发
// ==========================================================

function initRipple() {
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    btn.appendChild(ripple);

    // 600ms 后清理（动画完成）
    setTimeout(() => ripple.remove(), 650);
  });
}

document.addEventListener('DOMContentLoaded', initRipple);

export { initRipple };
