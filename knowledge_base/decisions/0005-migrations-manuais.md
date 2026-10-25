# 0005. Migrations aplicadas à mão

- Status: aceita
- Data: 2026-10-25 (registra decisão anterior)

## Contexto

O projeto usa o Supabase free tier, sem Supabase local nem CLI de migração, e o desenvolvimento é em WSL sem Docker.

## Decisão

As migrations em `supabase/migrations/` são rodadas no SQL Editor, em ordem, seguidas do `seed.sql`.

## Consequências

- Migration já numerada nunca é editada, porque pode estar aplicada em produção. Mudança vira a próxima migration.
- O README precisa listar todas; hoje ele cita só até a 007.
