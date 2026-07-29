// ==========================================================
// AI 未来星域社区 · Galaxy 增强星空（v2 · 1000 粒子 + 鼠标磁场）
// 2026-07-29 23:03 · 阶段 4 升级
// ==========================================================
//
// 增强点（vs 上一版）：
// - 1000 粒子（500 远 + 350 中 + 150 前）
// - 鼠标磁场（粒子被推开 · 80 半径 · 类似斥力）
// - 镜头缓慢自转（dynamic camera · 60 半径环绕）
// - 行星 + 大气辉光 + 月亮轨道
// - 整体性能优化（size attenuation + depthWrite false）
// ==========================================================

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function initGalaxyScene(canvas) {
  if (!canvas) return null;

  try {
    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
    camera.position.set(0, 0, 60);
    camera.lookAt(0, 0, 0);

    const galaxy = new THREE.Group();
    scene.add(galaxy);

    // 鼠标位置（磁场）
    const mouseNDC = new THREE.Vector2(0, 0);
    const mouseWorld = new THREE.Vector3(0, 0, 0);
    let mouseActive = false;
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouseNDC.x = ((e.clientX - r.left) / r.width) - 0.5;
      mouseNDC.y = -(((e.clientY - r.top) / r.height) - 0.5);
      mouseActive = true;
    });
    canvas.addEventListener('mouseleave', () => { mouseActive = false; });

    // § 1 远景粒子（500 颗 · 白点 · 极大范围）
    {
      const pos = new Float32Array(500 * 3);
      for (let i = 0; i < 500; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 1200;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 1200;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 1200 - 500;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const m = new THREE.PointsMaterial({
        size: 1.4, color: 0xffffff, transparent: true, opacity: 0.7,
        sizeAttenuation: true, depthWrite: false,
      });
      galaxy.add(new THREE.Points(g, m));
    }

    // § 2 中景粒子（350 颗 · 带颜色 · 飞旋 · 磁场交互）
    {
      const pos = new Float32Array(350 * 3);
      const cols = new Float32Array(350 * 3);
      const vels = [];
      for (let i = 0; i < 350; i++) {
        const r = 80 + Math.random() * 350;
        const angle = Math.random() * Math.PI * 2;
        pos[i * 3]     = Math.cos(angle) * r;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 240;
        pos[i * 3 + 2] = Math.sin(angle) * r - 200;
        const hue = 0.55 + Math.random() * 0.18;
        const c = new THREE.Color().setHSL(hue, 0.8, 0.55 + Math.random() * 0.3);
        cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
        vels.push({
          radius: r, angle: angle,
          speed: 0.0005 + Math.random() * 0.001,
          ySpeed: (Math.random() - 0.5) * 0.0002,
        });
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      const m = new THREE.PointsMaterial({
        size: 2.2, vertexColors: true, transparent: true, opacity: 0.95,
        sizeAttenuation: true, depthWrite: false,
      });
      const points = new THREE.Points(g, m);
      points.userData = { vels };
      galaxy.add(points);
    }

    // § 3 前景粒子（150 颗 · 大亮蓝 · 磁场重点）
    {
      const pos = new Float32Array(150 * 3);
      for (let i = 0; i < 150; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 300;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 300;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 300 - 100;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const m = new THREE.PointsMaterial({
        size: 3.5, color: 0x7df9ff, transparent: true, opacity: 1.0,
        sizeAttenuation: true, depthWrite: false,
      });
      galaxy.add(new THREE.Points(g, m));
    }

    // § 4 行星 + 大气辉光
    const planet = (() => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(
        new THREE.SphereGeometry(3.5, 48, 48),
        new THREE.MeshStandardMaterial({
          color: 0x4488ff, emissive: 0x112244, emissiveIntensity: 0.45,
          metalness: 0.4, roughness: 0.65,
        })
      ));
      g.add(new THREE.Mesh(
        new THREE.SphereGeometry(5, 48, 48),
        new THREE.MeshBasicMaterial({
          color: 0x7df9ff, transparent: true, opacity: 0.22,
          side: THREE.BackSide, depthWrite: false,
        })
      ));
      // 光环
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(5.5, 6.5, 64),
        new THREE.MeshBasicMaterial({
          color: 0x7df9ff, transparent: true, opacity: 0.4,
          side: THREE.DoubleSide, depthWrite: false,
        })
      );
      ring.rotation.x = Math.PI / 2.5;
      g.add(ring);
      g.position.set(22, 4, -50);
      return g;
    })();
    galaxy.add(planet);

    // § 5 第二颗小行星（远景）
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xaaaaaa, emissive: 0x444444, metalness: 0.2, roughness: 0.9,
      })
    );
    moon.position.set(-32, -10, -80);
    galaxy.add(moon);

    // § 6 灯光
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(20, 12, 5);
    scene.add(sun);
    const rimLight = new THREE.DirectionalLight(0x7df9ff, 0.5);
    rimLight.position.set(-12, -6, -15);
    scene.add(rimLight);

    // § 7 Resize
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
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(onResize);
      ro.observe(canvas);
    }

    // § 8 动画循环
    let raf = 0;
    const tmp = new THREE.Vector3();
    let cameraAngle = 0;

    function animate() {
      raf = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;

      // 镜头缓慢自转
      cameraAngle += 0.0008;
      camera.position.x = Math.cos(cameraAngle) * 60;
      camera.position.z = 60 + Math.sin(cameraAngle) * 30;
      camera.position.y = Math.sin(t * 0.3) * 5;
      camera.lookAt(0, 0, 0);

      // 鼠标磁场（粒子被推开）
      if (mouseActive) {
        mouseWorld.set(mouseNDC.x * 100, mouseNDC.y * 100, 0);
        galaxy.children.forEach((child) => {
          if (child.isPoints && child.geometry.attributes.position.count === 150) {
            const pos = child.geometry.attributes.position;
            for (let i = 0; i < 150; i++) {
              tmp.set(pos.array[i * 3], pos.array[i * 3 + 1], pos.array[i * 3 + 2]);
              const d = tmp.distanceTo(mouseWorld);
              if (d < 90) {
                const force = (1 - d / 90) * 10;
                const dir = tmp.clone().sub(mouseWorld).normalize();
                pos.array[i * 3]     += dir.x * force;
                pos.array[i * 3 + 1] += dir.y * force;
                pos.array[i * 3 + 2] += dir.z * force * 0.5;
              }
            }
            pos.needsUpdate = true;
          }
        });
      }

      // 中景粒子自旋
      galaxy.children.forEach((child) => {
        if (child.isPoints && child.userData?.vels) {
          const pos = child.geometry.attributes.position;
          const vs = child.userData.vels;
          for (let i = 0; i < vs.length; i++) {
            vs[i].angle += vs[i].speed;
            pos.array[i * 3]     = Math.cos(vs[i].angle) * vs[i].radius;
            pos.array[i * 3 + 1] += vs[i].ySpeed;
            pos.array[i * 3 + 2] = Math.sin(vs[i].angle) * vs[i].radius - 200;
          }
          pos.needsUpdate = true;
          child.rotation.y += 0.0003;
        }
      });

      // 行星 + 月亮
      planet.rotation.y += 0.008;
      moon.position.x = planet.position.x + Math.cos(t * 0.8) * 12;
      moon.position.z = planet.position.z + Math.sin(t * 0.8) * 12;

      renderer.render(scene, camera);
    }
    animate();

    // § 9 Cleanup
    const dispose = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
      renderer.dispose();
      galaxy.children.forEach((child) => {
        if (child.isPoints) {
          child.geometry.dispose();
          child.material.dispose();
        } else if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
    };
    canvas.addEventListener('cleanup-scene', dispose, { once: true });

    return { renderer, scene, camera, dispose };
  } catch (err) {
    console.warn('[galaxy-scene] init failed:', err);
    return null;
  }
}
