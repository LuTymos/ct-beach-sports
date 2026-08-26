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
   - `supabase/migrations/005_contact_tickets.sql`
   - `supabase/migrations/006_rls_admin_policies.sql`
   - `supabase/migrations/007_stage_entries.sql`
   - `supabase/seed.sql` (etapas 2026)
3. Em **Authentication → Users**, crie o usuário admin (seu e-mail e o do professor).
4. Promova o usuário a admin no **SQL Editor** (claim em `app_metadata`, não em `user_metadata`), depois faça logout/login:
   ```sql
   update auth.users
   set raw_app_meta_data =
     coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
   where email in ('SEU_EMAIL');
   ```
5. Copie **Project URL** e a chave **publishable** (ou anon JWT) para `.env.local`.

## Admin

- Login: `/admin/login`
- Cadastre atletas, etapas e resultados (pontos calculados automaticamente).
- Importar planilha da etapa: `/admin/importacao` (`atleta,categoria,nivel,serie,colocacao`).
- Tickets de contato: `/contato` (público) e `/admin/tickets`.
- Inscrições por etapa (duplas): `/admin/etapas/[id]/inscricoes` (pagamento só admin); lista pública em `/etapas/[id]`.

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
