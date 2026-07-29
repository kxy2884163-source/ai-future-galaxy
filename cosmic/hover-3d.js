// ==========================================================
// AI 未来星域社区 · 3D 鼠标跟随倾斜（页面增强层）
// 2026-07-29 22:42 · 阶段 3 动画增强
// ==========================================================
//
// 效果：鼠标悬停在卡片上时 · 卡片根据鼠标位置做 3D 倾斜
// 鼠标在卡片左上 → 卡片左上角抬起、右下角压下
// 鼠标离开 → 卡片复位
//
// 受影响：.module-card · .tool-card · .me-card · .resource-card-item · .fav-card · .search-item
//
// 性能：requestAnimationFrame 节流 · transform 不触发 layout
// 降级：触屏设备（无 hover）→ 不做任何事
// ==========================================================

const TILT_MAX = 8;       // 最大倾斜角度（度）
const SCALE_HOVER = 1.02;  // hover 时缩放
const LIFT_Y = -6;         // hover 时上移像素

function init3DHover() {
  // 触屏 / 无鼠标设备直接跳过
  if (window.matchMedia('(hover: none)').matches) return;
  // 减少运动偏好（a11y）
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll(
    '.module-card, .tool-card, .me-card, .resource-card-item, .fav-card, .search-item, .related-item'
  );

  cards.forEach(card => {
    let raf = null;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    // 缓动插值（让动画丝滑）
    function animate() {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      card.style.transform = `translateY(${LIFT_Y}px) scale(${SCALE_HOVER}) perspective(800px) rotateX(${currentY}deg) rotateY(${currentX}deg)`;
      if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
        raf = requestAnimationFrame(animate);
      } else {
        raf = null;
      }
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      // 鼠标位置 → -0.5 ~ 0.5 范围
      const x = ((e.clientX - rect.left) / rect.width) - 0.5;
      const y = ((e.clientY - rect.top) / rect.height) - 0.5;
      targetX = x * TILT_MAX * 2;   // 旋转 X（左右倾斜）
      targetY = y * -TILT_MAX * 2;  // 旋转 Y（上下倾斜，反向）
      if (!raf) raf = requestAnimationFrame(animate);
    });

    card.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(animate);
      // 完全归位后清理 inline style
      setTimeout(() => {
        if (Math.abs(targetX) < 0.01 && Math.abs(targetY) < 0.01) {
          card.style.transform = '';
        }
      }, 300);
    });
  });
}

document.addEventListener('DOMContentLoaded', init3DHover);

export { init3DHover };
