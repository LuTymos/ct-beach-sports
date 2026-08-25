-- Stage pair inscriptions (admin enrolls athletes; schema ready for future athlete self-signup)
-- Public may read entries/members; payment (`paid`) is selected only in admin queries.
-- When athlete Auth arrives, consider moving `paid` to an admin-only table.

create table if not exists public.stage_entries (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.stages (id) on delete cascade,
  category text not null check (category in ('misto', 'masculino', 'feminino')),
  level text not null check (level in ('iniciante', 'intermediario', 'avancado')),
  podium_series text check (
    podium_series is null
    or podium_series in ('ouro', 'prata', 'bronze', 'bronzinho')
  ),
  podium_placement int check (
    podium_placement is null
    or podium_placement between 1 and 4
  ),
  source text not null default 'admin' check (source in ('admin', 'athlete')),
  created_at timestamptz not null default now(),
  constraint stage_entries_podium_pair check (
    (podium_series is null and podium_placement is null)
    or (podium_series is not null and podium_placement is not null)
  )
);

create table if not exists public.stage_entry_members (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.stage_entries (id) on delete cascade,
  -- denormalized for unique (stage, category, athlete): one pair per category per stage
  stage_id uuid not null references public.stages (id) on delete cascade,
  category text not null check (category in ('misto', 'masculino', 'feminino')),
  athlete_id uuid not null references public.athletes (id) on delete cascade,
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  unique (entry_id, athlete_id),
  unique (stage_id, category, athlete_id)
);

create index if not exists stage_entries_stage_id_idx on public.stage_entries (stage_id);
create index if not exists stage_entries_stage_category_level_idx
  on public.stage_entries (stage_id, category, level);
create index if not exists stage_entry_members_entry_id_idx on public.stage_entry_members (entry_id);
create index if not exists stage_entry_members_athlete_id_idx on public.stage_entry_members (athlete_id);
create index if not exists stage_entry_members_stage_id_idx on public.stage_entry_members (stage_id);

alter table public.stage_entries enable row level security;
alter table public.stage_entry_members enable row level security;

grant select on public.stage_entries to anon, authenticated;
grant select, insert, update, delete on public.stage_entries to authenticated;
grant select, insert, update, delete on public.stage_entries to service_role;

grant select on public.stage_entry_members to anon, authenticated;
grant select, insert, update, delete on public.stage_entry_members to authenticated;
grant select, insert, update, delete on public.stage_entry_members to service_role;

create policy "Public read stage entries"
  on public.stage_entries for select
  to anon, authenticated
  using (true);

create policy "Admin write stage entries"
  on public.stage_entries for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Public read stage entry members"
  on public.stage_entry_members for select
  to anon, authenticated
  using (true);

create policy "Admin write stage entry members"
  on public.stage_entry_members for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
