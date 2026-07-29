// ==========================================================
// AI 未来星域社区 · 数字滚动动画（页面增强层）
// 2026-07-29 23:03 · 阶段 4 升级
// ==========================================================
//
// 效果：滚动到数字时 · 数字从 0 滚到目标值
// 使用 IntersectionObserver 触发 · 一次性
//
// 性能：requestAnimationFrame + 缓动函数
// 降级：reduced-motion → 直接显示目标值
// ==========================================================

function initCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-count]').forEach((el) => {
      el.textContent = el.dataset.count;
    });
    return;
  }

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);  // ease-out-cubic
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.done) {
        entry.target.dataset.done = '1';
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-count]').forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', initCounters);

export { initCounters };
