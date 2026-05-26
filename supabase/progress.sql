create table if not exists public.onboarding_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  primary_need text not null check (primary_need in ('focus', 'anxiety', 'brain-dump', 'rsd', 'burnout', 'motivation')),
  completed_at timestamptz not null default now()
);

create table if not exists public.brain_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  tag text not null check (tag in ('task', 'anxiety', 'idea', 'reminder')),
  local_date text not null,
  local_time text not null,
  local_created_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, local_created_at)
);

create table if not exists public.mood_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mood integer not null check (mood between 1 and 5),
  energy integer not null check (energy between 1 and 5),
  emotion text,
  emoji text,
  local_date text not null,
  local_created_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, local_created_at)
);

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, occurred_at)
);

create table if not exists public.reset_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, occurred_at)
);

alter table public.onboarding_preferences enable row level security;
alter table public.brain_notes enable row level security;
alter table public.mood_checkins enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.reset_logs enable row level security;

drop policy if exists "onboarding own" on public.onboarding_preferences;
create policy "onboarding own" on public.onboarding_preferences
for all using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "brain notes own" on public.brain_notes;
create policy "brain notes own" on public.brain_notes
for all using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "mood checkins own" on public.mood_checkins;
create policy "mood checkins own" on public.mood_checkins
for all using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "focus sessions own" on public.focus_sessions;
create policy "focus sessions own" on public.focus_sessions
for all using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "reset logs own" on public.reset_logs;
create policy "reset logs own" on public.reset_logs
for all using (user_id = auth.uid())
with check (user_id = auth.uid());
