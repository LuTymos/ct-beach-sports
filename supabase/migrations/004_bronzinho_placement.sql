-- Fix bronzinho placement rule if 003 was applied with the old "no placement" version.
-- Safe to re-run: drops and recreates the placement constraint.

alter table public.results drop constraint if exists results_placement_by_series;

alter table public.results
  add constraint results_placement_by_series check (
    (series = 'participacao' and placement is null)
    or (series <> 'participacao' and placement is not null)
  );
