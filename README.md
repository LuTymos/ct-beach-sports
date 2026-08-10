# Ranking CT Beach Sports 2026

Site de ranking do torneio dos alunos do **CT Beach Sports**.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Auth)
- Vercel (deploy gratuito)

## Desenvolvimento (WSL)

```bash
cd ~/Projects/ranking-ct-beach-sports
cp .env.example .env.local
# preencha as chaves do Supabase
npm install
npm run dev
```

Abra no Chrome do Windows: [http://localhost:3000](http://localhost:3000)

## Setup Supabase (gratuito)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **SQL Editor**, rode:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_category_level.sql`
   - `supabase/migrations/003_bronzinho.sql`
   - `supabase/migrations/004_bronzinho_placement.sql`
   - `supabase/seed.sql` (etapas 2026)
3. Em **Authentication → Users**, crie o usuário admin (seu e-mail e o do professor).
4. Copie **Project URL** e a chave **publishable** (ou anon JWT) para `.env.local`.

## Admin

- Login: `/admin/login`
- Cadastre atletas, etapas e resultados (pontos calculados automaticamente).
- Importar planilha da etapa: `/admin/importacao` (`atleta,categoria,nivel,serie,colocacao`).

## Deploy Vercel (Hobby)

1. Suba o repo no GitHub (quando quiser).
2. Importe o projeto na Vercel.
3. Configure as mesmas env vars `NEXT_PUBLIC_SUPABASE_*`.
4. Deploy — URL `*.vercel.app` gratuita.

Ou via CLI (com login):

```bash
npx vercel
```

## Estrutura

Veja `AGENTS.md` e `.cursor/rules/` para contexto do agente.
