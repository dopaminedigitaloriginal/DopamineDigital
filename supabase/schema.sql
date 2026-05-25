create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Dopamine member',
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  membership text not null default 'free' check (membership in ('free', 'paid')),
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.spaces (
  id text primary key,
  name text not null,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  paid_only boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  space_id text not null references public.spaces(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'support',
  title text not null default 'Support post',
  body text not null,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.spaces (id, name, visibility, paid_only)
values
  ('public-support', 'Support thread', 'public', false),
  ('wins', 'Streak shares', 'public', false),
  ('body-double', 'Body doubling', 'public', false),
  ('members', 'Member support room', 'private', true)
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
    and blocked = false
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_count integer;
begin
  select count(*) into profile_count from public.profiles;

  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Dopamine member'),
    new.email,
    case when profile_count = 0 then 'admin' else 'member' end
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles
for select using (auth.uid() is not null);

drop policy if exists "profiles update own or admin" on public.profiles;
create policy "profiles update own or admin" on public.profiles
for update using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "spaces read" on public.spaces;
create policy "spaces read" on public.spaces
for select using (
  visibility = 'public'
  or public.is_admin()
  or (auth.uid() is not null and paid_only = false)
  or exists (
    select 1 from public.profiles
    where id = auth.uid()
    and membership = 'paid'
    and blocked = false
  )
);

drop policy if exists "posts read visible" on public.posts;
create policy "posts read visible" on public.posts
for select using (
  hidden = false
  or public.is_admin()
);

drop policy if exists "posts insert logged in" on public.posts;
create policy "posts insert logged in" on public.posts
for insert with check (
  auth.uid() = author_id
  and exists (select 1 from public.profiles where id = auth.uid() and blocked = false)
);

drop policy if exists "posts update own or admin" on public.posts;
create policy "posts update own or admin" on public.posts
for update using (author_id = auth.uid() or public.is_admin())
with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "comments read visible" on public.comments;
create policy "comments read visible" on public.comments
for select using (
  hidden = false
  or public.is_admin()
);

drop policy if exists "comments insert logged in" on public.comments;
create policy "comments insert logged in" on public.comments
for insert with check (
  auth.uid() = author_id
  and exists (select 1 from public.profiles where id = auth.uid() and blocked = false)
);

drop policy if exists "comments update own or admin" on public.comments;
create policy "comments update own or admin" on public.comments
for update using (author_id = auth.uid() or public.is_admin())
with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "reports insert own" on public.reports;
create policy "reports insert own" on public.reports
for insert with check (auth.uid() = reporter_id);

drop policy if exists "reports read own or admin" on public.reports;
create policy "reports read own or admin" on public.reports
for select using (reporter_id = auth.uid() or public.is_admin());

drop policy if exists "reports update admin" on public.reports;
create policy "reports update admin" on public.reports
for update using (public.is_admin())
with check (public.is_admin());

drop policy if exists "blocks own" on public.blocks;
create policy "blocks own" on public.blocks
for all using (blocker_id = auth.uid())
with check (blocker_id = auth.uid());

drop policy if exists "notifications own" on public.notifications;
create policy "notifications own" on public.notifications
for select using (user_id = auth.uid());

drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own" on public.notifications
for update using (user_id = auth.uid())
with check (user_id = auth.uid());
