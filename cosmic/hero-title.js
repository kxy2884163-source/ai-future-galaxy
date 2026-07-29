// ==========================================================
// AI 未来星域社区 · Hero 标题 stagger 文字动画（页面增强层）
// 2026-07-29 22:45 · 阶段 3 动画增强
// ==========================================================
//
// 效果：Hero 标题 ✦ 字符 一个个出现 · 微微弹出 + 蓝色阴影
// 影响：.hero-title h1 · 5 个核心页生效
//
// 工具：anime.js v4（CDN ESM）
// 降级：CDN 失败 → 标题直接显示
// ==========================================================

let initialized = false;

async function initHeroTitle() {
  if (initialized) return;
  initialized = true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let anime;
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/animejs@4.0.0/dist/animejs.esm.min.js');
    anime = mod.animate;
  } catch (e) {
    console.warn('anime.js not loaded:', e);
    return;
  }

  const titles = document.querySelectorAll('.hero-title');
  titles.forEach((title) => {
    // 把 h1 内容按字符拆开（保留 ✦ 在 span）
    const text = title.textContent.trim();
    title.innerHTML = '';

    // 注入字符 span（保留 ✦ 单独更大）
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(20px)';
      if (ch === '✦') {
        span.style.color = 'var(--accent)';
        span.style.marginRight = '0.3em';
        span.style.fontSize = '1.2em';
      }
      title.appendChild(span);
    });

    anime(title.querySelectorAll('.char'), {
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.85, 1],
      duration: 800,
      delay: anime.stagger(60, { start: 200 }),
      ease: 'outCubic',
    });
  });
}

document.addEventListener('DOMContentLoaded', initHeroTitle);

export { initHeroTitle };
