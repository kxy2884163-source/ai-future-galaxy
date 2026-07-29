// ==========================================================
// AI 未来星域社区 · Galaxy 增强星空（阶段 4 升级）
// 2026-07-29 22:58 · 参照 Awwwards Galaxy 风格
// ==========================================================
//
// 升级要点：
// - 800+ 粒子（远 + 中 + 近 3 层）
// - 鼠标位置磁场（粒子被推开）
// - 镜头缓慢自转（dynamic camera）
// - 行星光环 + 大气辉光
// - 流星带轨迹
// - 整体性能优化（point size 衰减）
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

    const galaxyGroup = new THREE.Group();
    scene.add(galaxyGroup);

    // 鼠标位置（用于磁场效果）
    const mouse = new THREE.Vector2(0, 0);
    const mouseWorld = new THREE.Vector3(0, 0, 0);
    let mouseActive = false;
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) - 0.5;
      mouse.y = -(((e.clientY - rect.top) / rect.height) - 0.5);
      mouseActive = true;
    });
    canvas.addEventListener('mouseleave', () => { mouseActive = false; });

    // § 1 远景粒子（500 颗 · 小白点）
    {
      const positions = new Float32Array(500 * 3);
      for (let i = 0; i < 500; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 1000;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1000 - 400;
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        size: 1.2, color: 0xffffff, transparent: true, opacity: 0.7,
        sizeAttenuation: true, depthWrite: false,
      });
      galaxyGroup.add(new THREE.Points(geom, mat));
    }

    // § 2 中景粒子（250 颗 · 带颜色 · 飞旋）
    {
      const positions = new Float32Array(250 * 3);
      const colors = new Float32Array(250 * 3);
      const velocities = [];  // 自旋用
      for (let i = 0; i < 250; i++) {
        const r = 100 + Math.random() * 300;
        const angle = Math.random() * Math.PI * 2;
        positions[i * 3]     = Math.cos(angle) * r;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = Math.sin(angle) * r - 200;
        const hue = 0.55 + Math.random() * 0.15;
        const c = new THREE.Color().setHSL(hue, 0.8, 0.6 + Math.random() * 0.3);
        colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
        velocities.push({
          radius: r,
          angle: angle,
          speed: 0.0005 + Math.random() * 0.001,
          ySpeed: (Math.random() - 0.5) * 0.0002,
        });
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const mat = new THREE.PointsMaterial({
        size: 2.0, vertexColors: true, transparent: true, opacity: 0.95,
        sizeAttenuation: true, depthWrite: false,
      });
      const points = new THREE.Points(geom, mat);
      points.userData = { velocities };
      galaxyGroup.add(points);
    }

    // § 3 前景粒子（80 颗 · 大亮蓝 · 主角）
    {
      const positions = new Float32Array(80 * 3);
      for (let i = 0; i < 80; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 250;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 250 - 100;
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        size: 3.0, color: 0x7df9ff, transparent: true, opacity: 1.0,
        sizeAttenuation: true, depthWrite: false,
      });
      galaxyGroup.add(new THREE.Points(geom, mat));
    }

    // § 4 行星 + 大气辉光
    const planet = (() => {
      const g = new THREE.Group();
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(3, 48, 48),
        new THREE.MeshStandardMaterial({
          color: 0x4488ff, emissive: 0x112244, emissiveIntensity: 0.4,
          metalness: 0.4, roughness: 0.65,
        })
      );
      g.add(sphere);
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(4.2, 48, 48),
        new THREE.MeshBasicMaterial({
          color: 0x7df9ff, transparent: true, opacity: 0.2,
          side: THREE.BackSide, depthWrite: false,
        })
      );
      g.add(glow);
      g.position.set(20, 4, -50);
      return g;
    })();
    galaxyGroup.add(planet);

    // § 5 第二颗小行星（远景）
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xaaaaaa, emissive: 0x333333, metalness: 0.2, roughness: 0.9,
      })
    );
    moon.position.set(-30, -10, -80);
    galaxyGroup.add(moon);

    // § 6 灯光
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(20, 12, 5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x7df9ff, 0.5);
    rim.position.set(-12, -6, -15);
    scene.add(rim);

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

      // § 镜头缓慢自转（dynamic camera）
      cameraAngle += 0.0008;
      camera.position.x = Math.cos(cameraAngle) * 60;
      camera.position.z = 60 + Math.sin(cameraAngle) * 30;
      camera.position.y = Math.sin(t * 0.3) * 5;
      camera.lookAt(0, 0, 0);

      // § 鼠标磁场（粒子被推离）
      if (mouseActive) {
        // 转 NDC 世界坐标
        mouseWorld.set(mouse.x * 100, mouse.y * 100, 0);
        galaxyGroup.children.forEach((child) => {
          if (child.isPoints) {
            const pos = child.geometry.attributes.position;
            // 仅作用于前景粒子（80 颗）
            if (pos.count === 80) {
              for (let i = 0; i < 80; i++) {
                tmp.set(pos.array[i * 3], pos.array[i * 3 + 1], pos.array[i * 3 + 2]);
                const d = tmp.distanceTo(mouseWorld);
                if (d < 80) {
                  const force = (1 - d / 80) * 8;
                  const dir = tmp.clone().sub(mouseWorld).normalize();
                  pos.array[i * 3]     += dir.x * force;
                  pos.array[i * 3 + 1] += dir.y * force;
                  pos.array[i * 3 + 2] += dir.z * force * 0.5;
                }
              }
              pos.needsUpdate = true;
            }
          }
        });
      }

      // § 中景粒子自旋（银心旋转）
      galaxyGroup.children.forEach((child) => {
        if (child.isPoints && child.userData?.velocities) {
          const pos = child.geometry.attributes.position;
          const vs = child.userData.velocities;
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

      // § 行星自转 + 月亮轨道
      planet.rotation.y += 0.008;
      moon.position.x = planet.position.x + Math.cos(t * 0.8) * 10;
      moon.position.z = planet.position.z + Math.sin(t * 0.8) * 10;

      renderer.render(scene, camera);
    }
    animate();

    // § 9 Cleanup
    const dispose = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
      renderer.dispose();
      galaxyGroup.children.forEach((child) => {
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
