// ==========================================================
// AI 未来星域社区 · 滚动入场动画（页面增强层）
// 2026-07-29 22:33 · 阶段 3 启动第一波
// ==========================================================
//
// 用法：HTML 元素加 `.anim-up` / `.anim-fade` / `.anim-left` / `.anim-right` class
// 元素进入视口时自动触发 · 一次 · 减少首次加载视觉跳出
//
// 性能：IntersectionObserver（浏览器原生 · 不占主线程）
// 降级：浏览器不支持 IO 时立刻显示（CSS 默认 visible）
// ==========================================================

function initScrollAnimations() {
  // 浏览器支持检查
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.anim-up, .anim-fade, .anim-left, .anim-right').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 找到所有匹配 class 的元素 · stagger delay
        const target = entry.target;
        const siblings = Array.from(target.parentElement?.children || [])
          .filter(child => child.classList?.contains('anim-up') || child.classList?.contains('anim-fade'))
          .filter(child => !child.classList.contains('is-visible'));
        const idx = siblings.indexOf(target);
        const delay = idx >= 0 ? idx * 80 : 0;

        setTimeout(() => {
          target.classList.add('is-visible');
        }, delay);

        observer.unobserve(target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  });

  // 观察所有 .anim-* 元素
  document.querySelectorAll('.anim-up, .anim-fade, .anim-left, .anim-right').forEach(el => {
    observer.observe(el);
  });
}

// 在页脚 / 资源卡 / 通知等加 .anim-up / anim-fade
// 立即可见（首屏不动画）
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();

  // 顶部 hero 区直接显示（首屏不动画）
  document.querySelectorAll('.hero, .auth-card, .page-head, .dash-header, .settings-head').forEach(el => {
    el.classList.add('is-visible');
  });
});

// 导出供其他页面使用
export { initScrollAnimations };
