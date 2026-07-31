// ==========================================================
// AI 未来星域社区 · Galaxy v3 主线程
// 2026-08-01 · Path C · Web Worker + OffscreenCanvas
// 仿 Blueyard 风格 · 单屏 Hero · 漩涡星系 + 极简文字
// ==========================================================
//
// 架构：
// - 主线程：DOM 交互 + 鼠标事件 + resize
// - Worker（galaxy-worker.js）：粒子物理 + 渲染（OffscreenCanvas）
// - 兼容性：OffscreenCanvas 不支持 → 回退主线程直接画
// ==========================================================

let canvas = null;
let worker = null;
let mouse = { x: -10000, y: -10000, active: false, vx: 0, vy: 0 };
let mouseTarget = { x: -10000, y: -10000 };
let lastFrameTime = 0;
let canvasW = 0;
let canvasH = 0;
let rafId = null;
let workerReady = false;
let fallbackParticles = null;

export function initGalaxyScene(canvasEl) {
  if (!canvasEl) return null;
  canvas = canvasEl;

  // 初始尺寸
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasW = window.innerWidth * dpr;
    canvasH = window.innerHeight * dpr;
    canvas.width = canvasW;
    canvas.height = canvasH;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  // 鼠标 / 触摸交互
  canvas.style.pointerEvents = 'auto';
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseTarget.x = (e.clientX - rect.left) * (canvasW / rect.width);
    mouseTarget.y = (e.clientY - rect.top) * (canvasH / rect.height);
    mouse.active = true;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
  });
  // 触摸支持（移动端）
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      mouseTarget.x = (t.clientX - rect.left) * (canvasW / rect.width);
      mouseTarget.y = (t.clientY - rect.top) * (canvasH / rect.height);
      mouse.active = true;
    }
  }, { passive: true });
  canvas.addEventListener('touchend', () => {
    mouse.active = false;
  }, { passive: true });

  // 偏好 reduced-motion：直接静态渲染 1 帧
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // 直接画 1 帧静态
    return renderStaticFrame();
  }

  // 尝试 OffscreenCanvas + Worker
  if (typeof canvas.transferControlToOffscreen === 'function' && typeof Worker === 'function') {
    try {
      const offscreen = canvas.transferControlToOffscreen();
      worker = new Worker(new URL('./galaxy-worker.js', import.meta.url), { type: 'module' });

      worker.addEventListener('message', (e) => {
        // Worker ready（可以加握手）
      });

      worker.postMessage({
        type: 'init',
        canvas: offscreen,
        width: canvasW,
        height: canvasH,
      }, [offscreen]);

      workerReady = true;
      lastFrameTime = performance.now();
      rafId = requestAnimationFrame(mainLoop);
      return;
    } catch (e) {
      console.warn('Galaxy v3: OffscreenCanvas failed, fallback to main thread', e);
      worker = null;
      workerReady = false;
    }
  }

  // Fallback：主线程直接渲染（性能较弱但兼容）
  fallbackParticles = initFallbackParticles(canvasW, canvasH);
  lastFrameTime = performance.now();
  rafId = requestAnimationFrame(mainLoop);
}

function mainLoop(now) {
  const dt = Math.min(now - lastFrameTime, 50);
  lastFrameTime = now;

  // 鼠标插值（让移动更顺滑）
  mouse.x += (mouseTarget.x - mouse.x) * 0.15;
  mouse.y += (mouseTarget.y - mouse.y) * 0.15;

  if (worker && workerReady) {
    // OffscreenCanvas 路径：worker 自己画
    worker.postMessage({
      type: 'update',
      dt,
      mouse: mouse.active ? { x: mouse.x, y: mouse.y } : null,
      width: canvasW,
      height: canvasH,
    });
  } else {
    // Fallback：主线程画
    renderFallback(now);
  }

  rafId = requestAnimationFrame(mainLoop);
}

// === Fallback：主线程直接画（OffscreenCanvas 不支持时）===
function initFallbackParticles(w, h) {
  // 复用 worker 的粒子生成逻辑（简化版）
  // 实际生产中应抽到共享模块
  return null;  // 暂时显示静态
}

function renderFallback(now) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 简单占位：静态径向渐变
  ctx.fillStyle = '#000308';
  ctx.fillRect(0, 0, canvasW, canvasH);

  const cx = canvasW * 0.6;
  const cy = canvasH * 0.55;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(canvasW, canvasH) * 0.5);
  grad.addColorStop(0, 'rgba(165, 243, 252, 0.15)');
  grad.addColorStop(0.3, 'rgba(59, 130, 246, 0.1)');
  grad.addColorStop(0.7, 'rgba(30, 27, 75, 0.05)');
  grad.addColorStop(1, 'rgba(0, 3, 8, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasW, canvasH);
}

// === Reduced-motion 静态帧 ===
function renderStaticFrame() {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#000308';
  ctx.fillRect(0, 0, canvasW, canvasH);

  const cx = canvasW * 0.6;
  const cy = canvasH * 0.55;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(canvasW, canvasH) * 0.5);
  grad.addColorStop(0, 'rgba(165, 243, 252, 0.2)');
  grad.addColorStop(0.4, 'rgba(59, 130, 246, 0.12)');
  grad.addColorStop(1, 'rgba(0, 3, 8, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasW, canvasH);
}

// === 清理（页面切换时）===
export function destroyGalaxyScene() {
  if (rafId !== null) cancelAnimationFrame(rafId);
  if (worker) worker.terminate();
  window.removeEventListener('resize', () => {});
}