# CT Beach Sports — Ranking Torneio 2026

## Produto

Site de ranking do torneio dos alunos do **CT Beach Sports**.
Público só consulta; admin (professor / você) cadastra atletas, etapas e resultados.

## Stack

- Next.js App Router + TypeScript
- Tailwind + shadcn/ui (`src/components/ui`)
- Supabase (Postgres + Auth) — free tier
- Deploy: Vercel Hobby
- Dev: WSL (`npm run dev` → Chrome Windows em `localhost:3000`)

## Pontuação

Única fonte: `src/lib/scoring.ts`

| Série | 1º | 2º | 3º | 4º |
| ----- | -- | -- | -- | -- |
| Ouro | 100 | 80 | 60 | 50 |
| Prata | 50 | 40 | 30 | 20 |
| Bronze | 30 | 20 | 10 | 5 |

Participação = 5 pts (tipo separado, sem colocação).
Bronzinho = colocação 1–4, mas **sempre 5 pts** (não usa a tabela Ouro/Prata/Bronze).
Um atleta pode ter vários resultados na mesma etapa.

Categoria (`misto` / `masculino` / `feminino`) e nível (`iniciante` / `intermediario` / `avancado`) ficam no resultado; o ranking geral mostra colunas por categoria e abas por nível.

## Estrutura

```
src/app/                 rotas públicas + admin
src/components/ui/       shadcn
src/features/            ranking, admin
src/lib/scoring.ts       pontuação
src/lib/supabase/        clients + middleware
supabase/migrations/     SQL
```

## MVP vs roadmap

**MVP:** ranking geral, por etapa, ficha do atleta, admin CRUD, import CSV por etapa.

**Depois:** inscrição em etapas, links de auditoria preenchidos.

## Next.js notes

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
