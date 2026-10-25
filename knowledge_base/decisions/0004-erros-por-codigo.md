# 0004. Erros ao usuário são códigos mapeados

- Status: aceita
- Data: 2026-10-25 (registra decisão anterior)

## Contexto

Actions terminam em `redirect`, então não retornam erro para a UI. Mensagens cruas do Supabase ou do Zod vazavam detalhes técnicos e apareciam em inglês.

## Decisão

A action redireciona com `?error=<código>`; o texto vem de `ERROR_MESSAGES` em `src/lib/flash-errors.ts`. No admin há também um cookie flash.

## Consequências

- Nova falha exige um código novo no catálogo.
- O catálogo ainda não tem um documento de referência (`ERROR_CODES.md`, card no Trello).
