# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Convenções por área (Next 16, RSC, Server Actions, Supabase, Tailwind 4, Zod 4, shadcn, pontuação) ficam em `.claude/rules/` e carregam por caminho de arquivo. O domínio do ranking (lançar resultado, inscrições, import CSV) está na skill `torneio-ranking`. Não repita essas regras aqui.

## Comandos

```bash
npm run dev      # Next + Turbopack em localhost:3000
npm run build
npm run lint     # ESLint CLI (next lint não existe mais)
npm test         # tsx --test, lista de arquivos fixa no package.json
npx tsx --test src/features/ranking/ranking-href.test.ts   # um arquivo só
```

- `npm test` **não descobre testes sozinho**: ao criar um `*.test.ts`, adicione o caminho ao script `test` em `package.json`, senão ele nunca roda.
- Não há suíte de integração/E2E; só testes unitários de funções puras (CSV, redirects, schemas, senha, URL segura, escolha da etapa da home).
- Setup: `cp .env.example .env.local` e preencher Supabase. `SUPABASE_SERVICE_ROLE_KEY` é só servidor (convites).
- O banco é aplicado **à mão no SQL Editor do Supabase**, na ordem de `supabase/migrations/001…010` e depois `supabase/seed.sql`. O README lista só até a 007; a 008 (conta do atleta), 009 e 010 (hardening) também são necessárias. Não há CLI de migração.

## Arquitetura (o que exige ler vários arquivos)

**Fluxo de dados.** Páginas em `src/app/**` são Server Components que chamam `queries.ts` da feature. Escrita é sempre Server Action em `src/features/*/actions.ts`; não há Route Handlers de CRUD. O ranking **não é uma tabela**: `src/features/ranking/queries.ts` soma `results.points` na hora e atribui posições (empate = mesma posição). Mudar a regra de posição ou de soma é mudar essa camada, não o banco.

**Papéis e clientes Supabase** (`src/lib/supabase/`). Três perfis: público anônimo (só leitura via RLS), atleta logado (`/conta`, vinculado por `athletes.user_id`) e admin (`app_metadata.role === "admin"`, nunca `user_metadata`).
- `server.ts`: cliente por request com cookies, respeita RLS.
- `require-admin.ts`: `requireAdmin()` no topo de **toda** action/página admin, antes de ler o input. Redireciona para `/admin/login`.
- `service.ts`: `service_role`, ignora RLS. Só via `createAdminServiceClient()` (checa admin) ou em fluxos de convite. Nunca no client.
- Pagamento (`stage_entry_members.paid`) é escondido do público por RLS e só aparece nas queries admin (`getStageEntriesAdmin`); `getStageEntriesPublic` é a versão sem `paid`. Não misture as duas.
- `middleware.ts` (nome ainda `middleware`, não `proxy`) só renova a sessão; ele **não** protege rotas. A proteção está em `requireAdmin()` e no RLS.

**Erros e feedback.** Actions não retornam erro para a UI: chamam `redirect(path?error=<code>)` com um código de `ERROR_MESSAGES` em `src/lib/flash-errors.ts`, e a página mapeia o código para texto (`MappedErrorAlert`). Mensagens de admin usam cookie flash (`features/admin/flash-error.ts`). Para uma nova falha, adicione um código ali em vez de passar mensagem crua do Supabase/Zod.

**Rate limit** (`src/lib/rate-limit.ts`): contador por IP+chave, usado em login admin, login do atleta e contato. Usa o service client quando há `SERVICE_ROLE_KEY` e cai para memória do processo sem ela, o que não é compartilhado entre instâncias serverless.

**Inscrições de etapa** (`features/entries`): a dupla vira `stage_entries` + 2 `stage_entry_members`. Marcar pódio **gera linhas em `results`** via `calculatePoints`, e fechar a etapa cria Participação para quem não pontuou e muda `stages.status` para `completed`. Ou seja, `results` tem duas origens (lançamento manual/CSV e fechamento de inscrições); desfazer pódio (`clearEntryPodiumAction`) precisa remover as linhas geradas.

**Ranking e URLs.** Filtros vivem na query string (`categoria`, `nivel`, `q`, `page`), montados por `buildRankingHref` em `features/ranking/ranking-href.ts`. O ranking geral está em `/ranking`; a home (`/`) é vitrine e redireciona links antigos com filtros para `/ranking`. Ao adicionar uma mutation, faça `revalidatePath` de `/`, `/ranking` e das páginas de etapa/atleta afetadas.

**Segurança já endurecida** (migration 010, `next.config.ts`, `lib/safe-url.ts`): CSP e headers em `next.config.ts` (o `connect-src` deriva de `NEXT_PUBLIC_SUPABASE_URL`), `audit_url` e `next` do callback passam por validação de URL, import CSV limitado a 512 KB e 400 linhas. Ao introduzir domínio externo (imagem, script, fonte), é preciso ajustar a CSP.

## Armadilhas

- Radix `Select` não envia `name` no `FormData`; em forms de Server Action use hidden input ou `<select>` nativo.
- Dev em WSL, deploy na Vercel Hobby (região `iad1`). Não exigir Docker nem Supabase local.
- Trello (board "CT Beach Sports") é o backlog; PRs de agentes anteriores seguem a convenção de citar o card no corpo.
