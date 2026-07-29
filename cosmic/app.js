// ==========================================================
// AI 未来星域社区 · 应用脚本
// 范式: ES Module · vanilla JS · 无依赖
// §1 常量（localStorage 键）
// §2 工具函数
// §3 Auth 模块
// §4 页面绑定
// §5 Toast / Flash banner
// ==========================================================

// §1 常量
const LS_USERS = 'cosmic.users';
const LS_CURRENT = 'cosmic.currentUser';
const LS_RESOURCES = 'cosmic.resources';
const LS_FOLLOWING = 'cosmic.following';
const LS_FOLLOWERS = 'cosmic.followers';
const LS_FLASH = 'cosmic.flash';

// §2 工具函数
function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn('readJSON fail:', key, e);
    return fallback;
  }
}

function writeJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch (e) {
    console.warn('writeJSON fail:', key, e);
    return false;
  }
}

function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return root.querySelectorAll(sel); }

function escapeHTML(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

// §3 Auth 模块
export function registerUser({ username, email, password }) {
  if (!username || username.length < 2) throw new Error('用户名至少 2 个字');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('邮箱格式不对');
  if (!password || password.length < 6) throw new Error('密码至少 6 位');

  const users = readJSON(LS_USERS, []);
  if (users.find(u => u.email === email)) throw new Error('该邮箱已注册');
  if (users.find(u => u.username === username)) throw new Error('该用户名已被占用');

  const user = {
    id: 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    username,
    email,
    bio: `${username} · 新加入 AI 未来星域社区`,
    createdAt: new Date().toISOString(),
    followers: 0,
    following: 0,
    resources: [],
  };
  users.push({ ...user, password });
  writeJSON(LS_USERS, users);
  const publicUser = { ...user };
  writeJSON(LS_CURRENT, publicUser);
  return publicUser;
}

export function loginUser({ email, password }) {
  if (!email || !password) throw new Error('请输入邮箱和密码');
  const users = readJSON(LS_USERS, []);
  const found = users.find(u => u.email === email && u.password === password);
  if (!found) throw new Error('邮箱或密码错误');
  const { password: _, ...publicUser } = found;
  writeJSON(LS_CURRENT, publicUser);
  return publicUser;
}

export function logoutUser() {
  localStorage.removeItem(LS_CURRENT);
}

export function getCurrentUser() {
  return readJSON(LS_CURRENT);
}

export function requireAuth() {
  const u = getCurrentUser();
  if (!u) {
    writeJSON(LS_FLASH, { type: 'warn', text: '请先登录' });
    location.href = './login.html';
    return null;
  }
  return u;
}

export function redirectIfAuthed() {
  if (getCurrentUser()) {
    location.href = './dashboard.html';
  }
}

export function readFlash() {
  const f = readJSON(LS_FLASH);
  localStorage.removeItem(LS_FLASH);
  return f;
}

export function writeFlash(type, text) {
  writeJSON(LS_FLASH, { type, text });
}

// §4 页面绑定
document.addEventListener('DOMContentLoaded', () => {
  // 4.1 nav 按钮（登录/登出状态切换）
  const navBtn = $('#nav-auth');
  if (navBtn) {
    const u = getCurrentUser();
    if (u) {
      navBtn.textContent = '登出';
      navBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm(`确定登出（${u.username}）？`)) {
          logoutUser();
          writeFlash('info', '已登出');
          location.href = './index.html';
        }
      });
    } else {
      navBtn.textContent = '登录';
      navBtn.addEventListener('click', () => { location.href = './login.html'; });
    }
  }

  // 4.2 登录表单
  const loginForm = $('#login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(loginForm);
      try {
        const user = loginUser({
          email: fd.get('email'),
          password: fd.get('password'),
        });
        writeFlash('success', `欢迎回来，${user.username}！`);
        location.href = './dashboard.html';
      } catch (err) {
        showBanner(err.message, 'error');
      }
    });
  }

  // 4.3 注册表单
  const registerForm = $('#register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(registerForm);
      try {
        const user = registerUser({
          username: fd.get('username'),
          email: fd.get('email'),
          password: fd.get('password'),
        });
        // 校验确认密码
        const confirm = fd.get('confirm');
        if (confirm !== fd.get('password')) throw new Error('两次密码输入不一致');

        writeFlash('success', `注册成功！欢迎加入 ${user.username}`);
        location.href = './dashboard.html';
      } catch (err) {
        showBanner(err.message, 'error');
      }
    });
  }

  // 4.4 GitHub 登录（mock — 阶段 2 接 Supabase）
  const ghBtn = $('#gh-login');
  if (ghBtn) {
    ghBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showBanner('GitHub OAuth 接入将在阶段 2 完成（Supabase Auth）', 'warn');
    });
  }

  // 4.5 Dashboard 加载用户信息
  const me = getCurrentUser();
  if (me && $('#user-name')) {
    const uname = $('#user-name');
    const ubio = $('#user-bio');
    const statFollowers = $('#stat-followers');
    const statFollowing = $('#stat-following');
    const statResources = $('#stat-resources');

    if (uname) uname.textContent = me.username;
    if (ubio) ubio.textContent = me.bio;
    if (statFollowers) statFollowers.textContent = me.followers || 0;
    if (statFollowing) statFollowing.textContent = me.following || 0;

    // 统计我的资源
    const resources = readJSON(LS_RESOURCES, []);
    const myRes = resources.filter(r => r.userId === me.id);
    if (statResources) statResources.textContent = myRes.length;

    // 渲染我的作品
    const list = $('#my-resources');
    if (list) {
      if (myRes.length === 0) {
        list.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon" aria-hidden="true">✦</div>
            <p>还没有作品</p>
            <p><a href="./upload.html">上传第一个资源 →</a></p>
          </div>`;
      } else {
        list.innerHTML = myRes.map(r => `
          <a class="resource-card-item" href="./upload.html?edit=${encodeURIComponent(r.id)}">
            <h4>${escapeHTML(r.title || '未命名')}</h4>
            <p>${escapeHTML(r.description || '').slice(0, 80)}</p>
          </a>
        `).join('');
      }
    }
  } else if ($('#user-name')) {
    // 未登录 — 被 requireAuth 跳转到 login.html 前的状态
    const list = $('#my-resources');
    if (list) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon" aria-hidden="true">🔒</div>
          <p>请先登录查看个人主页</p>
        </div>`;
    }
  }

  // 4.6 Flash banner（页面顶部提示）
  const flash = readFlash();
  if (flash && flash.text) {
    showBanner(flash.text, flash.type || 'info');
  }
});

// §5 Toast / Flash banner
function showBanner(text, type = 'info') {
  // 移除已有 banner
  const existing = document.getElementById('cosmic-banner');
  if (existing) existing.remove();

  const b = document.createElement('div');
  b.id = 'cosmic-banner';
  b.setAttribute('role', 'status');
  b.setAttribute('aria-live', 'polite');
  b.textContent = text;

  const colors = {
    success: 'rgba(107, 217, 104, 0.2)',
    warn: 'rgba(255, 200, 87, 0.2)',
    error: 'rgba(255, 93, 108, 0.2)',
    info: 'rgba(125, 249, 255, 0.2)',
  };
  const accents = {
    success: 'var(--success)',
    warn: 'var(--warn)',
    error: 'var(--danger)',
    info: 'var(--accent)',
  };

  b.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 12px;
    z-index: 100;
    background: ${colors[type] || colors.info};
    border: 1px solid ${accents[type] || accents.info};
    color: var(--fg);
    font-weight: 600;
    font-size: 14px;
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
    box-shadow: var(--shadow);
    animation: slideDown 0.3s ease;
  `;
  document.body.appendChild(b);
  setTimeout(() => {
    b.style.opacity = '0';
    b.style.transition = 'opacity 0.3s ease';
    setTimeout(() => b.remove(), 300);
  }, 3000);
}

// Inject animation keyframes once
(function injectAnim() {
  if (!document.getElementById('cosmic-anim')) {
    const s = document.createElement('style');
    s.id = 'cosmic-anim';
    s.textContent = `
      @keyframes slideDown {
        from { transform: translate(-50%, -20px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
    `;
    document.head.appendChild(s);
  }
})();
