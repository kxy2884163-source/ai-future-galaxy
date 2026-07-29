-- ==========================================================
-- AI 未来星域社区 · 初始 Schema
-- 拍板日期：2026-07-29
-- 依据：docs/02-后端技术栈.md · docs/03-数据库技术栈.md · PRD § 4 大模块
-- ==========================================================

-- § 1 表结构

-- 1.1 resources 资源（4 模块里的知识分享 + 上传资源）
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('prompt','model','tool','dataset','inspiration')),
  title text not null,
  description text default '',
  icon text default '✦',
  tags text[] default '{}',
  -- 草稿 vs 发布（drafts 表里有更细的编辑状态）
  is_draft boolean default false,
  -- 计数器（点赞 / 收藏 / 下载 / 浏览）
  likes_count int default 0,
  favorites_count int default 0,
  downloads_count int default 0,
  views_count int default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create index idx_resources_user_id on public.resources(user_id);
create index idx_resources_type on public.resources(type);
create index idx_resources_created_at on public.resources(created_at desc);
create index idx_resources_is_draft on public.resources(is_draft) where is_draft = false;

-- 1.2 comments 评论（resource 详情页）
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid references public.resources(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  author_name text not null,  -- 冗余字段 · 避免每条评论 join 用户表
  content text not null check (length(content) between 1 and 1000),
  created_at timestamptz default now() not null
);
create index idx_comments_resource_id on public.comments(resource_id);
create index idx_comments_user_id on public.comments(user_id);
create index idx_comments_created_at on public.comments(created_at desc);

-- 1.3 likes 点赞（resource 点赞）
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid references public.resources(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(resource_id, user_id)
);
create index idx_likes_resource_id on public.likes(resource_id);
create index idx_likes_user_id on public.likes(user_id);

-- 1.4 resource_favorites 资源收藏（favorites 页 - 资源 tab）
create table public.resource_favorites (
  id uuid primary key default gen_random_uuid(),
  resource_id text not null,  -- resource 可能是 mock ID（01-12）或真 UUID
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(resource_id, user_id)
);
create index idx_resource_favorites_user_id on public.resource_favorites(user_id);

-- 1.5 tool_favorites 工具收藏（favorites 页 - 工具 tab）
create table public.tool_favorites (
  id uuid primary key default gen_random_uuid(),
  tool_name text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(tool_name, user_id)
);
create index idx_tool_favorites_user_id on public.tool_favorites(user_id);

-- 1.6 follows 关注（follows 页）
create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references auth.users(id) on delete cascade not null,
  following_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(follower_id, following_id),
  check (follower_id <> following_id)  -- 不能关注自己
);
create index idx_follows_follower_id on public.follows(follower_id);
create index idx_follows_following_id on public.follows(following_id);

-- 1.7 notifications 通知中心
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  -- 接收者
  recipient_id uuid references auth.users(id) on delete cascade not null,
  -- 触发者（可能为 null · 比如系统通知）
  actor_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('comment','reply','like','favorite','follow','mention','system')),
  -- 关联资源
  resource_id uuid references public.resources(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  -- 内容快照（避免 join 表 · 通知标题/摘要）
  title text not null,
  preview text default '',
  is_read boolean default false,
  created_at timestamptz default now() not null
);
create index idx_notifications_recipient_unread on public.notifications(recipient_id, is_read) where is_read = false;
create index idx_notifications_created_at on public.notifications(created_at desc);

-- 1.8 drafts 草稿（drafts 页 · 编辑中未发布的资源）
create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  -- 关联到已发布的 resource（如果有）
  resource_id uuid references public.resources(id) on delete set null,
  -- 编辑中数据
  payload jsonb not null default '{}'::jsonb,
  -- 元数据
  title text not null default '未命名草稿',
  edited_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);
create index idx_drafts_user_id on public.drafts(user_id);
create index idx_drafts_edited_at on public.drafts(edited_at desc);

-- 1.9 user_profiles 扩展 auth.users（用户元数据）
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (length(username) between 2 and 20),
  bio text default '',
  avatar_url text,
  -- 个人主页设置（也可放 settings 表 · 暂存这里）
  -- 公开主页 / 陌生人私信 / 显示在线
  privacy_public boolean default true,
  privacy_dm boolean default false,
  privacy_online boolean default true,
  -- 通知偏好
  notify_comment boolean default true,
  notify_like boolean default true,
  notify_follow boolean default true,
  notify_system boolean default false,
  -- 计数器（denormalized · 性能优化）
  followers_count int default 0,
  following_count int default 0,
  resources_count int default 0,
  likes_received_count int default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create index idx_user_profiles_username on public.user_profiles(username);

-- § 2 RLS（行级安全 · 每张表独立策略）

alter table public.resources enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.resource_favorites enable row level security;
alter table public.tool_favorites enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.drafts enable row level security;
alter table public.user_profiles enable row level security;

-- 2.1 resources 策略
create policy "Anyone can read published resources"
  on public.resources for select
  using (is_draft = false or auth.uid() = user_id);

create policy "Authenticated users can insert own resources"
  on public.resources for insert
  with check (auth.uid() = user_id);

create policy "Users can update own resources"
  on public.resources for update
  using (auth.uid() = user_id);

create policy "Users can delete own resources"
  on public.resources for delete
  using (auth.uid() = user_id);

-- 2.2 comments 策略
create policy "Anyone can read comments"
  on public.comments for select
  using (true);

create policy "Authenticated users can insert own comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

-- 2.3 likes 策略
create policy "Anyone can read likes"
  on public.likes for select
  using (true);

create policy "Authenticated users can like"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike own"
  on public.likes for delete
  using (auth.uid() = user_id);

-- 2.4 resource_favorites 策略（用户私有）
create policy "Users read own favorites"
  on public.resource_favorites for select
  using (auth.uid() = user_id);

create policy "Users manage own favorites"
  on public.resource_favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2.5 tool_favorites 策略（用户私有）
create policy "Users read own tool favorites"
  on public.tool_favorites for select
  using (auth.uid() = user_id);

create policy "Users manage own tool favorites"
  on public.tool_favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2.6 follows 策略（公开可见 · 仅自己可改）
create policy "Anyone can read follows"
  on public.follows for select
  using (true);

create policy "Users can follow"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- 2.7 notifications 策略（用户私有 · 仅自己可见）
create policy "Users read own notifications"
  on public.notifications for select
  using (auth.uid() = recipient_id);

create policy "Users mark own notifications read"
  on public.notifications for update
  using (auth.uid() = recipient_id);

create policy "System can create notifications"
  on public.notifications for insert
  with check (true);  -- Edge Functions / 后端可创建

-- 2.8 drafts 策略（用户私有）
create policy "Users manage own drafts"
  on public.drafts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2.9 user_profiles 策略
create policy "Anyone can read profiles"
  on public.user_profiles for select
  using (true);

create policy "Users manage own profile"
  on public.user_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- § 3 Trigger · 用户注册自动建 profile

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- § 4 性能优化 · 计数器函数（denormalized 字段自动更新）

-- 4.1 likes 触发器：resource.likes_count 自增 / 自减
create or replace function public.handle_like_change()
returns trigger
language plpgsql
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.resources set likes_count = likes_count + 1 where id = new.resource_id;
    -- 给 resource 作者发通知（如果点赞者不是作者自己）
    if (new.user_id <> (select user_id from public.resources where id = new.resource_id)) then
      insert into public.notifications (recipient_id, actor_id, type, resource_id, title, preview)
      select r.user_id, new.user_id, 'like', r.id, '有人点赞了你的资源', r.title
      from public.resources r where r.id = new.resource_id;
    end if;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.resources set likes_count = likes_count - 1 where id = old.resource_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger trg_like_change
  after insert or delete on public.likes
  for each row execute procedure public.handle_like_change();

-- 4.2 resource_favorites 触发器
create or replace function public.handle_resource_favorite_change()
returns trigger
language plpgsql
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.resources set favorites_count = favorites_count + 1 where id::text = new.resource_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.resources set favorites_count = favorites_count - 1 where id::text = old.resource_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger trg_resource_favorite_change
  after insert or delete on public.resource_favorites
  for each row execute procedure public.handle_resource_favorite_change();

-- 4.3 comments 触发器：自动通知作者 + 自增 resource 的评论数（可选）
create or replace function public.handle_comment_insert()
returns trigger
language plpgsql
as $$
begin
  -- 通知资源作者（如果评论者不是作者自己）
  if (new.user_id <> (select user_id from public.resources where id = new.resource_id)) then
    insert into public.notifications (recipient_id, actor_id, type, resource_id, comment_id, title, preview)
    select r.user_id, new.user_id, 'comment', r.id, new.id,
           new.author_name || ' 评论了你的资源', left(new.content, 80)
    from public.resources r where r.id = new.resource_id;
  end if;
  return new;
end;
$$;

create trigger trg_comment_insert
  after insert on public.comments
  for each row execute procedure public.handle_comment_insert();

-- 4.4 follows 触发器：互关通知 + 计数器
create or replace function public.handle_follow_change()
returns trigger
language plpgsql
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.user_profiles set followers_count = followers_count + 1 where id = new.following_id;
    update public.user_profiles set following_count = following_count + 1 where id = new.follower_id;
    -- 通知被关注者
    insert into public.notifications (recipient_id, actor_id, type, title)
    select new.following_id, new.follower_id, 'follow', '有人关注了你';
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.user_profiles set followers_count = followers_count - 1 where id = old.following_id;
    update public.user_profiles set following_count = following_count - 1 where id = old.follower_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger trg_follow_change
  after insert or delete on public.follows
  for each row execute procedure public.handle_follow_change();

-- § 5 Realtime（订阅 DB 变更 · 让前端实时更新）

alter publication supabase_realtime add table public.resources;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.notifications;