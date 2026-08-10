-- CT Beach Sports ranking schema
-- Run in Supabase SQL editor (free tier)

create extension if not exists "pgcrypto";

create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  team text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.stages (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text not null,
  location text,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed')),
  audit_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  stage_id uuid not null references public.stages (id) on delete cascade,
  category text not null default 'misto' check (category in ('misto', 'masculino', 'feminino')),
  level text not null default 'intermediario' check (level in ('iniciante', 'intermediario', 'avancado')),
  series text not null check (series in ('ouro', 'prata', 'bronze', 'participacao', 'bronzinho')),
  placement int check (placement is null or placement between 1 and 4),
  points int not null check (points >= 0),
  created_at timestamptz not null default now(),
  constraint results_placement_by_series check (
    (series = 'participacao' and placement is null)
    or (series <> 'participacao' and placement is not null)
  )
);

create index if not exists results_athlete_id_idx on public.results (athlete_id);
create index if not exists results_stage_id_idx on public.results (stage_id);
create index if not exists results_category_idx on public.results (category);
create index if not exists results_level_idx on public.results (level);
create index if not exists stages_sort_order_idx on public.stages (sort_order);

alter table public.athletes enable row level security;
alter table public.stages enable row level security;
alter table public.results enable row level security;

-- Public read
create policy "Public read athletes"
  on public.athletes for select
  to anon, authenticated
  using (true);

create policy "Public read stages"
  on public.stages for select
  to anon, authenticated
  using (true);

create policy "Public read results"
  on public.results for select
  to anon, authenticated
  using (true);

-- Authenticated admins write (restrict further with allowlist in app / JWT email claims)
create policy "Auth write athletes"
  on public.athletes for all
  to authenticated
  using (true)
  with check (true);

create policy "Auth write stages"
  on public.stages for all
  to authenticated
  using (true)
  with check (true);

create policy "Auth write results"
  on public.results for all
  to authenticated
  using (true)
  with check (true);
