create table if not exists public.agent_learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  run_id text not null,
  event_type text not null check (
    event_type in (
      'agent_run',
      'recommendation_snapshot',
      'user_feedback',
      'preference_update'
    )
  ),
  input_message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_preference_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  liked_categories jsonb not null default '{}'::jsonb,
  disliked_categories jsonb not null default '{}'::jsonb,
  liked_keywords jsonb not null default '{}'::jsonb,
  disliked_keywords jsonb not null default '{}'::jsonb,
  preferred_price_min integer,
  preferred_price_max integer,
  last_observations jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists agent_learning_events_user_created_idx
  on public.agent_learning_events (user_id, created_at desc);

create index if not exists agent_learning_events_run_idx
  on public.agent_learning_events (run_id);

alter table public.agent_learning_events enable row level security;
alter table public.user_preference_profiles enable row level security;

create policy "Users read own agent learning events"
  on public.agent_learning_events for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users create own agent learning events"
  on public.agent_learning_events for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users read own preference profile"
  on public.user_preference_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users create own preference profile"
  on public.user_preference_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own preference profile"
  on public.user_preference_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
