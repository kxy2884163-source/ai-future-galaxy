// ==========================================================
// AI 未来星域社区 · 页面切换 View Transitions API（页面增强层）
// 2026-07-29 22:45 · 阶段 3 动画增强
// ==========================================================
//
// 效果：页面跳转时触发 View Transitions（Chrome 111+）
// 页面淡出 + 淡入 + 微微 scale 缩放
//
// 性能：浏览器原生 · 60fps
// 降级：旧浏览器直接跳转（无动画）
// ==========================================================

function initViewTransitions() {
  if (!document.startViewTransition) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // 拦截所有站内链接
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    // 跳过外部链接 / 非 HTML / 锚点 / 事件修饰
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
    if (link.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (href.includes('.js') || href.includes('.css')) return;

    e.preventDefault();

    // 触发 view transition
    document.startViewTransition(() => {
      // 跳转页面（用 location 更可靠）
      window.location.href = href;
    });
  });
}

document.addEventListener('DOMContentLoaded', initViewTransitions);

export { initViewTransitions };
