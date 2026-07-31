// ==========================================================
// AI 未来星域社区 · Galaxy v3 Worker
// 2026-08-01 · Path C · Web Worker + OffscreenCanvas
// 仿 Blueyard 风格 · 漩涡星系 + 抛射流 + 自转
// ==========================================================
// 架构：
// - 主线程：转移 canvas control → OffscreenCanvas 给 worker
// - Worker：粒子物理 + 渲染（一次性算 + 一次性画）
// - 20000+ 粒子 · 不卡主线程
// ==========================================================

const PARTICLE_COUNT = 20000;
const CORE_PARTICLE_COUNT = 2000;   // 亮核
const SPIRAL_PARTICLE_COUNT = 14000; // 螺旋臂
const HALO_PARTICLE_COUNT = 2500;    // 外圈光晕
const EJECTA_PARTICLE_COUNT = 1500;  // 抛射流

let canvas = null;
let ctx = null;
let width = 0;
let height = 0;
let dpr = 1;
let time = 0;
let mouse = null;
let particles = [];

// === 初始化 ===
self.addEventListener('message', (e) => {
  const msg = e.data;
  if (msg.type === 'init') {
    canvas = msg.canvas;
    ctx = canvas.getContext('2d');
    width = msg.width;
    height = msg.height;
    dpr = width / window.innerWidth || 1;
    initParticles();
    startLoop();
  } else if (msg.type === 'update') {
    mouse = msg.mouse;
    if (msg.width !== width || msg.height !== height) {
      width = msg.width;
      height = msg.height;
      canvas.width = width;
      canvas.height = height;
    }
  }
});

function initParticles() {
  particles = [];
  const cx = width * 0.6;
  const cy = height * 0.55;

  // 1. 亮核（密集 cluster · 色偏 #A5F3FC）
  for (let i = 0; i < CORE_PARTICLE_COUNT; i++) {
    const r = Math.random() * 30;
    const theta = Math.random() * Math.PI * 2;
    particles.push({
      type: 'core',
      r, theta,
      baseR: r,
      cx, cy,
      color: pickCoreColor(),
      size: 1 + Math.random() * 1.5,
      opacity: 0.7 + Math.random() * 0.3,
    });
  }

  // 2. 螺旋臂（对数螺旋 · cyan 主导）
  for (let i = 0; i < SPIRAL_PARTICLE_COUNT; i++) {
    const arm = Math.random() < 0.5 ? 0 : Math.PI;  // 两条臂
    const t = Math.random();
    const r = 8 * Math.exp(0.16 * t * 6) + (Math.random() - 0.5) * 18;
    const theta = arm + t * Math.PI * 3 + (Math.random() - 0.5) * 0.4;
    particles.push({
      type: 'spiral',
      r, theta,
      baseR: r,
      cx, cy,
      color: pickSpiralColor(r),
      size: 0.6 + Math.random() * 1.6,
      opacity: 0.4 + Math.random() * 0.4,
    });
  }

  // 3. 外圈光晕（散点 · indigo / deep blue）
  for (let i = 0; i < HALO_PARTICLE_COUNT; i++) {
    const r = 120 + Math.random() * 220;
    const theta = Math.random() * Math.PI * 2;
    particles.push({
      type: 'halo',
      r, theta,
      baseR: r,
      cx, cy,
      color: pickHaloColor(),
      size: 0.5 + Math.random() * 1.4,
      opacity: 0.2 + Math.random() * 0.4,
    });
  }

  // 4. 抛射流（5% 粒子脱离轨道向上喷射）
  for (let i = 0; i < EJECTA_PARTICLE_COUNT; i++) {
    const r = 20 + Math.random() * 40;
    const theta = Math.random() * Math.PI * 2;
    particles.push({
      type: 'ejecta',
      r, theta,
      baseR: r,
      cx, cy,
      color: pickEjectaColor(),
      size: 0.8 + Math.random() * 1.4,
      opacity: 0.5,
      life: Math.random(),          // 0-1 寿命
      vTheta: (Math.random() - 0.5) * 0.0008,  // 自转扰动
      vR: 0.15 + Math.random() * 0.3,        // 径向外扩
      ejectionDelay: Math.random() * 5000,    // 异步发射延迟
    });
  }
}

// === 颜色选择器 ===
function pickCoreColor() {
  // 亮核：偏白蓝 #A5F3FC
  const h = 185 + Math.random() * 10;
  return `hsla(${h}, 90%, ${75 + Math.random() * 15}%, 1)`;
}

function pickSpiralColor(r) {
  // 螺旋：cyan/blue（内圈更亮 cyan，外圈 deep blue）
  const t = Math.min(1, r / 200);
  if (Math.random() < 0.5 - t * 0.3) {
    // cyan #00E5FF
    return `hsla(${185 + Math.random() * 15}, ${85 + Math.random() * 10}%, ${55 + Math.random() * 20}%, 1)`;
  } else {
    // blue #3B82F6
    return `hsla(${215 + Math.random() * 25}, ${75 + Math.random() * 15}%, ${45 + Math.random() * 25}%, 1)`;
  }
}

function pickHaloColor() {
  // 外圈：indigo #312E81 / deep blue #1E1B4B
  const h = 220 + Math.random() * 30;
  return `hsla(${h}, ${50 + Math.random() * 20}%, ${25 + Math.random() * 20}%, 1)`;
}

function pickEjectaColor() {
  // 抛射：8% magenta / 92% cyan-blue
  if (Math.random() < 0.08) {
    // magenta #EC4899
    return `hsla(${325 + Math.random() * 20}, ${80 + Math.random() * 15}%, ${55 + Math.random() * 15}%, 1)`;
  }
  const h = Math.random() < 0.5 ? 185 : 215;
  return `hsla(${h + Math.random() * 15}, ${80 + Math.random() * 10}%, ${55 + Math.random() * 20}%, 1)`;
}

// === 渲染循环（worker 内部 60fps）===
let rafId = null;
function startLoop() {
  if (rafId !== null) cancelAnimationFrame(rafId);
  const tick = (t) => {
    update(t);
    render();
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function update(t) {
  time = t;
  const rotSpeed = 0.00012;  // 极慢自转 · 暗示永恒演化
  const cx = width * 0.6;
  const cy = height * 0.55;
  // 更新中心点（如果 viewport 变了）
  for (let i = 0; i < particles.length; i++) {
    particles[i].cx = cx;
    particles[i].cy = cy;
  }

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    if (p.type === 'core') {
      // 亮核：缓慢抖动 + 自转
      p.theta += rotSpeed * 1.5;
      // 鼠标磁场
      if (mouse) applyMouseField(p);
    } else if (p.type === 'spiral') {
      // 螺旋臂：自转 + 径向呼吸
      p.theta += rotSpeed;
      p.r = p.baseR + Math.sin(time * 0.0008 + p.theta * 0.3) * 1.5;
      if (mouse) applyMouseField(p);
    } else if (p.type === 'halo') {
      // 光晕：极慢自转
      p.theta += rotSpeed * 0.5;
      if (mouse) applyMouseField(p);
    } else if (p.type === 'ejecta') {
      // 抛射：径向外扩 + 寿命管理
      p.life -= 0.0008;
      if (p.life <= 0) {
        // 重置：从核附近重生
        p.r = 25 + Math.random() * 30;
        p.theta = Math.random() * Math.PI * 2;
        p.life = 1;
        p.ejectionDelay = 0;
      } else {
        p.r += p.vR;
        p.theta += p.vTheta;
      }
    }
  }
}

function applyMouseField(p) {
  // 简化：先跳过（20000 粒子每帧都算 mouse field 太重）
  // 主线程会做 mouse 推进
}

function render() {
  if (!ctx) return;

  // 1. 清屏 · 微蓝调背景（避免 OLED 死黑）
  ctx.fillStyle = '#000308';
  ctx.fillRect(0, 0, width, height);

  // 2. 主循环绘制粒子
  ctx.globalCompositeOperation = 'lighter';  // 加色混合（让粒子叠加发光）

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const x = p.cx + p.r * Math.cos(p.theta);
    const y = p.cy + p.r * Math.sin(p.theta);

    let alpha = p.opacity;
    if (p.type === 'ejecta') alpha = p.life * 0.7;

    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, p.size * dpr, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// === 关闭 ===
self.addEventListener('beforeunload', () => {
  if (rafId !== null) cancelAnimationFrame(rafId);
});