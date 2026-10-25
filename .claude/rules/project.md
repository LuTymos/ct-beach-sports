# Projeto CT Beach Sports

Produto, stack e tabela de pontos estão no `AGENTS.md`. Aqui só o que não está lá:

- Dev em WSL; não exigir Docker.
- Docs do Next da versão instalada: `node_modules/next/dist/docs/` (ler antes de usar API nova).
- Não inventar funcionalidade fora do pedido; o backlog está no Trello.
- Pontuação apenas via `src/lib/scoring.ts`.
- Público lê; só admin autenticado escreve.
- Preferir Server Components; `"use client"` só quando necessário.
- Commits e push só se o usuário pedir explicitamente.
