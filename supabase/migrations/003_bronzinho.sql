-- Bronzinho: series with placement 1–4, always 5 points (not podium table)

alter table public.results drop constraint if exists results_series_check;
alter table public.results drop constraint if exists results_placement_by_series;

alter table public.results
  add constraint results_series_check
    check (series in ('ouro', 'prata', 'bronze', 'participacao', 'bronzinho'));

-- Participação: no placement. All other series (including bronzinho): placement 1–4.
alter table public.results
  add constraint results_placement_by_series check (
    (series = 'participacao' and placement is null)
    or (series <> 'participacao' and placement is not null)
  );
