# Modelo de dados

Colunas exatas: `supabase/migrations/` (001–010) e `src/types/index.ts`. Aqui ficam as relações e as regras de acesso.

## Tabelas

| Tabela | Papel |
| --- | --- |
| `athletes` | Atletas. `user_id` liga a uma conta Auth (convite); `email` é de convite/login. |
| `stages` | Etapas: data, título, local, `status` (`scheduled`/`completed`), `audit_url`, `sort_order`. |
| `results` | Pontos por atleta, etapa, categoria, nível e série. **Fonte do ranking.** |
| `stage_entries` | Dupla inscrita numa etapa (categoria, nível, pódio opcional, `source` `admin`/`athlete`). |
| `stage_entry_members` | Os 2 atletas da dupla, com `paid`. |
| `contact_tickets` | Mensagens do formulário público. |
| `security_rate_hits` | Contador do rate limit. Só `service_role` acessa. |

## Restrições que o código assume

- `results`: `placement` entre 1 e 4 ou nulo, conforme a série (`results_placement_by_series`: participação não tem colocação; bronzinho exige); `points >= 0`.
- `stage_entries`: `podium_series` e `podium_placement` são ambos nulos ou ambos preenchidos.
- `stage_entry_members`: único por `(entry_id, athlete_id)` e por `(stage_id, category, athlete_id)`. Um atleta tem **uma dupla por categoria por etapa**.
- Apagar etapa ou atleta apaga em cascata as inscrições (`on delete cascade`).

## Acesso (o que é público e o que não é)

- Admin = `app_metadata.role = 'admin'`; a função `public.is_admin()` aplica isso nas policies de escrita (migration 006).
- Leitura pública de `athletes`, `stages`, `results`, `stage_entries` e `stage_entry_members`, **com limites de coluna** (migrations 009 e 010):
  - `athletes.email` não é selecionável por `anon` nem `authenticated`; o admin lê via `service_role`.
  - `stage_entry_members.paid` idem.
  - `anon` não vê `athletes.user_id`.
- `contact_tickets`: sem INSERT pela Data API. O formulário grava pela Server Action com `service_role`, depois do rate limit.
- O atleta logado só atualiza o próprio perfil (policy "Athlete update own profile"), e um trigger (`protect_athlete_auth_columns`, migration 008) impede que ele altere as colunas de auth.

## Mudar o banco

Migrations são aplicadas **à mão** no SQL Editor do Supabase, em ordem. Nunca edite uma existente: crie a próxima (`011_...`). Um hook do repositório bloqueia a edição das já existentes.
