-- Category + level on results (run after 001_init.sql)
-- Gender category and skill level for ranking columns/tabs

alter table public.results
  add column if not exists category text,
  add column if not exists level text;

update public.results
set
  category = coalesce(category, 'misto'),
  level = coalesce(level, 'intermediario')
where category is null or level is null;

alter table public.results
  alter column category set default 'misto',
  alter column level set default 'intermediario',
  alter column category set not null,
  alter column level set not null;

alter table public.results
  drop constraint if exists results_category_check,
  drop constraint if exists results_level_check;

alter table public.results
  add constraint results_category_check
    check (category in ('misto', 'masculino', 'feminino')),
  add constraint results_level_check
    check (level in ('iniciante', 'intermediario', 'avancado'));

create index if not exists results_category_idx on public.results (category);
create index if not exists results_level_idx on public.results (level);
