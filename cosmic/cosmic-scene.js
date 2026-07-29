// ==========================================================
// AI 未来星域社区 · Three.js 星空场景
// 范式: ES Module + unpkg CDN import
// §1 initCosmicScene(canvas) — 主入口（带 guard）
// §2 星空几何（远 500 / 中 200 / 近 80 颗星）
// §3 行星 + 大气辉光
// §4 动画循环 + 响应式 resize
// §5 Auto-init (DOMContentLoaded 钩子)
// ==========================================================

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// §1 主入口 — 用 if (canvas) 守卫，确保 canvas 缺失时安全 no-op
export function initCosmicScene(canvas) {
  if (!canvas) return null;

  try {
    // §1.1 Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // §1.2 Scene + Camera
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
    camera.position.set(0, 0, 50);
    camera.lookAt(0, 0, 0);

    // §2 星空 3 层
    const starsGroup = new THREE.Group();

    // 远景 — 500 颗白星（背景）
    {
      const geom = new THREE.BufferGeometry();
      const pos = new Float32Array(500 * 3);
      for (let i = 0; i < 500; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 800;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 800;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 800 - 400;
      }
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        size: 1.0,
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        depthWrite: false,
      });
      starsGroup.add(new THREE.Points(geom, mat));
    }

    // 中景 — 200 颗彩色星
    {
      const geom = new THREE.BufferGeometry();
      const pos = new Float32Array(200 * 3);
      const cols = new Float32Array(200 * 3);
      for (let i = 0; i < 200; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 500;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 500;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 500 - 200;
        const hue = 0.55 + Math.random() * 0.2;
        const sat = 0.7 + Math.random() * 0.3;
        const lum = 0.55 + Math.random() * 0.3;
        const c = new THREE.Color().setHSL(hue, sat, lum);
        cols[i * 3]     = c.r;
        cols[i * 3 + 1] = c.g;
        cols[i * 3 + 2] = c.b;
      }
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geom.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      const mat = new THREE.PointsMaterial({
        size: 1.6,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        depthWrite: false,
      });
      starsGroup.add(new THREE.Points(geom, mat));
    }

    // 前景 — 80 颗亮蓝星
    {
      const geom = new THREE.BufferGeometry();
      const pos = new Float32Array(80 * 3);
      for (let i = 0; i < 80; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 200;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 200 - 80;
      }
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        size: 2.5,
        color: 0x7df9ff,
        transparent: true,
        opacity: 1.0,
        sizeAttenuation: true,
        depthWrite: false,
      });
      starsGroup.add(new THREE.Points(geom, mat));
    }

    scene.add(starsGroup);

    // §3 行星（地球）+ 大气辉光
    const planetGeom = new THREE.SphereGeometry(2.5, 48, 48);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x4488ff,
      emissive: 0x112244,
      emissiveIntensity: 0.4,
      metalness: 0.4,
      roughness: 0.65,
    });
    const planet = new THREE.Mesh(planetGeom, planetMat);
    planet.position.set(15, 3, -30);
    scene.add(planet);

    const glowGeom = new THREE.SphereGeometry(3.6, 48, 48);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x7df9ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    glow.position.copy(planet.position);
    scene.add(glow);

    // 第 2 颗行星（远景小行星）
    const moonGeom = new THREE.SphereGeometry(0.6, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      emissive: 0x333333,
      metalness: 0.2,
      roughness: 0.9,
    });
    const moon = new THREE.Mesh(moonGeom, moonMat);
    moon.position.set(-25, -8, -60);
    scene.add(moon);

    // §4 灯光
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(15, 10, 5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x7df9ff, 0.4);
    rim.position.set(-10, -5, -10);
    scene.add(rim);

    // §5 Resize
    function onResize() {
      const w = canvas.clientWidth || canvas.width;
      const h = canvas.clientHeight || canvas.height;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    onResize();
    window.addEventListener('resize', onResize);
    // ResizeObserver 兜底（应对 sticky header / flex 变化）
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(onResize);
      ro.observe(canvas);
    }

    // §6 动画循环
    let raf = 0;
    let startTime = performance.now();
    function animate() {
      raf = requestAnimationFrame(animate);
      const t = (performance.now() - startTime) * 0.001;

      // 整体星海缓慢旋转
      starsGroup.rotation.y = t * 0.05;
      starsGroup.rotation.x = Math.sin(t * 0.3) * 0.05;

      // 行星自转
      planet.rotation.y = t * 0.6;
      // 月亮绕地球（轨道半径简化）
      moon.position.x = planet.position.x + Math.cos(t * 0.8) * 8;
      moon.position.z = planet.position.z + Math.sin(t * 0.8) * 8;

      renderer.render(scene, camera);
    }
    animate();

    // §7 Cleanup hook（防止泄漏）
    const dispose = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
      renderer.dispose();
      planetGeom.dispose();
      planetMat.dispose();
      glowGeom.dispose();
      glowMat.dispose();
      moonGeom.dispose();
      moonMat.dispose();
      starsGroup.children.forEach(p => {
        p.geometry.dispose();
        p.material.dispose();
      });
    };
    canvas.addEventListener('cleanup-scene', dispose, { once: true });

    return { renderer, scene, camera, dispose };
  } catch (err) {
    console.warn('[cosmic-scene] init 失败：', err);
    return null;
  }
}

// §5 Auto-init — DOMContentLoaded 钩子
document.addEventListener('DOMContentLoaded', () => {
  // 尊重 prefers-reduced-motion：减少过度动画
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    // 即使减少动画，星域背景仍要渲染（只是不转）
  }
  const canvas = document.getElementById('cosmic-canvas');
  initCosmicScene(canvas);
});

// §6 导出对象，便于测试
export { THREE };
