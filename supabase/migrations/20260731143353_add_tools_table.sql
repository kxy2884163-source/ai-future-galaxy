-- ==========================================================
-- AI 未来星域社区 · 补建 tools 表
-- 拍板日期：2026-07-31
-- 原因：PRD § 模块 3（插件工具）需要 · 原 init_schema.sql 漏建
-- 兼容：tool_favorites.tool_name 直接关联 tools.name（最小改动原则）
-- ==========================================================

-- § 1 表结构

create table public.tools (
  id uuid primary key default gen_random_uuid(),
  -- 短标识 · 用于 tool_favorites.tool_name 关联
  -- 这里 slug = name（英文）· 唯一约束保证工具不被重复
  slug text unique not null,
  name text not null,
  description text default '',
  category text not null check (category in ('writing','image','code','video','search','chat')),
  icon text default '✦',
  url text not null,
  rating numeric(2,1) default 0 check (rating >= 0 and rating <= 5),
  -- 排序 / 计数器
  sort_order int default 0,
  favorites_count int default 0,
  clicks_count int default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create index idx_tools_category on public.tools(category);
create index idx_tools_sort_order on public.tools(sort_order);
create index idx_tools_slug on public.tools(slug);

-- § 2 RLS（行级安全）

alter table public.tools enable row level security;

-- 公开读（任何人都能浏览工具）
create policy "Anyone can read tools"
  on public.tools for select
  using (true);

-- 只有 service_role / admin 能写（前端用户不能自创工具 · 工具列表由站长维护）
-- 简化：不开放 user insert · 后续如有需要再扩
create policy "Service role can manage tools"
  on public.tools for all
  using (auth.jwt()->>'role' = 'service_role')
  with check (auth.jwt()->>'role' = 'service_role');

-- § 3 Realtime（如后续需要订阅工具更新）
-- alter publication supabase_realtime add table public.tools;
-- 暂不开启 · 工具列表不常变

-- ==========================================================
-- 拍板备注：
-- 1. tools.name 跟 tool_favorites.tool_name 直接关联 · 不改 tool_favorites schema
-- 2. 后续如要扩 user 上传工具：加 INSERT policy 即可
-- 3. 暂不开 Realtime · 工具列表跟 resources/comments 性质不同
-- ==========================================================
