-- Frozen Banana — cross-device sync schema.
-- Run this once in your Supabase project's SQL editor.
--
-- The whole app state is stored as one JSON blob per user. Row-Level Security
-- guarantees a signed-in user can only ever read or write their own row, so the
-- public anon key is safe to ship in the frontend.

create table if not exists public.app_states (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_states enable row level security;

drop policy if exists "own row select" on public.app_states;
create policy "own row select"
  on public.app_states for select
  using (auth.uid() = user_id);

drop policy if exists "own row insert" on public.app_states;
create policy "own row insert"
  on public.app_states for insert
  with check (auth.uid() = user_id);

drop policy if exists "own row update" on public.app_states;
create policy "own row update"
  on public.app_states for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Enable realtime so a change on one device pushes to the other.
alter publication supabase_realtime add table public.app_states;
