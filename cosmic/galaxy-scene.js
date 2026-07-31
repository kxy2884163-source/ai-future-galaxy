// ==========================================================
// AI 未来星域社区 · Galaxy v3 主线程渲染
// 2026-08-01 · 仿 Blueyard 风格 · 漩涡星系 + 抛射流 + 自转
// 路径：主线程直接渲染（20000 粒子 · 60fps）
// ==========================================================

const PARTICLE_COUNT = 20000;
const CORE_COUNT = 2000;
const SPIRAL_COUNT = 14000;
const HALO_COUNT = 2500;
const EJECTA_COUNT = 1500;

let canvas = null;
let ctx = null;
let width = 0;
let height = 0;
let dpr = 1;
let particles = [];
let rafId = null;
let mouse = { x: -10000, y: -10000, active: false };
let mouseTarget = { x: -10000, y: -10000 };
let startTime = 0;

export function initGalaxyScene(canvasEl) {
  if (!canvasEl) return null;
  canvas = canvasEl;

  ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('Galaxy v3: canvas 2d context failed');
    return null;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth * dpr;
    height = window.innerHeight * dpr;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  // 鼠标 / 触摸交互
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseTarget.x = (e.clientX - rect.left) * dpr;
    mouseTarget.y = (e.clientY - rect.top) * dpr;
    mouse.active = true;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
  });
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      mouseTarget.x = (t.clientX - rect.left) * dpr;
      mouseTarget.y = (t.clientY - rect.top) * dpr;
      mouse.active = true;
    }
  }, { passive: true });
  canvas.addEventListener('touchend', () => {
    mouse.active = false;
  }, { passive: true });

  // 初始化粒子
  initParticles();

  // reduced-motion 检查
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    renderFrame(0);
    return;
  }

  startTime = performance.now();
  rafId = requestAnimationFrame(loop);
}

function initParticles() {
  particles = [];
  const cx = width * 0.7;  // 漩涡偏右 70%
  const cy = height * 0.5; // 漩涡垂直居中

  // 1. 亮核
  for (let i = 0; i < CORE_COUNT; i++) {
    const r = Math.random() * 30;
    const theta = Math.random() * Math.PI * 2;
    particles.push({
      type: 'core',
      r, theta,
      baseR: r,
      cx, cy,
      color: pickCoreColor(),
      size: (1 + Math.random() * 1.5) * dpr,
      opacity: 0.7 + Math.random() * 0.3,
    });
  }

  // 2. 螺旋臂（对数螺旋 · cyan/blue 主导）
  for (let i = 0; i < SPIRAL_COUNT; i++) {
    const arm = Math.random() < 0.5 ? 0 : Math.PI;
    const t = Math.random();
    const r = 12 * Math.exp(0.13 * t * 7) + (Math.random() - 0.5) * 18 * dpr;
    const theta = arm + t * Math.PI * 3.2 + (Math.random() - 0.5) * 0.4;
    particles.push({
      type: 'spiral',
      r, theta,
      baseR: r,
      cx, cy,
      color: pickSpiralColor(r),
      size: (0.6 + Math.random() * 1.6) * dpr,
      opacity: 0.4 + Math.random() * 0.4,
    });
  }

  // 3. 外圈光晕
  for (let i = 0; i < HALO_COUNT; i++) {
    const r = 120 * dpr + Math.random() * 220 * dpr;
    const theta = Math.random() * Math.PI * 2;
    particles.push({
      type: 'halo',
      r, theta,
      baseR: r,
      cx, cy,
      color: pickHaloColor(),
      size: (0.5 + Math.random() * 1.4) * dpr,
      opacity: 0.2 + Math.random() * 0.4,
    });
  }

  // 4. 抛射流
  for (let i = 0; i < EJECTA_COUNT; i++) {
    const r = 30 * dpr + Math.random() * 40 * dpr;
    const theta = Math.random() * Math.PI * 2;
    particles.push({
      type: 'ejecta',
      r, theta,
      baseR: r,
      cx, cy,
      color: pickEjectaColor(),
      size: (0.8 + Math.random() * 1.4) * dpr,
      opacity: 0.5,
      life: Math.random(),
      vTheta: (Math.random() - 0.5) * 0.0008,
      vR: (0.15 + Math.random() * 0.3) * dpr,
    });
  }
}

function pickCoreColor() {
  const h = 185 + Math.random() * 10;
  return `hsla(${h}, 90%, ${75 + Math.random() * 15}%, 1)`;
}

function pickSpiralColor(r) {
  const t = Math.min(1, r / (200 * dpr));
  if (Math.random() < 0.5 - t * 0.3) {
    return `hsla(${185 + Math.random() * 15}, ${85 + Math.random() * 10}%, ${55 + Math.random() * 20}%, 1)`;
  } else {
    return `hsla(${215 + Math.random() * 25}, ${75 + Math.random() * 15}%, ${45 + Math.random() * 25}%, 1)`;
  }
}

function pickHaloColor() {
  const h = 220 + Math.random() * 30;
  return `hsla(${h}, ${50 + Math.random() * 20}%, ${25 + Math.random() * 20}%, 1)`;
}

function pickEjectaColor() {
  if (Math.random() < 0.08) {
    return `hsla(${325 + Math.random() * 20}, ${80 + Math.random() * 15}%, ${55 + Math.random() * 15}%, 1)`;
  }
  const h = Math.random() < 0.5 ? 185 : 215;
  return `hsla(${h + Math.random() * 15}, ${80 + Math.random() * 10}%, ${55 + Math.random() * 20}%, 1)`;
}

function loop(now) {
  // 鼠标插值（让移动更顺滑）
  mouse.x += (mouseTarget.x - mouse.x) * 0.12;
  mouse.y += (mouseTarget.y - mouse.y) * 0.12;

  const t = now - startTime;
  update(t);
  renderFrame(t);
  rafId = requestAnimationFrame(loop);
}

function update(t) {
  const cx = width * 0.7;
  const cy = height * 0.5;
  const rotSpeed = 0.00012;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.cx = cx;
    p.cy = cy;

    if (p.type === 'core') {
      p.theta += rotSpeed * 1.5;
    } else if (p.type === 'spiral') {
      p.theta += rotSpeed;
      p.r = p.baseR + Math.sin(t * 0.0008 + p.theta * 0.3) * 1.5 * dpr;
    } else if (p.type === 'halo') {
      p.theta += rotSpeed * 0.5;
    } else if (p.type === 'ejecta') {
      p.life -= 0.0008;
      if (p.life <= 0) {
        p.r = 30 * dpr + Math.random() * 40 * dpr;
        p.theta = Math.random() * Math.PI * 2;
        p.life = 1;
      } else {
        p.r += p.vR;
        p.theta += p.vTheta;
      }
    }

    // 鼠标磁场（轻推 · 不抢视觉）
    if (mouse.active) {
      const x = p.cx + p.r * Math.cos(p.theta);
      const y = p.cy + p.r * Math.sin(p.theta);
      const dx = x - mouse.x;
      const dy = y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80 * dpr && dist > 1) {
        const force = (80 * dpr - dist) / (80 * dpr);
        // 推离鼠标
        p.theta -= 0.008 * force * (dy > 0 ? 1 : -1);
      }
    }
  }
}

function renderFrame(t) {
  if (!ctx) return;

  // 1. 清屏 · 微蓝调背景
  ctx.fillStyle = '#000308';
  ctx.fillRect(0, 0, width, height);

  // 2. 加色混合（让粒子叠加发光）
  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const x = p.cx + p.r * Math.cos(p.theta);
    const y = p.cy + p.r * Math.sin(p.theta);

    let alpha = p.opacity;
    if (p.type === 'ejecta') alpha = p.life * 0.7;

    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  // 3. 微弱 vignette（让边缘自然衰减）
  const grad = ctx.createRadialGradient(
    width * 0.7, height * 0.5, Math.min(width, height) * 0.2,
    width * 0.7, height * 0.5, Math.min(width, height) * 0.8
  );
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

export function destroyGalaxyScene() {
  if (rafId !== null) cancelAnimationFrame(rafId);
  rafId = null;
  window.removeEventListener('resize', () => {});
}