-- Táblák létrehozása (ha még nem léteznek)
create table if not exists public.chore_entries (
  id uuid primary key default gen_random_uuid(),
  person text not null,
  task text not null,
  time_minutes integer not null default 0,
  notes text default '',
  date timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists public.available_tasks (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.chore_entries enable row level security;
alter table public.available_tasks enable row level security;

-- Policy-k (csak ha még nem léteznek)
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'chore_entries' and policyname = 'anon_all'
  ) then
    create policy "anon_all" on public.chore_entries
      for all to anon using (true) with check (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'available_tasks' and policyname = 'anon_all'
  ) then
    create policy "anon_all" on public.available_tasks
      for all to anon using (true) with check (true);
  end if;
end $$;

-- Realtime bekapcsolása (csak ha még nincs hozzáadva)
do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'chore_entries'
  ) then
    alter publication supabase_realtime add table public.chore_entries;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'available_tasks'
  ) then
    alter publication supabase_realtime add table public.available_tasks;
  end if;
end $$;
