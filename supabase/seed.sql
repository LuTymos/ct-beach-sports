-- Seed etapas 2026 (CT Beach Sports)
-- Run after 001_init.sql (safe to re-run only on empty stages table)

insert into public.stages (date, title, location, status, sort_order) values
  ('2026-02-01', 'Etapa 1', null, 'completed', 1),
  ('2026-03-08', 'Etapa 2', null, 'completed', 2),
  ('2026-04-12', 'Etapa 3', null, 'completed', 3),
  ('2026-06-14', 'Etapa 4', null, 'completed', 4),
  ('2026-07-26', 'Etapa 5', null, 'completed', 5),
  ('2026-08-22', 'Etapa 6', null, 'scheduled', 6),
  ('2026-09-27', 'Etapa 7', null, 'scheduled', 7),
  ('2026-11-08', 'Etapa 8 — Caraguá', 'Caraguá', 'scheduled', 8),
  ('2026-12-19', 'Etapa 9', null, 'scheduled', 9);
