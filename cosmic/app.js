// ==========================================================
// AI 未来星域社区 · 应用脚本（Supabase 集成版）
// 阶段 2 · 2026-07-29 端到端接入 Supabase
// 阶段 3 · 2026-07-29 22:33 滚动入场动画
// ==========================================================
//
// 改造说明：
// - 替换 localStorage 调用 → Supabase Auth + Database
// - 保留 localStorage 兼容（作 fallback · 离线 / Supabase 不可用）
// - 全部 export 函数改成 async（因为 Supabase API 异步）
//
// 升级前要先做的（一次性）：
// 1. Supabase Dashboard → Authentication → Email → 关闭 "Confirm email"
// 2. 让用户能直接注册后登录（不用邮件验证）
//
// ==========================================================

// § 滚动入场动画（阶段 3 增强）
import { initScrollAnimations } from './anim-up.js';
// § 3D 鼠标跟随倾斜（阶段 3 增强）
import { init3DHover } from './hover-3d.js';
// § 按钮 ripple 粒子（阶段 3 增强）
import { initRipple } from './ripple.js';
// § 星空流星（阶段 3 增强）
import { initMeteors } from './meteors.js';
// § Hero 标题 stagger 文字动画（阶段 3 增强）
import { initHeroTitle } from './hero-title.js';
// § 页面切换 View Transitions API（Chrome 111+）
import { initViewTransitions } from './view-transition.js';
// § 登录成功 confetti（阶段 3 增强）
import { initConfetti } from './confetti.js';

// § Supabase client · CDN ESM 一行加载（零构建）
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://mygrxpwcdbuappvploja.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_FovABsTd--pVx5onBPwnRw_rd3M8yys';

// 单一 client 实例（浏览器侧共享）
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ==========================================================
// §1 本地 storage keys（fallback 用）
// ==========================================================
const LS_USERS = 'cosmic.users';
const LS_CURRENT = 'cosmic.currentUser';
const LS_RESOURCES = 'cosmic.resources';
const LS_FLASH = 'cosmic.flash';

// ==========================================================
// §2 工具函数
// ==========================================================
function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
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

function formatTime(iso) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`;
    return d.toLocaleDateString('zh-CN');
  } catch {
    return '未知';
  }
}

// ==========================================================
// §3 Auth 模块（Supabase Auth · 异步）
// ==========================================================

// 注册：Supabase signUp + trigger 自动建 user_profile
export async function registerUser({ username, email, password }) {
  if (!username || username.length < 2) throw new Error('用户名至少 2 个字');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('邮箱格式不对');
  if (!password || password.length < 6) throw new Error('密码至少 6 位');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },  // 传给 handle_new_user trigger
      emailRedirectTo: `${location.origin}/cosmic/index.html`,
    },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('注册失败 · 请检查 Supabase Auth 配置');

  // 立即登录（需要 Supabase 关闭 "Confirm email"）
  // 如果还要求 email confirm · 提示用户检查邮箱
  if (data.session) {
    return await getCurrentUser();
  }
  // 没立即 session · 可能需要 email confirm
  throw new Error('注册成功！请检查邮箱完成验证（Supabase → Auth → Email → 关闭 Confirm email 可直接登录）');
}

// 登录
export async function loginUser({ email, password }) {
  if (!email || !password) throw new Error('请输入邮箱和密码');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('邮箱或密码错误');
  if (!data.session) throw new Error('登录失败');

  return await getCurrentUser();
}

// 登出
export async function logoutUser() {
  await supabase.auth.signOut();
  // 清除 localStorage 备份
  localStorage.removeItem(LS_CURRENT);
}

// 当前用户（读 session + profile）
export async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    // 读 user_profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      // 还没建 profile（trigger 失败或刚注册还没跑）· 用 session 数据 fallback
      return {
        id: session.user.id,
        username: session.user.user_metadata?.username || session.user.email.split('@')[0],
        email: session.user.email,
        bio: '',
        followers: 0,
        following: 0,
      };
    }

    return {
      id: session.user.id,
      username: profile.username,
      email: session.user.email,
      bio: profile.bio || '',
      followers: profile.followers_count || 0,
      following: profile.following_count || 0,
    };
  } catch (e) {
    console.warn('getCurrentUser fail:', e);
    return null;
  }
}

// 同步版本（给不需要 async 的 DOMContentLoaded handlers 用）
// 这些同步函数会立即返回缓存值（如果已登录过）
let _cachedUser = null;
export function getCurrentUserSync() {
  if (_cachedUser) return _cachedUser;
  // 从 localStorage 缓存读（fallback）
  return readJSON(LS_CURRENT);
}

// 在 getCurrentUser 异步成功后 · 缓存
async function refreshUserCache() {
  _cachedUser = await getCurrentUser();
  if (_cachedUser) writeJSON(LS_CURRENT, _cachedUser);
  return _cachedUser;
}

// ==========================================================
// §4 路由 helpers
// ==========================================================
export function requireAuth() {
  // 立即检查缓存 · 异步刷新由调用方负责
  if (!_cachedUser) {
    writeJSON(LS_FLASH, { type: 'warn', text: '请先登录' });
    location.href = './login.html';
    return null;
  }
  return _cachedUser;
}

export function redirectIfAuthed() {
  if (_cachedUser) {
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

// ==========================================================
// §5 表单错误 a11y
// ==========================================================
export function showFieldError(input, msg) {
  if (!input) return;
  input.setAttribute('aria-invalid', 'true');

  let errId = input.getAttribute('aria-describedby');
  let errSpan = errId ? document.getElementById(errId) : null;
  if (!errSpan) {
    errSpan = document.createElement('span');
    errSpan.className = 'form-error';
    errSpan.setAttribute('role', 'alert');
    errSpan.id = 'err-' + (input.name || input.id || ('f' + Date.now()));
    input.setAttribute('aria-describedby', errSpan.id);
    input.insertAdjacentElement('afterend', errSpan);
  }
  errSpan.textContent = msg;
}

export function clearFieldError(input) {
  if (!input) return;
  input.setAttribute('aria-invalid', 'false');
  const errId = input.getAttribute('aria-describedby');
  if (errId) {
    const errSpan = document.getElementById(errId);
    if (errSpan) errSpan.textContent = '';
  }
}

export function clearAllFieldErrors(form) {
  if (!form) return;
  form.querySelectorAll('[aria-invalid]').forEach((el) => clearFieldError(el));
}

// ==========================================================
// §6 数据 API（Supabase Database · 异步）
// ==========================================================

// 6.1 评论
export async function addComment(resourceId, content) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('请先登录');

  // 读 username from user_profiles
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('id', session.user.id)
    .single();
  const authorName = profile?.username || session.user.email.split('@')[0];

  const { data, error } = await supabase
    .from('comments')
    .insert({
      resource_id: resourceId,
      user_id: session.user.id,
      author_name: authorName,
      content,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getComments(resourceId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('resource_id', resourceId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

// 6.2 资源收藏
export async function toggleResourceFav(resourceId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('请先登录');

  const { data: existing } = await supabase
    .from('resource_favorites')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('resource_id', resourceId)
    .single();

  if (existing) {
    await supabase.from('resource_favorites').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('resource_favorites').insert({
      user_id: session.user.id,
      resource_id: resourceId,
    });
    return true;
  }
}

export async function getUserResourceFavs() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];
  const { data, error } = await supabase
    .from('resource_favorites')
    .select('resource_id')
    .eq('user_id', session.user.id);
  if (error) return [];
  return (data || []).map((r) => r.resource_id);
}

// 6.3 工具收藏
export async function toggleToolFav(toolName) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('请先登录');

  const { data: existing } = await supabase
    .from('tool_favorites')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('tool_name', toolName)
    .single();

  if (existing) {
    await supabase.from('tool_favorites').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('tool_favorites').insert({
      user_id: session.user.id,
      tool_name: toolName,
    });
    return true;
  }
}

export async function getUserToolFavs() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];
  const { data, error } = await supabase
    .from('tool_favorites')
    .select('tool_name')
    .eq('user_id', session.user.id);
  if (error) return [];
  return (data || []).map((r) => r.tool_name);
}

// 6.4 点赞
export async function toggleLike(resourceId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('请先登录');

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('resource_id', resourceId)
    .single();

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('likes').insert({
      user_id: session.user.id,
      resource_id: resourceId,
    });
    return true;
  }
}

export async function getUserLikes() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];
  const { data, error } = await supabase
    .from('likes')
    .select('resource_id')
    .eq('user_id', session.user.id);
  if (error) return [];
  return (data || []).map((r) => r.resource_id);
}

// 6.5 关注
export async function toggleFollow(targetUserId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('请先登录');
  if (targetUserId === session.user.id) throw new Error('不能关注自己');

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', session.user.id)
    .eq('following_id', targetUserId)
    .single();

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('follows').insert({
      follower_id: session.user.id,
      following_id: targetUserId,
    });
    return true;
  }
}

export async function getFollowing() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', session.user.id);
  if (error) return [];
  return (data || []).map((r) => r.following_id);
}

// 6.6 通知
export async function getNotifications() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return [];
  return data || [];
}

// ==========================================================
// §7 DOMContentLoaded · 页面初始化
// ==========================================================
document.addEventListener('DOMContentLoaded', async () => {
  // 7.1 异步刷新当前用户
  await refreshUserCache();

  // 7.2 nav auth 按钮
  const navBtn = $('#nav-auth');
  if (navBtn) {
    if (_cachedUser) {
      navBtn.textContent = '登出';
      navBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm(`确定登出（${_cachedUser.username}）？`)) {
          await logoutUser();
          writeFlash('info', '已登出');
          location.href = './index.html';
        }
      });
    } else {
      navBtn.textContent = '登录';
      navBtn.addEventListener('click', () => { location.href = './login.html'; });
    }
  }

  // 7.3 nav active state
  document.querySelectorAll('.site-nav a[href]').forEach((a) => {
    try {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href === '#' || href.startsWith('./upload.html?edit=')) return;
      const url = new URL(a.href, location.href);
      const path = url.pathname.replace(/^.*\/cosmic\//, '').replace(/\.html$/, '') || 'index';
      const here = location.pathname.replace(/^.*\/cosmic\//, '').replace(/\.html$/, '') || 'index';
      if (path === here) {
        a.setAttribute('aria-current', 'page');
      }
    } catch (e) { /* ignore */ }
  });

  // 7.4 登录表单
  const loginForm = $('#login-form');
  if (loginForm) {
    // 已登录 → 跳 dashboard
    if (_cachedUser) {
      location.href = './dashboard.html';
      return;
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAllFieldErrors(loginForm);
      const fd = new FormData(loginForm);
      const emailInput = loginForm.querySelector('[name="email"]');
      const passwordInput = loginForm.querySelector('[name="password"]');
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        const user = await loginUser({
          email: fd.get('email'),
          password: fd.get('password'),
        });
        _cachedUser = user;
        writeJSON(LS_CURRENT, user);
        writeFlash('success', `欢迎回来，${user.username}！`);
        location.href = './dashboard.html';
      } catch (err) {
        showBanner(err.message, 'error');
        if (err.message.includes('邮箱')) showFieldError(emailInput, err.message);
        else if (err.message.includes('密码')) showFieldError(passwordInput, err.message);
        else showFieldError(emailInput, err.message);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    loginForm.querySelectorAll('input').forEach((inp) => {
      inp.addEventListener('input', () => clearFieldError(inp));
    });
  }

  // 7.5 注册表单
  const registerForm = $('#register-form');
  if (registerForm) {
    if (_cachedUser) {
      location.href = './dashboard.html';
      return;
    }

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAllFieldErrors(registerForm);
      const fd = new FormData(registerForm);
      const inputs = {
        username: registerForm.querySelector('[name="username"]'),
        email: registerForm.querySelector('[name="email"]'),
        password: registerForm.querySelector('[name="password"]'),
        confirm: registerForm.querySelector('[name="confirm"]'),
      };
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        const pwd = fd.get('password');
        const confirm = fd.get('confirm');
        if (confirm !== pwd) {
          showFieldError(inputs.confirm, '两次密码输入不一致');
          return;
        }
        const user = await registerUser({
          username: fd.get('username'),
          email: fd.get('email'),
          password: pwd,
        });
        _cachedUser = user;
        writeJSON(LS_CURRENT, user);
        writeFlash('success', `注册成功！欢迎加入 ${user.username}`);
        location.href = './dashboard.html';
      } catch (err) {
        showBanner(err.message, 'error');
        const msg = err.message;
        if (msg.includes('用户名')) showFieldError(inputs.username, msg);
        else if (msg.includes('邮箱')) showFieldError(inputs.email, msg);
        else if (msg.includes('密码')) showFieldError(inputs.password, msg);
        else showFieldError(inputs.username, msg);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    registerForm.querySelectorAll('input').forEach((inp) => {
      inp.addEventListener('input', () => clearFieldError(inp));
    });
  }

  // 7.6 GitHub 登录（mock）
  const ghBtn = $('#gh-login');
  if (ghBtn) {
    ghBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showBanner('GitHub OAuth 接入将在阶段 2 后期完成（Supabase Auth providers）', 'warn');
    });
  }

  // 7.7 Flash banner
  const flash = readFlash();
  if (flash && flash.text) {
    showBanner(flash.text, flash.type || 'info');
  }

  // 7.8 滚动入场动画（已通过 import 自动加载）
  initScrollAnimations();
  init3DHover();
  initRipple();
  initMeteors();
  initHeroTitle();
  initConfetti();
  initViewTransitions();
});

// ==========================================================
// §8 通用 banner / toast（role=status + aria-live=polite）
// ==========================================================
export function showBanner(text, type = 'info') {
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
    position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
    padding: 12px 24px; border-radius: 12px; z-index: 100;
    background: ${colors[type] || colors.info};
    border: 1px solid ${accents[type] || accents.info};
    color: var(--fg); font-weight: 600; font-size: 14px;
    -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
    box-shadow: var(--shadow);
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

// ==========================================================
// 导出 supabase client（供其他页面用 · 可选）
// ==========================================================
export { supabase };
