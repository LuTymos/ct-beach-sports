# Knowledge base

Contexto de domínio e decisões que o código sozinho não conta. Não é carregado automaticamente: leia o arquivo que a tarefa pede.

| Arquivo | Quando ler |
| --- | --- |
| `constitution.md` | Antes de qualquer mudança que toque pontuação, auth ou dados públicos. |
| `glossary.md` | Termos do torneio (série, bronzinho, dupla, etapa). |
| `data-model.md` | Tabelas, restrições e RLS. Confirme colunas exatas nas migrations. |
| `flows.md` | Como um resultado nasce: lançamento manual, import CSV, inscrição de duplas e fechamento de etapa. |
| `decisions/` | Por que as coisas são como são (ADRs). |

## Manutenção

- Fatos que o código já mostra (nomes de arquivos, listas de componentes) não entram aqui.
- Mudou uma regra de negócio ou de acesso: atualize o arquivo correspondente na **mesma PR**.
- Decisão nova que alguém poderia questionar depois: crie um ADR em `decisions/` (formato MADR mínimo, numeração sequencial; veja `0000`).
- Esta pasta fica fora de `docs/` porque o `.gitignore` ignora `docs/`.
